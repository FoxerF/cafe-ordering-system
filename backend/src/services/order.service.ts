import {
  randomBytes,
  randomInt,
} from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/app-error.js";

import {
  ALLOWED_TRANSITIONS,
  isOrderStatus,
  type OrderStatus,
} from "../lib/order-status.js";

type CreateOrderItemInput = {
  productId: number;
  quantity: number;
};

function generateOrderNumber() {
  return `ORD-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

async function generatePickupCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(
      randomInt(100000, 1000000),
    );

    const existing =
      await prisma.order.findUnique({
        where: {
          pickupCode: code,
        },
      });

    if (!existing) {
      return code;
    }
  }

  throw new AppError(
    500,
    "Unable to generate pickup code",
  );
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerComment?: string;
  pickupSlotId: number;
  items: CreateOrderItemInput[];
}) {
  if (data.items.length === 0) {
    throw new AppError(
      400,
      "Order must contain at least one item",
    );
  }

  const productIds = data.items.map(
    (item) => item.productId,
  );

  const uniqueProductIds =
    new Set(productIds);

  if (
    uniqueProductIds.size !==
    productIds.length
  ) {
    throw new AppError(
      400,
      "The same product cannot appear twice in one order",
    );
  }

  for (const item of data.items) {
    if (
      !Number.isInteger(item.productId) ||
      item.productId <= 0
    ) {
      throw new AppError(
        400,
        "Invalid product ID",
      );
    }

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new AppError(
        400,
        "Product quantity must be a positive integer",
      );
    }
  }

  const products =
    await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ]),
  );

  for (const productId of productIds) {
    const product =
      productMap.get(productId);

    if (!product) {
      throw new AppError(
        400,
        `Product ${productId} not found`,
      );
    }

    if (!product.isAvailable) {
      throw new AppError(
        409,
        `Product "${product.name}" is currently unavailable`,
      );
    }
  }

  const slot =
    await prisma.pickupSlot.findUnique({
      where: {
        id: data.pickupSlotId,
      },
    });

  if (!slot) {
    throw new AppError(
      404,
      "Pickup slot not found",
    );
  }

  if (!slot.isActive) {
    throw new AppError(
      409,
      "Pickup slot is not available",
    );
  }

  const now = new Date();

  if (slot.startsAt <= now) {
    throw new AppError(
      409,
      "Pickup slot has already started",
    );
  }

  const currentSlotOrders =
    await prisma.order.count({
      where: {
        pickupSlotId: slot.id,
        status: {
          not: "CANCELLED",
        },
      },
    });

  if (
    currentSlotOrders >=
    slot.maxOrders
  ) {
    throw new AppError(
      409,
      "Pickup slot is full",
    );
  }

  const activeOrderCount =
    await prisma.order.count({
      where: {
        status: {
          in: [
            "NEW",
            "CONFIRMED",
            "PREPARING",
          ],
        },
      },
    });

  let totalPrice = 0;
  let totalQuantity = 0;

  const preparedItems = data.items.map(
    (item) => {
      const product =
        productMap.get(item.productId)!;

      const subtotal =
        product.price * item.quantity;

      totalPrice += subtotal;
      totalQuantity += item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal,
      };
    },
  );

  /*
    Simple educational workload formula:

    10 minutes base preparation
    + 2 minutes per ordered item
    + 3 minutes for every currently active order
  */
  const preparationMinutes =
    10 +
    totalQuantity * 2 +
    activeOrderCount * 3;

  const estimatedReadyAt = new Date(
    now.getTime() +
      preparationMinutes * 60 * 1000,
  );

  if (
    estimatedReadyAt >
    slot.startsAt
  ) {
    throw new AppError(
      409,
      "The selected pickup slot is too busy for this order",
    );
  }

  const orderNumber =
    generateOrderNumber();

  const pickupCode =
    await generatePickupCode();

  return prisma.$transaction(
    async (tx) => {
      /*
        Re-check the slot inside the transaction
        immediately before creating the order.
      */
      const freshSlot =
        await tx.pickupSlot.findUnique({
          where: {
            id: data.pickupSlotId,
          },
        });

      if (
        !freshSlot ||
        !freshSlot.isActive
      ) {
        throw new AppError(
          409,
          "Pickup slot is no longer available",
        );
      }

      const freshSlotOrders =
        await tx.order.count({
          where: {
            pickupSlotId:
              freshSlot.id,
            status: {
              not: "CANCELLED",
            },
          },
        });

      if (
        freshSlotOrders >=
        freshSlot.maxOrders
      ) {
        throw new AppError(
          409,
          "Pickup slot became full",
        );
      }

      return tx.order.create({
        data: {
          orderNumber,
          pickupCode,
          customerName:
            data.customerName.trim(),
          customerPhone:
            data.customerPhone.trim(),
          customerComment:
            data.customerComment?.trim() ||
            null,
          status: "NEW",
          totalPrice,
          estimatedReadyAt,
          pickupSlotId:
            freshSlot.id,

          items: {
            create: preparedItems,
          },
        },

        include: {
          pickupSlot: true,
          items: true,
        },
      });
    },
  );
}

export async function getOrderByNumber(
  orderNumber: string,
) {
  return prisma.order.findUnique({
    where: {
      orderNumber,
    },
    select: {
      orderNumber: true,
      pickupCode: true,
      status: true,
      totalPrice: true,
      estimatedReadyAt: true,
      createdAt: true,

      pickupSlot: true,

      items: {
        select: {
          productName: true,
          unitPrice: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  });
}

export async function updateOrderStatus(
  id: number,
  newStatusValue: string,
) {
  if (!isOrderStatus(newStatusValue)) {
    throw new AppError(
      400,
      "Invalid order status",
    );
  }

  const newStatus: OrderStatus =
    newStatusValue;

  const order =
    await prisma.order.findUnique({
      where: {
        id,
      },
    });

  if (!order) {
    throw new AppError(
      404,
      "Order not found",
    );
  }

  if (!isOrderStatus(order.status)) {
    throw new AppError(
      500,
      "Order has an invalid stored status",
    );
  }

  const currentStatus:
    OrderStatus = order.status;

  if (currentStatus === newStatus) {
    return order;
  }

  const allowed =
    ALLOWED_TRANSITIONS[
      currentStatus
    ];

  if (!allowed.includes(newStatus)) {
    throw new AppError(
      409,
      `Cannot change order status from ${currentStatus} to ${newStatus}`,
    );
  }

  return prisma.order.update({
    where: {
      id,
    },
    data: {
      status: newStatus,
    },
    include: {
      pickupSlot: true,
      items: true,
    },
  });
}

export async function getAdminOrders() {
  return prisma.order.findMany({
    include: {
      pickupSlot: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
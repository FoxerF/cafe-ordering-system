import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/app-error.js";

export async function getAvailablePickupSlots() {
  const now = new Date();

  const slots = await prisma.pickupSlot.findMany({
    where: {
      isActive: true,
      startsAt: {
        gt: now,
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  return Promise.all(
    slots.map(async (slot) => {
      const currentOrders =
        await prisma.order.count({
          where: {
            pickupSlotId: slot.id,
            status: {
              not: "CANCELLED",
            },
          },
        });

      return {
        ...slot,
        currentOrders,
        remainingOrders: Math.max(
          slot.maxOrders - currentOrders,
          0,
        ),
        available:
          currentOrders < slot.maxOrders,
      };
    }),
  );
}

export async function createPickupSlot(data: {
  startsAt: string;
  endsAt: string;
  maxOrders?: number;
}) {
  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);

  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime())
  ) {
    throw new AppError(
      400,
      "Invalid date or time",
    );
  }

  if (startsAt <= new Date()) {
    throw new AppError(
      400,
      "Pickup slot must be in the future",
    );
  }

  if (endsAt <= startsAt) {
    throw new AppError(
      400,
      "Slot end time must be after start time",
    );
  }

  const maxOrders = data.maxOrders ?? 4;

  if (
    !Number.isInteger(maxOrders) ||
    maxOrders <= 0
  ) {
    throw new AppError(
      400,
      "maxOrders must be a positive integer",
    );
  }

  const overlappingSlot =
    await prisma.pickupSlot.findFirst({
      where: {
        startsAt: {
          lt: endsAt,
        },
        endsAt: {
          gt: startsAt,
        },
      },
    });

  if (overlappingSlot) {
    throw new AppError(
      409,
      "Pickup slot overlaps an existing slot",
    );
  }

  return prisma.pickupSlot.create({
    data: {
      startsAt,
      endsAt,
      maxOrders,
    },
  });
}
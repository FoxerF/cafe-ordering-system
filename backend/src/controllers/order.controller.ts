import type { Request, Response } from "express";

import {
  createOrder,
  getOrderByNumber,
  updateOrderStatus,
  getAdminOrders,
} from "../services/order.service.js";

import { AppError } from "../lib/app-error.js";

function parseId(
  value: string | string[] | undefined,
): number | null {
  const raw = Array.isArray(value)
    ? value[0]
    : value;

  if (typeof raw !== "string") {
    return null;
  }

  const id = Number(raw);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  return id;
}

function getStringParam(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value)
    ? value[0]
    : value;

  return typeof raw === "string"
    ? raw
    : null;
}

function sendError(
  res: Response,
  error: unknown,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}

export async function addOrder(
  req: Request,
  res: Response,
) {
  const body = req.body ?? {};

  const {
    customerName,
    customerPhone,
    customerComment,
    pickupSlotId,
    items,
  } = body;

  if (
    typeof customerName !== "string" ||
    !customerName.trim()
  ) {
    return res.status(400).json({
      message:
        "customerName is required",
    });
  }

  if (
    typeof customerPhone !== "string" ||
    !customerPhone.trim()
  ) {
    return res.status(400).json({
      message:
        "customerPhone is required",
    });
  }

  if (
    !Number.isInteger(pickupSlotId) ||
    pickupSlotId <= 0
  ) {
    return res.status(400).json({
      message:
        "Valid pickupSlotId is required",
    });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({
      message:
        "items must be an array",
    });
  }

  try {
    const order = await createOrder({
      customerName,
      customerPhone,
      customerComment:
        typeof customerComment ===
        "string"
          ? customerComment
          : undefined,
      pickupSlotId,
      items,
    });

    return res.status(201).json(order);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getOrder(
  req: Request,
  res: Response,
) {
  const orderNumber =
    getStringParam(
      req.params.orderNumber,
    );

  if (!orderNumber) {
    return res.status(400).json({
      message:
        "Invalid order number",
    });
  }

  try {
    const order =
      await getOrderByNumber(
        orderNumber,
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function changeOrderStatus(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);
  const body = req.body ?? {};

  if (id === null) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  if (
    typeof body.status !== "string"
  ) {
    return res.status(400).json({
      message: "status is required",
    });
  }

  try {
    const order =
      await updateOrderStatus(
        id,
        body.status,
      );

    return res.json(order);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getAdminOrdersList(
  _req: Request,
  res: Response,
) {
  try {
    const orders =
      await getAdminOrders();

    return res.json(orders);
  } catch {
    return res.status(500).json({
      message:
        "Failed to load orders",
    });
  }
}
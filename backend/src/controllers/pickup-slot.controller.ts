import type {
  Request,
  Response,
} from "express";

import {
  createPickupSlot,
  getAvailablePickupSlots,
} from "../services/pickup-slot.service.js";

import { AppError } from "../lib/app-error.js";

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

export async function getPickupSlots(
  _req: Request,
  res: Response,
) {
  try {
    const slots =
      await getAvailablePickupSlots();

    return res.json(slots);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function addPickupSlot(
  req: Request,
  res: Response,
) {
  const body = req.body ?? {};

  if (
    typeof body.startsAt !== "string" ||
    typeof body.endsAt !== "string"
  ) {
    return res.status(400).json({
      message:
        "startsAt and endsAt are required",
    });
  }

  const maxOrders =
    body.maxOrders === undefined
      ? 4
      : body.maxOrders;

  if (
    !Number.isInteger(maxOrders) ||
    maxOrders <= 0
  ) {
    return res.status(400).json({
      message:
        "maxOrders must be a positive integer",
    });
  }

  try {
    const slot = await createPickupSlot({
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      maxOrders,
    });

    return res.status(201).json(slot);
  } catch (error) {
    return sendError(res, error);
  }
}
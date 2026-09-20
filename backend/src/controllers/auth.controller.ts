import type {
  Request,
  Response,
} from "express";

import {
  loginUser,
  getUserById,
} from "../services/auth.service.js";

import {
  createAccessToken,
} from "../lib/auth.js";

import { AppError } from "../lib/app-error.js";

export async function login(
  req: Request,
  res: Response,
) {
  const body = req.body ?? {};

  if (
    typeof body.email !== "string" ||
    !body.email.trim()
  ) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  if (
    typeof body.password !== "string" ||
    !body.password
  ) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  try {
    const user =
      await loginUser(
        body.email,
        body.password,
      );

    const token =
      createAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(
        error.statusCode,
      ).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
}

export async function me(
  req: Request,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const user =
    await getUserById(
      req.user.id,
    );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json(user);
}
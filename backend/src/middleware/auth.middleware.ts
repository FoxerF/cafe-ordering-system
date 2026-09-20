import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  verifyAccessToken,
} from "../lib/auth.js";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization =
    req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token =
    authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const payload =
      verifyAccessToken(token);

    const userId =
      Number(payload.sub);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Administrator access required",
    });
  }

  next();
}
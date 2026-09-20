import type {
  Request,
  Response,
} from "express";

import {
  getAdminDashboardSummary,
} from "../services/admin.service.js";

export async function getAdminSummary(
  _req: Request,
  res: Response,
) {
  try {
    const summary =
      await getAdminDashboardSummary();

    return res.json(summary);
  } catch {
    return res.status(500).json({
      message:
        "Failed to load admin summary",
    });
  }
}
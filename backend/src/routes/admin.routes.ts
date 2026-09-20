import { Router } from "express";

import {
  getAdminSummary,
} from "../controllers/admin.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(
  authenticate,
  requireAdmin,
);

router.get(
  "/summary",
  getAdminSummary,
);

export default router;
import { Router } from "express";

import {
  addOrder,
  changeOrderStatus,
  getAdminOrdersList,
  getOrder,
} from "../controllers/order.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  requireAdmin,
  getAdminOrdersList,
);

router.post(
  "/",
  addOrder,
);

router.get(
  "/:orderNumber",
  getOrder,
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  changeOrderStatus,
);

export default router;
import { Router } from "express";

import {
  addPickupSlot,
  getPickupSlots,
  disablePickupSlot,
} from "../controllers/pickup-slot.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/",
  getPickupSlots,
);

router.post(
  "/",
  authenticate,
  requireAdmin,
  addPickupSlot,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  requireAdmin,
  disablePickupSlot,
);

export default router;
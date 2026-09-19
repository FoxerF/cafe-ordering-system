import { Router } from "express";

import {
  addPickupSlot,
  getPickupSlots,
} from "../controllers/pickup-slot.controller.js";

const router = Router();

router.get("/", getPickupSlots);
router.post("/", addPickupSlot);

export default router;
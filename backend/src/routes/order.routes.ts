import { Router } from "express";

import {
  addOrder,
  changeOrderStatus,
  getOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", addOrder);
router.get("/:orderNumber", getOrder);
router.patch(
  "/:id/status",
  changeOrderStatus,
);

export default router;
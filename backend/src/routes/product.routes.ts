import { Router } from "express";

import {
  addProduct,
  editProduct,
  getAllProducts,
  getProduct,
  removeProduct,
} from "../controllers/product.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);

router.post(
  "/",
  authenticate,
  requireAdmin,
  addProduct,
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  editProduct,
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  removeProduct,
);

export default router;
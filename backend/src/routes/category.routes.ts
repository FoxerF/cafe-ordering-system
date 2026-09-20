import { Router } from "express";

import {
  addCategory,
  editCategory,
  getAllCategories,
  getCategory,
  removeCategory,
} from "../controllers/category.controller.js";

import {
  authenticate,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategory);

router.post(
  "/",
  authenticate,
  requireAdmin,
  addCategory,
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  editCategory,
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  removeCategory,
);

export default router;
import { Router } from "express";
import {
  addCategory,
  editCategory,
  getAllCategories,
  getCategory,
  removeCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.post("/", addCategory);
router.patch("/:id", editCategory);
router.delete("/:id", removeCategory);

export default router;
import { Router } from "express";
import {
  addProduct,
  editProduct,
  getAllProducts,
  getProduct,
  removeProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);
router.post("/", addProduct);
router.patch("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;
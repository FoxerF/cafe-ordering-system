import type { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/product.service.js";

function parseId(value: string | string[] | undefined): number | null {
  // Accept string, array of strings, or undefined (from express params)
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== "string") {
    return null;
  }

  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function isValidPrice(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

export async function getAllProducts(
  _req: Request,
  res: Response,
) {
  const products = await getProducts();

  res.json(products);
}

export async function getProduct(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const product = await getProductById(id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
}

export async function addProduct(
  req: Request,
  res: Response,
) {
  const {
    name,
    description,
    price,
    imageUrl,
    isAvailable,
    categoryId,
  } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim()
  ) {
    return res.status(400).json({
      message: "Product name is required",
    });
  }

  if (!isValidPrice(price)) {
    return res.status(400).json({
      message: "Price must be a valid non-negative number",
    });
  }

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    return res.status(400).json({
      message: "Valid categoryId is required",
    });
  }

  if (
    isAvailable !== undefined &&
    typeof isAvailable !== "boolean"
  ) {
    return res.status(400).json({
      message: "isAvailable must be a boolean",
    });
  }

  try {
    const product = await createProduct({
      name: name.trim(),
      description:
        typeof description === "string"
          ? description.trim()
          : undefined,
      price,
      imageUrl:
        typeof imageUrl === "string"
          ? imageUrl.trim()
          : undefined,
      isAvailable:
        isAvailable ?? true,
      categoryId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create product",
    });
  }
}

export async function editProduct(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const {
    name,
    description,
    price,
    imageUrl,
    isAvailable,
    categoryId,
  } = req.body;

  const data: {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    categoryId?: number;
  } = {};

  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        message: "Invalid product name",
      });
    }

    data.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({
        message: "Invalid description",
      });
    }

    data.description = description.trim();
  }

  if (price !== undefined) {
    if (!isValidPrice(price)) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    data.price = price;
  }

  if (imageUrl !== undefined) {
    if (typeof imageUrl !== "string") {
      return res.status(400).json({
        message: "Invalid image URL",
      });
    }

    data.imageUrl = imageUrl.trim();
  }

  if (isAvailable !== undefined) {
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be a boolean",
      });
    }

    data.isAvailable = isAvailable;
  }

  if (categoryId !== undefined) {
    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid categoryId",
      });
    }

    data.categoryId = categoryId;
  }

  try {
    const product = await updateProduct(id, data);

    res.json(product);
  } catch (error) {
    res.status(404).json({
      message:
        error instanceof Error
          ? error.message
          : "Product not found",
    });
  }
}

export async function removeProduct(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  try {
    const product = await deleteProduct(id);

    res.json(product);
  } catch {
    res.status(404).json({
      message: "Product not found",
    });
  }
}
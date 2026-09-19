import type { Request, Response } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/category.service.js";

function parseId(value: string | string[] | undefined): number | null {

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

export async function getAllCategories(
  _req: Request,
  res: Response,
) {
  const categories = await getCategories();

  res.json(categories);
}

export async function getCategory(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  const category = await getCategoryById(id);

  if (!category) {
    return res.status(404).json({
      message: "Category not found",
    });
  }

  res.json(category);
}

export async function addCategory(
  req: Request,
  res: Response,
) {
  const name =
    typeof req.body.name === "string"
      ? req.body.name.trim()
      : "";

  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  try {
    const category = await createCategory(name);

    res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create category",
    });
  }
}

export async function editCategory(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);
  const name =
    typeof req.body.name === "string"
      ? req.body.name.trim()
      : "";

  if (id === null) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  try {
    const category = await updateCategory(id, name);

    res.json(category);
  } catch {
    res.status(404).json({
      message: "Category not found",
    });
  }
}

export async function removeCategory(
  req: Request,
  res: Response,
) {
  const id = parseId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: "Invalid category ID",
    });
  }

  try {
    const category = await deleteCategory(id);

    res.json(category);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete category";

    const status =
      message.includes("contains products")
        ? 409
        : 404;

    res.status(status).json({ message });
  }
}
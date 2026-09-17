import { prisma } from "../lib/prisma.js";

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  categoryId: number;
}) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return prisma.product.create({
    data,
    include: {
      category: true,
    },
  });
}

export async function updateProduct(
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    categoryId?: number;
  },
) {
  if (data.categoryId !== undefined) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }
  }

  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}
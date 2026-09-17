import { prisma } from "../lib/prisma.js";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });
}

export async function createCategory(name: string) {
  return prisma.category.create({
    data: {
      name,
    },
  });
}

export async function updateCategory(
  id: number,
  name: string,
) {
  return prisma.category.update({
    where: { id },
    data: {
      name,
    },
  });
}

export async function deleteCategory(id: number) {
  const productCount = await prisma.product.count({
    where: {
      categoryId: id,
    },
  });

  if (productCount > 0) {
    throw new Error(
      "Cannot delete a category that contains products",
    );
  }

  return prisma.category.delete({
    where: { id },
  });
}
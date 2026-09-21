import type {
  Category,
  Product,
} from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ??
        "Request failed",
    );
  }

  return data;
}

export function getCategories() {
  return request<Category[]>(
    "/categories",
  );
}

export function getProducts() {
  return request<Product[]>(
    "/products",
  );
}
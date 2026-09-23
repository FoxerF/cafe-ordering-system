import type {
  Category,
  Order,
  PickupSlot,
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
      data.message ?? "Request failed",
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

export function getPickupSlots() {
  return request<PickupSlot[]>(
    "/pickup-slots",
  );
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerComment?: string;
  pickupSlotId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export function createOrder(
  data: CreateOrderInput,
) {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getOrder(
  orderNumber: string,
) {
  return request<Order>(
    `/orders/${encodeURIComponent(
      orderNumber,
    )}`,
  );
}
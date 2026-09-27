import type {
  AdminSummary,
  AuthUser,
  Category,
  Order,
  PickupSlot,
  Product,
} from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3000/api";

export function getAuthToken() {
  return localStorage.getItem(
    "cafe_auth_token",
  );
}

export function setAuthToken(
  token: string,
) {
  localStorage.setItem(
    "cafe_auth_token",
    token,
  );
}

export function clearAuthToken() {
  localStorage.removeItem(
    "cafe_auth_token",
  );
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(
    options?.headers,
  );

  headers.set(
    "Content-Type",
    "application/json",
  );

  const token = getAuthToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Request failed";

    throw new Error(message);
  }

  return data as T;
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

export function login(
  email: string,
  password: string,
) {
  return request<{
    token: string;
    user: AuthUser;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function getCurrentUser() {
  return request<AuthUser>(
    "/auth/me",
  );
}


export function getAdminSummary() {
  return request<AdminSummary>(
    "/admin/summary",
  );
}

export function getAdminOrders() {
  return request<Order[]>(
    "/orders/admin",
  );
}

export function createCategory(
  name: string,
) {
  return request<Category>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
  );
}

export function updateCategory(
  id: number,
  name: string,
) {
  return request<Category>(
    `/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export function deleteCategory(
  id: number,
) {
  return request<Category>(
    `/categories/${id}`,
    {
      method: "DELETE",
    },
  );
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  categoryId: number;
}

export function createProduct(
  data: CreateProductInput,
) {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  id: number,
  data: Partial<CreateProductInput>,
) {
  return request<Product>(
    `/products/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteProduct(
  id: number,
) {
  return request<Product>(
    `/products/${id}`,
    {
      method: "DELETE",
    },
  );
}

export function updateOrderStatus(
  id: number,
  status: string,
) {
  return request<Order>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export interface CreatePickupSlotInput {
  startsAt: string;
  endsAt: string;
  maxOrders: number;
}

export function createPickupSlot(
  data: CreatePickupSlotInput,
) {
  return request<PickupSlot>(
    "/pickup-slots",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function deactivatePickupSlot(
  id: number,
) {
  return request<PickupSlot>(
    `/pickup-slots/${id}/deactivate`,
    {
      method: "PATCH",
    },
  );
}
export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus =
  (typeof ORDER_STATUSES)[number];

export function isOrderStatus(
  value: string,
): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(
    value,
  );
}

export const ALLOWED_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
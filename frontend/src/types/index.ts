export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: number;
  category: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PickupSlot {
  id: number;
  startsAt: string;
  endsAt: string;
  maxOrders: number;
  isActive: boolean;
  currentOrders: number;
  remainingOrders: number;
  available: boolean;
}

export interface OrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id?: number;
  orderNumber: string;
  pickupCode: string;
  customerName?: string;
  customerPhone?: string;
  customerComment?: string | null;
  status: string;
  totalPrice: number;
  estimatedReadyAt: string | null;
  createdAt: string;
  pickupSlot: PickupSlot;
  items: OrderItem[];
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AdminSummarySlot {
  id: number;
  startsAt: string;
  endsAt: string;
  maxOrders: number;
  currentOrders: number;
  remainingOrders: number;
}

export interface AdminSummary {
  activeOrders: number;
  preparingOrders: number;
  readyOrders: number;
  upcomingSlots: AdminSummarySlot[];
}
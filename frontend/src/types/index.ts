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
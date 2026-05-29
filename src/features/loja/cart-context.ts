import { createContext, useContext } from "react";
import type { Product } from "./data/products";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  getProduct: (productId: string) => Product | undefined;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRODUCTS, Product } from "./data/products";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  getProduct: (productId: string) => Product | undefined;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "loja_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const getProduct = (productId: string) =>
    PRODUCTS.find((p) => p.id === productId);

  const addItem = (productId: string, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const clear = () => setItems([]);

  const { totalItems, subtotal } = useMemo(() => {
    let totalItems = 0;
    let subtotal = 0;
    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) continue;
      totalItems += item.quantity;
      subtotal += product.unitPrice * item.quantity;
    }
    return { totalItems, subtotal };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totalItems,
    subtotal,
    getProduct,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}

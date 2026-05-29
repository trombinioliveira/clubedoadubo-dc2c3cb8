import React, { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "./data/products";
import { CartContext, CartContextValue, CartItem, useCart } from "./cart-context";

export type { CartItem };
export { useCart };

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

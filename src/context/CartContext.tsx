import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { ProductType } from "@/types";

export type { ProductType };

interface CartContextProps {
  cart: ProductType[];
  addToCart: (product: ProductType) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ProductType[]>([]);

  const addToCart = useCallback((product: ProductType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, p_qu: (item.p_qu || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, p_qu: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, p_qu: qty } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.p_qu || 1), 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => {
      const cost = typeof item.p_cost === "number" ? item.p_cost : parseFloat(item.p_cost) || 0;
      return acc + cost * (item.p_qu || 1);
    }, 0);
  }, [cart]);

  const contextValue = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalAmount,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalAmount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

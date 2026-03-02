import React,
{
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Product, CartItem } from "@/types/product";
import { products } from "@/data/products"; // ✅ LOCAL PRODUCTS
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {

  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  /*
  =====================================
  LOAD CART
  =====================================
  */
  const loadCart = async () => {

    if (!user) {
      setItems([]);
      return;
    }

    const { data: cartRows, error } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", user.id);

    if (error || !cartRows) return;

    /* ✅ merge using LOCAL products.ts */
    const merged: CartItem[] = cartRows
      .map(cart => {

        const product = products.find(
          p => p.id === cart.product_id
        );

        if (!product) return null;

        return {
          product,
          size: cart.size,
          quantity: cart.quantity,
        };
      })
      .filter(Boolean) as CartItem[];

    setItems(merged);
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  /*
  =====================================
  ADD
  =====================================
  */
  const addToCart = async (
    product: Product,
    size: string,
    quantity = 1
  ) => {

    if (!user) {
      toast.error("Login required");
      return;
    }

    const { error } = await supabase
      .from("carts")
      .upsert(
        {
          user_id: user.id,
          product_id: product.id,
          size,
          quantity,
        },
        {
          onConflict: "user_id,product_id,size",
        }
      );

    if (!error) {
      toast.success("Added to cart");
      loadCart();
    }
  };

  /*
  =====================================
  REMOVE
  =====================================
  */
  const removeFromCart = async (
    productId: string,
    size: string
  ) => {

    if (!user) return;

    await supabase
      .from("carts")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("size", size);

    loadCart();
  };

  /*
  =====================================
  UPDATE
  =====================================
  */
  const updateQuantity = async (
    productId: string,
    size: string,
    quantity: number
  ) => {

    if (!user) return;

    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    await supabase
      .from("carts")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("size", size);

    loadCart();
  };

  /*
  =====================================
  CLEAR
  =====================================
  */
  const clearCart = async () => {

    if (!user) return;

    await supabase
      .from("carts")
      .delete()
      .eq("user_id", user.id);

    setItems([]);
  };

  /*
  =====================================
  TOTALS
  =====================================
  */
  const totalItems = items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCart must be inside CartProvider");
  return ctx;
};
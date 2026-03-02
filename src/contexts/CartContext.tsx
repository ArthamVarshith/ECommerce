import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Product, CartItem } from "@/types/product";
import { products } from "@/data/products";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

import { db } from "@/integrations/firebase/client";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

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

    const cartRef = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(cartRef);

    const merged: CartItem[] = snapshot.docs
      .map((docSnap) => {
        const data = docSnap.data();

        const product = products.find(
          (p) => p.id === data.productId
        );

        if (!product) return null;

        return {
          product,
          size: data.size,
          quantity: data.quantity,
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

    const cartRef = collection(db, "users", user.uid, "cart");

    const q = query(
      cartRef,
      where("productId", "==", product.id),
      where("size", "==", size)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0];
      const existingData = existingDoc.data();

      await updateDoc(existingDoc.ref, {
        quantity: existingData.quantity + quantity,
      });

      toast.success("Updated cart");
      loadCart();
      return;
    }

    await addDoc(cartRef, {
      productId: product.id,
      size,
      quantity,
    });

    toast.success("Added to cart");
    loadCart();
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

    const cartRef = collection(db, "users", user.uid, "cart");

    const q = query(
      cartRef,
      where("productId", "==", productId),
      where("size", "==", size)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

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

    const cartRef = collection(db, "users", user.uid, "cart");

    const q = query(
      cartRef,
      where("productId", "==", productId),
      where("size", "==", size)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { quantity });
    });

    loadCart();
  };

  /*
  =====================================
  CLEAR
  =====================================
  */
  const clearCart = async () => {
    if (!user) return;

    const cartRef = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(cartRef);

    snapshot.forEach(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

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
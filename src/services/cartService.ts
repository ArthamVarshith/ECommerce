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

import { products } from "@/data/products";
import { CartItem, Product } from "@/types/product";

/*
------------------------------------
GET PRODUCT FROM LOCAL FILE
------------------------------------
*/
const getProduct = (productId: string): Product | undefined => {
  return products.find((p) => p.id === productId);
};

/*
------------------------------------
GET CART ITEMS
------------------------------------
*/
export const getCartItems = async (
  userId: string
): Promise<CartItem[]> => {
  const cartRef = collection(db, "users", userId, "cart");
  const snapshot = await getDocs(cartRef);

  const cartItems: CartItem[] = snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const product = getProduct(data.productId);

      if (!product) return null;

      return {
        product,
        quantity: data.quantity,
        size: data.size,
        cartId: docSnap.id,
      };
    })
    .filter(Boolean) as CartItem[];

  return cartItems;
};

/*
------------------------------------
ADD TO CART
------------------------------------
*/
export const addToCart = async (
  userId: string,
  productId: string,
  size: string,
  quantity: number
) => {
  const cartRef = collection(db, "users", userId, "cart");

  const q = query(
    cartRef,
    where("productId", "==", productId),
    where("size", "==", size)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    const existingData = existingDoc.data();

    await updateDoc(existingDoc.ref, {
      quantity: existingData.quantity + quantity,
    });

    return;
  }

  await addDoc(cartRef, {
    productId,
    size,
    quantity,
  });
};

/*
------------------------------------
REMOVE ITEM
------------------------------------
*/
export const removeFromCart = async (
  userId: string,
  cartId: string
) => {
  const cartDoc = doc(db, "users", userId, "cart", cartId);
  await deleteDoc(cartDoc);
};

/*
------------------------------------
CLEAR CART
------------------------------------
*/
export const clearCart = async (userId: string) => {
  const cartRef = collection(db, "users", userId, "cart");
  const snapshot = await getDocs(cartRef);

  const deletions = snapshot.docs.map((docSnap) =>
    deleteDoc(docSnap.ref)
  );

  await Promise.all(deletions);
};
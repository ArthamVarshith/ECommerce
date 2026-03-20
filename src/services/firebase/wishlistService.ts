import { db } from "@/integrations/firebase/client";
import {
    collection,
    getDocs,
    query,
    where,
    addDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

/**
 * Fetches all wishlist product IDs for a given user.
 */
export const fetchWishlistIds = async (userId: string): Promise<string[]> => {
    const wishlistRef = collection(db, "users", userId, "wishlist");
    const snapshot = await getDocs(wishlistRef);
    return snapshot.docs.map((docSnap) => docSnap.data().productId);
};

/**
 * Adds a product to the user's wishlist.
 */
export const addWishlistItem = async (
    userId: string,
    productId: string
): Promise<void> => {
    const wishlistRef = collection(db, "users", userId, "wishlist");
    await addDoc(wishlistRef, {
        productId,
        createdAt: serverTimestamp(),
    });
};

/**
 * Removes a product from the user's wishlist.
 * Uses Promise.all instead of forEach+async to properly await all deletions.
 */
export const removeWishlistItem = async (
    userId: string,
    productId: string
): Promise<void> => {
    const wishlistRef = collection(db, "users", userId, "wishlist");
    const q = query(wishlistRef, where("productId", "==", productId));
    const snapshot = await getDocs(q);

    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
};

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
    getDoc,
    runTransaction,
    serverTimestamp,
} from "firebase/firestore";

import type { CartItem, Product } from "@/types/product";

// Simple in-memory cache for product lookups during cart load
const productCache = new Map<string, Product | null>();

/**
 * Resolves a product from Firestore by ID, with in-memory caching
 * to avoid N+1 reads when loading multiple cart items.
 */
const resolveProduct = async (productId: string): Promise<Product | null> => {
    if (productCache.has(productId)) {
        return productCache.get(productId)!;
    }

    const docSnap = await getDoc(doc(db, "products", productId));
    if (!docSnap.exists()) {
        productCache.set(productId, null);
        return null;
    }

    const data = docSnap.data();
    const product: Product = {
        id: docSnap.id,
        name: data.name,
        slug: data.slug,
        price: data.price,
        originalPrice: data.originalPrice,
        description: data.description,
        category: data.category,
        images: data.images || [],
        sizes: data.sizes || [],
        variants: data.variants || [],
        stock: data.stock ?? 0,
        inStock: data.inStock ?? true,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        isNew: data.isNew ?? false,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        createdBy: data.createdBy ?? "",
    };

    productCache.set(productId, product);
    return product;
};

/**
 * Fetches all cart items for a given user.
 * Resolves product details from Firestore (cached per session).
 */
export const fetchCartItems = async (userId: string): Promise<CartItem[]> => {
    const cartRef = collection(db, "users", userId, "cart");
    const snapshot = await getDocs(cartRef);

    const items: CartItem[] = [];

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const product = await resolveProduct(data.productId);
        if (!product || !product.isActive) continue;
        items.push({ product, size: data.size, quantity: data.quantity });
    }

    return items;
};

/**
 * Adds an item to the cart or increments quantity if it already exists.
 * Uses a Firestore transaction to prevent race conditions.
 */
export const addCartItem = async (
    userId: string,
    productId: string,
    size: string,
    quantity: number
): Promise<void> => {
    const cartRef = collection(db, "users", userId, "cart");

    // Check if item already exists
    const q = query(
        cartRef,
        where("productId", "==", productId),
        where("size", "==", size)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        // Update existing item via transaction for safety
        const existingDoc = snapshot.docs[0];
        await runTransaction(db, async (transaction) => {
            const freshDoc = await transaction.get(existingDoc.ref);
            if (!freshDoc.exists()) return;
            const currentQty = freshDoc.data().quantity ?? 0;
            transaction.update(existingDoc.ref, {
                quantity: currentQty + quantity,
                updatedAt: serverTimestamp(),
            });
        });
    } else {
        await addDoc(cartRef, {
            productId,
            size,
            quantity,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
};

/**
 * Removes a specific item (by productId + size) from the cart.
 */
export const removeCartItem = async (
    userId: string,
    productId: string,
    size: string
): Promise<void> => {
    const cartRef = collection(db, "users", userId, "cart");
    const q = query(
        cartRef,
        where("productId", "==", productId),
        where("size", "==", size)
    );
    const snapshot = await getDocs(q);

    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
};

/**
 * Updates the quantity of a specific cart item.
 */
export const updateCartItemQuantity = async (
    userId: string,
    productId: string,
    size: string,
    quantity: number
): Promise<void> => {
    const cartRef = collection(db, "users", userId, "cart");
    const q = query(
        cartRef,
        where("productId", "==", productId),
        where("size", "==", size)
    );
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { quantity, updatedAt: serverTimestamp() })
    );
    await Promise.all(updates);
};

/**
 * Clears all items from the user's cart.
 */
export const clearCartItems = async (userId: string): Promise<void> => {
    const cartRef = collection(db, "users", userId, "cart");
    const snapshot = await getDocs(cartRef);

    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
};

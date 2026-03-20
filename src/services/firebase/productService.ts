import { db } from "@/integrations/firebase/client";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit as firestoreLimit,
    startAfter,
    serverTimestamp,
    runTransaction,
    DocumentSnapshot,
    QueryConstraint,
} from "firebase/firestore";
import type { Product } from "@/types/product";

const PRODUCTS_COLLECTION = "products";

// ============================================
// Helper: Convert Firestore doc to Product
// ============================================
const docToProduct = (docSnap: DocumentSnapshot): Product | null => {
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
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
    } as Product;
};

// ============================================
// READ Operations
// ============================================

/** Fetch a single product by ID */
export const getProductById = async (
    productId: string
): Promise<Product | null> => {
    const docSnap = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return docToProduct(docSnap);
};

/** Fetch products with pagination and filtering (admin) */
export const getProducts = async (options: {
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
    category?: string;
    activeOnly?: boolean;
}): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> => {
    const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];

    if (options.activeOnly) {
        constraints.unshift(where("isActive", "==", true));
    }
    if (options.category) {
        constraints.push(where("category", "==", options.category));
    }
    if (options.pageSize) {
        constraints.push(firestoreLimit(options.pageSize));
    }
    if (options.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
    }

    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const products = snapshot.docs
        .map(docToProduct)
        .filter(Boolean) as Product[];

    const lastDocSnap =
        snapshot.docs.length > 0
            ? snapshot.docs[snapshot.docs.length - 1]
            : null;

    return { products, lastDoc: lastDocSnap };
};

/** Fetch all active products (customer-facing) */
export const getActiveProducts = async (): Promise<Product[]> => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(docToProduct).filter(Boolean) as Product[];
    // Sort client-side to avoid requiring composite index
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/** Fetch active products by category */
export const getProductsByCategory = async (
    categorySlug: string
): Promise<Product[]> => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("isActive", "==", true),
        where("category", "==", categorySlug)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(docToProduct).filter(Boolean) as Product[];
    // Sort client-side to avoid requiring composite index
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/** Fetch featured products */
export const getFeaturedProducts = async (): Promise<Product[]> => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("isActive", "==", true),
        where("isFeatured", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct).filter(Boolean) as Product[];
};

/** Fetch new arrivals */
export const getNewArrivals = async (): Promise<Product[]> => {
    const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("isActive", "==", true),
        where("isNew", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct).filter(Boolean) as Product[];
};

// ============================================
// WRITE Operations (Admin only)
// ============================================

/** Create a new product */
export const createProduct = async (
    data: Omit<Product, "id" | "createdAt" | "updatedAt">,
    adminUid: string
): Promise<string> => {
    const productRef = doc(collection(db, PRODUCTS_COLLECTION));
    await setDoc(productRef, {
        ...data,
        createdBy: adminUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return productRef.id;
};

/** Update an existing product */
export const updateProduct = async (
    productId: string,
    data: Partial<Product>
): Promise<void> => {
    // Remove fields that shouldn't be overwritten
    const { id, createdAt, createdBy, ...updateData } = data as any;
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        ...updateData,
        updatedAt: serverTimestamp(),
    });
};

/** Soft-delete a product (set isActive: false) */
export const deleteProduct = async (productId: string): Promise<void> => {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        isActive: false,
        updatedAt: serverTimestamp(),
    });
};

/** Hard-delete a product (permanent removal) */
export const hardDeleteProduct = async (productId: string): Promise<void> => {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
};

/** Toggle stock availability */
export const toggleProductStock = async (
    productId: string,
    inStock: boolean
): Promise<void> => {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        inStock,
        updatedAt: serverTimestamp(),
    });
};

/** Update stock quantity atomically */
export const updateProductStock = async (
    productId: string,
    newStock: number
): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const ref = doc(db, PRODUCTS_COLLECTION, productId);
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw new Error("Product not found");

        transaction.update(ref, {
            stock: newStock,
            inStock: newStock > 0,
            updatedAt: serverTimestamp(),
        });
    });
};

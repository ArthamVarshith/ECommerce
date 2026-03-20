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
    serverTimestamp,
    DocumentSnapshot,
    Timestamp,
} from "firebase/firestore";

import type { Category } from "@/types/product";

const CATEGORIES_COLLECTION = "categories";

/* =====================================================
   Helper: Convert Firestore Document → Category
===================================================== */
const docToCategory = (docSnap: DocumentSnapshot): Category | null => {
    if (!docSnap.exists()) return null;

    const data = docSnap.data();

    return {
        id: docSnap.id,
        name: data?.name ?? "",
        description: data?.description ?? "",
        image: data?.image ?? "",
        slug: data?.slug ?? "",
        order: data?.order ?? 0,
        isActive: data?.isActive ?? true,
        createdAt:
            data?.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : data?.createdAt ?? new Date(),
        updatedAt:
            data?.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate()
                : data?.updatedAt ?? new Date(),
    };
};

/* =====================================================
   READ OPERATIONS
===================================================== */

/** Fetch all active categories (customer-facing) */
export const getActiveCategories = async (): Promise<Category[]> => {
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where("isActive", "==", true)
    );

    const snapshot = await getDocs(q);

    const categories = snapshot.docs
        .map(docToCategory)
        .filter((c): c is Category => c !== null);

    // Sort client-side to avoid requiring composite index
    return categories.sort((a, b) => a.order - b.order);
};

/** Fetch all categories (admin) */
export const getAllCategories = async (): Promise<Category[]> => {
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs
        .map(docToCategory)
        .filter((c): c is Category => c !== null);
};

/** Fetch single category by ID */
export const getCategoryById = async (
    categoryId: string
): Promise<Category | null> => {
    const docSnap = await getDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
    return docToCategory(docSnap);
};

/** Fetch category by slug (customer-facing, active only) */
export const getCategoryBySlug = async (
    slug: string
): Promise<Category | null> => {
    const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where("slug", "==", slug),
        where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return docToCategory(snapshot.docs[0]);
};

/* =====================================================
   WRITE OPERATIONS (Admin)
===================================================== */

/** Create category */
export const createCategory = async (
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
    const categoryRef = doc(collection(db, CATEGORIES_COLLECTION));

    await setDoc(categoryRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return categoryRef.id;
};

/** Update category */
export const updateCategory = async (
    categoryId: string,
    data: Partial<Category>
): Promise<void> => {
    const { id, createdAt, updatedAt, ...updateData } = data;

    await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), {
        ...updateData,
        updatedAt: serverTimestamp(),
    });
};

/** Delete category */
export const deleteCategory = async (
    categoryId: string
): Promise<void> => {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
};
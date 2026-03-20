import { db } from "@/integrations/firebase/client";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    orderBy,
    limit as firestoreLimit,
    startAfter,
    serverTimestamp,
    DocumentSnapshot,
    QueryConstraint,
} from "firebase/firestore";
import type { UserProfile } from "@/types/product";

const USERS_COLLECTION = "users";

// ============================================
// Helper: Convert Firestore doc to UserProfile
// ============================================
const docToUserProfile = (docSnap: DocumentSnapshot): UserProfile | null => {
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
        id: docSnap.id,
        email: data.email ?? "",
        displayName: data.displayName ?? "",
        role: data.role ?? "customer",
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive ?? true,
        orderCount: data.orderCount ?? 0,
        totalSpent: data.totalSpent ?? 0,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        lastLoginAt: data.lastLoginAt?.toDate?.() ?? new Date(),
    } as UserProfile;
};

// ============================================
// READ Operations
// ============================================

/** Fetch a user profile by UID */
export const getUserProfile = async (
    userId: string
): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    return docToUserProfile(docSnap);
};

/** Fetch all users with pagination (admin) */
export const getUsers = async (options: {
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
}): Promise<{ users: UserProfile[]; lastDoc: DocumentSnapshot | null }> => {
    const constraints: QueryConstraint[] = [];

    if (options.pageSize) {
        constraints.push(firestoreLimit(options.pageSize));
    }
    if (options.lastDoc) {
        constraints.push(startAfter(options.lastDoc));
    }

    const q = query(collection(db, USERS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const users = snapshot.docs
        .map(docToUserProfile)
        .filter(Boolean) as UserProfile[];

    // Sort client-side to avoid requiring composite index
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const lastDocSnap =
        snapshot.docs.length > 0
            ? snapshot.docs[snapshot.docs.length - 1]
            : null;

    return { users, lastDoc: lastDocSnap };
};

// ============================================
// WRITE Operations
// ============================================

/** Create or update a user profile (called on first login / registration) */
export const createUserProfile = async (
    userId: string,
    data: {
        email: string;
        displayName: string;
    }
): Promise<void> => {
    await setDoc(
        doc(db, USERS_COLLECTION, userId),
        {
            email: data.email,
            displayName: data.displayName,
            role: "customer",
            isActive: true,
            orderCount: 0,
            totalSpent: 0,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        },
        { merge: true }
    );
};

/** Update user profile fields */
export const updateUserProfile = async (
    userId: string,
    data: Partial<UserProfile>
): Promise<void> => {
    const { id, createdAt, ...updateData } = data as any;
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        ...updateData,
    });
};

/** Toggle user active status (admin) */
export const toggleUserActive = async (
    userId: string,
    isActive: boolean
): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        isActive,
    });
};

/** Update last login timestamp */
export const updateLastLogin = async (userId: string): Promise<void> => {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
        lastLoginAt: serverTimestamp(),
    });
};

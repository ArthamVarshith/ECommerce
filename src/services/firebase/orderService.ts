import { db } from "@/integrations/firebase/client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  serverTimestamp,
  runTransaction,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
  increment,
} from "firebase/firestore";

import type { CartItem, Order, OrderStatus } from "@/types/product";

const ORDERS_COLLECTION = "orders";

/* =====================================================
   Types
===================================================== */

interface FirestoreStatusHistory {
  status: OrderStatus;
  timestamp: Timestamp | Date;
  changedBy: string;
}

/* =====================================================
   Helper: Convert Firestore Document → Order
===================================================== */
const docToOrder = (docSnap: DocumentSnapshot): Order | null => {
  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  const statusHistory: FirestoreStatusHistory[] =
    (data?.statusHistory ?? []) as FirestoreStatusHistory[];

  return {
    id: docSnap.id,
    userId: data?.userId ?? "",
    userEmail: data?.userEmail ?? "",
    items: data?.items ?? [],
    subtotal: data?.subtotal ?? data?.total ?? 0,
    shippingCost: data?.shippingCost ?? 0,
    total: data?.total ?? 0,
    shipping: data?.shipping ?? {},
    status: data?.status ?? "pending",
    statusHistory: statusHistory.map((sh) => ({
      status: sh.status,
      changedBy: sh.changedBy,
      timestamp:
        sh.timestamp instanceof Date
          ? sh.timestamp
          : sh.timestamp?.toDate?.() ?? new Date(),
    })),
    trackingNumber: data?.trackingNumber ?? "",
    notes: data?.notes ?? "",
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
   CUSTOMER OPERATIONS
===================================================== */

export const placeOrder = async (
  userId: string,
  userEmail: string,
  cartItems: CartItem[],
  subtotal: number,
  shippingCost: number,
  total: number,
  shipping: {
    name: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  }
): Promise<string> => {
  const orderRef = doc(collection(db, ORDERS_COLLECTION));

  // Pre-fetch cart docs before entering transaction (reads outside txn are fine)
  const cartSnapshot = await getDocs(
    collection(db, "users", userId, "cart")
  );

  await runTransaction(db, async (transaction) => {
    // 1. Read all product docs to verify stock
    const productRefs = cartItems.map((item) =>
      doc(db, "products", item.product.id)
    );
    const productSnaps = await Promise.all(
      productRefs.map((ref) => transaction.get(ref))
    );

    // 2. Validate stock availability
    for (let i = 0; i < cartItems.length; i++) {
      const snap = productSnaps[i];
      if (!snap.exists()) {
        throw new Error(`Product "${cartItems[i].product.name}" no longer exists.`);
      }
      const currentStock = snap.data().stock ?? 0;
      if (currentStock < cartItems[i].quantity) {
        throw new Error(
          `Insufficient stock for "${cartItems[i].product.name}". Available: ${currentStock}, Requested: ${cartItems[i].quantity}`
        );
      }
    }

    // 3. Decrement stock for each product
    for (let i = 0; i < cartItems.length; i++) {
      const snap = productSnaps[i];
      const currentStock = snap.data()!.stock ?? 0;
      const newStock = currentStock - cartItems[i].quantity;
      transaction.update(productRefs[i], {
        stock: newStock,
        inStock: newStock > 0,
        updatedAt: serverTimestamp(),
      });
    }

    // 4. Create the order
    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    transaction.set(orderRef, {
      userId,
      userEmail,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      shipping,
      status: "pending" as OrderStatus,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          changedBy: userId,
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 5. Clear cart items
    cartSnapshot.docs.forEach((cartDoc) => {
      transaction.delete(cartDoc.ref);
    });

    // 6. Update user profile stats (orderCount & totalSpent)
    const userRef = doc(db, "users", userId);
    transaction.update(userRef, {
      orderCount: increment(1),
      totalSpent: increment(total),
    });
  });

  return orderRef.id;
};

export const getUserOrders = async (
  userId: string
): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  const orders = snapshot.docs
    .map(docToOrder)
    .filter((order): order is Order => order !== null);

  // Sort client-side to avoid requiring a composite index
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return orders;
};

/* =====================================================
   ADMIN OPERATIONS
===================================================== */

export const getOrderById = async (
  orderId: string
): Promise<Order | null> => {
  const docSnap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
  return docToOrder(docSnap);
};

export const getOrders = async (options?: {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
  status?: OrderStatus;
}): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (options?.status) {
      constraints.push(where("status", "==", options.status));
    }

    constraints.push(orderBy("createdAt", "desc"));

    if (options?.pageSize) {
      constraints.push(firestoreLimit(options.pageSize));
    }

    if (options?.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const q = query(collection(db, ORDERS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    const orders = snapshot.docs
      .map(docToOrder)
      .filter((order): order is Order => order !== null);

    const lastDocSnap =
      snapshot.docs.length > 0
        ? snapshot.docs[snapshot.docs.length - 1]
        : null;

    return { orders, lastDoc: lastDocSnap };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { orders: [], lastDoc: null };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  adminUid: string,
  trackingNumber?: string,
  notes?: string
): Promise<void> => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const currentData = orderSnap.data();
    const existingHistory =
      (currentData.statusHistory ?? []) as FirestoreStatusHistory[];

    const updatedHistory = [
      ...existingHistory,
      {
        status: newStatus,
        timestamp: new Date(),
        changedBy: adminUid,
      },
    ];

    const updateData: Record<string, unknown> = {
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: serverTimestamp(),
    };

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    transaction.update(orderRef, updateData);
  });
};
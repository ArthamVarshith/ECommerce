import { db } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import type { MonthlyAnalytics } from "@/types/product";

// ============================================
// Helper: Format month key as YYYY-MM
// ============================================
const getMonthKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

// ============================================
// READ Operations (Admin only)
// ============================================

/** Fetch analytics for a given month */
export const getMonthlyAnalytics = async (
    date: Date
): Promise<MonthlyAnalytics | null> => {
    const monthKey = getMonthKey(date);
    const docSnap = await getDoc(doc(db, "analytics", monthKey));

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        totalOrders: data.totalOrders ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        newUsers: data.newUsers ?? 0,
        productsSold: data.productsSold ?? {},
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    };
};

/** Fetch analytics for the last N months */
export const getAnalyticsRange = async (
    months: number = 6
): Promise<MonthlyAnalytics[]> => {
    const results: MonthlyAnalytics[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const data = await getMonthlyAnalytics(targetDate);
        if (data) {
            results.push(data);
        } else {
            // Return zero-filled entry for months with no data
            results.push({
                totalOrders: 0,
                totalRevenue: 0,
                newUsers: 0,
                productsSold: {},
                updatedAt: targetDate,
            });
        }
    }

    return results.reverse(); // Oldest first
};

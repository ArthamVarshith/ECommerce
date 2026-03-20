import { db } from "@/integrations/firebase/client";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import type { AppSettings } from "@/types/product";

const SETTINGS_DOC_PATH = "settings/app";

/**
 * Default application settings — used when no settings document exists.
 */
const DEFAULT_SETTINGS: AppSettings = {
    siteName: "ATELIER",
    currency: "USD",
    freeShippingThreshold: 150,
    standardShippingCost: 12,
    taxRate: 0,
    maintenanceMode: false,
    announcements: [],
    updatedAt: new Date(),
};

// ============================================
// READ
// ============================================

/** Fetch application settings */
export const getAppSettings = async (): Promise<AppSettings> => {
    const docSnap = await getDoc(doc(db, SETTINGS_DOC_PATH));

    if (!docSnap.exists()) {
        return DEFAULT_SETTINGS;
    }

    const data = docSnap.data();
    return {
        siteName: data.siteName ?? DEFAULT_SETTINGS.siteName,
        currency: data.currency ?? DEFAULT_SETTINGS.currency,
        freeShippingThreshold:
            data.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold,
        standardShippingCost:
            data.standardShippingCost ?? DEFAULT_SETTINGS.standardShippingCost,
        taxRate: data.taxRate ?? DEFAULT_SETTINGS.taxRate,
        maintenanceMode: data.maintenanceMode ?? false,
        announcements: data.announcements ?? [],
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
    };
};

// ============================================
// WRITE (Admin only)
// ============================================

/** Update application settings (merge) */
export const updateAppSettings = async (
    data: Partial<AppSettings>
): Promise<void> => {
    const { updatedAt, ...settingsData } = data;
    await setDoc(
        doc(db, SETTINGS_DOC_PATH),
        {
            ...settingsData,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );
};

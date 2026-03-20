import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { getAppSettings } from "@/services/firebase/settingsService";
import type { AppSettings } from "@/types/product";

interface SettingsContextType {
    settings: AppSettings;
    loading: boolean;
}

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

const SettingsContext = createContext<SettingsContextType>({
    settings: DEFAULT_SETTINGS,
    loading: true,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAppSettings();
                setSettings(data);
            } catch (error) {
                console.error("[SettingsContext] Failed to load settings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

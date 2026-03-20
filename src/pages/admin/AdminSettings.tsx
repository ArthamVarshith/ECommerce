import { useEffect, useState } from "react";
import {
    getAppSettings,
    updateAppSettings,
} from "@/services/firebase/settingsService";
import type { AppSettings } from "@/types/product";
import { toast } from "sonner";
import { Save, Settings } from "lucide-react";

const AdminSettings = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getAppSettings();
                setSettings(data);
            } catch (error) {
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (!settings) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setSettings({
            ...settings,
            [name]:
                type === "checkbox"
                    ? checked
                    : type === "number"
                        ? parseFloat(value) || 0
                        : value,
        });
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await updateAppSettings(settings);
            toast.success("Settings saved successfully.");
        } catch (error) {
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">Loading settings...</div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display text-white tracking-wide">
                        Settings
                    </h1>
                    <p className="text-sm text-gray-500 font-body mt-1">
                        Application-wide configuration
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-body px-4 py-2.5 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>

            {/* General */}
            <SettingsSection title="General" icon={<Settings className="w-4 h-4" />}>
                <SettingsField
                    label="Site Name"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                />
                <SettingsField
                    label="Currency"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    placeholder="USD"
                />
            </SettingsSection>

            {/* Shipping */}
            <SettingsSection title="Shipping">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsField
                        label="Free Shipping Threshold ($)"
                        name="freeShippingThreshold"
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={handleChange}
                    />
                    <SettingsField
                        label="Standard Shipping Cost ($)"
                        name="standardShippingCost"
                        type="number"
                        value={settings.standardShippingCost}
                        onChange={handleChange}
                    />
                </div>
                <SettingsField
                    label="Tax Rate (%)"
                    name="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={handleChange}
                    step={0.01}
                />
            </SettingsSection>

            {/* Maintenance */}
            <SettingsSection title="Maintenance">
                <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer font-body">
                    <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-white/20 bg-[#0f0f12] text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    Enable Maintenance Mode
                    <span className="text-xs text-gray-500">
                        (shows maintenance page to all visitors)
                    </span>
                </label>
            </SettingsSection>

            {/* Announcements */}
            <SettingsSection title="Announcements">
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-body mb-1.5 block">
                        Announcement Messages (one per line)
                    </label>
                    <textarea
                        value={settings.announcements.join("\n")}
                        onChange={(e) =>
                            setSettings({
                                ...settings,
                                announcements: e.target.value
                                    .split("\n")
                                    .filter((a) => a.trim()),
                            })
                        }
                        rows={3}
                        placeholder="Free shipping on orders over $150..."
                        className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    />
                </div>
            </SettingsSection>
        </div>
    );
};

const SettingsSection = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) => (
    <div className="bg-[#16161d] border border-white/5 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <h2 className="text-lg font-display text-white">{title}</h2>
        </div>
        {children}
    </div>
);

const SettingsField = ({
    label,
    name,
    ...rest
}: {
    label: string;
    name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider font-body mb-1.5 block">
            {label}
        </label>
        <input
            name={name}
            {...rest}
            className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
    </div>
);

export default AdminSettings;

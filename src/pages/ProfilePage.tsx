import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserOrders } from "@/services/firebase/orderService";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import type { Order } from "@/types/product";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Package,
    Settings,
    Sun,
    Moon,
    Lock,
    LogOut,
    ChevronDown,
    ChevronRight,
    Calendar,
    Mail,
} from "lucide-react";

type Tab = "account" | "orders" | "settings";

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Account", icon: <User size={18} /> },
    { id: "orders", label: "My Orders", icon: <Package size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

const ProfilePage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>("account");

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-16 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-10"
                >
                    <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-display font-semibold">
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                        <h1 className="font-display text-2xl lg:text-3xl text-foreground">
                            {user.displayName || "My Account"}
                        </h1>
                        <p className="font-body text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
                    {TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-body text-sm transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                                    ? "border-foreground text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "account" && <AccountTab />}
                        {activeTab === "orders" && <OrdersTab />}
                        {activeTab === "settings" && <SettingsTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Layout>
    );
};

/* ──────────── Account Tab ──────────── */
const AccountTab = () => {
    const { user } = useAuth();

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "—";

    const lastSignIn = user?.metadata?.lastSignInTime
        ? new Date(user.metadata.lastSignInTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-lg p-6 space-y-5">
                <h2 className="font-display text-lg text-foreground">Profile Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InfoCard icon={<User size={16} />} label="Name" value={user?.displayName || "—"} />
                    <InfoCard icon={<Mail size={16} />} label="Email" value={user?.email || "—"} />
                    <InfoCard icon={<Calendar size={16} />} label="Member Since" value={memberSince} />
                    <InfoCard icon={<Calendar size={16} />} label="Last Sign In" value={lastSignIn} />
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-background text-muted-foreground flex-shrink-0">{icon}</div>
        <div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="font-body text-sm text-foreground mt-0.5">{value}</p>
        </div>
    </div>
);

/* ──────────── Orders Tab ──────────── */
const OrdersTab = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            if (!user) return;
            try {
                const result = await getUserOrders(user.uid);
                setOrders(result);
            } catch (error) {
                console.error("[ProfilePage] Failed to load orders:", error);
                toast.error("Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-pulse font-body text-sm text-muted-foreground">Loading orders...</div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-body text-sm text-muted-foreground">No orders yet.</p>
                <p className="font-body text-xs text-muted-foreground/60 mt-1">
                    Your order history will appear here after your first purchase.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="border border-border rounded-lg overflow-hidden"
                >
                    {/* Order header */}
                    <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/50 transition-colors"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div>
                                <p className="font-body text-sm text-foreground">
                                    Order #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="font-body text-xs text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadge status={order.status} />
                            <span className="font-body text-sm font-medium text-foreground">
                                ${order.total.toFixed(2)}
                            </span>
                            {expandedOrder === order.id ? (
                                <ChevronDown size={16} className="text-muted-foreground" />
                            ) : (
                                <ChevronRight size={16} className="text-muted-foreground" />
                            )}
                        </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                        {expandedOrder === order.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-border"
                            >
                                <div className="px-5 py-4 space-y-3 bg-secondary/30">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between font-body text-sm">
                                            <span className="text-foreground">
                                                {item.name} ({item.size}) × {item.quantity}
                                            </span>
                                            <span className="text-muted-foreground">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t border-border pt-3 flex justify-between font-body text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-body text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-foreground">
                                            {order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-body text-sm font-medium">
                                        <span className="text-foreground">Total</span>
                                        <span className="text-foreground">${order.total.toFixed(2)}</span>
                                    </div>
                                    {order.trackingNumber && (
                                        <div className="pt-2">
                                            <p className="font-body text-xs text-muted-foreground">
                                                Tracking: <span className="text-foreground">{order.trackingNumber}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const StatusBadge = ({ status }: { status: string }) => (
    <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide font-medium border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600 border-gray-200"
            }`}
    >
        {status}
    </span>
);

/* ──────────── Settings Tab ──────────── */
const SettingsTab = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setChangingPassword(true);
        try {
            if (!user?.email) throw new Error("No email found.");
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            if (error.code === "auth/wrong-password") {
                toast.error("Current password is incorrect.");
            } else if (error.code === "auth/requires-recent-login") {
                toast.error("Please sign out and sign back in before changing your password.");
            } else {
                toast.error(error.message || "Failed to update password.");
            }
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
    };

    return (
        <div className="space-y-8">
            {/* Theme */}
            <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display text-lg text-foreground mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-body text-sm text-foreground">Theme</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                            Switch between light and dark mode
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-secondary transition-all"
                    >
                        {theme === "light" ? (
                            <>
                                <Sun size={16} className="text-amber-500" />
                                <span className="font-body text-sm text-foreground">Light</span>
                            </>
                        ) : (
                            <>
                                <Moon size={16} className="text-indigo-400" />
                                <span className="font-body text-sm text-foreground">Dark</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display text-lg text-foreground mb-4">
                    <Lock size={18} className="inline mr-2 -mt-0.5" />
                    Change Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground rounded-lg focus:outline-none focus:border-foreground transition-colors"
                        />
                    </div>
                    <div>
                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground rounded-lg focus:outline-none focus:border-foreground transition-colors"
                        />
                    </div>
                    <div>
                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-background border border-border px-4 py-3 font-body text-sm text-foreground rounded-lg focus:outline-none focus:border-foreground transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase px-6 py-3 rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                        {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>

            {/* Sign Out */}
            <div className="bg-secondary rounded-lg p-6">
                <h2 className="font-display text-lg text-foreground mb-2">Account</h2>
                <p className="font-body text-xs text-muted-foreground mb-4">
                    Sign out of your account on this device.
                </p>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-500/20 text-red-500 font-body text-sm hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;

import { useEffect, useState } from "react";
import { getOrders } from "@/services/firebase/orderService";
import { getProducts } from "@/services/firebase/productService";
import { getUsers } from "@/services/firebase/userService";
import { getMonthlyAnalytics } from "@/services/firebase/analyticsService";
import type { Order, Product, UserProfile, MonthlyAnalytics } from "@/types/product";
import {
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [ordersRes, productsRes, usersRes, analyticsRes] =
                    await Promise.all([
                        getOrders({ pageSize: 50 }),
                        getProducts({ pageSize: 100 }),
                        getUsers({ pageSize: 100 }),
                        getMonthlyAnalytics(new Date()),
                    ]);

                setOrders(ordersRes.orders);
                setProducts(productsRes.products);
                setUsers(usersRes.users);
                setAnalytics(analyticsRes);
            } catch (error) {
                console.error("[AdminDashboard] Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Compute stats from live data
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const lowStockProducts = products.filter((p) => p.stock <= 5 && p.isActive).length;
    const activeProducts = products.filter((p) => p.isActive).length;

    const STATS = [
        {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            gradient: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-500/10 to-teal-600/10",
        },
        {
            label: "Total Orders",
            value: orders.length.toString(),
            icon: ShoppingCart,
            gradient: "from-blue-500 to-indigo-600",
            bgGradient: "from-blue-500/10 to-indigo-600/10",
        },
        {
            label: "Active Products",
            value: activeProducts.toString(),
            icon: Package,
            gradient: "from-purple-500 to-pink-600",
            bgGradient: "from-purple-500/10 to-pink-600/10",
        },
        {
            label: "Total Users",
            value: users.length.toString(),
            icon: Users,
            gradient: "from-orange-500 to-red-600",
            bgGradient: "from-orange-500/10 to-red-600/10",
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display text-white tracking-wide">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 font-body mt-1">
                    Overview of your store's performance
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat) => (
                    <div
                        key={stat.label}
                        className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm border border-white/5 rounded-xl p-5 transition-transform hover:scale-[1.02]`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-body tracking-wide uppercase">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-display text-white mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}
                            >
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingOrders > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-body text-yellow-200">
                                {pendingOrders} order{pendingOrders > 1 ? "s" : ""} pending
                                review
                            </p>
                            <p className="text-xs text-yellow-400/60 mt-1">
                                These orders need to be confirmed or processed.
                            </p>
                        </div>
                    </div>
                )}

                {lowStockProducts > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-body text-red-200">
                                {lowStockProducts} product{lowStockProducts > 1 ? "s" : ""} low
                                on stock
                            </p>
                            <p className="text-xs text-red-400/60 mt-1">
                                Products with 5 or fewer units remaining.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <div className="bg-[#16161d] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="text-lg font-display text-white">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 font-body uppercase tracking-wider">
                                <th className="px-6 py-3 text-left">Order ID</th>
                                <th className="px-6 py-3 text-left">Customer</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.slice(0, 10).map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-6 py-3 text-sm text-gray-300 font-mono">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-300">
                                        {order.userEmail || "—"}
                                    </td>
                                    <td className="px-6 py-3">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white text-right font-mono">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500">
                                        {order.createdAt.toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-gray-500 text-sm"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        processing: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    };

    return (
        <span
            className={`text-[11px] font-body tracking-wide uppercase px-2.5 py-1 rounded-full border ${colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                }`}
        >
            {status}
        </span>
    );
};

export default AdminDashboard;

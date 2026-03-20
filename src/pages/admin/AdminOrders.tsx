import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrderStatus } from "@/services/firebase/orderService";
import { useAuth } from "@/contexts/AuthContext";
import type { Order, OrderStatus } from "@/types/product";
import { ORDER_STATUSES, STATUS_TRANSITIONS } from "@/lib/constants";
import { toast } from "sonner";
import { Search, Eye, ChevronDown } from "lucide-react";

const AdminOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            const result = await getOrders({
                pageSize: 100,
                ...(statusFilter ? { status: statusFilter as OrderStatus } : {}),
            });
            setOrders(result.orders);
        } catch (error) {
            console.error("[AdminOrders] Failed to load:", error);
            toast.error("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const handleStatusChange = async (
        order: Order,
        newStatus: OrderStatus
    ) => {
        if (!user) return;
        try {
            await updateOrderStatus(order.id, newStatus, user.uid);
            toast.success(`Order ${order.id.slice(0, 8)} updated to "${newStatus}".`);
            await loadOrders();
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    const filtered = orders.filter(
        (o) =>
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.shipping?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-display text-white tracking-wide">Orders</h1>
                <p className="text-sm text-gray-500 font-body mt-1">
                    {orders.length} total orders
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by order ID, email, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#16161d] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-body placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
                    className="bg-[#16161d] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-body focus:outline-none focus:border-purple-500/50"
                >
                    <option value="">All Statuses</option>
                    {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-[#16161d] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 font-body uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3 text-left">Order ID</th>
                                <th className="px-6 py-3 text-left">Customer</th>
                                <th className="px-6 py-3 text-center">Items</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Date</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3 text-sm text-gray-300 font-mono">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-3">
                                        <div>
                                            <p className="text-sm text-gray-300">{order.shipping?.name || "—"}</p>
                                            <p className="text-[11px] text-gray-500">{order.userEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-400 text-center">
                                        {order.items.length}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white text-right font-mono">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="relative inline-block">
                                            <select
                                                value={order.status}
                                                onChange={(e) =>
                                                    handleStatusChange(order, e.target.value as OrderStatus)
                                                }
                                                className={`appearance-none text-[11px] font-body tracking-wide uppercase px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none pr-7 ${getStatusClasses(order.status)}`}
                                            >
                                                <option value={order.status}>{order.status}</option>
                                                {STATUS_TRANSITIONS[order.status]?.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500">
                                        {order.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No orders found.
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

const getStatusClasses = (status: string): string => {
    const map: Record<string, string> = {
        pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        processing: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        shipped: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        delivered: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    };
    return map[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
};

export default AdminOrders;

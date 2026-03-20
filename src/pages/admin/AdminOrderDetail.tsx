import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "@/services/firebase/orderService";
import { useAuth } from "@/contexts/AuthContext";
import type { Order, OrderStatus } from "@/types/product";
import { STATUS_TRANSITIONS } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Truck, Package, User, MapPin } from "lucide-react";

const AdminOrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await getOrderById(id);
                setOrder(data);
                setTrackingNumber(data?.trackingNumber || "");
                setNotes(data?.notes || "");
            } catch (error) {
                toast.error("Failed to load order.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        if (!order || !user || !id) return;
        try {
            await updateOrderStatus(id, newStatus, user.uid, trackingNumber, notes);
            toast.success(`Order updated to "${newStatus}".`);
            const updated = await getOrderById(id);
            setOrder(updated);
        } catch (error) {
            toast.error("Failed to update order.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">Loading order...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center text-gray-400">Order not found.</div>
        );
    }

    const validTransitions = STATUS_TRANSITIONS[order.status] || [];

    return (
        <div className="p-6 lg:p-8 max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/admin/orders")}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-display text-white tracking-wide">
                        Order Details
                    </h1>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                        #{order.id}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 bg-[#16161d] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <h2 className="text-lg font-display text-white">Items</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {order.items.map((item, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white font-body">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                        Size: {item.size} · Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm text-white font-mono">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 py-4 border-t border-white/5 space-y-1">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Subtotal</span>
                            <span className="font-mono">${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>Shipping</span>
                            <span className="font-mono">
                                {order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}
                            </span>
                        </div>
                        <div className="flex justify-between text-white font-display text-lg pt-2 border-t border-white/5">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-[#16161d] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-display text-white">Customer</h3>
                        </div>
                        <p className="text-sm text-gray-300">{order.userEmail}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{order.userId}</p>
                    </div>

                    {/* Shipping */}
                    <div className="bg-[#16161d] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-display text-white">Shipping Address</h3>
                        </div>
                        <div className="text-sm text-gray-300 space-y-0.5">
                            <p>{order.shipping.name}</p>
                            <p>{order.shipping.address}</p>
                            <p>
                                {order.shipping.city}, {order.shipping.zip}
                            </p>
                            <p>{order.shipping.country}</p>
                        </div>
                    </div>

                    {/* Status Updates */}
                    <div className="bg-[#16161d] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-display text-white">Update Status</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                                    Tracking Number
                                </label>
                                <input
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Internal notes..."
                                    rows={2}
                                    className="w-full bg-[#0f0f12] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-body placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {validTransitions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        className="text-xs font-body uppercase tracking-wide px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/30 hover:text-purple-300 transition-all"
                                    >
                                        → {status}
                                    </button>
                                ))}
                                {validTransitions.length === 0 && (
                                    <p className="text-xs text-gray-500">
                                        No further status transitions available.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory.length > 0 && (
                        <div className="bg-[#16161d] border border-white/5 rounded-xl p-5">
                            <h3 className="text-sm font-display text-white mb-3">History</h3>
                            <div className="space-y-2">
                                {order.statusHistory.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-300 uppercase tracking-wide">
                                                {entry.status}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                {entry.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
            className={`text-[11px] font-body tracking-wide uppercase px-3 py-1.5 rounded-full border ${colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                }`}
        >
            {status}
        </span>
    );
};

export default AdminOrderDetail;

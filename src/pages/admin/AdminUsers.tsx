import { useEffect, useState } from "react";
import { getUsers, toggleUserActive } from "@/services/firebase/userService";
import { getOrders } from "@/services/firebase/orderService";
import type { UserProfile } from "@/types/product";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, UserCheck, UserX } from "lucide-react";

const AdminUsers = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = async () => {
        try {
            setLoading(true);
            // Fetch users and all orders in parallel
            const [userResult, ordersResult] = await Promise.all([
                getUsers({ pageSize: 100 }),
                getOrders({ pageSize: 500 }),
            ]);

            // Aggregate order stats per user from actual orders
            const statsMap = new Map<string, { count: number; spent: number }>();
            for (const order of ordersResult.orders) {
                const existing = statsMap.get(order.userId) || { count: 0, spent: 0 };
                existing.count += 1;
                existing.spent += order.total;
                statsMap.set(order.userId, existing);
            }

            // Override profile stats with computed values
            const enrichedUsers = userResult.users.map((u) => {
                const stats = statsMap.get(u.id);
                return {
                    ...u,
                    orderCount: stats?.count ?? 0,
                    totalSpent: stats?.spent ?? 0,
                };
            });

            setUsers(enrichedUsers);
        } catch (error) {
            console.error("[AdminUsers] Failed to load:", error);
            toast.error("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleActive = async (user: UserProfile) => {
        try {
            await toggleUserActive(user.id, !user.isActive);
            toast.success(
                `${user.displayName || user.email} is now ${!user.isActive ? "active" : "disabled"
                }.`
            );
            await loadUsers();
        } catch (error) {
            toast.error("Failed to update user status.");
        }
    };

    const filtered = users.filter(
        (u) =>
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-body">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-display text-white tracking-wide">Users</h1>
                <p className="text-sm text-gray-500 font-body mt-1">
                    {users.length} total users ·{" "}
                    {users.filter((u) => u.role === "admin").length} admins
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#16161d] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-body placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-[#16161d] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 font-body uppercase tracking-wider border-b border-white/5">
                                <th className="px-6 py-3 text-left">User</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-center">Orders</th>
                                <th className="px-6 py-3 text-right">Total Spent</th>
                                <th className="px-6 py-3 text-left">Joined</th>
                                <th className="px-6 py-3 text-left">Last Login</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((u) => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {u.displayName.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white font-body">
                                                    {u.displayName || "—"}
                                                </p>
                                                <p className="text-[11px] text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full ${u.role === "admin"
                                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                : "bg-gray-500/10 text-gray-400 border border-white/5"
                                                }`}
                                        >
                                            {u.role === "admin" ? (
                                                <Shield className="w-3 h-3" />
                                            ) : (
                                                <ShieldOff className="w-3 h-3" />
                                            )}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-300 text-center font-mono">
                                        {u.orderCount}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-white text-right font-mono">
                                        ${u.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500">
                                        {u.createdAt.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-500">
                                        {u.lastLoginAt.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleActive(u)}
                                            className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wide transition-colors ${u.isActive
                                                ? "text-emerald-400 hover:text-emerald-300"
                                                : "text-red-400 hover:text-red-300"
                                                }`}
                                            title={u.isActive ? "Disable user" : "Enable user"}
                                        >
                                            {u.isActive ? (
                                                <>
                                                    <UserCheck className="w-4 h-4" /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <UserX className="w-4 h-4" /> Disabled
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No users found.
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

export default AdminUsers;

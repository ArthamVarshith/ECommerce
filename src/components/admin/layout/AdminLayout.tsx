import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const AdminLayout = () => {
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("Signed out successfully.");
        } catch {
            toast.error("Failed to sign out.");
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0f0f12]">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? "w-64" : "w-20"
                    } bg-[#16161d] border-r border-white/5 flex flex-col transition-all duration-300 relative`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <h1
                        className={`font-display text-white tracking-[0.3em] uppercase transition-all duration-300 ${sidebarOpen ? "text-lg" : "text-xs"
                            }`}
                    >
                        {sidebarOpen ? "ATELIER" : "A"}
                    </h1>
                    <span
                        className={`ml-2 text-[10px] font-body tracking-widest text-purple-400 uppercase ${sidebarOpen ? "" : "hidden"
                            }`}
                    >
                        Admin
                    </span>
                </div>

                {/* Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 bg-[#1e1e2a] border border-white/10 rounded-full p-1 text-gray-400 hover:text-white transition-colors z-10"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="w-4 h-4" />
                    ) : (
                        <Menu className="w-4 h-4" />
                    )}
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 group ${isActive
                                    ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white border border-purple-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && (
                                <span className="tracking-wide">{item.label}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-white/5">
                    <div
                        className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"
                            }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user?.displayName?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate font-body">
                                    {user?.displayName || "Admin"}
                                </p>
                                <p className="text-[10px] text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className={`mt-3 flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm font-body ${sidebarOpen ? "w-full" : "justify-center w-full"
                            }`}
                    >
                        <LogOut className="w-4 h-4" />
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

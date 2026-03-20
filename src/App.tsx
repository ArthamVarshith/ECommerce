import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";
import MaintenancePage from "@/pages/MaintenancePage";
import { lazy, Suspense } from "react";

// Customer pages
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

// Admin pages — lazy loaded for code-splitting
const AdminLayout = lazy(() => import("@/components/admin/layout/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductEdit = lazy(() => import("./pages/admin/AdminProductEdit"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient();

/**
 * Auth loading gate — prevents children from rendering until
 * Firebase auth state is initialized, avoiding flickers.
 */
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-body text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Maintenance gate — shows maintenance page for customer-facing routes
 * when maintenance mode is enabled. Login/register/admin routes are
 * always accessible so admins can sign in and toggle it off.
 */
const MaintenanceGate = ({ children }: { children: React.ReactNode }) => {
  const { settings, loading: settingsLoading } = useSettings();
  const { isAdmin } = useAuth();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-body text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (settings.maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

/** Loading fallback for lazy-loaded admin routes */
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0f0f12]">
    <div className="animate-pulse font-body text-sm text-gray-400">
      Loading admin panel...
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <AuthGate>
                <CartProvider>
                  <WishlistProvider>
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        {/* Public routes — wrapped in MaintenanceGate */}
                        <Route path="/" element={<MaintenanceGate><Index /></MaintenanceGate>} />
                        <Route path="/category/:slug" element={<MaintenanceGate><CategoryPage /></MaintenanceGate>} />
                        <Route path="/product/:id" element={<MaintenanceGate><ProductDetail /></MaintenanceGate>} />
                        <Route path="/search" element={<MaintenanceGate><SearchPage /></MaintenanceGate>} />

                        {/* Auth routes — always accessible (admin needs to log in) */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected routes — require authentication */}
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <MaintenanceGate><CartPage /></MaintenanceGate>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/wishlist"
                          element={
                            <ProtectedRoute>
                              <MaintenanceGate><WishlistPage /></MaintenanceGate>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <MaintenanceGate><CheckoutPage /></MaintenanceGate>
                            </ProtectedRoute>
                          }
                        />

                        {/* Profile — protected, accessible during maintenance */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin routes — ALWAYS accessible, require admin role */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <Suspense fallback={<AdminLoadingFallback />}>
                                <AdminLayout />
                              </Suspense>
                            </AdminRoute>
                          }
                        >
                          <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense>} />
                          <Route path="products" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProducts /></Suspense>} />
                          <Route path="products/new" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProductEdit /></Suspense>} />
                          <Route path="products/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminProductEdit /></Suspense>} />
                          <Route path="orders" element={<Suspense fallback={<AdminLoadingFallback />}><AdminOrders /></Suspense>} />
                          <Route path="orders/:id" element={<Suspense fallback={<AdminLoadingFallback />}><AdminOrderDetail /></Suspense>} />
                          <Route path="users" element={<Suspense fallback={<AdminLoadingFallback />}><AdminUsers /></Suspense>} />
                          <Route path="settings" element={<Suspense fallback={<AdminLoadingFallback />}><AdminSettings /></Suspense>} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </WishlistProvider>
                </CartProvider>
              </AuthGate>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

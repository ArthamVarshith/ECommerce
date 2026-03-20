import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Route guard that restricts access to admin users only.
 * Non-admin users are redirected to the homepage with a toast notification.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isAdmin, loading, initialized } = useAuth();
    const hasShownToast = useRef(false);

    useEffect(() => {
        if (initialized && !loading && user && !isAdmin && !hasShownToast.current) {
            toast.error("Access denied. Admin privileges required.");
            hasShownToast.current = true;
        }
    }, [initialized, loading, user, isAdmin]);

    if (!initialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse font-body text-sm text-muted-foreground">
                    Verifying access...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

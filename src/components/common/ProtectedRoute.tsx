import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireVerified?: boolean;
}

const ProtectedRoute = ({
    children,
    requireVerified = false,
}: ProtectedRouteProps) => {
    const { user, loading, initialized } = useAuth();

    if (!initialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse font-body text-sm text-muted-foreground">
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireVerified && !user.emailVerified) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

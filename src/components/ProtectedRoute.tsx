import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute: מגן על דפים רגישים. 
 * - אם המצב עדיין בטעינה – מציג ספינר.
 * - אם אין משתמש – מציג טוסט פעם אחת ומפנה לדף התחברות.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const [toastShown, setToastShown] = useState(false);

    useEffect(() => {
        if (!isLoading && !user && !toastShown) {
            toast({
                title: "Authentication required",
                description: "Please sign in to access this page",
                variant: "destructive",
            });
            setToastShown(true);
        }
    }, [isLoading, user, toastShown]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-recipe-green" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

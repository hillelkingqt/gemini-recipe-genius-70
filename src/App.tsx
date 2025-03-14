
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CookingModeProvider } from "@/contexts/CookingModeContext";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { sessionManager } from "@/utils/sessionManager";
import { Navigation } from "./components/Navigation";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Recipes from "./pages/Recipes";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import RecipeDetailPage from './components/RecipeDetail';
import RecipePage from '@/pages/RecipePage';



const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

const AppRoutes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const lastSession = sessionManager.getLastSession();
        if (lastSession && location.pathname === "/") {
            navigate(lastSession.route);
            window.scrollTo(0, lastSession.scroll);
            sessionManager.clearSession();
        }
        const handleBeforeUnload = () => {
            sessionManager.saveSession();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [navigate, location]);
    return (
        <PageWrapper>
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <main className="max-w-7xl mx-auto pb-196">
                                <Chat />
                            </main>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/recipes"
                    element={
                        <ProtectedRoute>
                            <main className="max-w-7xl mx-auto pb-16">
                                <Recipes />
                            </main>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/community"
                    element={
                        <ProtectedRoute>
                            <main className="max-w-7xl mx-auto pb-16">
                                <Community />
                            </main>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <main className="max-w-7xl mx-auto pb-16">
                                <UserProfile />
                            </main>
                        </ProtectedRoute>
                    }
                />
                <Route path="/recipes/:id" element={
                    <ProtectedRoute>
                        <RecipePage />
                    </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </PageWrapper>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <CookingModeProvider>
                <AuthProvider>
                    <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
                            <Navigation />
                            <AppRoutes />
                        </div>
                    </TooltipProvider>
                </AuthProvider>
            </CookingModeProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;

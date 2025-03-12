
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CookingModeProvider } from "@/contexts/CookingModeContext";
import { useEffect } from "react";
import { sessionManager } from "@/utils/sessionManager";
import { Navigation } from "./components/Navigation";
import Chat from "./pages/Chat";
import Recipes from "./pages/Recipes";
import NotFound from "./pages/NotFound";
import { motion, AnimatePresence } from "framer-motion";

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
    if (lastSession && location.pathname === '/') {
      navigate(lastSession.route);
      window.scrollTo(0, lastSession.scroll);
      sessionManager.clearSession();
    }

    const handleBeforeUnload = () => {
      sessionManager.saveSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [navigate, location]);

  return (
    <PageWrapper>
      <main className="max-w-7xl mx-auto pb-16">
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </PageWrapper>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CookingModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
              <Navigation />
              <AppRoutes />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CookingModeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


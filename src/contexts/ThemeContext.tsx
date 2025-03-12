
import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    updateThemeClass(savedDarkMode);
  }, []);

  const updateThemeClass = (darkMode: boolean) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.background = 'radial-gradient(circle at top, #1a2a3a 0%, #111927 100%)';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.background = 'radial-gradient(circle at top, #f8fafc 0%, #e2e8f0 100%)';
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    updateThemeClass(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={`transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isDarkMode ? 'dark' : 'light'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

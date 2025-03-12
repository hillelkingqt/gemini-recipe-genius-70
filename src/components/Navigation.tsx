
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CookingPot, MessageSquare, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  // Track scroll position for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <motion.nav 
      className={`sticky top-0 w-full bg-white dark:bg-gray-900 z-50 transition-all duration-300 ${
        scrollPosition > 50 ? 'shadow-md' : ''
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div 
              className="text-xl font-bold text-recipe-green dark:text-green-400 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CookingPot className="h-6 w-6 mr-2" />
              <span className="gradient-text">Recipe Genius</span>
            </motion.div>
          </div>
          
          {/* Desktop menu */}
          <motion.div 
            className="hidden md:flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className="flex items-center gap-2 font-medium"
              >
                <MessageSquare className="h-5 w-5" />
                Chat
              </Button>
            </Link>
            
            <Link to="/recipes">
              <Button 
                variant={location.pathname === '/recipes' ? 'default' : 'ghost'}
                className="flex items-center gap-2 font-medium"
              >
                <CookingPot className="h-5 w-5" />
                Recipes
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="ml-2"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="mr-2"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
            <Link 
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/' 
                  ? 'bg-recipe-green text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat
              </div>
            </Link>
            
            <Link 
              to="/recipes"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/recipes' 
                  ? 'bg-recipe-green text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <CookingPot className="h-5 w-5 mr-2" />
                Recipes
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

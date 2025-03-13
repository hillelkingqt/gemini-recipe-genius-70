
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CookingPot, MessageSquare, Moon, Sun, Menu, X, LogOut, UserCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position for navbar effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navigation on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <motion.nav 
      className={`sticky top-0 w-full backdrop-blur-md dark:bg-gray-900/95 z-50 transition-all duration-300 ${
        scrollPosition > 50 ? 'shadow-lg' : ''
      } ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'}`}
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
            {user && (
              <>
                <Link to="/">
                  <Button 
                    variant={location.pathname === '/' ? 'default' : 'ghost'}
                    className="flex items-center gap-2 font-medium dark:text-white dark:hover:bg-gray-800 glass-effect"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Chat
                  </Button>
                </Link>
                
                <Link to="/recipes">
                  <Button 
                    variant={location.pathname === '/recipes' ? 'default' : 'ghost'}
                    className="flex items-center gap-2 font-medium dark:text-white dark:hover:bg-gray-800 glass-effect"
                  >
                    <CookingPot className="h-5 w-5" />
                    Recipes
                  </Button>
                </Link>

                <Link to="/community">
                  <Button 
                    variant={location.pathname === '/community' ? 'default' : 'ghost'}
                    className="flex items-center gap-2 font-medium dark:text-white dark:hover:bg-gray-800 glass-effect"
                  >
                    <Users className="h-5 w-5" />
                    Community
                  </Button>
                </Link>
              </>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleDarkMode}
              className="ml-2 dark:text-white dark:hover:bg-gray-800 glass-effect"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-10 w-10 overflow-hidden">
                    <UserCircle className="h-6 w-6 text-recipe-green dark:text-green-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {profile?.username || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { }}>
                    <Link to="/profile" className="flex items-center w-full">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="mr-2 dark:text-white dark:hover:bg-gray-800"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="dark:text-white dark:hover:bg-gray-800"
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
            {user && (
              <>
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

                <Link 
                  to="/community"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/community' 
                      ? 'bg-recipe-green text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Community
                  </div>
                </Link>

                <Link 
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/profile' 
                      ? 'bg-recipe-green text-white' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-2" />
                    Profile
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </div>
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

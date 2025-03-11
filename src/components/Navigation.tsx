
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CookingPot, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <motion.nav 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 flex gap-4 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/">
        <Button 
          variant={location.pathname === '/' ? 'default' : 'ghost'}
          className="flex items-center gap-2 font-medium"
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </Button>
      </Link>
      
      <div className="w-px bg-gray-200" />
      
      <Link to="/recipes">
        <Button 
          variant={location.pathname === '/recipes' ? 'default' : 'ghost'}
          className="flex items-center gap-2 font-medium"
        >
          <CookingPot className="h-4 w-4" />
          Recipes
        </Button>
      </Link>
    </motion.nav>
  );
};

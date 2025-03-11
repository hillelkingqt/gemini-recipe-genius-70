
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CookingPot, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const location = useLocation();
  
  return (
    <motion.nav 
      className="sticky top-0 w-full bg-white shadow-md z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div 
              className="text-xl font-bold text-recipe-green flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CookingPot className="h-6 w-6 mr-2" />
              Recipe Genius
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center justify-center gap-4"
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
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

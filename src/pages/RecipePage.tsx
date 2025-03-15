
// src/pages/RecipePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/types/Recipe';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChefHat, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  PageTransition, 
  FadeInSlideUp, 
  PopIn, 
  BounceIn, 
  PulseHighlight, 
  SlideInRight 
} from '@/components/ui/page-transition';
import { getCachedRecipesFromLocalStorage } from '@/hooks/useLocalStorage';

const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const { recipes, fetchUserRecipes } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Enhanced animation variants for loaders with more dynamic effects
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const spinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };
  
  // New floating animation for more visual interest
  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      
      // Try to get recipe from localStorage first for instant loading
      const cachedRecipes = getCachedRecipesFromLocalStorage('cachedRecipes');
      if (cachedRecipes) {
        const cachedRecipe = cachedRecipes.find((r: Recipe) => r.id.toString() === id);
        if (cachedRecipe) {
          setRecipe(cachedRecipe);
          setLoading(false);
          return;
        }
      }
      
      // If not in cache, fetch from server
      if (recipes.length === 0) {
        await fetchUserRecipes();
      }
      
      const found = recipes.find(r => r.id.toString() === id);
      setRecipe(found || null);
      setLoading(false);
      
      // Cache the recipes for future use
      if (recipes.length > 0) {
        localStorage.setItem('cachedRecipes', JSON.stringify(recipes));
      }
    };

    load();
  }, [id, recipes, fetchUserRecipes]);

  return (
    <PageTransition className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/80 pt-6">
      <div className="container mx-auto px-4">
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="relative z-10"
        >
          <Button 
            variant="ghost" 
            className="mb-6 group transition-all duration-300 hover:bg-recipe-green/10"
            onClick={() => navigate('/recipes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Recipes</span>
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              className="flex flex-col items-center justify-center py-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.div
                  variants={spinVariants}
                  animate="animate"
                  className="relative z-10"
                >
                  <Loader2 className="h-16 w-16 text-recipe-green" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-recipe-green/20"
                  variants={pulseVariants}
                  animate="animate"
                />
              </motion.div>
              <motion.p 
                className="text-lg mt-6 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Loading the perfect recipe...
              </motion.p>
              
              {/* Added floating decorative elements for more visual interest */}
              <motion.div 
                className="absolute opacity-30 top-1/4 left-1/4"
                variants={floatVariants}
                animate="animate"
              >
                <Heart className="h-12 w-12 text-recipe-green/20" />
              </motion.div>
              <motion.div 
                className="absolute opacity-30 bottom-1/4 right-1/4"
                variants={floatVariants}
                animate="animate"
                transition={{ delay: 1 }}
              >
                <ChefHat className="h-12 w-12 text-recipe-orange/20" />
              </motion.div>
            </motion.div>
          ) : !recipe ? (
            <FadeInSlideUp key="not-found" className="text-center py-32 space-y-4">
              <BounceIn>
                <motion.div
                  whileHover={{ 
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <ChefHat className="h-20 w-20 mx-auto text-gray-300 dark:text-gray-600" />
                </motion.div>
              </BounceIn>
              <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400">Recipe Not Found</h2>
              <p className="text-gray-500 max-w-md mx-auto dark:text-gray-400">
                The recipe you're looking for doesn't exist or has been removed.
              </p>
              <PopIn>
                <Button 
                  className="mt-6 bg-recipe-green hover:bg-recipe-green/90 animate-pulse-soft"
                  onClick={() => navigate('/recipes')}
                >
                  Browse Recipes
                </Button>
              </PopIn>
            </FadeInSlideUp>
          ) : (
            <FadeInSlideUp key="recipe-detail">
              <SlideInRight>
                <div className="recipe-detail-container">
                  <RecipeDetail recipe={recipe} />
                </div>
              </SlideInRight>
            </FadeInSlideUp>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default RecipePage;

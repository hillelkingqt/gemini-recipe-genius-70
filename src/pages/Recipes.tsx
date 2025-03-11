
import React, { useState, useEffect } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, ArrowLeft, CookingPot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Recipes: React.FC = () => {
  const { recipes, removeRecipe } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get recipe ID from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (recipeId) {
      setSelectedRecipeId(recipeId);
    }
  }, []);
  
  // Update URL when a recipe is selected
  useEffect(() => {
    if (selectedRecipeId) {
      window.history.pushState({}, '', `?id=${selectedRecipeId}`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [selectedRecipeId]);
  
  const handleDeleteRecipe = (id: string) => {
    removeRecipe(id);
    
    if (selectedRecipeId === id) {
      setSelectedRecipeId(null);
    }
    
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been removed from your collection.",
    });
  };
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedRecipe = recipes.find(recipe => recipe.id === selectedRecipeId);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div 
        className="bg-gradient-to-r from-recipe-orange/90 to-recipe-orange text-white py-4 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <CookingPot className="h-6 w-6 mr-3" />
            <h1 className="text-2xl font-bold">My Recipes</h1>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-white text-recipe-orange hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>
      </motion.div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          {selectedRecipe ? (
            <motion.div 
              key="recipe-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={() => setSelectedRecipeId(null)}
                className="mb-4 text-recipe-orange"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Recipes
              </Button>
              <RecipeDetail recipe={selectedRecipe} />
            </motion.div>
          ) : (
            <motion.div
              key="recipe-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 relative max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search recipes..."
                    className="pl-10 pr-10 bg-white border-gray-300"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {filteredRecipes.length === 0 ? (
                <motion.div 
                  className="text-center py-12 px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CookingPot className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No recipes match your search.' : 'Your recipe collection is empty.'}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? 'Try searching with different keywords or clear your search.' 
                      : 'Create your first recipe to get started with your culinary journey.'}
                  </p>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="bg-recipe-green hover:bg-recipe-green/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Recipe
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <RecipeCard
                        recipe={recipe}
                        showActions={true}
                        onEdit={(id) => setSelectedRecipeId(id)}
                        onDelete={handleDeleteRecipe}
                        className="h-full cursor-pointer hover:border-recipe-green"
                        onClick={() => setSelectedRecipeId(recipe.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recipes;

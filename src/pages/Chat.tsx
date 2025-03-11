
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import { RecipeResponse } from '@/types/Recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/components/ui/use-toast';
import { CookingPot } from 'lucide-react';
import { motion } from 'framer-motion';

const Chat: React.FC = () => {
  const { addRecipe } = useRecipes();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRecipeGenerated = (recipe: RecipeResponse) => {
    try {
      const newRecipe = addRecipe(recipe);
      
      toast({
        title: "Recipe Saved!",
        description: `"${recipe.name}" has been added to your collection.`,
      });
      
      // Navigate to the specific recipe in the recipes page
      navigate(`/recipes?id=${newRecipe.id}`);
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving your recipe.",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <motion.div 
        className="bg-gradient-to-r from-recipe-green/90 to-recipe-green text-white py-4 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <CookingPot className="h-6 w-6 mr-3" />
          <h1 className="text-2xl font-bold">Recipe Genius</h1>
        </div>
        <p className="text-center mt-2 text-white/80 max-w-xl mx-auto">
          Tell me what you'd like to cook, and I'll create a personalized recipe just for you
        </p>
      </motion.div>
      
      <div className="flex-1 overflow-hidden">
        <ChatInterface onRecipeGenerated={handleRecipeGenerated} />
      </div>
    </div>
  );
};

export default Chat;

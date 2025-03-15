
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import { RecipeResponse } from '@/types/Recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/components/ui/use-toast';
import { CookingPot, ChefHat, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const Chat: React.FC = () => {
  const { addRecipe } = useRecipes();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecipeGenerated = async (recipe: RecipeResponse) => {
    try {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to save recipes.",
        });
        navigate('/auth');
        return;
      }

      // Accept or save as draft based on recipe quality
      const recipeWithStatus = {
        ...recipe,
        user_id: user.id, // Add user_id
      };
      
      const newRecipe = await addRecipe(recipeWithStatus, recipe.isRecipe ? 'accepted' : 'draft');
      
      toast({
        title: "Recipe Saved!",
        description: `"${recipe.name}" has been added to your collection.`,
      });
      
      // Navigate to recipes page with specific recipe ID
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

  const handleRecipeRejected = async (recipe: RecipeResponse) => {
    try {
      if (!user) {
        toast({
          variant: "default",
          title: "Authentication Required",
          description: "Please log in to save rejected recipes.",
        });
        navigate('/auth');
        return;
      }

      // Save rejected recipe with rejected status
      const recipeWithStatus = {
        ...recipe,
        user_id: user.id, // Add user_id
      };
      
      await addRecipe(recipeWithStatus, 'rejected');
      
      toast({
        variant: "default",
        title: "Recipe Saved as Rejected",
        description: "The recipe was saved in your rejected recipes collection.",
      });
      
    } catch (error) {
      console.error('Error saving rejected recipe:', error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-recipe-green/90 to-recipe-green text-white py-8 px-6 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-[-50%] left-[10%] w-72 h-72 bg-white/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        
        <motion.div 
          className="absolute bottom-[-30%] right-[5%] w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -20, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
          <motion.div 
            className="flex items-center mb-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          >
            <ChefHat className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">Recipe Genius</h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="ml-3"
            >
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-center mt-2 text-white/90 max-w-xl mx-auto text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Tell me what you'd like to cook, and I'll create a personalized recipe just for you
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {["Quick Dinner", "Healthy Breakfast", "Vegan", "Dessert", "Italian"].map((item, i) => (
              <motion.span 
                key={item}
                className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
              >
                {item}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-hidden">
        <ChatInterface 
          onRecipeGenerated={handleRecipeGenerated}
          onRecipeRejected={handleRecipeRejected}
        />
      </div>
    </div>
  );
};

export default Chat;

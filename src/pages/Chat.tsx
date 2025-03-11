
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import { RecipeResponse } from '@/types/Recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/components/ui/use-toast';

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
      
      // Navigate to the recipes page
      navigate('/recipes');
      
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
    <div className="flex flex-col h-screen">
      <div className="bg-recipe-green text-white p-4">
        <h1 className="text-2xl font-bold text-center">Recipe Genius</h1>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatInterface onRecipeGenerated={handleRecipeGenerated} />
      </div>
    </div>
  );
};

export default Chat;

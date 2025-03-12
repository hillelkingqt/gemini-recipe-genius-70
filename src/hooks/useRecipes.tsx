import { useState, useEffect } from 'react';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { user } = useAuth();
  
  // Load recipes from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Convert string dates back to Date objects and JSONB arrays to JS arrays
        const recipesWithDates = data.map((recipe: any) => ({
          ...recipe,
          createdAt: new Date(recipe.created_at),
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : JSON.parse(String(recipe.ingredients)),
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : JSON.parse(String(recipe.instructions)),
          tags: recipe.tags ? (Array.isArray(recipe.tags) ? recipe.tags : JSON.parse(String(recipe.tags))) : [],
          timeMarkers: recipe.time_markers ? (Array.isArray(recipe.time_markers) ? recipe.time_markers : JSON.parse(String(recipe.time_markers))) : [],
          nutritionInfo: recipe.nutrition_info ? (typeof recipe.nutrition_info === 'object' ? recipe.nutrition_info : JSON.parse(String(recipe.nutrition_info))) : {},
          seasonality: recipe.seasonality ? (Array.isArray(recipe.seasonality) ? recipe.seasonality : JSON.parse(String(recipe.seasonality))) : [],
          isFavorite: recipe.is_favorite,
          isRTL: recipe.is_rtl,
          isRecipe: recipe.is_recipe,
          ingredientsLabel: recipe.ingredients_label,
          instructionsLabel: recipe.instructions_label,
        }));
        
        setRecipes(recipesWithDates);
        console.log('Recipes loaded from Supabase:', recipesWithDates);
      } catch (error) {
        console.error('Error loading recipes from Supabase:', error);
        
        // Show error toast
        toast({
          title: "Error loading recipes",
          description: "There was a problem loading your recipes.",
          variant: "destructive",
        });
      }
    };
    
    fetchRecipes();
  }, [user]);
  
  const addRecipe = async (recipeResponse: RecipeResponse, status: 'draft' | 'accepted' | 'rejected' = 'accepted'): Promise<Recipe> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes",
        variant: "destructive",
      });
      throw new Error("User not authenticated");
    }
    
    try {
      // Prepare recipe data for Supabase
      const recipeData = {
        user_id: user.id,
        name: recipeResponse.name,
        ingredients: JSON.stringify(recipeResponse.ingredients),
        instructions: JSON.stringify(recipeResponse.instructions),
        is_rtl: recipeResponse.isRTL || false,
        ingredients_label: recipeResponse.ingredientsLabel || (recipeResponse.isRTL ? 'מצרכים' : 'Ingredients'),
        instructions_label: recipeResponse.instructionsLabel || (recipeResponse.isRTL ? 'אופן ההכנה' : 'Instructions'),
        is_recipe: recipeResponse.isRecipe,
        content: recipeResponse.content,
        is_favorite: false,
        tags: recipeResponse.tags ? JSON.stringify(recipeResponse.tags) : null,
        difficulty: recipeResponse.difficulty || 'medium',
        estimated_time: recipeResponse.estimatedTime || '',
        calories: recipeResponse.calories || '',
        notes: '',
        rating: 0,
        status,
        time_markers: recipeResponse.timeMarkers ? JSON.stringify(recipeResponse.timeMarkers) : null,
        prep_time: recipeResponse.prepTime,
        cook_time: recipeResponse.cookTime,
        total_time: recipeResponse.totalTime,
        servings: recipeResponse.servings || 4,
        nutrition_info: recipeResponse.nutritionInfo ? JSON.stringify(recipeResponse.nutritionInfo) : null,
        seasonality: recipeResponse.seasonality ? JSON.stringify(recipeResponse.seasonality) : null,
        cuisine: recipeResponse.cuisine
      };
      
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipeData)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Convert the returned data to our Recipe type
      const newRecipe: Recipe = {
        id: data.id,
        name: data.name,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : JSON.parse(String(data.ingredients)),
        instructions: Array.isArray(data.instructions) ? data.instructions : JSON.parse(String(data.instructions)),
        createdAt: new Date(data.created_at),
        isRTL: data.is_rtl,
        ingredientsLabel: data.ingredients_label,
        instructionsLabel: data.instructions_label,
        isRecipe: data.is_recipe,
        content: data.content,
        isFavorite: data.is_favorite,
        tags: data.tags ? (Array.isArray(data.tags) ? data.tags : JSON.parse(String(data.tags))) : [],
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        estimatedTime: data.estimated_time,
        calories: data.calories,
        notes: data.notes || '',
        rating: data.rating,
        status: data.status as 'draft' | 'accepted' | 'rejected',
        timeMarkers: data.time_markers ? (Array.isArray(data.time_markers) ? data.time_markers : JSON.parse(String(data.time_markers))) : [],
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        totalTime: data.total_time,
        servings: data.servings,
        nutritionInfo: data.nutrition_info ? (typeof data.nutrition_info === 'object' ? data.nutrition_info : JSON.parse(String(data.nutrition_info))) : {},
        seasonality: data.seasonality ? (Array.isArray(data.seasonality) ? data.seasonality : JSON.parse(String(data.seasonality))) : [],
        cuisine: data.cuisine
      };
      
      const updatedRecipes = [newRecipe, ...recipes];
      setRecipes(updatedRecipes);
      
      // Show success toast
      toast({
        title: status === 'accepted' ? "Recipe added" : status === 'draft' ? "Recipe saved as draft" : "Recipe rejected but saved",
        description: `"${newRecipe.name}" has been ${status === 'accepted' ? 'added to' : 'saved in'} your collection.`,
        duration: 3000,
      });
      
      console.log('New recipe added to Supabase:', newRecipe);
      
      return newRecipe;
    } catch (error: any) {
      console.error('Error saving recipe to Supabase:', error);
      
      toast({
        title: "Error saving recipe",
        description: error.message || "There was a problem saving your recipe.",
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  const toggleFavorite = async (id: string) => {
    if (!user) return;
    
    try {
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      
      const newFavoriteStatus = !recipe.isFavorite;
      
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite: newFavoriteStatus } : recipe
      );
      setRecipes(updatedRecipes);
      
      toast({
        title: newFavoriteStatus ? "Added to favorites" : "Removed from favorites",
        description: `"${recipe.name}" has been ${newFavoriteStatus ? 'added to' : 'removed from'} your favorites.`,
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error updating favorite status:', error);
      
      toast({
        title: "Error updating favorite",
        description: error.message || "There was a problem updating your favorite.",
        variant: "destructive",
      });
    }
  };
  
  const rateRecipe = async (id: string, rating: number) => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update({ rating })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, rating } : recipe
      );
      setRecipes(updatedRecipes);
      
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        toast({
          title: "Recipe rated",
          description: `You gave "${recipe.name}" a rating of ${rating} stars.`,
          duration: 2000,
        });
      }
    } catch (error: any) {
      console.error('Error rating recipe:', error);
      
      toast({
        title: "Error updating rating",
        description: error.message || "There was a problem updating your rating.",
        variant: "destructive",
      });
    }
  };
  
  const addNote = async (id: string, note: string) => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update({ notes: note })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, notes: note } : recipe
      );
      setRecipes(updatedRecipes);
      
      toast({
        title: "Notes saved",
        description: "Your personal notes for this recipe have been saved.",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error saving notes:', error);
      
      toast({
        title: "Error saving notes",
        description: error.message || "There was a problem saving your notes.",
        variant: "destructive",
      });
    }
  };
  
  const removeRecipe = async (id: string) => {
    if (!user) return;
    
    try {
      const recipeToRemove = recipes.find(r => r.id === id);
      if (!recipeToRemove) return;
      
      // Delete from Supabase
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(updatedRecipes);
      
      toast({
        title: "Recipe deleted",
        description: `"${recipeToRemove.name}" has been removed from your collection.`,
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      
      toast({
        title: "Error deleting recipe",
        description: error.message || "There was a problem deleting your recipe.",
        variant: "destructive",
      });
    }
  };
  
  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  const updateRecipe = async (id: string, updatedRecipeData: Partial<Recipe>) => {
    if (!user) return;
    
    try {
      // Prepare data for Supabase (convert camelCase to snake_case)
      const supabaseData: any = {};
      
      if (updatedRecipeData.name !== undefined) supabaseData.name = updatedRecipeData.name;
      if (updatedRecipeData.ingredients !== undefined) supabaseData.ingredients = JSON.stringify(updatedRecipeData.ingredients);
      if (updatedRecipeData.instructions !== undefined) supabaseData.instructions = JSON.stringify(updatedRecipeData.instructions);
      if (updatedRecipeData.isRTL !== undefined) supabaseData.is_rtl = updatedRecipeData.isRTL;
      if (updatedRecipeData.ingredientsLabel !== undefined) supabaseData.ingredients_label = updatedRecipeData.ingredientsLabel;
      if (updatedRecipeData.instructionsLabel !== undefined) supabaseData.instructions_label = updatedRecipeData.instructionsLabel;
      if (updatedRecipeData.isRecipe !== undefined) supabaseData.is_recipe = updatedRecipeData.isRecipe;
      if (updatedRecipeData.content !== undefined) supabaseData.content = updatedRecipeData.content;
      if (updatedRecipeData.isFavorite !== undefined) supabaseData.is_favorite = updatedRecipeData.isFavorite;
      if (updatedRecipeData.tags !== undefined) supabaseData.tags = JSON.stringify(updatedRecipeData.tags);
      if (updatedRecipeData.difficulty !== undefined) supabaseData.difficulty = updatedRecipeData.difficulty;
      if (updatedRecipeData.estimatedTime !== undefined) supabaseData.estimated_time = updatedRecipeData.estimatedTime;
      if (updatedRecipeData.calories !== undefined) supabaseData.calories = updatedRecipeData.calories;
      if (updatedRecipeData.notes !== undefined) supabaseData.notes = updatedRecipeData.notes;
      if (updatedRecipeData.rating !== undefined) supabaseData.rating = updatedRecipeData.rating;
      if (updatedRecipeData.status !== undefined) supabaseData.status = updatedRecipeData.status;
      if (updatedRecipeData.timeMarkers !== undefined) supabaseData.time_markers = JSON.stringify(updatedRecipeData.timeMarkers);
      if (updatedRecipeData.prepTime !== undefined) supabaseData.prep_time = updatedRecipeData.prepTime;
      if (updatedRecipeData.cookTime !== undefined) supabaseData.cook_time = updatedRecipeData.cookTime;
      if (updatedRecipeData.totalTime !== undefined) supabaseData.total_time = updatedRecipeData.totalTime;
      if (updatedRecipeData.servings !== undefined) supabaseData.servings = updatedRecipeData.servings;
      if (updatedRecipeData.nutritionInfo !== undefined) supabaseData.nutrition_info = JSON.stringify(updatedRecipeData.nutritionInfo);
      if (updatedRecipeData.seasonality !== undefined) supabaseData.seasonality = JSON.stringify(updatedRecipeData.seasonality);
      if (updatedRecipeData.cuisine !== undefined) supabaseData.cuisine = updatedRecipeData.cuisine;
      
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update(supabaseData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, ...updatedRecipeData } : recipe
      );
      setRecipes(updatedRecipes);
      
      toast({
        title: "Recipe updated",
        description: "The recipe has been successfully updated.",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      
      toast({
        title: "Error updating recipe",
        description: error.message || "There was a problem updating your recipe.",
        variant: "destructive",
      });
    }
  };
  
  const updateRecipeStatus = async (id: string, status: 'draft' | 'accepted' | 'rejected') => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, status } : recipe
      );
      setRecipes(updatedRecipes);
      
      const statusMessages = {
        'draft': 'saved as draft',
        'accepted': 'accepted',
        'rejected': 'rejected but saved',
      };
      
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        toast({
          title: `Recipe ${statusMessages[status]}`,
          description: `"${recipe.name}" has been ${statusMessages[status]}.`,
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error updating recipe status:', error);
      
      toast({
        title: "Error updating status",
        description: error.message || "There was a problem updating your recipe status.",
        variant: "destructive",
      });
    }
  };
  
  const updateServings = async (id: string, servings: number) => {
    if (!user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('recipes')
        .update({ servings })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, servings } : recipe
      );
      setRecipes(updatedRecipes);
      
      toast({
        title: "Servings updated",
        description: `Recipe updated to serve ${servings} people.`,
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error updating servings:', error);
      
      toast({
        title: "Error updating servings",
        description: error.message || "There was a problem updating the servings.",
        variant: "destructive",
      });
    }
  };

  const saveChatState = (messages: any[], currentRecipe: RecipeResponse | null) => {
    if (!currentRecipe?.isRecipe) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
      if (currentRecipe) {
        localStorage.setItem('current_recipe', JSON.stringify(currentRecipe));
      }
    }
  };

  const clearChatState = () => {
    localStorage.removeItem('chat_messages');
    localStorage.removeItem('current_recipe');
  };

  return {
    recipes,
    addRecipe,
    removeRecipe,
    getRecipe,
    updateRecipe,
    toggleFavorite,
    rateRecipe,
    addNote,
    updateRecipeStatus,
    updateServings,
    saveChatState,
    clearChatState,
  };
}

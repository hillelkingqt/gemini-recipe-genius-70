
import { useState, useEffect } from 'react';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load recipes from Supabase
  const loadRecipes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      const formattedRecipes: Recipe[] = data.map(recipe => {
        return {
          id: recipe.id,
          name: recipe.name,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          createdAt: new Date(recipe.created_at),
          isRTL: recipe.is_rtl,
          ingredientsLabel: recipe.ingredients_label,
          instructionsLabel: recipe.instructions_label,
          isRecipe: recipe.is_recipe,
          content: recipe.content,
          isFavorite: recipe.is_favorite || false,
          tags: Array.isArray(recipe.tags) ? recipe.tags : [],
          difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
          estimatedTime: recipe.estimated_time,
          calories: recipe.calories,
          notes: recipe.notes || '',
          rating: recipe.rating || 0,
          status: recipe.status as 'draft' | 'accepted' | 'rejected' | 'published',
          timeMarkers: Array.isArray(recipe.time_markers) ? recipe.time_markers : [],
          prepTime: recipe.prep_time,
          cookTime: recipe.cook_time,
          totalTime: recipe.total_time,
          servings: typeof recipe.servings === 'number' ? recipe.servings : 4,
          nutritionInfo: recipe.nutrition_info || {},
          seasonality: Array.isArray(recipe.seasonality) ? recipe.seasonality : [],
          cuisine: recipe.cuisine,
          likes: recipe.likes || 0,
        };
      });
      
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      setIsError(true);
      toast({
        title: 'Failed to load recipes',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a recipe to Supabase
  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'rating' | 'notes' | 'status'>): Promise<Recipe> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          is_rtl: recipe.isRTL,
          ingredients_label: recipe.ingredientsLabel,
          instructions_label: recipe.instructionsLabel,
          is_recipe: recipe.isRecipe !== undefined ? recipe.isRecipe : true,
          content: recipe.content,
          is_favorite: false,
          tags: recipe.tags || [],
          difficulty: recipe.difficulty || 'medium',
          estimated_time: recipe.estimatedTime || '',
          calories: recipe.calories || '',
          time_markers: recipe.timeMarkers || [],
          prep_time: recipe.prepTime || '',
          cook_time: recipe.cookTime || '',
          total_time: recipe.totalTime || '',
          servings: recipe.servings || 4,
          nutrition_info: recipe.nutritionInfo || {},
          seasonality: recipe.seasonality || [],
          cuisine: recipe.cuisine || '',
          user_id: user.id,
          status: 'accepted',
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      const newRecipe: Recipe = {
        id: data.id,
        name: data.name,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        instructions: Array.isArray(data.instructions) ? data.instructions : [],
        createdAt: new Date(data.created_at),
        isRTL: data.is_rtl,
        ingredientsLabel: data.ingredients_label,
        instructionsLabel: data.instructions_label,
        isRecipe: data.is_recipe,
        content: data.content,
        isFavorite: data.is_favorite || false,
        tags: Array.isArray(data.tags) ? data.tags : [],
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        estimatedTime: data.estimated_time,
        calories: data.calories,
        notes: data.notes || '',
        rating: data.rating || 0,
        status: data.status as 'draft' | 'accepted' | 'rejected' | 'published',
        timeMarkers: Array.isArray(data.time_markers) ? data.time_markers : [],
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        totalTime: data.total_time,
        servings: typeof data.servings === 'number' ? data.servings : 4,
        nutritionInfo: data.nutrition_info || {},
        seasonality: Array.isArray(data.seasonality) ? data.seasonality : [],
        cuisine: data.cuisine,
        likes: 0,
      };
      
      setRecipes((prev) => [newRecipe, ...prev]);
      
      toast({
        title: 'Recipe saved',
        description: 'Recipe has been added to your collection',
      });
      
      return newRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: 'Failed to save recipe',
        description: 'Please try again later',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Update a recipe in Supabase
  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    if (!user) return;
    
    try {
      const dbUpdates: Record<string, any> = {};
      
      // Map Recipe properties to database column names
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;
      if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
      if (updates.isRTL !== undefined) dbUpdates.is_rtl = updates.isRTL;
      if (updates.ingredientsLabel !== undefined) dbUpdates.ingredients_label = updates.ingredientsLabel;
      if (updates.instructionsLabel !== undefined) dbUpdates.instructions_label = updates.instructionsLabel;
      if (updates.isRecipe !== undefined) dbUpdates.is_recipe = updates.isRecipe;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
      if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;
      if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.timeMarkers !== undefined) dbUpdates.time_markers = updates.timeMarkers;
      if (updates.prepTime !== undefined) dbUpdates.prep_time = updates.prepTime;
      if (updates.cookTime !== undefined) dbUpdates.cook_time = updates.cookTime;
      if (updates.totalTime !== undefined) dbUpdates.total_time = updates.totalTime;
      if (updates.servings !== undefined) dbUpdates.servings = updates.servings;
      if (updates.nutritionInfo !== undefined) dbUpdates.nutrition_info = updates.nutritionInfo;
      if (updates.seasonality !== undefined) dbUpdates.seasonality = updates.seasonality;
      if (updates.cuisine !== undefined) dbUpdates.cuisine = updates.cuisine;
      
      const { error } = await supabase
        .from('recipes')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === id ? { ...recipe, ...updates } : recipe
        )
      );
      
      toast({
        title: 'Recipe updated',
        description: 'Changes have been saved',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast({
        title: 'Failed to update recipe',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  // Delete a recipe from Supabase
  const deleteRecipe = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      
      toast({
        title: 'Recipe deleted',
        description: 'Recipe has been removed from your collection',
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Failed to delete recipe',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe || !user) return;
    
    try {
      const newFavoriteStatus = !recipe.isFavorite;
      
      const { error } = await supabase
        .from('recipes')
        .update({ is_favorite: newFavoriteStatus })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isFavorite: newFavoriteStatus } : r
        )
      );
      
      toast({
        title: newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Action failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  // Publish a recipe to the community
  const publishRecipe = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'published' })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'published' } : r
        )
      );
      
      toast({
        title: 'Recipe published',
        description: 'Your recipe is now visible to the community',
      });
    } catch (error) {
      console.error('Error publishing recipe:', error);
      toast({
        title: 'Publishing failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  // Unpublish a recipe from the community
  const unpublishRecipe = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'accepted' })
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'accepted' } : r
        )
      );
      
      toast({
        title: 'Recipe unpublished',
        description: 'Your recipe is no longer visible to the community',
      });
    } catch (error) {
      console.error('Error unpublishing recipe:', error);
      toast({
        title: 'Unpublishing failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  // Loading recipes when the component mounts
  useEffect(() => {
    if (user) {
      loadRecipes();
    }
  }, [user]);
  
  return { 
    recipes, 
    isLoading, 
    isError, 
    loadRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    publishRecipe,
    unpublishRecipe
  };
};

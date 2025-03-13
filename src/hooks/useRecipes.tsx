
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRecipes();
    } else {
      setRecipes([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadRecipes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setIsError(false);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const loadedRecipes: Recipe[] = data.map(item => ({
        id: item.id,
        name: item.name,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients as string[] : [],
        instructions: Array.isArray(item.instructions) ? item.instructions as string[] : [],
        createdAt: new Date(item.created_at),
        isRTL: item.is_rtl || false,
        ingredientsLabel: item.ingredients_label || 'Ingredients',
        instructionsLabel: item.instructions_label || 'Instructions',
        isRecipe: item.is_recipe || true,
        content: item.content || '',
        isFavorite: item.is_favorite || false,
        tags: Array.isArray(item.tags) ? item.tags as string[] : [],
        difficulty: (item.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        estimatedTime: item.estimated_time || '',
        calories: item.calories || '',
        notes: item.notes || '',
        rating: item.rating || 0,
        status: item.status as 'draft' | 'accepted' | 'rejected' | 'published',
        timeMarkers: item.time_markers as { step: number; duration: number; description: string; }[] || [],
        prepTime: item.prep_time || '',
        cookTime: item.cook_time || '',
        totalTime: item.total_time || '',
        servings: item.servings || 0,
        nutritionInfo: item.nutrition_info as { calories?: string; protein?: string; carbs?: string; fat?: string; } || {},
        seasonality: Array.isArray(item.seasonality) ? item.seasonality as string[] : [],
        cuisine: item.cuisine || '',
        likes: item.likes || 0,
        publishedAt: item.published_at ? new Date(item.published_at) : undefined,
        author: item.author || '',
        imageBase64: item.image_base64 || '',
      }));
      
      setRecipes(loadedRecipes);
      
    } catch (error) {
      console.error('Error loading recipes:', error);
      setIsError(true);
      
      toast({
        variant: "destructive",
        title: "Failed to Load Recipes",
        description: "There was an error loading your recipes."
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'notes' | 'rating' | 'status' | 'createdAt' | 'isFavorite'> & { status?: 'draft' | 'accepted' | 'rejected' | 'published' }, status = 'accepted') => {
    if (!user) throw new Error('User must be logged in');
    
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
          is_recipe: recipe.isRecipe,
          content: recipe.content,
          is_favorite: false,
          tags: recipe.tags,
          difficulty: recipe.difficulty,
          estimated_time: recipe.estimatedTime,
          calories: recipe.calories,
          notes: '',
          rating: 0,
          status: recipe.status || status,
          time_markers: recipe.timeMarkers,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          total_time: recipe.totalTime,
          servings: recipe.servings,
          nutrition_info: recipe.nutritionInfo,
          seasonality: recipe.seasonality,
          cuisine: recipe.cuisine,
          user_id: user.id,
          image_base64: recipe.imageBase64,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert the returned data to our Recipe type
      const newRecipe: Recipe = {
        id: data.id,
        name: data.name,
        ingredients: data.ingredients as string[],
        instructions: data.instructions as string[],
        createdAt: new Date(data.created_at),
        isRTL: data.is_rtl || false,
        ingredientsLabel: data.ingredients_label || 'Ingredients',
        instructionsLabel: data.instructions_label || 'Instructions',
        isRecipe: data.is_recipe || true,
        content: data.content || '',
        isFavorite: data.is_favorite || false,
        tags: data.tags as string[] || [],
        difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        estimatedTime: data.estimated_time || '',
        calories: data.calories || '',
        notes: data.notes || '',
        rating: data.rating || 0,
        status: data.status as 'draft' | 'accepted' | 'rejected' | 'published',
        timeMarkers: data.time_markers as { step: number; duration: number; description: string; }[] || [],
        prepTime: data.prep_time || '',
        cookTime: data.cook_time || '',
        totalTime: data.total_time || '',
        servings: data.servings || 0,
        nutritionInfo: data.nutrition_info as { calories?: string; protein?: string; carbs?: string; fat?: string; } || {},
        seasonality: data.seasonality as string[] || [],
        cuisine: data.cuisine || '',
        likes: 0,
      };
      
      setRecipes(prev => [newRecipe, ...prev]);
      
      return newRecipe;
      
    } catch (error) {
      console.error('Error adding recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to Add Recipe",
        description: "There was an error saving your recipe."
      });
      
      throw error;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      // Find the recipe in state
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      
      // Optimistically update state
      setRecipes(prev => 
        prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)
      );
      
      // Update in database
      const { error } = await supabase
        .from('recipes')
        .update({ is_favorite: !recipe.isFavorite })
        .eq('id', id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert optimistic update on error
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        setRecipes(prev => 
          prev.map(r => r.id === id ? { ...r, isFavorite: recipe.isFavorite } : r)
        );
      }
      
      toast({
        variant: "destructive",
        title: "Failed to Update Favorite",
        description: "There was an error updating your favorite recipe."
      });
    }
  };

  const publishRecipe = async (id: string, username: string) => {
    try {
      // Find the recipe in state
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      
      // Update in database
      const { error } = await supabase
        .from('recipes')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          author: username
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      setRecipes(prev => 
        prev.map(r => r.id === id ? { 
          ...r, 
          status: 'published',
          publishedAt: new Date(),
          author: username
        } : r)
      );
      
      toast({
        title: "Recipe Published",
        description: "Your recipe has been published to the community."
      });
      
    } catch (error) {
      console.error('Error publishing recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to Publish Recipe",
        description: "There was an error publishing your recipe."
      });
    }
  };

  const unpublishRecipe = async (id: string) => {
    try {
      // Find the recipe in state
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      
      // Update in database
      const { error } = await supabase
        .from('recipes')
        .update({ 
          status: 'accepted',
          published_at: null,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      setRecipes(prev => 
        prev.map(r => r.id === id ? { 
          ...r, 
          status: 'accepted',
          publishedAt: undefined,
        } : r)
      );
      
      toast({
        title: "Recipe Unpublished",
        description: "Your recipe has been removed from the community."
      });
      
    } catch (error) {
      console.error('Error unpublishing recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to Unpublish Recipe",
        description: "There was an error unpublishing your recipe."
      });
    }
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      // Convert our Recipe structure to match database column names
      const dbUpdates = {
        ...updates.name && { name: updates.name },
        ...updates.ingredients && { ingredients: updates.ingredients },
        ...updates.instructions && { instructions: updates.instructions },
        ...updates.isRTL !== undefined && { is_rtl: updates.isRTL },
        ...updates.ingredientsLabel && { ingredients_label: updates.ingredientsLabel },
        ...updates.instructionsLabel && { instructions_label: updates.instructionsLabel },
        ...updates.isRecipe !== undefined && { is_recipe: updates.isRecipe },
        ...updates.content && { content: updates.content },
        ...updates.isFavorite !== undefined && { is_favorite: updates.isFavorite },
        ...updates.tags && { tags: updates.tags },
        ...updates.difficulty && { difficulty: updates.difficulty },
        ...updates.estimatedTime && { estimated_time: updates.estimatedTime },
        ...updates.calories && { calories: updates.calories },
        ...updates.notes && { notes: updates.notes },
        ...updates.rating !== undefined && { rating: updates.rating },
        ...updates.status && { status: updates.status },
        ...updates.timeMarkers && { time_markers: updates.timeMarkers },
        ...updates.prepTime && { prep_time: updates.prepTime },
        ...updates.cookTime && { cook_time: updates.cookTime },
        ...updates.totalTime && { total_time: updates.totalTime },
        ...updates.servings !== undefined && { servings: updates.servings },
        ...updates.nutritionInfo && { nutrition_info: updates.nutritionInfo },
        ...updates.seasonality && { seasonality: updates.seasonality },
        ...updates.cuisine && { cuisine: updates.cuisine },
        ...updates.imageBase64 && { image_base64: updates.imageBase64 },
      };
      
      // Update in database
      const { error } = await supabase
        .from('recipes')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      setRecipes(prev => 
        prev.map(r => r.id === id ? { ...r, ...updates } : r)
      );
      
      toast({
        title: "Recipe Updated",
        description: "Your recipe has been successfully updated."
      });
      
    } catch (error) {
      console.error('Error updating recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to Update Recipe",
        description: "There was an error updating your recipe."
      });
      
      throw error;
    }
  };

  const rateRecipe = async (id: string, rating: number) => {
    try {
      // Find the recipe in state
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;
      
      // Update in database
      const { error } = await supabase
        .from('recipes')
        .update({ rating })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update in state
      setRecipes(prev => 
        prev.map(r => r.id === id ? { ...r, rating } : r)
      );
      
      toast({
        title: "Recipe Rated",
        description: "Your rating has been saved."
      });
      
    } catch (error) {
      console.error('Error rating recipe:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to Rate Recipe",
        description: "There was an error saving your rating."
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      // Optimistically update state
      setRecipes(prev => prev.filter(r => r.id !== id));
      
      // Delete from database
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Recipe Deleted",
        description: "Your recipe has been successfully deleted."
      });
      
    } catch (error) {
      console.error('Error deleting recipe:', error);
      
      // Reload data on error to ensure consistency
      loadRecipes();
      
      toast({
        variant: "destructive",
        title: "Failed to Delete Recipe",
        description: "There was an error deleting your recipe."
      });
    }
  };

  return {
    recipes,
    isLoading,
    isError,
    loadRecipes,
    addRecipe,
    toggleFavorite,
    updateRecipe,
    deleteRecipe,
    publishRecipe,
    unpublishRecipe,
    rateRecipe,
  };
};

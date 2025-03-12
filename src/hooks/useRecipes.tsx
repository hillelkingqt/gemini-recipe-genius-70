
import { useState, useEffect } from 'react';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { toast } from '@/hooks/use-toast';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  // Load recipes from localStorage on initial load
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedRecipes);
        // Convert string dates back to Date objects
        const recipesWithDates = parsedRecipes.map((recipe: Recipe) => ({
          ...recipe,
          createdAt: new Date(recipe.createdAt)
        }));
        setRecipes(recipesWithDates);
      } catch (error) {
        console.error('Error parsing saved recipes:', error);
        setRecipes([]);
        
        // Show error toast
        toast({
          title: "Error loading recipes",
          description: "There was a problem loading your saved recipes.",
          variant: "destructive",
        });
      }
    }
  }, []);
  
  // Save recipes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('recipes', JSON.stringify(recipes));
      console.log('Recipes saved to localStorage:', recipes);
    } catch (error) {
      console.error('Error saving recipes to localStorage:', error);
      
      // Show error toast
      toast({
        title: "Error saving recipes",
        description: "There was a problem saving your recipes.",
        variant: "destructive",
      });
    }
  }, [recipes]);
  
  const addRecipe = (recipeResponse: RecipeResponse, status: 'draft' | 'accepted' | 'rejected' = 'accepted') => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: recipeResponse.name,
      ingredients: recipeResponse.ingredients,
      instructions: recipeResponse.instructions,
      createdAt: new Date(),
      isRTL: recipeResponse.isRTL || false,
      ingredientsLabel: recipeResponse.ingredientsLabel || (recipeResponse.isRTL ? 'מצרכים' : 'Ingredients'),
      instructionsLabel: recipeResponse.instructionsLabel || (recipeResponse.isRTL ? 'אופן ההכנה' : 'Instructions'),
      isRecipe: recipeResponse.isRecipe,
      content: recipeResponse.content,
      isFavorite: false,
      tags: recipeResponse.tags || [],
      difficulty: recipeResponse.difficulty || 'medium',
      estimatedTime: recipeResponse.estimatedTime || '',
      calories: recipeResponse.calories || '',
      notes: '',
      rating: 0,
      status,
      timeMarkers: recipeResponse.timeMarkers || [],
      prepTime: recipeResponse.prepTime,
      cookTime: recipeResponse.cookTime,
      totalTime: recipeResponse.totalTime,
      servings: recipeResponse.servings || 4,
      nutritionInfo: recipeResponse.nutritionInfo,
      seasonality: recipeResponse.seasonality,
      cuisine: recipeResponse.cuisine
    };
    
    const updatedRecipes = [newRecipe, ...recipes];
    setRecipes(updatedRecipes);
    
    // Immediately save to localStorage to ensure it persists
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    // Show success toast
    toast({
      title: status === 'accepted' ? "Recipe added" : status === 'draft' ? "Recipe saved as draft" : "Recipe rejected but saved",
      description: `"${newRecipe.name}" has been ${status === 'accepted' ? 'added to' : 'saved in'} your collection.`,
      duration: 3000,
    });
    
    console.log('New recipe added:', newRecipe);
    console.log('Current recipes state:', updatedRecipes);
    
    return newRecipe;
  };
  
  const toggleFavorite = (id: string) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      toast({
        title: recipe.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `"${recipe.name}" has been ${recipe.isFavorite ? 'removed from' : 'added to'} your favorites.`,
        duration: 2000,
      });
    }
  };
  
  const rateRecipe = (id: string, rating: number) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, rating } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      toast({
        title: "Recipe rated",
        description: `You gave "${recipe.name}" a rating of ${rating} stars.`,
        duration: 2000,
      });
    }
  };
  
  const addNote = (id: string, note: string) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, notes: note } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    toast({
      title: "Notes saved",
      description: "Your personal notes for this recipe have been saved.",
      duration: 2000,
    });
  };
  
  const removeRecipe = (id: string) => {
    const recipeToRemove = recipes.find(r => r.id === id);
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    if (recipeToRemove) {
      toast({
        title: "Recipe deleted",
        description: `"${recipeToRemove.name}" has been removed from your collection.`,
        duration: 3000,
      });
    }
  };
  
  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  const updateRecipe = (id: string, updatedRecipe: Partial<Recipe>) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    toast({
      title: "Recipe updated",
      description: "The recipe has been successfully updated.",
      duration: 2000,
    });
  };
  
  const updateRecipeStatus = (id: string, status: 'draft' | 'accepted' | 'rejected') => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, status } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
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
  };
  
  const updateServings = (id: string, servings: number) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, servings } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    
    toast({
      title: "Servings updated",
      description: `Recipe updated to serve ${servings} people.`,
      duration: 2000,
    });
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
  };
}


import { useState, useEffect } from 'react';
import { Recipe, RecipeResponse } from '@/types/Recipe';

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
      }
    }
  }, []);
  
  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
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
    
    return newRecipe;
  };
  
  const toggleFavorite = (id: string) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };
  
  const rateRecipe = (id: string, rating: number) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, rating } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };
  
  const addNote = (id: string, note: string) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, notes: note } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };
  
  const removeRecipe = (id: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
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
  };
  
  const updateRecipeStatus = (id: string, status: 'draft' | 'accepted' | 'rejected') => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, status } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };
  
  const updateServings = (id: string, servings: number) => {
    const updatedRecipes = recipes.map(recipe => 
      recipe.id === id ? { ...recipe, servings } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
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

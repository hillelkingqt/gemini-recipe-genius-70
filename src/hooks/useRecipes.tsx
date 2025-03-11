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
        const recipesWithDates = parsedRecipes.map((recipe: any) => ({
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
    
    setRecipes(prevRecipes => [newRecipe, ...prevRecipes]);
    return newRecipe;
  };
  
  const toggleFavorite = (id: string) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    );
  };
  
  const rateRecipe = (id: string, rating: number) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, rating } : recipe
      )
    );
  };
  
  const addNote = (id: string, note: string) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, notes: note } : recipe
      )
    );
  };
  
  const removeRecipe = (id: string) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
  };
  
  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  const updateRecipe = (id: string, updatedRecipe: Partial<Recipe>) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, ...updatedRecipe } : recipe
      )
    );
  };
  
  const updateRecipeStatus = (id: string, status: 'draft' | 'accepted' | 'rejected') => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, status } : recipe
      )
    );
  };
  
  const updateServings = (id: string, servings: number) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === id ? { ...recipe, servings } : recipe
      )
    );
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

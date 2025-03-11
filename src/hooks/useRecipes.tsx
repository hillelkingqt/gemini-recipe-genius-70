
import { useState, useEffect } from 'react';
import { Recipe, RecipeResponse } from '../types/Recipe';

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
        // If there's an error, initialize with empty array
        setRecipes([]);
      }
    }
  }, []);
  
  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);
  
  const addRecipe = (recipeResponse: RecipeResponse) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: recipeResponse.name,
      ingredients: recipeResponse.ingredients,
      instructions: recipeResponse.instructions,
      createdAt: new Date(),
      isRTL: recipeResponse.isRTL || false,
      ingredientsLabel: recipeResponse.ingredientsLabel,
      instructionsLabel: recipeResponse.instructionsLabel,
      isRecipe: recipeResponse.isRecipe,
      content: recipeResponse.content,
      isFavorite: false,
      tags: recipeResponse.tags || [],
      difficulty: recipeResponse.difficulty || 'medium',
      estimatedTime: recipeResponse.estimatedTime || '',
      calories: recipeResponse.calories || '',
      notes: '',
      rating: 0
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
  
  return {
    recipes,
    addRecipe,
    removeRecipe,
    getRecipe,
    updateRecipe,
    toggleFavorite,
    rateRecipe,
    addNote
  };
}

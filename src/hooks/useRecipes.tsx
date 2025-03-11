
import { useState, useEffect } from 'react';
import { Recipe, RecipeResponse } from '../types/Recipe';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  // Load recipes from localStorage on initial load
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      try {
        setRecipes(JSON.parse(savedRecipes));
      } catch (error) {
        console.error('Error parsing saved recipes:', error);
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
    };
    
    setRecipes(prevRecipes => [...prevRecipes, newRecipe]);
    return newRecipe;
  };
  
  const removeRecipe = (id: string) => {
    setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== id));
  };
  
  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };
  
  return {
    recipes,
    addRecipe,
    removeRecipe,
    getRecipe,
  };
}

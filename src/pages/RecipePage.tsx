// src/pages/RecipePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeDetail from '@/components/RecipeDetail';
import { Recipe } from '@/types/Recipe';

const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const { recipes, fetchUserRecipes } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (recipes.length === 0) {
        await fetchUserRecipes();
      }
      const found = recipes.find(r => r.id.toString() === id); // השווה לפי string
      setRecipe(found || null);
      setLoading(false);
    };

    load();
  }, [id, recipes, fetchUserRecipes]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!recipe) return <p className="text-center mt-10 text-gray-500">Recipe not found</p>;

  return <RecipeDetail recipe={recipe} />;
};

export default RecipePage;

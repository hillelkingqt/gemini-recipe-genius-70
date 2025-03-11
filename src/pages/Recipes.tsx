
import React, { useState } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';

const Recipes: React.FC = () => {
  const { recipes, removeRecipe } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDeleteRecipe = (id: string) => {
    removeRecipe(id);
    
    if (selectedRecipeId === id) {
      setSelectedRecipeId(null);
    }
    
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been removed from your collection.",
    });
  };
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedRecipe = recipes.find(recipe => recipe.id === selectedRecipeId);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-recipe-green text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Recipes</h1>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-white text-recipe-green hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>
      </div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-4">
        {selectedRecipe ? (
          <div className="animate-fade-in">
            <RecipeDetail recipe={selectedRecipe} />
          </div>
        ) : (
          <>
            <div className="mb-6 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search recipes..."
                  className="pl-10 pr-10 bg-white"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No recipes match your search.' : 'Your recipe collection is empty.'}
                </p>
                <Button 
                  onClick={() => navigate('/')} 
                  className="bg-recipe-green hover:bg-recipe-green/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Recipe
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showActions={true}
                    onEdit={(id) => setSelectedRecipeId(id)}
                    onDelete={handleDeleteRecipe}
                    className="h-full cursor-pointer hover:border-recipe-green"
                    onClick={() => setSelectedRecipeId(recipe.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;


import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import { Recipe } from '@/types/Recipe';
import RecipeDetail from '@/components/RecipeDetail';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CookingPot, Search, Plus, Loader2, FileQuestion } from 'lucide-react';

const Recipes: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedRecipeId = queryParams.get('id');
    
    const { recipes, isLoading, deleteRecipe, toggleFavorite, updateRecipe, publishRecipe, unpublishRecipe, rateRecipe } = useRecipes();
    const { profile } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [filter, setFilter] = useState<'all' | 'favorites' | 'published'>('all');
    
    useEffect(() => {
        if (selectedRecipeId && recipes.length > 0) {
            const recipe = recipes.find(r => r.id === selectedRecipeId);
            if (recipe) {
                setSelectedRecipe(recipe);
            }
        }
    }, [selectedRecipeId, recipes]);
    
    useEffect(() => {
        let filtered = [...recipes];
        
        // Apply the filter
        if (filter === 'favorites') {
            filtered = filtered.filter(recipe => recipe.isFavorite);
        } else if (filter === 'published') {
            filtered = filtered.filter(recipe => recipe.status === 'published');
        }
        
        // Apply the search term
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(recipe => 
                recipe.name.toLowerCase().includes(term) ||
                recipe.tags?.some(tag => tag.toLowerCase().includes(term)) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(term))
            );
        }
        
        setFilteredRecipes(filtered);
    }, [recipes, searchTerm, filter]);
    
    const handleRecipeSelect = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        // Update URL without causing a page reload
        const url = new URL(window.location.href);
        url.searchParams.set('id', recipe.id);
        window.history.pushState({}, '', url);
    };
    
    const handleBackToList = () => {
        setSelectedRecipe(null);
        // Remove id param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('id');
        window.history.pushState({}, '', url);
    };
    
    const handleDeleteRecipe = async (id: string) => {
        await deleteRecipe(id);
        if (selectedRecipe?.id === id) {
            handleBackToList();
        }
    };
    
    const handleFavoriteToggle = async (id: string) => {
        await toggleFavorite(id);
        // Update selected recipe if it's the one being toggled
        if (selectedRecipe?.id === id) {
            const updatedRecipe = recipes.find(r => r.id === id);
            if (updatedRecipe) {
                setSelectedRecipe(updatedRecipe);
            }
        }
    };
    
    const handleRecipeUpdate = async (id: string, updates: Partial<Recipe>) => {
        await updateRecipe(id, updates);
        // Update selected recipe if it's the one being updated
        if (selectedRecipe?.id === id) {
            const updatedRecipe = recipes.find(r => r.id === id);
            if (updatedRecipe) {
                setSelectedRecipe(updatedRecipe);
            }
        }
    };
    
    const handlePublishRecipe = async (id: string) => {
        if (profile) {
            await publishRecipe(id, profile.username);
            // Update selected recipe if it's the one being published
            if (selectedRecipe?.id === id) {
                const updatedRecipe = recipes.find(r => r.id === id);
                if (updatedRecipe) {
                    setSelectedRecipe(updatedRecipe);
                }
            }
        }
    };
    
    const handleUnpublishRecipe = async (id: string) => {
        await unpublishRecipe(id);
        // Update selected recipe if it's the one being unpublished
        if (selectedRecipe?.id === id) {
            const updatedRecipe = recipes.find(r => r.id === id);
            if (updatedRecipe) {
                setSelectedRecipe(updatedRecipe);
            }
        }
    };
    
    const handleRateRecipe = async (id: string, rating: number) => {
        await rateRecipe(id, rating);
        // Update selected recipe if it's the one being rated
        if (selectedRecipe?.id === id) {
            const updatedRecipe = recipes.find(r => r.id === id);
            if (updatedRecipe) {
                setSelectedRecipe(updatedRecipe);
            }
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh]">
                <Loader2 className="h-10 w-10 animate-spin text-recipe-green mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading your recipes...</p>
            </div>
        );
    }
    
    if (selectedRecipe) {
        return (
            <RecipeDetail 
                recipe={selectedRecipe} 
                onBack={handleBackToList}
                onDelete={handleDeleteRecipe}
                onFavoriteToggle={handleFavoriteToggle}
                onUpdate={handleRecipeUpdate}
                onPublish={handlePublishRecipe}
                onUnpublish={handleUnpublishRecipe}
                onRate={handleRateRecipe}
            />
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <CookingPot className="h-8 w-8 mr-3 text-recipe-green" />
                        <h1 className="text-3xl font-bold">Your Recipes</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button 
                            variant="ghost" 
                            className={`${filter === 'all' ? 'bg-recipe-green/10 text-recipe-green' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`${filter === 'favorites' ? 'bg-recipe-green/10 text-recipe-green' : ''}`}
                            onClick={() => setFilter('favorites')}
                        >
                            Favorites
                        </Button>
                        <Button 
                            variant="ghost" 
                            className={`${filter === 'published' ? 'bg-recipe-green/10 text-recipe-green' : ''}`}
                            onClick={() => setFilter('published')}
                        >
                            Published
                        </Button>
                    </div>
                </div>
                
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                        type="text" 
                        placeholder="Search recipes by name, ingredients, or tags..." 
                        className="pl-10 pr-4 py-2 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {filteredRecipes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                        <FileQuestion className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No recipes found</h3>
                        {searchTerm ? (
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No recipes match your search criteria. Try adjusting your search.
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                You haven't created any recipes yet. Start a chat to create your first recipe!
                            </p>
                        )}
                        
                        <Button 
                            onClick={() => window.location.href = '/'} 
                            className="bg-recipe-green hover:bg-recipe-green/80"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Recipe
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                onClick={() => handleRecipeSelect(recipe)}
                                onFavoriteToggle={() => handleFavoriteToggle(recipe.id)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Recipes;

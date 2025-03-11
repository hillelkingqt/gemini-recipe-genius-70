
import React, { useState, useEffect } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetail from '@/components/RecipeDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X, ArrowLeft, CookingPot, Filter, SlidersHorizontal, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Recipes: React.FC = () => {
  const { recipes, removeRecipe, toggleFavorite, rateRecipe, addNote } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get recipe ID from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (recipeId) {
      setSelectedRecipeId(recipeId);
    }
  }, []);
  
  // Update URL when a recipe is selected
  useEffect(() => {
    if (selectedRecipeId) {
      window.history.pushState({}, '', `?id=${selectedRecipeId}`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, [selectedRecipeId]);
  
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
  
  // Get all unique tags across recipes
  const allTags = [...new Set(recipes.flatMap(recipe => recipe.tags || []))];
  
  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    // Search by name
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by difficulty
    const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
    
    // Filter by tags
    const matchesTags = filterTags.length === 0 || 
      (recipe.tags && filterTags.every(tag => recipe.tags.includes(tag)));
    
    return matchesSearch && matchesDifficulty && matchesTags;
  });
  
  const selectedRecipe = recipes.find(recipe => recipe.id === selectedRecipeId);
  
  // For showing favorite recipes
  const favoriteRecipes = recipes.filter(recipe => recipe.isFavorite);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <motion.div 
        className="bg-gradient-to-r from-recipe-orange/90 to-recipe-orange text-white py-4 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <CookingPot className="h-6 w-6 mr-3" />
            <h1 className="text-2xl font-bold">My Recipes</h1>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-white text-recipe-orange hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Recipe
          </Button>
        </div>
      </motion.div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        <AnimatePresence mode="wait">
          {selectedRecipe ? (
            <motion.div 
              key="recipe-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeDetail 
                recipe={selectedRecipe} 
                onToggleFavorite={toggleFavorite}
                onRate={rateRecipe}
                onUpdateNotes={addNote}
              />
            </motion.div>
          ) : (
            <motion.div
              key="recipe-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 relative">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search recipes..."
                      className="pl-10 pr-10 bg-white border-gray-300"
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
                  
                  <Button 
                    variant="outline" 
                    className="flex gap-2 items-center"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {(filterDifficulty !== 'all' || filterTags.length > 0) && (
                      <Badge className="bg-recipe-green ml-1">
                        {filterDifficulty !== 'all' && filterTags.length > 0 
                          ? `${1 + filterTags.length}` 
                          : filterDifficulty !== 'all' ? '1' : `${filterTags.length}`}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Filters section */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 mt-4 p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          <label className="text-sm font-medium text-gray-700">Difficulty</label>
                          <Select 
                            value={filterDifficulty} 
                            onValueChange={setFilterDifficulty}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All difficulties" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All difficulties</SelectItem>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex-grow">
                          <label className="text-sm font-medium text-gray-700 block mb-1">Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                              <Badge 
                                key={tag}
                                variant={filterTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-recipe-green/90 transition-colors"
                                onClick={() => {
                                  if (filterTags.includes(tag)) {
                                    setFilterTags(filterTags.filter(t => t !== tag));
                                  } else {
                                    setFilterTags([...filterTags, tag]);
                                  }
                                }}
                              >
                                {tag}
                                {filterTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                              </Badge>
                            ))}
                            {allTags.length === 0 && (
                              <span className="text-gray-500 italic">No tags available</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setFilterDifficulty('all');
                            setFilterTags([]);
                          }}
                          className="text-gray-700"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Tabs defaultValue="all" className="mb-6">
                <TabsList>
                  <TabsTrigger value="all" className="relative">
                    All Recipes
                    <Badge className="ml-2 bg-gray-600">{recipes.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="relative">
                    Favorites
                    <Badge className="ml-2 bg-red-500">{favoriteRecipes.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {filteredRecipes.length === 0 ? (
                    <motion.div 
                      className="text-center py-12 px-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <CookingPot className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        {searchTerm || filterDifficulty !== 'all' || filterTags.length > 0 
                          ? 'No recipes match your search or filters.' 
                          : 'Your recipe collection is empty.'}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {searchTerm || filterDifficulty !== 'all' || filterTags.length > 0
                          ? 'Try adjusting your search terms or filters.' 
                          : 'Create your first recipe to get started with your culinary journey.'}
                      </p>
                      {searchTerm || filterDifficulty !== 'all' || filterTags.length > 0 ? (
                        <Button 
                          onClick={() => {
                            setSearchTerm('');
                            setFilterDifficulty('all');
                            setFilterTags([]);
                          }} 
                          variant="outline"
                        >
                          Clear All Filters
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/')} 
                          className="bg-recipe-green hover:bg-recipe-green/90"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Recipe
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredRecipes.map((recipe, index) => (
                        <motion.div
                          key={recipe.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <RecipeCard
                            recipe={recipe}
                            showActions={true}
                            onEdit={(id) => setSelectedRecipeId(id)}
                            onDelete={handleDeleteRecipe}
                            onToggleFavorite={toggleFavorite}
                            onRate={rateRecipe}
                            className="h-full cursor-pointer hover:border-recipe-green"
                            onClick={() => setSelectedRecipeId(recipe.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="favorites">
                  {favoriteRecipes.length === 0 ? (
                    <motion.div 
                      className="text-center py-12 px-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 mb-4">
                        <Heart className="h-8 w-8 text-red-300" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No favorite recipes yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Mark recipes as favorites by clicking the heart icon on any recipe card.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteRecipes.map((recipe, index) => (
                        <motion.div
                          key={recipe.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <RecipeCard
                            recipe={recipe}
                            showActions={true}
                            onEdit={(id) => setSelectedRecipeId(id)}
                            onDelete={handleDeleteRecipe}
                            onToggleFavorite={toggleFavorite}
                            onRate={rateRecipe}
                            className="h-full cursor-pointer hover:border-recipe-green"
                            onClick={() => setSelectedRecipeId(recipe.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recipes;

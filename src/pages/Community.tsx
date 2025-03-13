
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import RecipeCard from '@/components/RecipeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, ChevronsUpDown, Heart, X, Check, Filter, 
  Award, Clock, ChefHat, Sparkles, ThumbsUp 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

const Community: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('newest');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadCommunityRecipes();
  }, []);

  const loadCommunityRecipes = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all published recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (recipesError) {
        throw recipesError;
      }
      
      if (!recipesData) {
        setRecipes([]);
        setFilteredRecipes([]);
        setIsLoading(false);
        return;
      }
      
      // Process the recipes
      const processedRecipes: Recipe[] = recipesData.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        ingredients: (recipe.ingredients as string[]) || [],
        instructions: (recipe.instructions as string[]) || [],
        createdAt: new Date(recipe.created_at),
        isRTL: recipe.is_rtl || false,
        ingredientsLabel: recipe.ingredients_label || 'Ingredients',
        instructionsLabel: recipe.instructions_label || 'Instructions',
        isRecipe: recipe.is_recipe || true,
        content: recipe.content || '',
        isFavorite: recipe.is_favorite || false,
        tags: (recipe.tags as string[]) || [],
        difficulty: (recipe.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        estimatedTime: recipe.estimated_time || '',
        calories: recipe.calories || '',
        notes: recipe.notes || '',
        rating: recipe.rating || 0,
        status: recipe.status as 'draft' | 'accepted' | 'rejected' | 'published',
        timeMarkers: (recipe.time_markers as { step: number; duration: number; description: string; }[]) || [],
        prepTime: recipe.prep_time || '',
        cookTime: recipe.cook_time || '',
        totalTime: recipe.total_time || '',
        servings: recipe.servings || 0,
        nutritionInfo: recipe.nutrition_info as { calories?: string; protein?: string; carbs?: string; fat?: string; } || {},
        seasonality: (recipe.seasonality as string[]) || [],
        cuisine: recipe.cuisine || '',
        likes: recipe.likes || 0,
        author: recipe.author || '',
        publishedAt: recipe.published_at ? new Date(recipe.published_at) : undefined,
        imageBase64: recipe.image_base64 || '',
      }));
      
      // Extract unique tags and cuisines for filtering
      const allTags = processedRecipes.flatMap(r => r.tags || []);
      const uniqueTags = [...new Set(allTags)].filter(tag => tag);
      setAvailableTags(uniqueTags);
      
      const allCuisines = processedRecipes.map(r => r.cuisine || '');
      const uniqueCuisines = [...new Set(allCuisines)].filter(cuisine => cuisine);
      setAvailableCuisines(uniqueCuisines);
      
      setRecipes(processedRecipes);
      setFilteredRecipes(processedRecipes);
      
    } catch (error) {
      console.error('Error loading community recipes:', error);
      toast({
        variant: "destructive",
        title: "Failed to Load Recipes",
        description: "There was an error loading the community recipes."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLikeRecipe = async (recipe: Recipe) => {
    if (!user) {
      toast({
        variant: "default",
        title: "Login Required",
        description: "Please login to like recipes",
      });
      return;
    }
    
    try {
      // Check if user has already liked this recipe
      const { data: existingLike } = await supabase
        .from('recipe_likes')
        .select('*')
        .eq('recipe_id', recipe.id)
        .eq('user_id', user.id)
        .single();
      
      if (existingLike) {
        // User already liked this recipe, so unlike it
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id);
        
        // Update the likes count in the recipes table
        await supabase
          .from('recipes')
          .update({ likes: Math.max((recipe.likes || 1) - 1, 0) })
          .eq('id', recipe.id);
        
        toast({
          variant: "default",
          title: "Recipe Unliked",
          description: `You've removed your like from "${recipe.name}"`,
        });
      } else {
        // User has not liked this recipe yet, so add the like
        await supabase
          .from('recipe_likes')
          .insert({
            recipe_id: recipe.id,
            user_id: user.id
          });
        
        // Update the likes count in the recipes table
        await supabase
          .from('recipes')
          .update({ likes: (recipe.likes || 0) + 1 })
          .eq('id', recipe.id);
        
        toast({
          variant: "default",
          title: "Recipe Liked",
          description: `You've liked "${recipe.name}"`,
        });
      }
      
      // Refresh the recipes
      loadCommunityRecipes();
      
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "There was an error processing your request."
      });
    }
  };
  
  const handleViewRecipe = (recipeId: string) => {
    navigate(`/recipes?id=${recipeId}`);
  };
  
  // Apply search and filters
  useEffect(() => {
    let filtered = [...recipes];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) || 
        recipe.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        recipe.cuisine?.toLowerCase().includes(query) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe => 
        selectedTags.every(tag => recipe.tags?.includes(tag))
      );
    }
    
    // Apply cuisine filter
    if (selectedCuisine) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine === selectedCuisine
      );
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      filtered.sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => (a.publishedAt?.getTime() || 0) - (b.publishedAt?.getTime() || 0));
    } else if (sortOption === 'most-liked') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortOption === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedTags, selectedCuisine, sortOption]);
  
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedCuisine('');
    setSortOption('newest');
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-recipe-green">Community Recipes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore delicious recipes shared by our community
        </p>
      </motion.div>
      
      <motion.div 
        className="flex flex-col md:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search recipes, ingredients, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {(selectedTags.length > 0 || selectedCuisine) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length + (selectedCuisine ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2">
              <h4 className="mb-2 text-sm font-medium">Cuisine</h4>
              <div className="mb-4">
                <select
                  className="w-full p-2 rounded border dark:bg-gray-800"
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                >
                  <option value="">All Cuisines</option>
                  {availableCuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>
              
              <h4 className="mb-2 text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto mb-2">
                {availableTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => setSortOption('newest')}
              className={sortOption === 'newest' ? 'bg-accent' : ''}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span>Newest</span>
              {sortOption === 'newest' && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOption('most-liked')}
              className={sortOption === 'most-liked' ? 'bg-accent' : ''}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              <span>Most Liked</span>
              {sortOption === 'most-liked' && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortOption('alphabetical')}
              className={sortOption === 'alphabetical' ? 'bg-accent' : ''}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Alphabetical</span>
              {sortOption === 'alphabetical' && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 h-96">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredRecipes.length === 0 ? (
            <motion.div 
              className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Recipes Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || selectedTags.length > 0 || selectedCuisine
                  ? "No recipes match your current filters. Try adjusting your search criteria."
                  : "There are no published recipes in the community yet. Be the first to share a recipe!"}
              </p>
              {(searchQuery || selectedTags.length > 0 || selectedCuisine) && (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence>
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="group" onClick={() => handleViewRecipe(recipe.id)}>
                      <RecipeCard
                        recipe={recipe}
                        showActions={false}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        className="cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 border-t">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1 text-recipe-green" />
                        <span className="text-sm">{recipe.likes || 0}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {recipe.author && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            by {recipe.author}
                          </span>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeRecipe(recipe);
                          }}
                          className="text-recipe-green hover:text-recipe-green/80"
                        >
                          <Heart className={`h-5 w-5 ${recipe.likes ? 'fill-recipe-green' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Community;

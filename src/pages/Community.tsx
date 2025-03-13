
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import RecipeCard from '@/components/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Globe, 
  ThumbsUp, 
  User,
  Loader2,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Heart,
  TagIcon,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

const Community: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [communityRecipes, setCommunityRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cuisineFilters, setCuisineFilters] = useState<string[]>([]);
  const [difficultyFilters, setDifficultyFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCommunityRecipes();
  }, []);

  const fetchCommunityRecipes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert Supabase response to Recipe type
      const recipes = data.map(item => ({
        id: item.id,
        name: item.name,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        instructions: Array.isArray(item.instructions) ? item.instructions : [],
        createdAt: new Date(item.created_at),
        isRTL: item.is_rtl,
        ingredientsLabel: item.ingredients_label,
        instructionsLabel: item.instructions_label,
        isRecipe: item.is_recipe,
        content: item.content,
        isFavorite: item.is_favorite || false,
        tags: Array.isArray(item.tags) ? item.tags : [],
        difficulty: item.difficulty as 'easy' | 'medium' | 'hard',
        estimatedTime: item.estimated_time,
        calories: item.calories,
        notes: item.notes || '',
        rating: item.rating || 0,
        status: item.status as 'draft' | 'accepted' | 'rejected' | 'published',
        timeMarkers: Array.isArray(item.time_markers) ? item.time_markers : [],
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        totalTime: item.total_time,
        servings: typeof item.servings === 'number' ? item.servings : 4,
        nutritionInfo: item.nutrition_info || {},
        seasonality: Array.isArray(item.seasonality) ? item.seasonality : [],
        cuisine: item.cuisine,
        likes: item.likes || 0,
        author: item.user_id,
      }));

      setCommunityRecipes(recipes);
      setFilteredRecipes(recipes);

      // Extract all unique tags and cuisines for filters
      const allTags = recipes.flatMap(recipe => recipe.tags || []);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);

      const allCuisines = recipes.map(recipe => recipe.cuisine).filter(Boolean) as string[];
      const uniqueCuisines = [...new Set(allCuisines)];
      setAvailableCuisines(uniqueCuisines);

      // Fetch likes for current user
      if (user) {
        fetchUserLikes();
      }

    } catch (error) {
      console.error('Error fetching community recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community recipes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recipe_likes')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const likes: Record<string, boolean> = {};
      data.forEach(like => {
        likes[like.recipe_id] = true;
      });

      setUserLikes(likes);
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const handleLike = async (recipeId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like recipes',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isLiked = userLikes[recipeId];

      if (isLiked) {
        // Unlike
        const { error: deleteLikeError } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (deleteLikeError) throw deleteLikeError;

        // Update recipe likes count
        const { error: updateRecipeError } = await supabase.rpc('decrement_likes', {
          recipe_id: recipeId
        });

        if (updateRecipeError) throw updateRecipeError;

        // Update local state
        setUserLikes(prev => ({
          ...prev,
          [recipeId]: false
        }));

        setCommunityRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, likes: (recipe.likes || 0) - 1 } 
            : recipe
        ));

        setFilteredRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, likes: (recipe.likes || 0) - 1 } 
            : recipe
        ));

      } else {
        // Like
        const { error: insertLikeError } = await supabase
          .from('recipe_likes')
          .insert({ user_id: user.id, recipe_id: recipeId });

        if (insertLikeError) throw insertLikeError;

        // Update recipe likes count
        const { error: updateRecipeError } = await supabase.rpc('increment_likes', {
          recipe_id: recipeId
        });

        if (updateRecipeError) throw updateRecipeError;

        // Update local state
        setUserLikes(prev => ({
          ...prev,
          [recipeId]: true
        }));

        setCommunityRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, likes: (recipe.likes || 0) + 1 } 
            : recipe
        ));

        setFilteredRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, likes: (recipe.likes || 0) + 1 } 
            : recipe
        ));
      }

    } catch (error) {
      console.error('Error liking/unliking recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to like/unlike recipe',
        variant: 'destructive',
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...communityRecipes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) || 
        recipe.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        recipe.cuisine?.toLowerCase().includes(query)
      );
    }

    // Apply cuisine filters
    if (cuisineFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine && cuisineFilters.includes(recipe.cuisine)
      );
    }

    // Apply difficulty filters
    if (difficultyFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.difficulty && difficultyFilters.includes(recipe.difficulty)
      );
    }

    // Apply tag filters
    if (tagFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.tags && tagFilters.some(tag => recipe.tags?.includes(tag))
      );
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredRecipes(filtered);
  };

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, cuisineFilters, difficultyFilters, tagFilters, sortBy, communityRecipes]);

  const toggleCuisineFilter = (cuisine: string) => {
    setCuisineFilters(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine) 
        : [...prev, cuisine]
    );
  };

  const toggleDifficultyFilter = (difficulty: string) => {
    setDifficultyFilters(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty) 
        : [...prev, difficulty]
    );
  };

  const toggleTagFilter = (tag: string) => {
    setTagFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCuisineFilters([]);
    setDifficultyFilters([]);
    setTagFilters([]);
    setSortBy('newest');
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-6 w-6 text-recipe-green" />
          <h1 className="text-3xl font-bold">Community Recipes</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and explore recipes shared by the community
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, tags, or cuisines..."
              className="pl-9 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'popular')} className="hidden md:block">
              <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="newest" className="data-[state=active]:bg-recipe-green/10 data-[state=active]:text-recipe-green">
                  Newest
                </TabsTrigger>
                <TabsTrigger value="popular" className="data-[state=active]:bg-recipe-green/10 data-[state=active]:text-recipe-green">
                  Most Popular
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white dark:bg-gray-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {(cuisineFilters.length > 0 || difficultyFilters.length > 0 || tagFilters.length > 0) && (
                <Badge className="ml-2 bg-recipe-green text-white">
                  {cuisineFilters.length + difficultyFilters.length + tagFilters.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={fetchCommunityRecipes}
              title="Refresh recipes"
              className="bg-white dark:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Responsive sort options for mobile */}
        <div className="md:hidden mb-4">
          <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'popular')}>
            <TabsList className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="newest" className="flex-1 data-[state=active]:bg-recipe-green/10 data-[state=active]:text-recipe-green">
                Newest
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex-1 data-[state=active]:bg-recipe-green/10 data-[state=active]:text-recipe-green">
                Most Popular
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium flex items-center">
                    <SlidersHorizontal className="mr-2 h-4 w-4 text-recipe-green" />
                    Filter Options
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-gray-500"
                    >
                      <XCircle className="mr-2 h-3 w-3" />
                      Clear All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowFilters(false)}
                      className="text-recipe-green"
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cuisine Filters */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-recipe-green" />
                      Cuisine
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {availableCuisines.length > 0 ? (
                        availableCuisines.map(cuisine => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`cuisine-${cuisine}`} 
                              checked={cuisineFilters.includes(cuisine)}
                              onCheckedChange={() => toggleCuisineFilter(cuisine)}
                            />
                            <Label htmlFor={`cuisine-${cuisine}`} className="cursor-pointer">{cuisine}</Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No cuisines available</p>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Filters */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <User className="mr-2 h-4 w-4 text-recipe-green" />
                      Difficulty
                    </h4>
                    <div className="space-y-2">
                      {['easy', 'medium', 'hard'].map(difficulty => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`difficulty-${difficulty}`} 
                            checked={difficultyFilters.includes(difficulty)}
                            onCheckedChange={() => toggleDifficultyFilter(difficulty)}
                          />
                          <Label htmlFor={`difficulty-${difficulty}`} className="cursor-pointer capitalize">{difficulty}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tag Filters */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <TagIcon className="mr-2 h-4 w-4 text-recipe-green" />
                      Popular Tags
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {availableTags.length > 0 ? (
                        availableTags.slice(0, 10).map(tag => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${tag}`} 
                              checked={tagFilters.includes(tag)}
                              onCheckedChange={() => toggleTagFilter(tag)}
                            />
                            <Label htmlFor={`tag-${tag}`} className="cursor-pointer">{tag}</Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tags available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {(cuisineFilters.length > 0 || difficultyFilters.length > 0 || tagFilters.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {cuisineFilters.map(cuisine => (
              <Badge 
                key={`filter-cuisine-${cuisine}`} 
                variant="outline"
                className="bg-recipe-green/10 text-recipe-green border-recipe-green/30 flex items-center"
              >
                <Globe className="mr-1 h-3 w-3" />
                {cuisine}
                <button 
                  onClick={() => toggleCuisineFilter(cuisine)}
                  className="ml-1 hover:text-red-500"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {difficultyFilters.map(difficulty => (
              <Badge 
                key={`filter-difficulty-${difficulty}`} 
                variant="outline"
                className="bg-recipe-orange/10 text-recipe-orange border-recipe-orange/30 flex items-center"
              >
                <User className="mr-1 h-3 w-3" />
                {difficulty}
                <button 
                  onClick={() => toggleDifficultyFilter(difficulty)}
                  className="ml-1 hover:text-red-500"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {tagFilters.map(tag => (
              <Badge 
                key={`filter-tag-${tag}`} 
                variant="outline"
                className="bg-blue-500/10 text-blue-500 border-blue-500/30 flex items-center"
              >
                <TagIcon className="mr-1 h-3 w-3" />
                {tag}
                <button 
                  onClick={() => toggleTagFilter(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-recipe-green" />
          <span className="ml-2 text-gray-500">Loading recipes...</span>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <RecipeCard 
                recipe={recipe} 
                showActions={false} 
                onEdit={() => {}} 
                onDelete={() => {}}
              />
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1 text-recipe-green" />
                    {recipe.likes || 0} likes
                  </span>
                </div>
                <Button
                  variant={userLikes[recipe.id] ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLike(recipe.id)}
                  className={userLikes[recipe.id] ? "bg-recipe-green hover:bg-recipe-green/90" : "text-recipe-green hover:bg-recipe-green/10"}
                >
                  {userLikes[recipe.id] ? (
                    <>
                      <Heart className="h-4 w-4 mr-1 fill-white" />
                      Liked
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No recipes found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || cuisineFilters.length > 0 || difficultyFilters.length > 0 || tagFilters.length > 0
              ? "No recipes match your current filters"
              : "There are no published community recipes yet"}
          </p>
          {(searchQuery || cuisineFilters.length > 0 || difficultyFilters.length > 0 || tagFilters.length > 0) && (
            <Button onClick={clearFilters} variant="outline">
              <XCircle className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Community;

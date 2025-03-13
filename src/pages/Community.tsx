
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecipeCard from '@/components/RecipeCard';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/types/Recipe';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Globe, ChefHat, Clock, Tag, 
  Zap, BookOpen, Filter as FilterIcon, X, Loader2,
  Users, ThumbsUp, Heart
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Community = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    cuisine: string[];
    difficulty: string[];
    tags: string[];
  }>({
    cuisine: [],
    difficulty: [],
    tags: []
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter options
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const difficulties = ['easy', 'medium', 'hard'];
  
  useEffect(() => {
    fetchPublishedRecipes();
  }, []);
  
  const fetchPublishedRecipes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setRecipes(data as Recipe[]);
        
        // Extract unique cuisines and tags
        const cuisines = [...new Set(data.map(recipe => recipe.cuisine).filter(Boolean))];
        setAvailableCuisines(cuisines as string[]);
        
        // Extract all tags and flatten the array
        const allTags = data
          .map(recipe => recipe.tags ? (recipe.tags as string[]) : [])
          .flat()
          .filter(Boolean);
        
        // Get unique tags
        const uniqueTags = [...new Set(allTags)];
        setAvailableTags(uniqueTags as string[]);
      }
    } catch (error) {
      console.error('Error fetching published recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community recipes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLikeRecipe = async (recipe: Recipe) => {
    try {
      // Update like count in database
      const { error } = await supabase
        .from('recipes')
        .update({ likes: (recipe.likes || 0) + 1 })
        .eq('id', recipe.id);
      
      if (error) throw error;
      
      // Update local state
      setRecipes(recipes.map(r => 
        r.id === recipe.id 
          ? { ...r, likes: (r.likes || 0) + 1 } 
          : r
      ));
      
      toast({
        title: 'Recipe Liked!',
        description: `You liked "${recipe.name}"`,
      });
    } catch (error) {
      console.error('Error liking recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to like recipe.',
        variant: 'destructive',
      });
    }
  };
  
  const toggleFilter = (type: 'cuisine' | 'difficulty' | 'tags', value: string) => {
    setActiveFilters(prev => {
      const current = [...prev[type]];
      const index = current.indexOf(value);
      
      if (index === -1) {
        // Add filter
        return {
          ...prev,
          [type]: [...current, value]
        };
      } else {
        // Remove filter
        current.splice(index, 1);
        return {
          ...prev,
          [type]: current
        };
      }
    });
  };
  
  const clearFilters = () => {
    setActiveFilters({
      cuisine: [],
      difficulty: [],
      tags: []
    });
    setSearchTerm('');
  };
  
  // Filter and search recipes
  const filteredRecipes = recipes.filter(recipe => {
    // Search term filter
    if (searchTerm && !(
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recipe.tags && (recipe.tags as string[]).some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )) {
      return false;
    }
    
    // Cuisine filter
    if (activeFilters.cuisine.length > 0 && 
        recipe.cuisine && 
        !activeFilters.cuisine.includes(recipe.cuisine)) {
      return false;
    }
    
    // Difficulty filter
    if (activeFilters.difficulty.length > 0 && 
        recipe.difficulty && 
        !activeFilters.difficulty.includes(recipe.difficulty)) {
      return false;
    }
    
    // Tags filter
    if (activeFilters.tags.length > 0 && 
        (!recipe.tags || !activeFilters.tags.some(tag => 
          (recipe.tags as string[]).includes(tag)
        ))) {
      return false;
    }
    
    return true;
  });
  
  // Color mapping for tags
  const getTagColorClass = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('vegan') || tagLower.includes('vegetarian') || 
        tagLower.includes('green') || tagLower.includes('healthy')) {
      return 'recipe-tag-green';
    } else if (tagLower.includes('quick') || tagLower.includes('easy') || 
               tagLower.includes('fast') || tagLower.includes('simple')) {
      return 'recipe-tag-blue';
    } else if (tagLower.includes('dessert') || tagLower.includes('sweet') || 
               tagLower.includes('cake') || tagLower.includes('chocolate')) {
      return 'recipe-tag-purple';
    } else if (tagLower.includes('spicy') || tagLower.includes('hot') || 
               tagLower.includes('bbq') || tagLower.includes('grill')) {
      return 'recipe-tag-orange';
    }
    return '';
  };
  
  // View recipe details
  const viewRecipeDetails = (recipe: Recipe) => {
    // Navigate to recipe detail page
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div className="container py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center">
              <Users className="mr-3 h-8 w-8 text-recipe-green" />
              Community Recipes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover and explore recipes shared by our community
            </p>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 md:min-w-[400px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes..."
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2 items-center">
                  <FilterIcon className="h-4 w-4" />
                  <span>Filter</span>
                  {(activeFilters.cuisine.length > 0 || 
                    activeFilters.difficulty.length > 0 || 
                    activeFilters.tags.length > 0) && (
                    <Badge className="ml-1 bg-recipe-green">
                      {activeFilters.cuisine.length + 
                       activeFilters.difficulty.length + 
                       activeFilters.tags.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Filter Recipes</span>
                  {(activeFilters.cuisine.length > 0 || 
                    activeFilters.difficulty.length > 0 || 
                    activeFilters.tags.length > 0) && (
                    <Button 
                      variant="ghost" 
                      className="h-8 px-2 text-xs"
                      onClick={clearFilters}
                    >
                      <X className="h-3 w-3 mr-1" /> Clear All
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Cuisine Filter */}
                <DropdownMenuLabel className="text-xs text-gray-500 flex items-center pt-2">
                  <Globe className="h-3 w-3 mr-1" /> Cuisine
                </DropdownMenuLabel>
                {availableCuisines.map(cuisine => (
                  <DropdownMenuItem 
                    key={cuisine}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleFilter('cuisine', cuisine);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {cuisine}
                    {activeFilters.cuisine.includes(cuisine) && <Check className="h-4 w-4 text-recipe-green" />}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                {/* Difficulty Filter */}
                <DropdownMenuLabel className="text-xs text-gray-500 flex items-center pt-2">
                  <ChefHat className="h-3 w-3 mr-1" /> Difficulty
                </DropdownMenuLabel>
                {difficulties.map(difficulty => (
                  <DropdownMenuItem 
                    key={difficulty}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleFilter('difficulty', difficulty);
                    }}
                    className="flex items-center justify-between cursor-pointer capitalize"
                  >
                    {difficulty}
                    {activeFilters.difficulty.includes(difficulty) && <Check className="h-4 w-4 text-recipe-green" />}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                {/* Tags Filter */}
                <DropdownMenuLabel className="text-xs text-gray-500 flex items-center pt-2">
                  <Tag className="h-3 w-3 mr-1" /> Popular Tags
                </DropdownMenuLabel>
                {availableTags.slice(0, 8).map(tag => (
                  <DropdownMenuItem 
                    key={tag}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleFilter('tags', tag);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {tag}
                    {activeFilters.tags.includes(tag) && <Check className="h-4 w-4 text-recipe-green" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Active Filters */}
        {(activeFilters.cuisine.length > 0 || 
          activeFilters.difficulty.length > 0 || 
          activeFilters.tags.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.cuisine.map(cuisine => (
              <Badge 
                key={cuisine} 
                className="bg-recipe-green flex items-center gap-1 pl-3 pr-2 py-1.5 cursor-pointer"
                onClick={() => toggleFilter('cuisine', cuisine)}
              >
                <Globe className="h-3 w-3 mr-1" />
                {cuisine}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            
            {activeFilters.difficulty.map(difficulty => (
              <Badge 
                key={difficulty} 
                className="bg-recipe-orange flex items-center gap-1 pl-3 pr-2 py-1.5 cursor-pointer capitalize"
                onClick={() => toggleFilter('difficulty', difficulty)}
              >
                <ChefHat className="h-3 w-3 mr-1" />
                {difficulty}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            
            {activeFilters.tags.map(tag => (
              <Badge 
                key={tag} 
                className="bg-blue-500 flex items-center gap-1 pl-3 pr-2 py-1.5 cursor-pointer"
                onClick={() => toggleFilter('tags', tag)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-recipe-green mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading community recipes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredRecipes.length} of {recipes.length} recipes
            </p>
            
            <div className="flex gap-2">
              <Button variant="ghost" className="gap-1">
                <Zap className="h-4 w-4" />
                <span>Newest</span>
              </Button>
              <Button variant="ghost" className="gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>Most Liked</span>
              </Button>
            </div>
          </div>
          
          {/* Recipe Grid */}
          {filteredRecipes.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="elegant-card overflow-hidden"
                  >
                    <div className="p-1">
                      <div className="relative overflow-hidden rounded-t-lg h-48 bg-recipe-cream dark:bg-gray-700">
                        <div className="absolute inset-0 bg-gradient-to-br from-recipe-cream/80 to-recipe-orange/30 dark:from-gray-800/80 dark:to-recipe-orange/20"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          🍳
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <h3 className="text-white font-bold text-lg line-clamp-1">
                            {recipe.name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        {/* Recipe Info */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recipe.cuisine && (
                            <Badge className="bg-recipe-green">
                              <Globe className="h-3 w-3 mr-1" />
                              {recipe.cuisine}
                            </Badge>
                          )}
                          
                          {recipe.difficulty && (
                            <Badge className="bg-recipe-orange capitalize">
                              <ChefHat className="h-3 w-3 mr-1" />
                              {recipe.difficulty}
                            </Badge>
                          )}
                          
                          {recipe.totalTime && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {recipe.totalTime}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Tags */}
                        {recipe.tags && (recipe.tags as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {(recipe.tags as string[]).slice(0, 3).map((tag, i) => (
                              <span 
                                key={i} 
                                className={`recipe-tag ${getTagColorClass(tag)}`}
                              >
                                #{tag}
                              </span>
                            ))}
                            {(recipe.tags as string[]).length > 3 && (
                              <span className="recipe-tag">
                                +{(recipe.tags as string[]).length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                          A delicious {recipe.cuisine} dish perfect for {recipe.difficulty === 'easy' ? 'beginners' : 'home cooks'}.
                        </p>
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center mt-4">
                          <Button 
                            variant="outline" 
                            className="gap-1 flex-1 mr-2"
                            onClick={() => viewRecipeDetails(recipe)}
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>View</span>
                          </Button>
                          
                          <Button 
                            className="gap-1 flex-1 bg-recipe-green hover:bg-recipe-green/90"
                            onClick={() => handleLikeRecipe(recipe)}
                          >
                            <Heart className="h-4 w-4" />
                            <span>{recipe.likes || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  We couldn't find any recipes matching your search criteria. Try adjusting your filters or search term.
                </p>
                <Button 
                  className="mt-6 gap-2"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  <span>Clear All Filters</span>
                </Button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Community;

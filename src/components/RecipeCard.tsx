
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { Edit, Trash, Heart, Star, Clock, Tag, Timer, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecipeCardProps {
  recipe: Recipe | RecipeResponse;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  className?: string;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showActions = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRate,
  className = '',
  onClick,
}) => {
  // Check if recipe has id (Recipe) or not (RecipeResponse)
  const recipeId = 'id' in recipe ? recipe.id : '';
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  const isFavorite = 'isFavorite' in recipe ? recipe.isFavorite : false;
  const rating = 'rating' in recipe ? recipe.rating : 0;
  
  const [currentRating, setCurrentRating] = useState(rating);
  
  const difficulty = 'difficulty' in recipe ? recipe.difficulty : undefined;
  const estimatedTime = 'estimatedTime' in recipe ? recipe.estimatedTime : undefined;
  const tags = 'tags' in recipe ? recipe.tags : [];
  
  const getDifficultyColor = (level?: string) => {
    switch(level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const cardClasses = `recipe-card overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl ${className} ${isRTL ? 'rtl text-right' : 'ltr text-left'}`;
  
  const handleRate = (newRating: number) => {
    if (onRate && recipeId) {
      setCurrentRating(newRating);
      onRate(recipeId, newRating);
    }
  };

  if (!recipe.isRecipe && recipe.content) {
    // Render non-recipe content
    return (
      <Card className={cardClasses} onClick={onClick}>
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-50 pb-2">
          <CardTitle className="text-primary text-xl font-bold">{recipe.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className={`text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>{recipe.content}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={`${cardClasses} h-full flex flex-col`} onClick={onClick}>
        <CardHeader className={`bg-gradient-to-r ${isRTL ? 'from-recipe-lightGreen/20 to-recipe-green/10' : 'from-recipe-green/10 to-recipe-lightGreen/20'} pb-2`}>
          <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between items-center`}>
            <CardTitle className="text-recipe-green text-xl font-bold">{recipe.name}</CardTitle>
            
            {showActions && recipeId && onToggleFavorite && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(recipeId);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </motion.button>
            )}
          </div>
          
          {/* Tags and metadata */}
          {(difficulty || estimatedTime || (tags && tags.length > 0)) && (
            <div className={`flex flex-wrap gap-2 mt-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {difficulty && (
                <Badge variant="outline" className={`${getDifficultyColor(difficulty)} flex items-center gap-1`}>
                  <FileText className="h-3 w-3" />
                  {difficulty}
                </Badge>
              )}
              
              {estimatedTime && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedTime}
                </Badge>
              )}
              
              {tags && tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="bg-purple-100 text-purple-800 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              
              {tags && tags.length > 2 && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-4 flex-grow">
          <div className="space-y-6">
            <div className={`bg-gray-50 rounded-lg p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className={`text-lg font-semibold text-recipe-orange mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
                {ingredientsLabel}
              </h3>
              <ul className={`${isRTL ? 'list-disc pr-5' : 'list-disc pl-5'} space-y-2`}>
                {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-700">{ingredient}</li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-sm text-gray-500 italic">
                    {isRTL ? `...ועוד ${recipe.ingredients.length - 5} מצרכים` : `...and ${recipe.ingredients.length - 5} more ingredients`}
                  </li>
                )}
              </ul>
            </div>
            
            <div className={`bg-gray-50 rounded-lg p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className={`text-lg font-semibold text-recipe-orange mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
                {instructionsLabel}
              </h3>
              <ol className={`${isRTL ? 'list-decimal pr-5' : 'list-decimal pl-5'} space-y-2`}>
                {recipe.instructions.slice(0, 3).map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-700">{instruction}</li>
                ))}
                {recipe.instructions.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    {isRTL ? `...ועוד ${recipe.instructions.length - 3} צעדים` : `...and ${recipe.instructions.length - 3} more steps`}
                  </li>
                )}
              </ol>
            </div>
          </div>
        </CardContent>
        
        {showActions && recipeId && (
          <CardFooter className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-between pt-2 pb-4`}>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <TooltipProvider key={star}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(star);
                        }}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-5 w-5 ${currentRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate {star} star{star !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(recipeId);
                  }}
                  className="text-recipe-green border-recipe-green hover:bg-recipe-green/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {isRTL ? 'ערוך' : 'Edit'}
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(recipeId);
                  }}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  {isRTL ? 'מחק' : 'Delete'}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default RecipeCard;

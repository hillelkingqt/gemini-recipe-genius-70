
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecipeCardProps {
  recipe: Recipe | RecipeResponse;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showActions = false,
  onEdit,
  onDelete,
  className = '',
  onClick,
}) => {
  // Check if recipe has id (Recipe) or not (RecipeResponse)
  const recipeId = 'id' in recipe ? recipe.id : '';
  const isRTL = recipe.isRTL || false;
  const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
  const instructionsLabel = recipe.instructionsLabel || 'Instructions';
  
  const cardClasses = `recipe-card overflow-hidden transform transition-all duration-200 hover:scale-[1.02] ${className} ${isRTL ? 'rtl text-right' : 'ltr text-left'}`;
  
  if (!recipe.isRecipe && recipe.content) {
    // Render non-recipe content
    return (
      <Card className={cardClasses} onClick={onClick}>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
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
    >
      <Card className={cardClasses} onClick={onClick}>
        <CardHeader className="bg-gradient-to-r from-recipe-green/10 to-recipe-lightGreen/20 pb-2">
          <CardTitle className="text-recipe-green text-xl font-bold">{recipe.name}</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-semibold text-recipe-orange mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
                {ingredientsLabel}
              </h3>
              <ul className={`${isRTL ? 'list-disc pr-5' : 'list-disc pl-5'} space-y-2`}>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-700">{ingredient}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className={`text-lg font-semibold text-recipe-orange mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
                {instructionsLabel}
              </h3>
              <ol className={`${isRTL ? 'list-decimal pr-5' : 'list-decimal pl-5'} space-y-2`}>
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-700">{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
          
          {showActions && recipeId && (
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-2 mt-6`}>
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
                  Edit
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
                  Delete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecipeCard;

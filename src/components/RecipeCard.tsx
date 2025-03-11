
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { Edit, Trash } from 'lucide-react';

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
  
  return (
    <Card 
      className={`recipe-card overflow-hidden transform transition-all duration-200 hover:scale-[1.02] ${className}`}
      onClick={onClick}
    >
      <CardHeader className="bg-gradient-to-r from-recipe-green/10 to-recipe-lightGreen/20 pb-2">
        <CardTitle className="text-recipe-green text-xl font-bold">{recipe.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-recipe-orange mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
              Ingredients
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-700">{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-recipe-orange mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-recipe-orange" />
              Instructions
            </h3>
            <ol className="list-decimal pl-5 space-y-2">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-sm text-gray-700">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
        
        {showActions && recipeId && (
          <div className="flex justify-end space-x-2 mt-6">
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
  );
};

export default RecipeCard;

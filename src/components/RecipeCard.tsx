
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
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showActions = false,
  onEdit,
  onDelete,
  className = '',
}) => {
  // Check if recipe has id (Recipe) or not (RecipeResponse)
  const recipeId = 'id' in recipe ? recipe.id : '';
  
  return (
    <Card className={`recipe-card overflow-hidden ${className}`}>
      <CardHeader className="bg-recipe-lightGreen/20 pb-2">
        <CardTitle className="text-recipe-green text-xl font-bold">{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div>
          <h3 className="text-lg font-semibold text-recipe-orange mb-2">Ingredients</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-sm">{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-recipe-orange mb-2">Instructions</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-sm">{instruction}</li>
            ))}
          </ol>
        </div>
        
        {showActions && recipeId && (
          <div className="flex justify-end space-x-2 mt-4">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(recipeId)}
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
                onClick={() => onDelete(recipeId)}
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

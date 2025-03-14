import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recipe, RecipeResponse } from '@/types/Recipe';
import { Trash, Heart, Star, Clock, Tag, FileText, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';


interface RecipeCardProps {
    recipe: Recipe | RecipeResponse;
    showActions?: boolean;
    onDelete?: (id: string) => void;
    onFavoriteToggle?: (id: string) => Promise<void>;
    onRate?: (id: string, rating: number) => Promise<void>;
    onPublish?: (id: string) => Promise<void>;
    onUnpublish?: (id: string) => Promise<void>;
    onLike?: (id: string) => Promise<void>; // ← הוסף את זה
    className?: string;
    onClick?: () => void;
}


/**
 * RecipeCard:
 * - מציג כרטיס מתכון עם מצרכים, הוראות וכו'.
 * - כפתורי Publish/Unpublish דינמיים לפי status.
 * - כפתורי מחיקה ודירוג כרגיל.
 */
const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    showActions = false,
    onDelete,
    onFavoriteToggle,
    onRate,
    onPublish,
    onUnpublish,
    className = '',
    onClick
}) => {
    // זיהוי האם זה מתכון מה־DB או תשובה מה־AI
    const navigate = useNavigate();
    const recipeId = 'id' in recipe ? recipe.id : '';
    const isRTL = recipe.isRTL || false;
    const ingredientsLabel = recipe.ingredientsLabel || 'Ingredients';
    const instructionsLabel = recipe.instructionsLabel || 'Instructions';

    // בדיקת favorite ודירוג (רק אם זה Recipe מה־DB)
    const isFavorite = 'isFavorite' in recipe ? recipe.isFavorite : false;
    const rating = 'rating' in recipe ? recipe.rating : 0;
    const [currentRating, setCurrentRating] = useState(rating);

    // בדיקת האם מפורסם (נניח status === 'published')
    const isPublished = 'status' in recipe && recipe.status === 'published';

    // Metadata נוסף
    const difficulty = 'difficulty' in recipe ? recipe.difficulty : undefined;
    const estimatedTime = 'estimatedTime' in recipe ? recipe.estimatedTime : undefined;
    const tags = 'tags' in recipe ? recipe.tags : [];

    // פונקציית עזר לצבעי difficulty
    const getDifficultyColor = (level?: string) => {
        switch (level) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const cardClasses = `
    recipe-card overflow-visible transition-all duration-300 shadow-lg hover:shadow-xl
    ${className}
    ${isRTL ? 'rtl text-right' : 'ltr text-left'}
    dark:bg-gray-800 dark:border-gray-700
  `;

    // פונקציית דירוג
    const handleRate = (newRating: number) => {
        if (onRate && recipeId) {
            setCurrentRating(newRating);
            onRate(recipeId, newRating);
        }
    };

    // אם זה לא באמת מתכון אלא תוכן חופשי
    if (!recipe.isRecipe && recipe.content) {
        return (
            <Card className={cardClasses} onClick={onClick}>
                <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 pb-2">
                    <CardTitle className="text-primary dark:text-white text-xl font-bold">{recipe.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className={`text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {recipe.content}
                        </p>
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
            <Card
                className={`${cardClasses} h-full flex flex-col group relative`}
                onClick={() => navigate(`/recipes/${recipe.id}`)}

            >
                <CardHeader
                    className={`
            bg-gradient-to-r
            ${isRTL ? 'from-recipe-lightGreen/20 to-recipe-green/10' : 'from-recipe-green/10 to-recipe-lightGreen/20'}
            dark:from-green-900/20 dark:to-green-800/10
            pb-2
            flex flex-col items-center
          `}
                >
                    {/* כותרת המתכון */}
                    <CardTitle className="text-recipe-green dark:text-green-400 text-xl font-bold text-center">
                        {recipe.name}
                    </CardTitle>

                    {/* תגים / metadata */}
                    {(difficulty || estimatedTime || (Array.isArray(tags) && tags.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2 justify-center">
                            {difficulty && (
                                <Badge
                                    variant="outline"
                                    className={`${getDifficultyColor(difficulty)} flex items-center gap-1`}
                                >
                                    <FileText className="h-3 w-3" />
                                    {difficulty}
                                </Badge>
                            )}
                            {estimatedTime && (
                                <Badge
                                    variant="outline"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
                                >
                                    <Clock className="h-3 w-3" />
                                    {estimatedTime}
                                </Badge>
                            )}
                            {Array.isArray(tags) &&
                                tags.slice(0, 2).map((tag, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                        className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-1"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                    </Badge>
                                ))}
                            {Array.isArray(tags) && tags.length > 2 && (
                                <Badge
                                    variant="outline"
                                    className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    +{tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}


                    {/* כפתור פייבוריט */}
                    {showActions && recipeId && onFavoriteToggle && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFavoriteToggle(recipeId);
                            }}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors self-end mt-2"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart
                                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''
                                    }`}
                            />
                        </motion.button>
                    )}
                </CardHeader>

                {/* תצוגה מקדימה של מצרכים/הוראות */}
                <CardContent className="pt-4 flex-grow">
                    <div className="space-y-6">
                        {/* Ingredients */}
                        <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h3
                                className={`
                  text-lg font-semibold text-recipe-orange dark:text-orange-400 mb-3
                  ${isRTL ? 'text-right' : 'text-left'}
                `}
                            >
                                {ingredientsLabel}
                            </h3>
                            {Array.isArray(recipe.ingredients) && (
                                <ul
                                    className={
                                        isRTL
                                            ? 'list-disc list-inside pr-5 text-right space-y-2'
                                            : 'list-disc list-outside pl-5 text-left space-y-2'
                                    }
                                >
                                    {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
                                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                            {ingredient}
                                        </li>
                                    ))}
                                    {recipe.ingredients.length > 5 && (
                                        <li className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            {isRTL
                                                ? `ועוד ${recipe.ingredients.length - 5} מצרכים...`
                                                : `and ${recipe.ingredients.length - 5} more ingredients...`}
                                        </li>
                                    )}
                                </ul>
                            )}

                        </div>

                        {/* Instructions */}
                        <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h3
                                className={`
                  text-lg font-semibold text-recipe-orange dark:text-orange-400 mb-3
                  ${isRTL ? 'text-right' : 'text-left'}
                `}
                            >
                                {instructionsLabel}
                            </h3>
                            {Array.isArray(recipe.instructions) && (
                                <ol
                                    className={
                                        isRTL
                                            ? 'list-decimal list-inside pr-5 text-right space-y-2'
                                            : 'list-decimal list-outside pl-5 text-left space-y-2'
                                    }
                                >
                                    {recipe.instructions.slice(0, 3).map((instruction, index) => (
                                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                            {instruction}
                                        </li>
                                    ))}
                                    {recipe.instructions.length > 3 && (
                                        <li className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            {isRTL
                                                ? `ועוד ${recipe.instructions.length - 3} צעדים...`
                                                : `and ${recipe.instructions.length - 3} more steps...`}
                                        </li>
                                    )}
                                </ol>
                            )}

                        </div>
                    </div>
                </CardContent>

                {/* Footer: Publish/Unpublish / Delete / Rating */}
                {showActions && recipeId && (
                    <CardFooter className="flex items-center justify-between pt-2 pb-4 flex-row">
                        {/* Rating Stars – always on the left */}
                        <div className="flex gap-1 mr-[10px]">
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
                                                    className={`h-5 w-5 ${currentRating >= star
                                                            ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                        }`}
                                                />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                                            <p>
                                                {isRTL
                                                    ? `דרג ${star} כוכב${star !== 1 ? 'ים' : ''}`
                                                    : `Rate ${star} star${star !== 1 ? 's' : ''}`}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* Buttons – always on the right */}
                        <div className="flex gap-2">
                            {onPublish && onUnpublish && (
                                <Button
                                    variant="outline"
                                    className="text-blue-700 border-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/30"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isPublished) {
                                            onUnpublish(recipeId);
                                        } else {
                                            onPublish(recipeId);
                                        }
                                    }}
                                >
                                    <Send className="h-4 w-4 mr-1" />
                                    {isRTL
                                        ? isPublished
                                            ? 'בטל פרסום'
                                            : 'פרסם'
                                        : isPublished
                                            ? 'Unpublish'
                                            : 'Publish'}
                                </Button>
                            )}

                            {onDelete && (
                                <Button
                                    variant="outline"
                                    className="text-red-700 border-red-600 hover:bg-red-50 dark:text-red-300 dark:border-red-600 dark:hover:bg-red-900/30"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(recipeId);
                                    }}
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

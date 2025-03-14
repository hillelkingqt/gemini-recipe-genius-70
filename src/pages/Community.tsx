import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Upload, X, Heart, ThumbsUp } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from '@/hooks/use-toast';
import { Recipe } from '@/types/Recipe';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

const Community = () => {
    const { user, session } = useAuth();
    const {
        communityRecipes,
        addRecipe,
        toggleFavorite,
        toggleLike,
        isLoading,
        fetchCommunityRecipes
    } = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState(communityRecipes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRecipeName, setNewRecipeName] = useState('');
    const [newRecipeIngredients, setNewRecipeIngredients] = useState('');
    const [newRecipeInstructions, setNewRecipeInstructions] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [isCommunityRecipeDetailsOpen, setIsCommunityRecipeDetailsOpen] = useState(false);
    const [selectedCommunityRecipe, setSelectedCommunityRecipe] = useState<Recipe | null>(null);
    const [isCommunityRecipeDetailsSavingAsFavorite, setIsCommunityRecipeDetailsSavingAsFavorite] = useState(false);

    useEffect(() => {
        fetchCommunityRecipes();
    }, []);

    useEffect(() => {
        setFilteredRecipes(communityRecipes);
    }, [communityRecipes]);

    useEffect(() => {
        const filtered = communityRecipes.filter(recipe =>
            recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredRecipes(filtered);
    }, [searchQuery, communityRecipes]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setSelectedImage(reader.result);
                    setImagePreview(reader.result);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewRecipeName('');
        setNewRecipeIngredients('');
        setNewRecipeInstructions('');
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        if (!newRecipeName || !newRecipeIngredients || !newRecipeInstructions) {
            toast({
                title: "Missing fields",
                description: "Please fill in all fields.",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        try {
            if (!user) {
                console.error('User not authenticated');
                return;
            }

            const recipeData = {
                name: newRecipeName,
                ingredients: newRecipeIngredients.split('\n'),
                instructions: newRecipeInstructions.split('\n'),
                user_id: user.id,
                imageBase64: selectedImage || undefined,
                isFromCommunity: true
            };

            await addRecipe(recipeData);
            toast({
                title: "Recipe added",
                description: "Your recipe has been added to the community.",
                variant: "default"
            });
            handleCloseModal();
            await fetchCommunityRecipes();
        } catch (error) {
            console.error('Error adding recipe:', error);
            toast({
                title: "Error adding recipe",
                description: "There was an error adding your recipe. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleFavorite = async (id: string) => {
        if (!user) {
            toast({
                title: "Not authenticated",
                description: "You must be logged in to save recipes.",
                variant: "destructive"
            });
            return;
        }
        try {
            await toggleFavorite(id);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast({
                title: "Error saving recipe",
                description: "There was an error saving this recipe. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleLikeRecipe = async (id: string) => {
        if (!user) {
            toast({
                title: "Not authenticated",
                description: "You must be logged in to like recipes.",
                variant: "destructive"
            });
            return;
        }
        try {
            await toggleLike(id);
        } catch (error) {
            console.error('Error toggling like:', error);
            toast({
                title: "Error liking recipe",
                description: "There was an error liking this recipe. Please try again.",
                variant: "destructive"
            });
        }
    };

    const openCommunityRecipeDetails = (recipe: Recipe) => {
        setSelectedCommunityRecipe(recipe);
        setIsCommunityRecipeDetailsOpen(true);
    };

    const closeCommunityRecipeDetails = () => {
        setSelectedCommunityRecipe(null);
        setIsCommunityRecipeDetailsOpen(false);
    };

    const CommunityRecipeDetails = ({ recipe }: { recipe: Recipe }) => {
        const [isSavingAsFavorite, setIsSavingAsFavorite] = useState(false);

        const handleSaveAsFavorite = async () => {
            if (!user) {
                toast({
                    title: "Not authenticated",
                    description: "You must be logged in to save recipes.",
                    variant: "destructive"
                });
                return;
            }

            setIsSavingAsFavorite(true);
            try {
                await toggleFavorite(recipe.id);
                toast({
                    title: "Recipe saved",
                    description: "This recipe has been saved to your favorites.",
                    variant: "default"
                });
            } catch (error) {
                console.error('Error saving recipe:', error);
                toast({
                    title: "Error saving recipe",
                    description: "There was an error saving this recipe. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setIsSavingAsFavorite(false);
            }
        };

        return (
            <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-gray-100">
                <DialogHeader>
                    <DialogTitle>{recipe.name}</DialogTitle>
                    <DialogDescription>
                        {recipe.ingredients.length} ingredients | {recipe.instructions.length} steps
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="col-span-4">
                        <h3 className="text-lg font-semibold mb-2">Ingredients:</h3>
                        <ul className="list-disc list-inside">
                            {recipe.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-4">
                        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                        <ol className="list-decimal list-inside">
                            {recipe.instructions.map((instruction, index) => (
                                <li key={index}>{instruction}</li>
                            ))}
                        </ol>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSaveAsFavorite} disabled={isSavingAsFavorite}>
                        {isSavingAsFavorite ? "Saving..." : "Save to Favorites"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        );
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Community Recipes</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    {session && user && (
                        <Button onClick={handleOpenModal} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Recipe
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl dark:bg-gray-800 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle>Add New Recipe</DialogTitle>
                        <DialogDescription>
                            Share your culinary masterpiece with the community!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="col-span-4">
                            <Label htmlFor="name">Recipe Name</Label>
                            <Input
                                type="text"
                                id="name"
                                placeholder="Enter recipe name"
                                value={newRecipeName}
                                onChange={(e) => setNewRecipeName(e.target.value)}
                                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="col-span-4">
                            <Label htmlFor="ingredients">Ingredients</Label>
                            <Textarea
                                id="ingredients"
                                placeholder="Enter ingredients, each on a new line"
                                value={newRecipeIngredients}
                                onChange={(e) => setNewRecipeIngredients(e.target.value)}
                                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                            />
                        </div>
                        <div className="col-span-4">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea
                                id="instructions"
                                placeholder="Enter instructions, each on a new line"
                                value={newRecipeInstructions}
                                onChange={(e) => setNewRecipeInstructions(e.target.value)}
                                className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                            />
                        </div>
                        <div className="col-span-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={handleImageButtonClick}
                                className="mb-2"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Image
                            </Button>
                            {imagePreview && (
                                <div className="mb-4 relative">
                                    <img
                                        src={imagePreview}
                                        alt="Upload preview"
                                        className="h-24 object-cover rounded-md"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 rounded-full p-0 h-6 w-6"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleSubmit} disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Add Recipe"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-40 w-full rounded-md" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredRecipes.map(recipe => (
                            <motion.div
                                key={recipe.id}
                                className="h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    showActions={false}
                                    className="h-full cursor-pointer"
                                    onClick={() => {
                                        setSelectedCommunityRecipe(recipe);
                                        setIsCommunityRecipeDetailsOpen(true);
                                    }}
                                    onFavoriteToggle={handleToggleFavorite}
                                    onLike={handleLikeRecipe}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Community;

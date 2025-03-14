import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Recipe } from '@/types/Recipe';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/hooks/useAuth';
import RecipeCard from '@/components/RecipeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDetail from '@/components/RecipeDetail';
import { CookingModeProvider } from '@/contexts/CookingModeContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, Trash } from 'lucide-react';
import { UploadButton } from "@/components/UploadThing";
import { useNavigate } from 'react-router-dom';



const Recipes = () => {
    const navigate = useNavigate();
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isRecipeDetailOpen, setIsRecipeDetailOpen] = useState(false);
    const handleOpenRecipeDetail = (recipe: Recipe) => {
        navigate(`/recipes/${recipe.id}`);
};
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [communityRecipes, setCommunityRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingRecipe, setIsAddingRecipe] = useState(false);
    const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'status' | 'notes' | 'rating'>>({
        name: '',
        ingredients: [],
        instructions: [],
        user_id: '',
        isRTL: false,
        ingredientsLabel: 'Ingredients',
        instructionsLabel: 'Instructions',
        isRecipe: true,
        content: '',
        tags: [],
        difficulty: undefined,
        estimatedTime: undefined,
        calories: undefined,
        timeMarkers: undefined,
        prepTime: undefined,
        cookTime: undefined,
        totalTime: undefined,
        servings: undefined,
        nutritionInfo: undefined,
        seasonality: undefined,
        cuisine: undefined,
        likes: 0,
        author: undefined,
        publishedAt: undefined,
        imageBase64: undefined,
        isFromCommunity: false
    });
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [recipeToPublish, setRecipeToPublish] = useState<string | null>(null);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [recipeToUnpublish, setRecipeToUnpublish] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [recipeToSave, setRecipeToSave] = useState<string | null>(null);
    const [isRating, setIsRating] = useState(false);
    const [recipeToRate, setRecipeToRate] = useState<{ id: string, rating: number } | null>(null);
    const [isFavoriteToggle, setIsFavoriteToggle] = useState(false);
    const [recipeToFavoriteToggle, setRecipeToFavoriteToggle] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
    const [isNotesUpdating, setIsNotesUpdating] = useState(false);
    const [recipeToUpdateNotes, setRecipeToUpdateNotes] = useState<{ id: string, notes: string } | null>(null);
    const [isCommunityRecipesLoading, setIsCommunityRecipesLoading] = useState(true);
    const [isUserRecipesLoading, setIsUserRecipesLoading] = useState(true);
    const [isCommunityRecipeDetailsOpen, setIsCommunityRecipeDetailsOpen] = useState(false);
    const [selectedCommunityRecipe, setSelectedCommunityRecipe] = useState<Recipe | null>(null);

    const {
        user,
        recipes: userRecipes,
        communityRecipes: fetchedCommunityRecipes,
        addRecipe: addRecipeAction,
        deleteRecipe,
        updateRecipe,
        publishRecipe,
        unpublishRecipe,
        toggleLike,
        toggleFavorite,
        rateRecipe,
        updateNotes,
        fetchUserRecipes,
        fetchCommunityRecipes
    } = useRecipes();
    const { profile } = useAuth();
    const isMobile = useIsMobile();



    useEffect(() => {
        const localData = localStorage.getItem("recipes-cache");
        const communityData = localStorage.getItem("community-recipes-cache");

        if (localData && communityData) {
            setRecipes(JSON.parse(localData));
            setCommunityRecipes(JSON.parse(communityData));
            setIsLoading(false);
            setIsCommunityRecipesLoading(false);
            setIsUserRecipesLoading(false);
        } else if (user) {
            setIsLoading(true);
            setIsCommunityRecipesLoading(true);
            setIsUserRecipesLoading(true);

            Promise.all([
                fetchUserRecipes(),
                fetchCommunityRecipes()
            ])
                .then(() => {
                    const updatedUser = localStorage.getItem("recipes-cache");
                    const updatedCommunity = localStorage.getItem("community-recipes-cache");

                    if (updatedUser) {
                        setRecipes(JSON.parse(updatedUser));
                    }

                    if (updatedCommunity) {
                        setCommunityRecipes(JSON.parse(updatedCommunity));
                    }

                    setIsLoading(false);
                    setIsCommunityRecipesLoading(false);
                    setIsUserRecipesLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching recipes:", error);
                    toast({
                        variant: "destructive",
                        title: "Loading Failed",
                        description: "Failed to load recipes. Please try again."
                    });
                    setIsLoading(false);
                    setIsCommunityRecipesLoading(false);
                    setIsUserRecipesLoading(false);
                });

        }
    }, []); // ❗️ שים לב שזה רץ רק פעם אחת



    useEffect(() => {
        if (userRecipes) {
            setRecipes(userRecipes);
        }
    }, [userRecipes]);

    useEffect(() => {
        if (fetchedCommunityRecipes) {
            setCommunityRecipes(fetchedCommunityRecipes);
        }
    }, [fetchedCommunityRecipes]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCommunityRecipes = communityRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddRecipe = async () => {
        setIsAddingRecipe(true);
        try {
            if (!profile) {
                toast({
                    variant: "destructive",
                    title: "Profile Required",
                    description: "Please update your profile before adding a recipe."
                });
                return;
            }

            if (!newRecipe.name || newRecipe.ingredients.length === 0 || newRecipe.instructions.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Missing Fields",
                    description: "Please fill in all required fields."
                });
                return;
            }

            if (!user) {
                toast({
                    variant: "destructive",
                    title: "Authentication Required",
                    description: "You must be logged in to add a recipe."
                });
                return;
            }

            const recipeToAdd = {
                ...newRecipe,
                user_id: user.id,
                isFromCommunity: false
            };

            await addRecipeAction(recipeToAdd);

            setNewRecipe({
                name: '',
                ingredients: [],
                instructions: [],
                user_id: '',
                isRTL: false,
                ingredientsLabel: 'Ingredients',
                instructionsLabel: 'Instructions',
                isRecipe: true,
                content: '',
                tags: [],
                difficulty: undefined,
                estimatedTime: undefined,
                calories: undefined,
                timeMarkers: undefined,
                prepTime: undefined,
                cookTime: undefined,
                totalTime: undefined,
                servings: undefined,
                nutritionInfo: undefined,
                seasonality: undefined,
                cuisine: undefined,
                likes: 0,
                author: undefined,
                publishedAt: undefined,
                imageBase64: undefined,
                isFromCommunity: false
            });

            setSelectedImage(null);
            setImagePreview(null);

            toast({
                title: "Recipe Added",
                description: "Your recipe has been added successfully."
            });
        } catch (error) {
            console.error("Error adding recipe:", error);
            toast({
                variant: "destructive",
                title: "Add Failed",
                description: "There was an error adding your recipe."
            });
        } finally {
            setIsAddingRecipe(false);
            closeModal();
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        setRecipeToDelete(id);
        setIsDeleting(true);
        try {
            await deleteRecipe(id);
            const updatedRecipes = recipes.filter(r => r.id !== id);
            setRecipes(updatedRecipes);
            localStorage.setItem("recipes-cache", JSON.stringify(updatedRecipes));

            toast({ title: "Recipe Deleted", description: "The recipe has been deleted successfully." });
        } catch (error) {
            console.error("Error deleting recipe:", error);
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "There was an error deleting the recipe."
            });
        } finally {
            setIsDeleting(false);
            setRecipeToDelete(null);
        }
    };

    const handlePublishRecipe = async (id: string) => {
        setRecipeToPublish(id);
        setIsPublishing(true);
        try {
            await publishRecipe(id, profile?.username || "Anonymous");
            toast({
                title: "Recipe Published",
                description: "The recipe has been published successfully."
            });
        } catch (error) {
            console.error("Error publishing recipe:", error);
            toast({
                variant: "destructive",
                title: "Publish Failed",
                description: "There was an error publishing the recipe."
            });
        } finally {
            setIsPublishing(false);
            setRecipeToPublish(null);
        }
    };

    const handleUnpublishRecipe = async (id: string) => {
        setRecipeToUnpublish(id);
        setIsUnpublishing(true);
        try {
            await unpublishRecipe(id);
            toast({
                title: "Recipe Unpublished",
                description: "The recipe has been unpublished successfully."
            });
        } catch (error) {
            console.error("Error unpublishing recipe:", error);
            toast({
                variant: "destructive",
                title: "Unpublish Failed",
                description: "There was an error unpublishing the recipe."
            });
        } finally {
            setIsUnpublishing(false);
            setRecipeToUnpublish(null);
        }
    };

    const handleToggleLike = async (id: string) => {
        setRecipeToSave(id);
        setIsSaving(true);
        try {
            await toggleLike(id);
        } catch (error) {
            console.error("Error saving recipe:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "There was an error saving the recipe."
            });
        } finally {
            setIsSaving(false);
            setRecipeToSave(null);
        }
    };

    const handleToggleFavorite = async (id: string) => {
        setRecipeToFavoriteToggle(id);
        setIsFavoriteToggle(true);
        try {
            await toggleFavorite(id);
        } catch (error) {
            console.error("Error toggling favorite:", error);
            toast({
                variant: "destructive",
                title: "Favorite Failed",
                description: "There was an error toggling favorite status."
            });
        } finally {
            setIsFavoriteToggle(false);
            setRecipeToFavoriteToggle(null);
        }
    };

    const handleRateRecipe = async (id: string, rating: number) => {
        setRecipeToRate({ id, rating });
        setIsRating(true);
        try {
            await rateRecipe(id, rating);
            toast({
                title: "Recipe Rated",
                description: "Your rating has been saved."
            });
        } catch (error) {
            console.error("Error rating recipe:", error);
            toast({
                variant: "destructive",
                title: "Rating Failed",
                description: "There was an error rating the recipe."
            });
        } finally {
            setIsRating(false);
            setRecipeToRate(null);
        }
    };

    const handleUpdateNotes = async (id: string, notes: string) => {
        setRecipeToUpdateNotes({ id, notes });
        setIsNotesUpdating(true);
        try {
            await updateNotes(id, notes);
            toast({
                title: "Notes Updated",
                description: "Your notes have been updated."
            });
        } catch (error) {
            console.error("Error updating notes:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "There was an error updating the notes."
            });
        } finally {
            setIsNotesUpdating(false);
            setRecipeToUpdateNotes(null);
        }
    };

    const handleEditRecipe = (recipe: Recipe) => {
        setRecipeToEdit(recipe);
        setIsEditing(true);
    };

    const handleUpdateRecipe = async (id: string, updates: Partial<Recipe>) => {
        setIsSaving(true);
        try {
            await updateRecipe(id, updates);
            toast({
                title: "Recipe Updated",
                description: "The recipe has been updated successfully."
            });
        } catch (error) {
            console.error("Error updating recipe:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "There was an error updating the recipe."
            });
        } finally {
            setIsSaving(false);
            setIsEditing(false);
            setRecipeToEdit(null);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        setNewRecipe(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newIngredients = [...newRecipe.ingredients];
        newIngredients[index] = e.target.value;
        setNewRecipe(prev => ({
            ...prev,
            ingredients: newIngredients
        }));
    };

    const handleAddIngredient = () => {
        setNewRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, '']
        }));
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngredients = [...newRecipe.ingredients];
        newIngredients.splice(index, 1);
        setNewRecipe(prev => ({
            ...prev,
            ingredients: newIngredients
        }));
    };

    const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
        const newInstructions = [...newRecipe.instructions];
        newInstructions[index] = e.target.value;
        setNewRecipe(prev => ({
            ...prev,
            instructions: newInstructions
        }));
    };

    const handleAddInstruction = () => {
        setNewRecipe(prev => ({
            ...prev,
            instructions: [...prev.instructions, '']
        }));
    };

    const handleRemoveInstruction = (index: number) => {
        const newInstructions = [...newRecipe.instructions];
        newInstructions.splice(index, 1);
        setNewRecipe(prev => ({
            ...prev,
            instructions: newInstructions
        }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setSelectedImage(reader.result);
                    setImagePreview(reader.result);
                    setNewRecipe(prev => ({
                        ...prev,
                        imageBase64: reader.result as string
                    }));
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleImageButtonClick = () => {
        document.getElementById('image-upload')?.click();
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setNewRecipe(prev => ({
            ...prev,
            imageBase64: undefined
        }));
    };

    const RecipeFormSchema = z.object({
        name: z.string().min(2, {
            message: "Recipe name must be at least 2 characters.",
        }),
        ingredientsLabel: z.string().min(2, {
            message: "Ingredients label must be at least 2 characters.",
        }),
        instructionsLabel: z.string().min(2, {
            message: "Instructions label must be at least 2 characters.",
        }),
    })

    const form = useForm<z.infer<typeof RecipeFormSchema>>({
        resolver: zodResolver(RecipeFormSchema),
        defaultValues: {
            name: newRecipe.name,
            ingredientsLabel: newRecipe.ingredientsLabel,
            instructionsLabel: newRecipe.instructionsLabel,
        },
        mode: "onChange",
    })

    const [isCommunityRecipeDetailsSavingAsFavorite, setIsCommunityRecipeDetailsSavingAsFavorite] = useState(false);

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Recipes</h1>
                <Input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="max-w-md"
                />
            </div>

            <div className="mb-6">
                <Button onClick={openModal}>Add Recipe</Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-[150px] w-full rounded-md" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {filteredRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredRecipes.map(recipe => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        showActions={true}
                                        onDelete={handleDeleteRecipe}
                                        onRate={handleRateRecipe}
                                        onPublish={handlePublishRecipe}
                                        onUnpublish={handleUnpublishRecipe}
                                        onFavoriteToggle={handleToggleFavorite}
                                        // 👇 זה חשוב
                                        onClick={() => handleOpenRecipeDetail(recipe)}
                                    />
                                ))}
                        </div>
                    ) : (
                        <p>No recipes found.</p>
                    )}
                </>
            )}

            

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Recipe</DialogTitle>
                        <DialogDescription>
                            Create a new recipe to share with the community.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => {
                                console.log(data)
                                handleAddRecipe()
                            })} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Recipe name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Recipe name" {...field} onChange={(e) => {
                                                    field.onChange(e)
                                                    handleInputChange(e, 'name')
                                                }} />
                                            </FormControl>
                                            <FormDescription>
                                                This is the name of your recipe.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <FormLabel>Ingredients</FormLabel>
                                    {newRecipe.ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-2">
                                            <Input
                                                type="text"
                                                placeholder={`Ingredient ${index + 1}`}
                                                value={ingredient}
                                                onChange={(e) => handleIngredientChange(e, index)}
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveIngredient(index)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" size="sm" onClick={handleAddIngredient}>
                                        Add Ingredient
                                    </Button>
                                </div>
                                <div>
                                    <FormLabel>Instructions</FormLabel>
                                    {newRecipe.instructions.map((instruction, index) => (
                                        <div key={index} className="mb-2">
                                            <Textarea
                                                placeholder={`Instruction ${index + 1}`}
                                                value={instruction}
                                                onChange={(e) => handleInstructionChange(e, index)}
                                                className="w-full"
                                            />
                                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveInstruction(index)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" size="sm" onClick={handleAddInstruction}>
                                        Add Instruction
                                    </Button>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="ingredientsLabel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ingredients Label</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingredients" {...field} onChange={(e) => {
                                                    field.onChange(e)
                                                    handleInputChange(e, 'ingredientsLabel')
                                                }} />
                                            </FormControl>
                                            <FormDescription>
                                                This is the label for your ingredients section.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="instructionsLabel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Instructions Label</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Instructions" {...field} onChange={(e) => {
                                                    field.onChange(e)
                                                    handleInputChange(e, 'instructionsLabel')
                                                }} />
                                            </FormControl>
                                            <FormDescription>
                                                This is the label for your instructions section.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div>
                                    <Label htmlFor="image" className="text-right">
                                        Image
                                    </Label>
                                    <Input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <div className="flex items-center space-x-4">
                                        <Button type="button" variant="secondary" size="sm" onClick={handleImageButtonClick}>
                                            {selectedImage ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                        {selectedImage && (
                                            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage}>
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img src={imagePreview} alt="Recipe Preview" className="max-h-32 rounded-md" />
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isAddingRecipe}>
                                        {isAddingRecipe ? 'Adding...' : 'Add Recipe'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Recipes;


import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Check, X, Edit, Image, Sparkles, RefreshCcw } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { RecipeResponse } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import RecipeCard from './RecipeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickReply {
    text: string;
    action: string;
    emoji?: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    isRTL?: boolean;
    imageUrl?: string;
    quickReplies?: QuickReply[];
}

interface ChatInterfaceProps {
    onRecipeGenerated: (recipe: RecipeResponse) => void;
    onRecipeRejected: (recipe: RecipeResponse) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    onRecipeGenerated,
    onRecipeRejected
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<RecipeResponse | null>(null);
    const [editRequest, setEditRequest] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingInProgress, setIsEditingInProgress] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const editFormRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { toast } = useToast();
    const { profile } = useAuth();
    const isMobile = useIsMobile();
    const [aiTyping, setAiTyping] = useState(false);
    const [lastGeneratedRecipe, setLastGeneratedRecipe] = useState<RecipeResponse | null>(null);

    // Listen for paste event to handle image pastes
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (e.clipboardData?.files?.length) {
                const file = e.clipboardData.files[0];
                if (file.type.startsWith('image/')) {
                    e.preventDefault();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            setSelectedImage(reader.result);
                            setImagePreview(reader.result);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        };

        window.addEventListener('paste', handlePaste as unknown as EventListener);
        return () => {
            window.removeEventListener('paste', handlePaste as unknown as EventListener);
        };
    }, []);

    // Load saved messages and recipe from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('chat_messages');
        const savedRecipe = localStorage.getItem('current_recipe');

        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            setMessages([
                {
                    id: '1',
                    text: "Hello! I'm your Recipe Assistant. Tell me what kind of recipe you're looking for, and I'll create it for you. You can also upload an image of food or ingredients and I'll create a recipe based on it!",
                    sender: 'ai'
                }
            ]);
        }

        if (savedRecipe) {
            setGeneratedRecipe(JSON.parse(savedRecipe));
        }
    }, []);

    // Save messages and recipes to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chat_messages', JSON.stringify(messages));
        }
        if (generatedRecipe) {
            localStorage.setItem('current_recipe', JSON.stringify(generatedRecipe));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, generatedRecipe]);

    // Auto-resize textarea as content grows
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

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

    const clearPersistedChat = () => {
        localStorage.removeItem('chat_messages');
        localStorage.removeItem('current_recipe');
    };

    const handleSendMessage = async () => {
        if (!input.trim() && !selectedImage) {
            toast({
                title: "Message required",
                description: "Please enter a message or prompt to send.",
                variant: "destructive"
            });
            return;
        }

        // Create user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            isRTL: detectLanguage(input) === 'he',
            imageUrl: imagePreview || undefined
        };
        setMessages(prev => [...prev, userMessage]);

        // Clear input and image
        setInput('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Show typing indicator
        setAiTyping(true);

        // Send request to API
        setIsLoading(true);
        try {
            const userPreferences = profile ? {
                dietaryRestrictions: profile.dietaryRestrictions,
                allergies: profile.allergies,
                favoriteIngredients: profile.favoriteIngredients,
                dislikedIngredients: profile.dislikedIngredients,
                preferredCuisines: profile.preferredCuisines,
                cookingSkillLevel: profile.cookingSkillLevel,
                healthGoals: profile.healthGoals,
                notes: profile.profileNotes,
                mentionInTitle: profile.mentionInTitle || false
            } : undefined;

            const recipe = await geminiService.generateRecipe({
                prompt: userMessage.text,
                language: detectLanguage(userMessage.text),
                imageBase64: selectedImage || undefined,
                userPreferences,
                respectPreferences: profile?.mentionInTitle || false
            });

            // Save the last generated recipe for context in quick replies
            setLastGeneratedRecipe(recipe);

            // Small delay to show typing animation
            await new Promise(resolve => setTimeout(resolve, 800));
            setAiTyping(false);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: recipe.isRecipe
                    ? `I've created a recipe for "${recipe.name}" based on your request.`
                    : recipe.content || "I can only help with recipes and food-related questions.",
                sender: 'ai',
                isRTL: recipe.isRTL,
                quickReplies: recipe.quickReplies && recipe.quickReplies.length > 3 
                    ? recipe.quickReplies.slice(0, 3) 
                    : recipe.quickReplies
            };
            setMessages(prev => [...prev, aiMessage]);

            if (recipe.isRecipe) {
                setGeneratedRecipe(recipe);
            }

        } catch (error) {
            console.error('Error generating recipe:', error);
            setAiTyping(false);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I couldn't generate a recipe. Please try again with a different request.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);

            toast({
                variant: "destructive",
                title: "Recipe Generation Failed",
                description: "There was an error generating your recipe. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickReply = async (reply: QuickReply) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: reply.text,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setAiTyping(true);

        try {
            const userPreferences = profile ? {
                dietaryRestrictions: profile.dietaryRestrictions,
                allergies: profile.allergies,
                favoriteIngredients: profile.favoriteIngredients,
                dislikedIngredients: profile.dislikedIngredients,
                preferredCuisines: profile.preferredCuisines,
                cookingSkillLevel: profile.cookingSkillLevel,
                healthGoals: profile.healthGoals,
                notes: profile.profileNotes,
                mentionInTitle: profile.mentionInTitle || false
            } : undefined;

            // Use the last generated recipe as context for this edit request
            const recipe = await geminiService.editRecipe(
                lastGeneratedRecipe || generatedRecipe,
                reply.text,
                detectLanguage(reply.text)
            );

            // Save the last generated recipe for context
            setLastGeneratedRecipe(recipe);

            // Small delay to show typing animation
            await new Promise(resolve => setTimeout(resolve, 800));
            setAiTyping(false);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: recipe.isRecipe
                    ? `I've updated the recipe for "${recipe.name}" based on your request.`
                    : recipe.content || "I can only help with recipes and food-related questions.",
                sender: 'ai',
                isRTL: recipe.isRTL,
                quickReplies: recipe.quickReplies && recipe.quickReplies.length > 3 
                    ? recipe.quickReplies.slice(0, 3) 
                    : recipe.quickReplies
            };
            setMessages(prev => [...prev, aiMessage]);

            if (recipe.isRecipe) {
                setGeneratedRecipe(recipe);
            }
        } catch (error) {
            console.error('Error generating recipe:', error);
            setAiTyping(false);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I couldn't update the recipe. Please try again with a different request.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);

            toast({
                variant: "destructive",
                title: "Recipe Update Failed",
                description: "There was an error updating your recipe. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditRecipe = async () => {
        if (!editRequest.trim() || !generatedRecipe) return;

        setIsEditingInProgress(true);
        setAiTyping(true);

        try {
            const userMessage: Message = {
                id: Date.now().toString(),
                text: `Can you modify the recipe? ${editRequest}`,
                sender: 'user',
                isRTL: detectLanguage(editRequest) === 'he'
            };
            setMessages(prev => [...prev, userMessage]);

            const updatedRecipe = await geminiService.editRecipe(
                generatedRecipe,
                editRequest,
                detectLanguage(editRequest)
            );

            // Save the new recipe for context
            setLastGeneratedRecipe(updatedRecipe);

            // Small delay to show typing animation
            await new Promise(resolve => setTimeout(resolve, 800));
            setAiTyping(false);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `I've updated the recipe for "${updatedRecipe.name}" based on your request.`,
                sender: 'ai',
                isRTL: updatedRecipe.isRTL,
                quickReplies: updatedRecipe.quickReplies && updatedRecipe.quickReplies.length > 3 
                    ? updatedRecipe.quickReplies.slice(0, 3) 
                    : updatedRecipe.quickReplies
            };
            setMessages(prev => [...prev, aiMessage]);

            setGeneratedRecipe(updatedRecipe);
            setEditRequest('');

        } catch (error) {
            console.error('Error editing recipe:', error);
            setAiTyping(false);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I couldn't edit the recipe. Please try a different edit request.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);

            toast({
                variant: "destructive",
                title: "Recipe Edit Failed",
                description: "There was an error updating your recipe. Please try again."
            });
        } finally {
            setIsEditingInProgress(false);
            setIsEditing(false);
        }
    };

    const handleAcceptRecipe = () => {
        if (generatedRecipe) {
            onRecipeGenerated(generatedRecipe);
            setGeneratedRecipe(null);
            clearPersistedChat();
            setMessages([]); // ← זה מנקה את ההודעות גם מה-State

            const confirmationMessage: Message = {
                id: Date.now().toString(),
                text: "Great! I've saved this recipe to your collection. What would you like to cook next?",
                sender: 'ai'
            };
        }
    };


    const handleRejectRecipe = () => {
        if (generatedRecipe) {
            onRecipeRejected(generatedRecipe);
            setGeneratedRecipe(null);
            clearPersistedChat();

            const message: Message = {
                id: Date.now().toString(),
                text: "No problem. Let's try something else! What kind of recipe would you like instead?",
                sender: 'ai'
            };
            setMessages(prev => [...prev, message]);
        }
    };

    const detectLanguage = (text: string): string => {
        const hebrewPattern = /[\u0590-\u05FF]/;
        return hebrewPattern.test(text) ? 'he' : 'en';
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && (input.trim() || selectedImage)) {
                handleSendMessage();
            }
        }
    };

    const renderMessage = (message: Message) => (
        <motion.div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`message-bubble ${message.sender === 'user'
                    ? 'user-message bg-recipe-green/90 text-white dark:bg-recipe-green-dark dark:text-white'
                    : 'ai-message bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                } ${message.isRTL ? 'rtl text-right' : 'ltr text-left'}`}
                style={{
                    maxWidth: '80%',
                    borderRadius: '18px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
            >
                {message.imageUrl && (
                    <div className="mb-3">
                        <img
                            src={message.imageUrl}
                            alt="Uploaded"
                            className="rounded-lg max-h-64 w-auto object-contain mb-2"
                        />
                    </div>
                )}

                {message.text}

                {message.sender === 'ai' && message.quickReplies && message.quickReplies.length > 0 && (
                    <motion.div
                        className="flex flex-wrap gap-2 mt-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {message.quickReplies.slice(0, 3).map((reply, index) => (
                            <Button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                variant="outline"
                                className="text-sm bg-white/50 dark:bg-gray-600 hover:bg-white/80 dark:hover:bg-gray-500 transition-colors"
                            >
                                {reply.emoji && <span className="mr-1">{reply.emoji}</span>}
                                {reply.text}
                            </Button>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Hidden file input for image uploads */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 space-y-6">
                <AnimatePresence>
                    <motion.div
                        className="flex flex-col space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {messages.map((message) => (
                            renderMessage(message)
                        ))}
                        
                        {aiTyping && (
                            <motion.div
                                className="flex justify-start"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="ai-message bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100" style={{
                                    borderRadius: '18px',
                                    padding: '12px 16px',
                                    marginBottom: '16px',
                                }}>
                                    <div className="flex items-center gap-2">
                                        <span>{isEditing ? "Updating your recipe" : "Crafting your recipe"}</span>
                                        <div className="flex space-x-1">
                                            <motion.span
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                                                className="w-1 h-1 bg-gray-500 dark:bg-gray-300 rounded-full inline-block"
                                            />
                                            <motion.span
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
                                                className="w-1 h-1 bg-gray-500 dark:bg-gray-300 rounded-full inline-block"
                                            />
                                            <motion.span
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: "loop" }}
                                                className="w-1 h-1 bg-gray-500 dark:bg-gray-300 rounded-full inline-block"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </motion.div>
                </AnimatePresence>

                {generatedRecipe && (
                    <motion.div
                        className="recipe-section mt-6 p-6 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
                    >
                        <RecipeCard
                            recipe={{
                                id: 'temp-id',
                                name: generatedRecipe.name,
                                ingredients: generatedRecipe.ingredients,
                                instructions: generatedRecipe.instructions,
                                createdAt: new Date(),
                                isRTL: generatedRecipe.isRTL,
                                ingredientsLabel: generatedRecipe.ingredientsLabel,
                                instructionsLabel: generatedRecipe.instructionsLabel,
                                isRecipe: generatedRecipe.isRecipe,
                                content: generatedRecipe.content,
                                isFavorite: false,
                                user_id: '', // Will be set when saved
                                tags: generatedRecipe.tags,
                                difficulty: generatedRecipe.difficulty,
                                estimatedTime: generatedRecipe.estimatedTime,
                                calories: generatedRecipe.calories,
                                notes: '',
                                rating: 0,
                                status: 'draft',
                                timeMarkers: generatedRecipe.timeMarkers,
                                prepTime: generatedRecipe.prepTime,
                                cookTime: generatedRecipe.cookTime,
                                totalTime: generatedRecipe.totalTime,
                                servings: generatedRecipe.servings,
                                nutritionInfo: generatedRecipe.nutritionInfo,
                                seasonality: generatedRecipe.seasonality,
                                cuisine: generatedRecipe.cuisine,
                                imageBase64: generatedRecipe.imageBase64,
                                isFromCommunity: false
                            }}
                            showActions={false}
                        />

                        <div className="mt-6 flex flex-col space-y-4">
                            <div className="flex flex-wrap justify-between gap-3">
                                <Button
                                    onClick={handleAcceptRecipe}
                                    className="flex-1 bg-recipe-green hover:bg-recipe-green/90 min-w-[120px] text-white font-semibold"
                                    style={{
                                        boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    {generatedRecipe.isRTL ? 'אישור המתכון' : 'Accept Recipe'}
                                </Button>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="outline"
                                    className="flex-1 border-recipe-green text-recipe-green min-w-[120px] hover:bg-recipe-green/10"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {generatedRecipe.isRTL ? 'עריכת המתכון' : 'Edit Recipe'}
                                </Button>
                                <Button
                                    onClick={handleRejectRecipe}
                                    variant="outline"
                                    className="flex-1 border-destructive text-destructive min-w-[120px] hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    {generatedRecipe.isRTL ? 'דחייה' : 'Reject Recipe'}
                                </Button>
                            </div>

                            {isEditing && (
                                <motion.div
                                    className="flex flex-col space-y-3 mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    ref={editFormRef}
                                >
                                    <h3 className={`font-medium text-gray-700 dark:text-gray-300 ${generatedRecipe.isRTL ? 'text-right' : 'text-left'}`}>
                                        {generatedRecipe.isRTL ? 'מה תרצה לשנות במתכון?' : 'What would you like to change?'}
                                    </h3>
                                    <Textarea
                                        value={editRequest}
                                        onChange={(e) => setEditRequest(e.target.value)}
                                        placeholder={generatedRecipe.isRTL ?
                                            "לדוגמה: הוסף יותר תבלינים, הפוך לצמחוני, השתמש בפחות שמן..." :
                                            "Ex: Add more spices, make it vegetarian, use less oil..."}
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white resize-none"
                                        dir={detectLanguage(editRequest) === 'he' ? 'rtl' : 'ltr'}
                                        disabled={isEditingInProgress}
                                        rows={3}
                                    />
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={handleEditRecipe}
                                            disabled={!editRequest.trim() || isEditingInProgress}
                                            className="bg-recipe-orange hover:bg-recipe-orange/90 flex-1 text-white"
                                            style={{
                                                boxShadow: '0 4px 10px rgba(245, 124, 0, 0.3)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {isEditingInProgress ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {generatedRecipe.isRTL ? 'מעדכן...' : 'Updating...'}
                                                </>
                                            ) : (
                                                generatedRecipe.isRTL ? 'שלח בקשת עריכה' : 'Send Edit Request'
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditRequest('');
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                            disabled={isEditingInProgress}
                                        >
                                            {generatedRecipe.isRTL ? 'ביטול' : 'Cancel'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 md:p-6 bg-white dark:bg-gray-800/95 border-t dark:border-gray-700 backdrop-blur-md">
                <motion.div 
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {imagePreview && (
                        <motion.div
                            className="mb-4 relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    className="h-24 object-cover rounded-lg border-2 border-recipe-green"
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
                        </motion.div>
                    )}

                    <div className="relative flex items-center">
                        <Button
                            onClick={handleImageButtonClick}
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 z-10"
                            disabled={isLoading}
                            title="Upload Image"
                        >
                            <Image className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        </Button>
                        
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe a recipe you'd like me to create..."
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 pr-16 pl-12 py-3 rounded-xl resize-none min-h-[50px] max-h-[150px] text-black dark:text-white focus-visible:ring-recipe-green w-full"
                            dir={detectLanguage(input) === 'he' ? 'rtl' : 'ltr'}
                            rows={1}
                        />
                        
                        <Button
                            onClick={handleSendMessage}
                            disabled={isLoading || (!input.trim() && !selectedImage)}
                            size="icon"
                            className="absolute right-2 rounded-full hover:bg-recipe-green/90 bg-recipe-green text-white h-10 w-10 flex-shrink-0 z-10"
                            style={{
                                boxShadow: '0 2px 5px rgba(46, 125, 50, 0.2)',
                            }}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                        Press Enter to send, Shift+Enter for new line
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChatInterface;

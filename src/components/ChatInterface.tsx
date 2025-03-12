
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Check, X, Edit, AlertCircle, Save } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { RecipeResponse } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import RecipeCard from './RecipeCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isRTL?: boolean;
}

interface ChatInterfaceProps {
  onRecipeGenerated: (recipe: RecipeResponse) => void;
  onRecipeRejected: (recipe: RecipeResponse) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onRecipeGenerated, onRecipeRejected }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeResponse | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInProgress, setIsEditingInProgress] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-scroll to edit form when it appears
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isEditing]);
  
  // Load saved messages from localStorage if they exist
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedRecipe = localStorage.getItem('currentRecipe');
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading saved messages:', e);
      }
    } else {
      // Initial greeting message if no saved messages
      setMessages([
        {
          id: '1',
          text: "Hello! I'm your Recipe Assistant. Tell me what kind of recipe you're looking for, and I'll create it for you. For example, try: 'I want a simple pasta recipe with mushrooms and garlic'.",
          sender: 'ai'
        }
      ]);
    }
    
    if (savedRecipe) {
      try {
        setGeneratedRecipe(JSON.parse(savedRecipe));
      } catch (e) {
        console.error('Error loading saved recipe:', e);
      }
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Save current recipe to localStorage whenever it changes
  useEffect(() => {
    if (generatedRecipe) {
      localStorage.setItem('currentRecipe', JSON.stringify(generatedRecipe));
    } else {
      localStorage.removeItem('currentRecipe');
    }
  }, [generatedRecipe]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      isRTL: detectLanguage(input) === 'he'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Generate recipe response
      const recipe = await geminiService.generateRecipe({
        prompt: input,
        language: detectLanguage(input)
      });
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: recipe.isRecipe 
          ? `I've created a recipe for "${recipe.name}" based on your request.`
          : recipe.content || "I can only help with recipes and food-related questions.",
        sender: 'ai',
        isRTL: recipe.isRTL
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Set the generated recipe if it's a recipe
      if (recipe.isRecipe) {
        setGeneratedRecipe(recipe);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      // Add error message
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
  
  const handleEditRecipe = async () => {
    if (!editRequest.trim() || !generatedRecipe) return;
    
    setIsEditingInProgress(true);
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `Can you modify the recipe? ${editRequest}`,
        sender: 'user',
        isRTL: detectLanguage(editRequest) === 'he'
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Call API to edit recipe
      const updatedRecipe = await geminiService.editRecipe(
        generatedRecipe, 
        editRequest,
        detectLanguage(editRequest)
      );
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've updated the recipe for "${updatedRecipe.name}" based on your request.`,
        sender: 'ai',
        isRTL: updatedRecipe.isRTL
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update the generated recipe
      setGeneratedRecipe(updatedRecipe);
      setEditRequest('');
      
    } catch (error) {
      console.error('Error editing recipe:', error);
      
      // Add error message
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
      localStorage.removeItem('currentRecipe');
      
      // Add confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "Great! I've saved this recipe to your collection. What would you like to cook next?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, confirmationMessage]);
    }
  };
  
  const handleSaveAsDraft = () => {
    if (generatedRecipe) {
      // We'll use the same handler but update the UI message
      onRecipeGenerated(generatedRecipe);
      setGeneratedRecipe(null);
      localStorage.removeItem('currentRecipe');
      
      // Add draft confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "I've saved this recipe as a draft. You can find it in your recipes collection.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, confirmationMessage]);
    }
  };
  
  const handleRejectRecipe = () => {
    if (generatedRecipe) {
      // Save the rejected recipe
      onRecipeRejected(generatedRecipe);
      setGeneratedRecipe(null);
      localStorage.removeItem('currentRecipe');
      
      // Add message
      const message: Message = {
        id: Date.now().toString(),
        text: "No problem. I've saved the recipe to your rejected recipes collection. Let's try something else! What kind of recipe would you like instead?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, message]);
    }
  };
  
  // Helper function to detect language (very simple implementation)
  const detectLanguage = (text: string): string => {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text) ? 'he' : 'en';
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          <motion.div 
            className="flex flex-col space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {messages.map((message) => (
              <motion.div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`message-bubble ${message.sender === 'user' ? 'bg-recipe-green/10 text-black' : 'bg-white text-black'} ${message.isRTL ? 'rtl text-right' : 'ltr text-left'}`}
                  style={{ 
                    maxWidth: '80%', 
                    borderRadius: '18px', 
                    padding: '12px 16px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        </AnimatePresence>
        
        {generatedRecipe && (
          <motion.div 
            className="recipe-section mt-6 p-6 bg-recipe-cream rounded-xl shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <RecipeCard 
              recipe={generatedRecipe}
              showActions={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
            
            <div className="mt-6 flex flex-col space-y-4">
              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  onClick={handleAcceptRecipe}
                  className="flex-1 bg-recipe-green hover:bg-recipe-green/90 min-w-[120px]"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {generatedRecipe.isRTL ? 'אישור המתכון' : 'Accept Recipe'}
                </Button>
                <Button
                  onClick={handleSaveAsDraft}
                  variant="outline"
                  className="flex-1 border-recipe-orange text-recipe-orange min-w-[120px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {generatedRecipe.isRTL ? 'שמור כטיוטה' : 'Save as Draft'}
                </Button>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1 border-recipe-green text-recipe-green min-w-[120px]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {generatedRecipe.isRTL ? 'עריכת המתכון' : 'Edit Recipe'}
                </Button>
                <Button
                  onClick={handleRejectRecipe}
                  variant="outline"
                  className="flex-1 border-destructive text-destructive min-w-[120px]"
                >
                  <X className="h-4 w-4 mr-2" />
                  {generatedRecipe.isRTL ? 'דחייה' : 'Reject Recipe'}
                </Button>
              </div>
              
              {isEditing && (
                <motion.div 
                  className="flex flex-col space-y-3 mt-4 p-4 bg-white rounded-lg shadow-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  ref={editFormRef}
                >
                  <h3 className={`font-medium text-gray-700 ${generatedRecipe.isRTL ? 'text-right' : 'text-left'}`}>
                    {generatedRecipe.isRTL ? 'מה תרצה לשנות במתכון?' : 'What would you like to change?'}
                  </h3>
                  <Input
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                    placeholder={generatedRecipe.isRTL ? 
                      "לדוגמה: הוסף יותר תבלינים, הפוך לצמחוני, השתמש בפחות שמן..." : 
                      "Ex: Add more spices, make it vegetarian, use less oil..."}
                    className="bg-white border-gray-300"
                    dir={detectLanguage(editRequest) === 'he' ? 'rtl' : 'ltr'}
                    disabled={isEditingInProgress}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleEditRecipe}
                      disabled={!editRequest.trim() || isEditingInProgress}
                      className="bg-recipe-orange hover:bg-recipe-orange/90 flex-1"
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
      
      <div className="p-6 bg-white border-t shadow-inner">
        <div className="max-w-3xl mx-auto flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a recipe you'd like me to create..."
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
            className="bg-white border-gray-300 focus:border-recipe-green focus:ring-recipe-green/30"
            dir={detectLanguage(input) === 'he' ? 'rtl' : 'ltr'}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-recipe-green hover:bg-recipe-green/90 flex-shrink-0 min-w-[50px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Check, X, Edit, AlertCircle } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { RecipeResponse } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import RecipeCard from './RecipeCard';
import { motion, AnimatePresence } from 'framer-motion';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [persistedMessages, setPersistedMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    const savedRecipe = localStorage.getItem('current_recipe');
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: '1',
          text: "Hello! I'm your Recipe Assistant. Tell me what kind of recipe you're looking for, and I'll create it for you. For example, try: 'I want a simple pasta recipe with mushrooms and garlic'.",
          sender: 'ai'
        }
      ]);
    }
    
    if (savedRecipe) {
      setGeneratedRecipe(JSON.parse(savedRecipe));
    }
  }, []);
  
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
    if (generatedRecipe) {
      localStorage.setItem('current_recipe', JSON.stringify(generatedRecipe));
    }
  }, [messages, generatedRecipe]);

  const clearPersistedChat = () => {
    localStorage.removeItem('chat_messages');
    localStorage.removeItem('current_recipe');
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
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
      const recipe = await geminiService.generateRecipe({
        prompt: input,
        language: detectLanguage(input)
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: recipe.isRecipe 
          ? `I've created a recipe for "${recipe.name}" based on your request.`
          : recipe.content || "I can only help with recipes and food-related questions.",
        sender: 'ai',
        isRTL: recipe.isRTL
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (recipe.isRecipe) {
        setGeneratedRecipe(recipe);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
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
    
    try {
      const recipe = await geminiService.generateRecipe({
        prompt: reply.text,
        language: detectLanguage(reply.text)
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: recipe.isRecipe 
          ? `I've created a recipe for "${recipe.name}" based on your request.`
          : recipe.content || "I can only help with recipes and food-related questions.",
        sender: 'ai',
        isRTL: recipe.isRTL
      };
      setMessages(prev => [...prev, aiMessage]);
      
      if (recipe.isRecipe) {
        setGeneratedRecipe(recipe);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
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
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I've updated the recipe for "${updatedRecipe.name}" based on your request.`,
        sender: 'ai',
        isRTL: updatedRecipe.isRTL
      };
      setMessages(prev => [...prev, aiMessage]);
      
      setGeneratedRecipe(updatedRecipe);
      setEditRequest('');
      
    } catch (error) {
      console.error('Error editing recipe:', error);
      
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
      
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "Great! I've saved this recipe to your collection. What would you like to cook next?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, confirmationMessage]);
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
  
  return (
    <div className="flex flex-col h-full">
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
                  className={`message-bubble ${
                    message.sender === 'user' 
                      ? 'bg-recipe-green/10 text-black dark:text-white dark:bg-recipe-green/20' 
                      : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'
                  } ${message.isRTL ? 'rtl text-right' : 'ltr text-left'}`}
                  style={{ 
                    maxWidth: '80%', 
                    borderRadius: '18px', 
                    padding: '12px 16px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {message.text}
                  {message.sender === 'ai' && message.quickReplies && message.quickReplies.length > 0 && (
                    <motion.div 
                      className="flex flex-wrap gap-2 mt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          variant="outline"
                          className="text-sm bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                        >
                          {reply.emoji && <span className="mr-1">{reply.emoji}</span>}
                          {reply.text}
                        </Button>
                      ))}
                    </motion.div>
                  )}
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
            className="bg-white border-gray-300"
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

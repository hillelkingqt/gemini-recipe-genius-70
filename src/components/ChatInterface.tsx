
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { RecipeResponse } from '@/types/Recipe';
import { useToast } from '@/components/ui/use-toast';
import RecipeCard from './RecipeCard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatInterfaceProps {
  onRecipeGenerated: (recipe: RecipeResponse) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onRecipeGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeResponse | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your Recipe Assistant. Tell me what kind of recipe you're looking for, and I'll create it for you. For example, try: 'I want a simple pasta recipe with mushrooms and garlic'.",
        sender: 'ai'
      }
    ]);
  }, []);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
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
        text: `I've created a recipe for "${recipe.name}" based on your request.`,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Set the generated recipe
      setGeneratedRecipe(recipe);
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
    
    setIsEditing(true);
    
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `Can you modify the recipe? ${editRequest}`,
        sender: 'user'
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
        sender: 'ai'
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
      setIsEditing(false);
    }
  };
  
  const handleAcceptRecipe = () => {
    if (generatedRecipe) {
      onRecipeGenerated(generatedRecipe);
      setGeneratedRecipe(null);
      
      toast({
        title: "Recipe Saved",
        description: "Your recipe has been added to your collection.",
      });
      
      // Add confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text: "Great! I've saved this recipe to your collection. What would you like to cook next?",
        sender: 'ai'
      };
      setMessages(prev => [...prev, confirmationMessage]);
    }
  };
  
  const handleRejectRecipe = () => {
    setGeneratedRecipe(null);
    
    // Add message
    const message: Message = {
      id: Date.now().toString(),
      text: "No problem. Let's try something else! What kind of recipe would you like instead?",
      sender: 'ai'
    };
    setMessages(prev => [...prev, message]);
  };
  
  // Helper function to detect language (very simple implementation)
  const detectLanguage = (text: string): string => {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text) ? 'he' : 'en';
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {generatedRecipe && (
          <div className="recipe-section mt-4 p-4 bg-recipe-cream rounded-lg shadow-md">
            <RecipeCard 
              recipe={generatedRecipe} 
              showActions={true}
              onEdit={() => {}}
              onDelete={() => {}}
            />
            
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex justify-between gap-2">
                <Button
                  onClick={handleAcceptRecipe}
                  className="flex-1 bg-recipe-green hover:bg-recipe-green/90"
                >
                  Accept Recipe
                </Button>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1 border-recipe-green text-recipe-green"
                >
                  Edit Recipe
                </Button>
                <Button
                  onClick={handleRejectRecipe}
                  variant="outline"
                  className="flex-1 border-destructive text-destructive"
                >
                  Reject Recipe
                </Button>
              </div>
              
              {isEditing && (
                <div className="flex flex-col space-y-2">
                  <Input
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                    placeholder="What would you like to change about this recipe?"
                    className="bg-white"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleEditRecipe}
                      disabled={isEditing && !editRequest.trim()}
                      className="bg-recipe-orange hover:bg-recipe-orange/90 flex-1"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Send Edit Request"
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a recipe you'd like me to create..."
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-recipe-green hover:bg-recipe-green/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

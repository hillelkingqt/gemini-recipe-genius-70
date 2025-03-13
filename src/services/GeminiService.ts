
import { RecipeRequest, RecipeResponse } from '@/types/Recipe';
import { apiKeyManager } from './ApiKeyManager';

class GeminiService {
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  private readonly visionUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";
  
  // Helper to get the correct API URL and key
  private getApiConfig(hasImage: boolean = false) {
    const apiKey = apiKeyManager.getRandomApiKey();
    const url = hasImage ? this.visionUrl : this.baseUrl;
    return {
      url: `${url}?key=${apiKey}`,
      apiKey
    };
  }

  async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      const hasImage = !!request.imageBase64;
      const { url } = this.getApiConfig(hasImage);
      
      // Build system prompt
      let systemPrompt = `You are a professional chef who specializes in creating recipes. You'll analyze the user's request and create a detailed recipe with ingredients and instructions.`;
      
      // Add user preferences if available
      if (request.userPreferences) {
        systemPrompt += `\nConsider these user preferences:
- Dietary restrictions: ${request.userPreferences.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${request.userPreferences.allergies?.join(', ') || 'None'}
- Favorite ingredients: ${request.userPreferences.favoriteIngredients?.join(', ') || 'None'}
- Disliked ingredients: ${request.userPreferences.dislikedIngredients?.join(', ') || 'None'}
- Preferred cuisines: ${request.userPreferences.preferredCuisines?.join(', ') || 'None'}
- Cooking skill level: ${request.userPreferences.cookingSkillLevel || 'intermediate'}
- Health goals: ${request.userPreferences.healthGoals?.join(', ') || 'None'}
- Notes: ${request.userPreferences.notes || ''}`;
      }

      // Determine content parts based on whether an image is provided
      const contentParts = [];
      
      // Add system prompt
      contentParts.push({
        text: systemPrompt
      });
      
      // Add text prompt
      contentParts.push({
        text: request.prompt
      });
      
      // Add image if present
      if (hasImage && request.imageBase64) {
        // Remove the data URL prefix if present
        const base64Image = request.imageBase64.includes('base64,') 
          ? request.imageBase64.split('base64,')[1] 
          : request.imageBase64;
        
        contentParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        });
      }
      
      // Create the request body
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: contentParts
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('Sending recipe request:', JSON.stringify(requestBody));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        
        // If the error is due to an invalid API key, try with a different one
        if (response.status === 400 || response.status === 403) {
          console.log('Trying with a different API key...');
          const newApiKey = apiKeyManager.getNextApiKey();
          console.log(`Switched to API key: ${newApiKey.substring(0, 5)}...`);
          
          // Retry the request
          return this.generateRecipe(request);
        }
        
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      console.log('Gemini API response:', data);

      // Check if we have a valid response
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error('Empty response from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      // Check if the language is RTL (like Hebrew or Arabic)
      const isRTL = this.detectRTL(content) || (request.language === 'he');
      
      // Try to parse the content as a recipe
      try {
        // Extract recipe details with a regex pattern
        const nameMatch = content.match(/(?:Title|Name|Recipe|שם המתכון|מתכון|כותרת):\s*([^\n]+)/i);
        const ingredientsMatch = content.match(/(?:Ingredients|מצרכים|חומרים):\s*([\s\S]*?)(?=\n\s*(?:Instructions|Directions|Method|Preparation|אופן הכנה|הוראות|שלבי הכנה):)/i);
        const instructionsMatch = content.match(/(?:Instructions|Directions|Method|Preparation|אופן הכנה|הוראות|שלבי הכנה):\s*([\s\S]*?)(?=\n\s*(?:Notes|Tips|Serving Suggestions|הערות|טיפים|הגשה):|\n*$)/i);
        
        // Additional metadata
        const difficultyMatch = content.match(/(?:Difficulty|רמת קושי):\s*([^\n]+)/i);
        const timeMatch = content.match(/(?:Time|Total Time|זמן הכנה|זמן כולל):\s*([^\n]+)/i);
        const servingsMatch = content.match(/(?:Servings|Yield|מנות|תפוקה):\s*([^\n]+)/i);
        const caloriesMatch = content.match(/(?:Calories|קלוריות):\s*([^\n]+)/i);
        const cuisineMatch = content.match(/(?:Cuisine|מטבח):\s*([^\n]+)/i);
        const tagsMatch = content.match(/(?:Tags|Keywords|תגיות|מילות מפתח):\s*([^\n]+)/i);
        
        // Process ingredients: split by lines and clean up
        const ingredients = ingredientsMatch && ingredientsMatch[1]
          ? ingredientsMatch[1].split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.match(/^-+$/))
              .map(line => line.replace(/^[•\-\*]\s*/, ''))
          : [];
        
        // Process instructions: split by numbered lines or line breaks
        const instructions = instructionsMatch && instructionsMatch[1]
          ? instructionsMatch[1].split(/\n(?:\d+[\.\)]\s*|(?:[•\-\*]\s*))|\n\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.match(/^-+$/))
              .map(line => line.replace(/^[•\-\*\d]+[\.\)]\s*/, ''))
          : [];
        
        // Process tags if available
        const tags = tagsMatch && tagsMatch[1]
          ? tagsMatch[1].split(/[,،;]/).map(tag => tag.trim())
          : [];
        
        const recipeResponse: RecipeResponse = {
          name: nameMatch && nameMatch[1] ? nameMatch[1].trim() : 'Untitled Recipe',
          ingredients,
          instructions,
          isRecipe: true,
          isRTL,
          ingredientsLabel: isRTL ? 'מצרכים' : 'Ingredients',
          instructionsLabel: isRTL ? 'אופן הכנה' : 'Instructions',
          difficulty: difficultyMatch && difficultyMatch[1] ? this.parseDifficulty(difficultyMatch[1]) : undefined,
          estimatedTime: timeMatch && timeMatch[1] ? timeMatch[1].trim() : undefined,
          servings: servingsMatch && servingsMatch[1] ? parseInt(servingsMatch[1], 10) || undefined : undefined,
          calories: caloriesMatch && caloriesMatch[1] ? caloriesMatch[1].trim() : undefined,
          cuisine: cuisineMatch && cuisineMatch[1] ? cuisineMatch[1].trim() : undefined,
          tags,
          imageBase64: request.imageBase64,
          quickReplies: [
            { text: isRTL ? "שנה את הוראות ההכנה" : "Modify the instructions", action: "edit", emoji: "✏️" },
            { text: isRTL ? "הוסף יותר תבלינים" : "Add more spices", action: "spice", emoji: "🌶️" },
            { text: isRTL ? "קצר את המתכון" : "Simplify the recipe", action: "simplify", emoji: "✨" }
          ]
        };
        
        return recipeResponse;
        
      } catch (parseError) {
        console.error('Error parsing recipe:', parseError);
        
        // Return a fallback response with the raw content
        return {
          name: 'Generated Content',
          ingredients: [],
          instructions: [],
          content,
          isRecipe: false,
          isRTL
        };
      }
    } catch (error) {
      console.error('Error in generateRecipe:', error);
      
      // Provide a meaningful error response
      return {
        name: 'Error Generating Recipe',
        ingredients: [],
        instructions: [],
        content: `I'm sorry, I couldn't generate a recipe at this time. ${error.message}`,
        isRecipe: false
      };
    }
  }

  async editRecipe(currentRecipe: RecipeResponse, editRequest: string, language?: string): Promise<RecipeResponse> {
    try {
      const { url } = this.getApiConfig();
      
      // Build the system prompt
      const systemPrompt = `You are a professional chef who specializes in creating recipes. You'll update the given recipe based on the user's request. Return the full updated recipe with all information.`;
      
      // Format the current recipe for the prompt
      const currentRecipeText = `
Recipe Name: ${currentRecipe.name}

Ingredients:
${currentRecipe.ingredients.map(ing => `- ${ing}`).join('\n')}

Instructions:
${currentRecipe.instructions.map((inst, idx) => `${idx + 1}. ${inst}`).join('\n')}
${currentRecipe.difficulty ? `\nDifficulty: ${currentRecipe.difficulty}` : ''}
${currentRecipe.estimatedTime ? `\nEstimated Time: ${currentRecipe.estimatedTime}` : ''}
${currentRecipe.servings ? `\nServings: ${currentRecipe.servings}` : ''}
${currentRecipe.calories ? `\nCalories: ${currentRecipe.calories}` : ''}
${currentRecipe.cuisine ? `\nCuisine: ${currentRecipe.cuisine}` : ''}
${currentRecipe.tags && currentRecipe.tags.length > 0 ? `\nTags: ${currentRecipe.tags.join(', ')}` : ''}
      `;
      
      // Create the user prompt
      const userPrompt = `Here is the current recipe:\n${currentRecipeText}\n\nEDIT REQUEST: ${editRequest}\n\nPlease update the recipe based on this request and return the full updated recipe.`;
      
      // Prepare the request
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };
      
      console.log('Sending edit request:', JSON.stringify(requestBody));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        
        // If the error is due to an invalid API key, try with a different one
        if (response.status === 400 || response.status === 403) {
          console.log('Trying with a different API key...');
          const newApiKey = apiKeyManager.getNextApiKey();
          console.log(`Switched to API key: ${newApiKey.substring(0, 5)}...`);
          
          // Retry the request
          return this.editRecipe(currentRecipe, editRequest, language);
        }
        
        throw new Error('Failed to edit recipe');
      }
      
      const data = await response.json();
      console.log('Gemini API response:', data);
      
      // Check if we have a valid response
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error('Empty response from Gemini API');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      
      // Check if the language is RTL
      const isRTL = this.detectRTL(content) || (language === 'he') || currentRecipe.isRTL;
      
      // Try to parse the content as a recipe
      try {
        // Extract recipe details with a regex pattern
        const nameMatch = content.match(/(?:Title|Name|Recipe|שם המתכון|מתכון|כותרת):\s*([^\n]+)/i);
        const ingredientsMatch = content.match(/(?:Ingredients|מצרכים|חומרים):\s*([\s\S]*?)(?=\n\s*(?:Instructions|Directions|Method|Preparation|אופן הכנה|הוראות|שלבי הכנה):)/i);
        const instructionsMatch = content.match(/(?:Instructions|Directions|Method|Preparation|אופן הכנה|הוראות|שלבי הכנה):\s*([\s\S]*?)(?=\n\s*(?:Notes|Tips|Serving Suggestions|הערות|טיפים|הגשה):|\n*$)/i);
        
        // Additional metadata
        const difficultyMatch = content.match(/(?:Difficulty|רמת קושי):\s*([^\n]+)/i);
        const timeMatch = content.match(/(?:Time|Total Time|זמן הכנה|זמן כולל):\s*([^\n]+)/i);
        const servingsMatch = content.match(/(?:Servings|Yield|מנות|תפוקה):\s*([^\n]+)/i);
        const caloriesMatch = content.match(/(?:Calories|קלוריות):\s*([^\n]+)/i);
        const cuisineMatch = content.match(/(?:Cuisine|מטבח):\s*([^\n]+)/i);
        const tagsMatch = content.match(/(?:Tags|Keywords|תגיות|מילות מפתח):\s*([^\n]+)/i);
        
        // Process ingredients: split by lines and clean up
        const ingredients = ingredientsMatch && ingredientsMatch[1]
          ? ingredientsMatch[1].split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.match(/^-+$/))
              .map(line => line.replace(/^[•\-\*]\s*/, ''))
          : currentRecipe.ingredients;
        
        // Process instructions: split by numbered lines or line breaks
        const instructions = instructionsMatch && instructionsMatch[1]
          ? instructionsMatch[1].split(/\n(?:\d+[\.\)]\s*|(?:[•\-\*]\s*))|\n\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.match(/^-+$/))
              .map(line => line.replace(/^[•\-\*\d]+[\.\)]\s*/, ''))
          : currentRecipe.instructions;
        
        // Process tags if available
        const tags = tagsMatch && tagsMatch[1]
          ? tagsMatch[1].split(/[,،;]/).map(tag => tag.trim())
          : currentRecipe.tags;
        
        // Create the updated recipe
        const updatedRecipe: RecipeResponse = {
          ...currentRecipe,
          name: nameMatch && nameMatch[1] ? nameMatch[1].trim() : currentRecipe.name,
          ingredients,
          instructions,
          isRTL,
          ingredientsLabel: isRTL ? 'מצרכים' : 'Ingredients',
          instructionsLabel: isRTL ? 'אופן הכנה' : 'Instructions',
          difficulty: difficultyMatch && difficultyMatch[1] 
            ? this.parseDifficulty(difficultyMatch[1]) 
            : currentRecipe.difficulty,
          estimatedTime: timeMatch && timeMatch[1] 
            ? timeMatch[1].trim() 
            : currentRecipe.estimatedTime,
          servings: servingsMatch && servingsMatch[1] 
            ? parseInt(servingsMatch[1], 10) || currentRecipe.servings 
            : currentRecipe.servings,
          calories: caloriesMatch && caloriesMatch[1] 
            ? caloriesMatch[1].trim() 
            : currentRecipe.calories,
          cuisine: cuisineMatch && cuisineMatch[1] 
            ? cuisineMatch[1].trim() 
            : currentRecipe.cuisine,
          tags: tags || currentRecipe.tags,
        };
        
        return updatedRecipe;
        
      } catch (parseError) {
        console.error('Error parsing edited recipe:', parseError);
        
        // Return a fallback response with the raw content
        return {
          ...currentRecipe,
          content,
          isRecipe: false
        };
      }
    } catch (error) {
      console.error('Error in editRecipe:', error);
      
      // Return the original recipe with an error message
      return {
        ...currentRecipe,
        content: `Error editing recipe: ${error.message}`,
      };
    }
  }
  
  // Helper function to detect RTL text
  private detectRTL(text: string): boolean {
    // Hebrew and Arabic character ranges
    const rtlPattern = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlPattern.test(text);
  }
  
  // Helper function to parse difficulty level
  private parseDifficulty(difficultyText: string): 'easy' | 'medium' | 'hard' {
    const text = difficultyText.toLowerCase();
    
    if (text.includes('easy') || text.includes('beginner') || text.includes('simple') || text.includes('קל')) {
      return 'easy';
    } else if (text.includes('hard') || text.includes('difficult') || text.includes('advanced') || text.includes('קשה')) {
      return 'hard';
    } else {
      return 'medium';
    }
  }
}

export const geminiService = new GeminiService();

import { RecipeRequest, RecipeResponse } from "../types/Recipe";

const GOOGLE_API_KEY = "AIzaSyA2KjqBCn4oT8s5s6WUB1VOVfVO_eI4rXA";
const MODEL_NAME = "gemini-2.0-flash-thinking-exp";

export class GeminiService {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = GOOGLE_API_KEY;
    this.modelName = MODEL_NAME;
  }

  async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      const prompt = this.createPrompt(request);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error from Gemini API:', data);
        throw new Error('Failed to generate recipe');
      }

      return this.parseRecipeResponse(data, request.language || 'en');
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  private createPrompt(request: RecipeRequest): string {
    const { prompt, language = 'en' } = request;
    const isHebrew = language === 'he';
    
    return `
You are a professional chef specialized in creating detailed recipes.
Create a recipe based on this request: "${prompt}"

${isHebrew ? "Please respond in Hebrew, following RTL (right-to-left) text direction." : "Please respond in English."}

Please provide:
- Detailed ingredients with quantities
- Step-by-step instructions
- Automatic tags based on ingredients and style
- Difficulty level (easy, medium, hard)
- Preparation time breakdown
- Calorie estimate per serving
- Time markers for steps that need timers (e.g., "bake for 30 minutes")
- Nutrition information if possible
- Cuisine type
- Seasonal recommendations if applicable

Respond ONLY with a complete, valid JSON object using this exact structure, nothing else:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "isRecipe": true,
  ${isHebrew ? '"isRTL": true,' : '"isRTL": false,'}
  ${isHebrew ? '"ingredientsLabel": "מצרכים",' : '"ingredientsLabel": "Ingredients",'}
  ${isHebrew ? '"instructionsLabel": "אופן ההכנה",' : '"instructionsLabel": "Instructions",'}
  "tags": ["tag1", "tag2"],
  "difficulty": "easy|medium|hard",
  "estimatedTime": "30 min",
  "calories": "300 calories per serving",
  "timeMarkers": [
    {
      "step": 1,
      "duration": 30,
      "description": "let the dough rise"
    }
  ],
  "prepTime": "15 minutes",
  "cookTime": "45 minutes",
  "totalTime": "1 hour",
  "servings": 4,
  "nutritionInfo": {
    "calories": "300 per serving",
    "protein": "15g",
    "carbs": "40g",
    "fat": "10g"
  },
  "seasonality": ["Spring", "Summer"],
  "cuisine": "Mediterranean"
}

If the user is NOT asking for a recipe or food-related content, respond with:
{
  "name": "Response",
  "content": "Your helpful response here",
  "isRecipe": false,
  ${isHebrew ? '"isRTL": true' : '"isRTL": false'}
}

The recipe should be detailed and professional.
Do not add any text, formatting, or explanation outside the JSON.
The JSON must be valid and parseable.`;
  }

  private parseRecipeResponse(response: any, language: string): RecipeResponse {
    try {
      console.log('Raw API response:', response);
      
      // Check if we have content in the response
      if (!response.candidates || 
          !response.candidates[0] || 
          !response.candidates[0].content ||
          !response.candidates[0].content.parts ||
          !response.candidates[0].content.parts[0] ||
          !response.candidates[0].content.parts[0].text) {
        throw new Error('Invalid API response structure');
      }
      
      const content = response.candidates[0].content.parts[0].text;
      console.log('Response content:', content);
      
      // Try to find a JSON object in the response - more robust regex
      const jsonRegex = /\{[\s\S]*\}/g;
      const jsonMatch = content.match(jsonRegex);
      
      if (!jsonMatch) {
        console.error('No JSON object found in response');
        throw new Error('Failed to extract JSON from response');
      }
      
      const jsonStr = jsonMatch[0];
      console.log('Extracted JSON:', jsonStr);
      
      try {
        const parsedResult = JSON.parse(jsonStr);
        
        if (parsedResult.isRecipe === false) {
          // This is a non-recipe response
          return {
            name: parsedResult.name || "Response",
            ingredients: [],
            instructions: [],
            isRecipe: false,
            isRTL: parsedResult.isRTL || language === 'he',
            content: parsedResult.content || "I can only help with recipes and food-related questions."
          };
        }
        
        // Validate required fields for recipes
        if (!parsedResult.name || !Array.isArray(parsedResult.ingredients) || !Array.isArray(parsedResult.instructions)) {
          throw new Error('Invalid recipe format');
        }
        
        return {
          name: parsedResult.name,
          ingredients: parsedResult.ingredients,
          instructions: parsedResult.instructions,
          isRecipe: true,
          isRTL: parsedResult.isRTL || language === 'he',
          ingredientsLabel: parsedResult.ingredientsLabel || (language === 'he' ? 'מצרכים' : 'Ingredients'),
          instructionsLabel: parsedResult.instructionsLabel || (language === 'he' ? 'אופן ההכנה' : 'Instructions'),
          tags: parsedResult.tags || [],
          difficulty: parsedResult.difficulty || 'medium',
          estimatedTime: parsedResult.estimatedTime || '',
          calories: parsedResult.calories || ''
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse JSON from response');
      }
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      throw new Error('Failed to parse recipe response');
    }
  }

  async editRecipe(originalRecipe: RecipeResponse, editRequest: string, language: string = 'en'): Promise<RecipeResponse> {
    try {
      const isHebrew = language === 'he';
      const prompt = `
Original recipe:
${JSON.stringify(originalRecipe, null, 2)}

Edit request: "${editRequest}"

Please modify the recipe according to the edit request.
${isHebrew ? "Please respond in Hebrew, following RTL (right-to-left) text direction." : "Please respond in English."}

Please provide:
- Detailed ingredients with quantities
- Step-by-step instructions
- Automatic tags based on ingredients and style
- Difficulty level (easy, medium, hard)
- Preparation time breakdown
- Calorie estimate per serving
- Time markers for steps that need timers (e.g., "bake for 30 minutes")
- Nutrition information if possible
- Cuisine type
- Seasonal recommendations if applicable

Respond ONLY with a valid JSON object that has the following structure:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "isRecipe": true,
  ${isHebrew ? '"isRTL": true,' : '"isRTL": false,'}
  ${isHebrew ? '"ingredientsLabel": "מצרכים",' : '"ingredientsLabel": "Ingredients",'}
  ${isHebrew ? '"instructionsLabel": "אופן ההכנה",' : '"instructionsLabel": "Instructions",'}
  "tags": ["tag1", "tag2"],
  "difficulty": "easy|medium|hard",
  "estimatedTime": "30 min",
  "calories": "300 calories per serving",
  "timeMarkers": [
    {
      "step": 1,
      "duration": 30,
      "description": "let the dough rise"
    }
  ],
  "prepTime": "15 minutes",
  "cookTime": "45 minutes",
  "totalTime": "1 hour",
  "servings": 4,
  "nutritionInfo": {
    "calories": "300 per serving",
    "protein": "15g",
    "carbs": "40g",
    "fat": "10g"
  },
  "seasonality": ["Spring", "Summer"],
  "cuisine": "Mediterranean"
}

The recipe should be detailed and professional.
Do not include any text before or after the JSON object.
Do not include markdown formatting or code blocks.
The JSON must be valid and parseable.
`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error from Gemini API:', data);
        throw new Error('Failed to edit recipe');
      }

      return this.parseRecipeResponse(data, language);
    } catch (error) {
      console.error('Error editing recipe:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

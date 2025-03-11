
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
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error from Gemini API:', data);
        throw new Error('Failed to generate recipe');
      }

      return this.parseRecipeResponse(data);
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  private createPrompt(request: RecipeRequest): string {
    const { prompt, language = 'en' } = request;
    
    return `
You are a professional chef specialized in creating detailed recipes.
I need you to create a recipe based on this request: "${prompt}"

Respond ONLY with a valid JSON object that has the following structure:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...]
}

The recipe should be detailed and professional. 
Please respond in ${language}.
Do not include any text before or after the JSON object.
Do not include markdown formatting or code blocks.
`;
  }

  private parseRecipeResponse(response: any): RecipeResponse {
    try {
      const content = response.candidates[0].content.parts[0].text;
      
      // Extract the JSON part from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }
      
      const jsonStr = jsonMatch[0];
      const recipe = JSON.parse(jsonStr);
      
      return {
        name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions
      };
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      throw new Error('Failed to parse recipe response');
    }
  }

  async editRecipe(originalRecipe: RecipeResponse, editRequest: string, language: string = 'en'): Promise<RecipeResponse> {
    try {
      const prompt = `
Original recipe:
${JSON.stringify(originalRecipe, null, 2)}

Edit request: "${editRequest}"

Please modify the recipe according to the edit request.
Respond ONLY with a valid JSON object that has the following structure:
{
  "name": "Recipe Name",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...]
}

The recipe should be detailed and professional.
Please respond in ${language}.
Do not include any text before or after the JSON object.
Do not include markdown formatting or code blocks.
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
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error from Gemini API:', data);
        throw new Error('Failed to edit recipe');
      }

      return this.parseRecipeResponse(data);
    } catch (error) {
      console.error('Error editing recipe:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

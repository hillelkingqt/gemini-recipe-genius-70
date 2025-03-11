
export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  createdAt: Date;
  isRTL?: boolean;
  ingredientsLabel?: string;
  instructionsLabel?: string;
  isRecipe?: boolean;
  content?: string;
}

export interface RecipeRequest {
  prompt: string;
  language?: string;
}

export interface RecipeResponse {
  name: string;
  ingredients: string[];
  instructions: string[];
  isRTL?: boolean;
  ingredientsLabel?: string;
  instructionsLabel?: string;
  isRecipe?: boolean;
  content?: string;
}

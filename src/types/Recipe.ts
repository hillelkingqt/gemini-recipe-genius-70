
export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  createdAt: Date;
}

export interface RecipeRequest {
  prompt: string;
  language?: string;
}

export interface RecipeResponse {
  name: string;
  ingredients: string[];
  instructions: string[];
}

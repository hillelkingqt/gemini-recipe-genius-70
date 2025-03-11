
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
  isFavorite?: boolean;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  calories?: string;
  notes?: string;
  rating?: number;
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
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: string;
  calories?: string;
}

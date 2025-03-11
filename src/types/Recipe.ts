
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
  status?: 'draft' | 'accepted' | 'rejected';
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  seasonality?: string[];
  cuisine?: string;
  timeMarkers?: {
    step: number;
    duration: number;
    description: string;
  }[];
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
  timeMarkers?: {
    step: number;
    duration: number;
    description: string;
  }[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  seasonality?: string[];
  cuisine?: string;
}

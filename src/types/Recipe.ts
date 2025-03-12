export interface CulinaryTerm {
  term: string;
  definition: string;
  category: string;
  examples?: string[];
}

export interface MeasurementConversion {
  from: string;
  to: string;
  ratio: number;
  ingredient?: string;
}

export interface UserStatistics {
  requestedRecipes: number;
  completedRecipes: number;
  favoriteRecipes: string[];
  mostCooked: {
    recipeId: string;
    count: number;
  }[];
  lastSession?: {
    route: string;
    scroll: number;
    timestamp: Date;
  };
}

export interface CookingTip {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  emoji?: string;
}

export interface MealPlan {
  date: Date;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipeId?: string;
    notes?: string;
  }[];
}

export interface QuickReply {
  text: string;
  action: string;
  emoji?: string;
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
  quickReplies?: QuickReply[];
}

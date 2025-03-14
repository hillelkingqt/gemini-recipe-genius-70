
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
    isFavorite: boolean;
    user_id: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedTime?: string;
    calories?: string;
    notes: string;
    rating: number;
    status: 'draft' | 'accepted' | 'rejected' | 'published';
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
    likes?: number;
    author?: string;
    publishedAt?: Date;
    imageBase64?: string;
    // Flag to track if recipe is from community (to hide publish button)
    isFromCommunity?: boolean;
}

export interface RecipeRequest {
  prompt: string;
  language?: string;
  imageBase64?: string;
  userPreferences?: UserPreferences;
  respectPreferences?: boolean; // New field to control if AI should use preferences in recipe titles
}

export interface UserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteIngredients?: string[];
  dislikedIngredients?: string[];
  preferredCuisines?: string[];
  cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  healthGoals?: string[];
  notes?: string;
  // Flag to control if preferences should be mentioned in recipe titles
  mentionInTitle?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteIngredients?: string[];
  dislikedIngredients?: string[];
  preferredCuisines?: string[];
  cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  healthGoals?: string[];
  profileNotes?: string;
  avatarUrl?: string;
  updated_at?: string;
  created_at?: string;
  mentionInTitle?: boolean; // Flag to control if preferences should be mentioned in recipe titles
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
  imageBase64?: string;
  status?: 'draft' | 'accepted' | 'rejected' | 'published';
  user_id?: string;
}

export interface RecipeCardProps {
  recipe: Recipe;
  showActions: boolean;
  className?: string;
  onFavoriteToggle?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
  onRate?: (id: string, rating: number) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
  onUnpublish?: (id: string) => Promise<void>;
  onLike?: (id: string) => Promise<void>;
}

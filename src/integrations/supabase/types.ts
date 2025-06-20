export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allergies: string[] | null
          avatar_url: string | null
          cooking_skill_level: string | null
          created_at: string
          dietary_restrictions: string[] | null
          disliked_ingredients: string[] | null
          favorite_ingredients: string[] | null
          health_goals: string[] | null
          id: string
          mention_in_title: boolean | null
          preferred_cuisines: string[] | null
          profile_notes: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          allergies?: string[] | null
          avatar_url?: string | null
          cooking_skill_level?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          disliked_ingredients?: string[] | null
          favorite_ingredients?: string[] | null
          health_goals?: string[] | null
          id: string
          mention_in_title?: boolean | null
          preferred_cuisines?: string[] | null
          profile_notes?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          allergies?: string[] | null
          avatar_url?: string | null
          cooking_skill_level?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          disliked_ingredients?: string[] | null
          favorite_ingredients?: string[] | null
          health_goals?: string[] | null
          id?: string
          mention_in_title?: boolean | null
          preferred_cuisines?: string[] | null
          profile_notes?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      recipe_likes: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_likes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          author: string | null
          calories: string | null
          content: string | null
          cook_time: string | null
          created_at: string
          cuisine: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          image_base64: string | null
          ingredients: Json
          ingredients_label: string | null
          instructions: Json
          instructions_label: string | null
          is_favorite: boolean | null
          is_from_community: boolean | null
          is_recipe: boolean | null
          is_rtl: boolean | null
          likes: number | null
          name: string
          notes: string | null
          nutrition_info: Json | null
          prep_time: string | null
          published_at: string | null
          rating: number | null
          seasonality: Json | null
          servings: number | null
          status: string | null
          tags: Json | null
          time_markers: Json | null
          total_time: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          calories?: string | null
          content?: string | null
          cook_time?: string | null
          created_at?: string
          cuisine?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          image_base64?: string | null
          ingredients: Json
          ingredients_label?: string | null
          instructions: Json
          instructions_label?: string | null
          is_favorite?: boolean | null
          is_from_community?: boolean | null
          is_recipe?: boolean | null
          is_rtl?: boolean | null
          likes?: number | null
          name: string
          notes?: string | null
          nutrition_info?: Json | null
          prep_time?: string | null
          published_at?: string | null
          rating?: number | null
          seasonality?: Json | null
          servings?: number | null
          status?: string | null
          tags?: Json | null
          time_markers?: Json | null
          total_time?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          calories?: string | null
          content?: string | null
          cook_time?: string | null
          created_at?: string
          cuisine?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          image_base64?: string | null
          ingredients?: Json
          ingredients_label?: string | null
          instructions?: Json
          instructions_label?: string | null
          is_favorite?: boolean | null
          is_from_community?: boolean | null
          is_recipe?: boolean | null
          is_rtl?: boolean | null
          likes?: number | null
          name?: string
          notes?: string | null
          nutrition_info?: Json | null
          prep_time?: string | null
          published_at?: string | null
          rating?: number | null
          seasonality?: Json | null
          servings?: number | null
          status?: string | null
          tags?: Json | null
          time_markers?: Json | null
          total_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

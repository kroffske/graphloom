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
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_user: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_user: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_user?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          calorie_goal: number | null
          carbs_goal: number | null
          created_at: string | null
          fat_goal: number | null
          id: string
          protein_goal: number | null
          updated_at: string | null
          user_id: string
          water_goal: number | null
          workout_goal: number | null
        }
        Insert: {
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string | null
          fat_goal?: number | null
          id?: string
          protein_goal?: number | null
          updated_at?: string | null
          user_id: string
          water_goal?: number | null
          workout_goal?: number | null
        }
        Update: {
          calorie_goal?: number | null
          carbs_goal?: number | null
          created_at?: string | null
          fat_goal?: number | null
          id?: string
          protein_goal?: number | null
          updated_at?: string | null
          user_id?: string
          water_goal?: number | null
          workout_goal?: number | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          chat_messages_count: number | null
          created_at: string | null
          food_entries_count: number | null
          id: string
          updated_at: string | null
          usage_date: string | null
          user_id: string
          workout_entries_count: number | null
        }
        Insert: {
          chat_messages_count?: number | null
          created_at?: string | null
          food_entries_count?: number | null
          id?: string
          updated_at?: string | null
          usage_date?: string | null
          user_id: string
          workout_entries_count?: number | null
        }
        Update: {
          chat_messages_count?: number | null
          created_at?: string | null
          food_entries_count?: number | null
          id?: string
          updated_at?: string | null
          usage_date?: string | null
          user_id?: string
          workout_entries_count?: number | null
        }
        Relationships: []
      }
      food_entries: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string | null
          fat: number | null
          id: string
          logged_date: string | null
          meal_type: string | null
          name: string
          protein: number | null
          serving_size: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          logged_date?: string | null
          meal_type?: string | null
          name: string
          protein?: number | null
          serving_size?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          logged_date?: string | null
          meal_type?: string | null
          name?: string
          protein?: number | null
          serving_size?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string | null
          first_name: string | null
          gender: string | null
          height: number | null
          id: string
          last_name: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          height?: number | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string | null
          first_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_entries: {
        Row: {
          calories_burned: number | null
          category: string | null
          created_at: string | null
          duration: number
          id: string
          intensity: string | null
          logged_date: string | null
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          category?: string | null
          created_at?: string | null
          duration?: number
          id?: string
          intensity?: string | null
          logged_date?: string | null
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          category?: string | null
          created_at?: string | null
          duration?: number
          id?: string
          intensity?: string | null
          logged_date?: string | null
          name?: string
          notes?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

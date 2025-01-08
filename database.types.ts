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
      generated_images: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          guidance: number | null
          height: number | null
          id: number
          image_name: string | null
          model: string | null
          num_inference_steps: number | null
          output_format: string | null
          prompt: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          guidance?: number | null
          height?: number | null
          id?: never
          image_name?: string | null
          model?: string | null
          num_inference_steps?: number | null
          output_format?: string | null
          prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          guidance?: number | null
          height?: number | null
          id?: never
          image_name?: string | null
          model?: string | null
          num_inference_steps?: number | null
          output_format?: string | null
          prompt?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      models: {
        Row: {
          created_at: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: number
          model_id: string | null
          model_name: string | null
          training_id: string | null
          training_status: Database["public"]["Enums"]["training_status"] | null
          training_steps: number | null
          training_time: string | null
          trigger_word: string | null
          user_id: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: never
          model_id?: string | null
          model_name?: string | null
          training_id?: string | null
          training_status?:
            | Database["public"]["Enums"]["training_status"]
            | null
          training_steps?: number | null
          training_time?: string | null
          trigger_word?: string | null
          user_id?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: never
          model_id?: string | null
          model_name?: string | null
          training_id?: string | null
          training_status?:
            | Database["public"]["Enums"]["training_status"]
            | null
          training_steps?: number | null
          training_time?: string | null
          trigger_word?: string | null
          user_id?: string | null
          version?: string | null
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
      gender: "man" | "women"
      training_status:
        | "starting"
        | "processing"
        | "succeeded"
        | "failed"
        | "canceled"
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

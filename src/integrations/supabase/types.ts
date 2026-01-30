export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          batch_type: Database["public"]["Enums"]["batch_type"]
          code: string
          created_at: string
          created_by: string | null
          id: string
          ready_date: string | null
          start_date: string
          status: Database["public"]["Enums"]["batch_status"]
          total_weight_grams: number
          updated_at: string
        }
        Insert: {
          batch_type?: Database["public"]["Enums"]["batch_type"]
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          ready_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"]
          total_weight_grams?: number
          updated_at?: string
        }
        Update: {
          batch_type?: Database["public"]["Enums"]["batch_type"]
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          ready_date?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["batch_status"]
          total_weight_grams?: number
          updated_at?: string
        }
        Relationships: []
      }
      collection_points: {
        Row: {
          address: string
          city: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          state?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      distributions: {
        Row: {
          check_at: string | null
          created_at: string
          created_by: string | null
          distributed_at: string
          granulated_kg_per_package: number | null
          granulated_packages: number | null
          id: string
          liquid_bottles: number | null
          liquid_liters_per_bottle: number | null
          observations: string | null
          other_items: string | null
          pros_moved: number
          sales_point_id: string | null
          updated_at: string
        }
        Insert: {
          check_at?: string | null
          created_at?: string
          created_by?: string | null
          distributed_at?: string
          granulated_kg_per_package?: number | null
          granulated_packages?: number | null
          id?: string
          liquid_bottles?: number | null
          liquid_liters_per_bottle?: number | null
          observations?: string | null
          other_items?: string | null
          pros_moved?: number
          sales_point_id?: string | null
          updated_at?: string
        }
        Update: {
          check_at?: string | null
          created_at?: string
          created_by?: string | null
          distributed_at?: string
          granulated_kg_per_package?: number | null
          granulated_packages?: number | null
          id?: string
          liquid_bottles?: number | null
          liquid_liters_per_bottle?: number | null
          observations?: string | null
          other_items?: string | null
          pros_moved?: number
          sales_point_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributions_sales_point_id_fkey"
            columns: ["sales_point_id"]
            isOneToOne: false
            referencedRelation: "sales_points"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          created_at: string
          current_amount: number
          id: string
          is_completed: boolean
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          id?: string
          is_completed?: boolean
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fifo_queue: {
        Row: {
          created_at: string
          id: string
          paid_at: string | null
          position: number
          pro_id: string
          status: Database["public"]["Enums"]["pro_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          position: number
          pro_id: string
          status?: Database["public"]["Enums"]["pro_status"]
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          position?: number
          pro_id?: string
          status?: Database["public"]["Enums"]["pro_status"]
        }
        Relationships: [
          {
            foreignKeyName: "fifo_queue_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: true
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          distributed_at: string | null
          id: string
          is_distributed: boolean
          pros_paid: number | null
          received_at: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          distributed_at?: string | null
          id?: string
          is_distributed?: boolean
          pros_paid?: number | null
          received_at?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          distributed_at?: string | null
          id?: string
          is_distributed?: boolean
          pros_paid?: number | null
          received_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          created_at: string
          email: string
          external_transaction_id: string | null
          full_name: string
          id: string
          is_blocked: boolean
          password_change_required: boolean
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          email: string
          external_transaction_id?: string | null
          full_name: string
          id?: string
          is_blocked?: boolean
          password_change_required?: boolean
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          created_at?: string
          email?: string
          external_transaction_id?: string | null
          full_name?: string
          id?: string
          is_blocked?: boolean
          password_change_required?: boolean
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pros: {
        Row: {
          batch_id: string | null
          code: string
          collection_point_id: string | null
          created_at: string
          dream_id: string | null
          fifo_position: number
          id: string
          paid_at: string | null
          processed_at: string | null
          sold_at: string | null
          status: Database["public"]["Enums"]["pro_status"]
          user_id: string
          weight_grams: number
        }
        Insert: {
          batch_id?: string | null
          code: string
          collection_point_id?: string | null
          created_at?: string
          dream_id?: string | null
          fifo_position: number
          id?: string
          paid_at?: string | null
          processed_at?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["pro_status"]
          user_id: string
          weight_grams?: number
        }
        Update: {
          batch_id?: string | null
          code?: string
          collection_point_id?: string | null
          created_at?: string
          dream_id?: string | null
          fifo_position?: number
          id?: string
          paid_at?: string | null
          processed_at?: string | null
          sold_at?: string | null
          status?: Database["public"]["Enums"]["pro_status"]
          user_id?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "pros_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pros_collection_point_id_fkey"
            columns: ["collection_point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pros_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_points: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string | null
          notes: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weighings: {
        Row: {
          collection_point_id: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
          weighed_at: string
          weighed_by: string
          weight_grams: number
        }
        Insert: {
          collection_point_id: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
          weighed_at?: string
          weighed_by: string
          weight_grams: number
        }
        Update: {
          collection_point_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
          weighed_at?: string
          weighed_by?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "weighings_collection_point_id_fkey"
            columns: ["collection_point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_pro_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_fifo_queue_public: {
        Args: never
        Returns: {
          pro_code: string
          pro_created_at: string
          pro_id: string
          pro_status: Database["public"]["Enums"]["pro_status"]
          pro_user_id: string
          pro_weight_grams: number
          queue_created_at: string
          queue_id: string
          queue_paid_at: string
          queue_position: number
          queue_status: Database["public"]["Enums"]["pro_status"]
          user_name: string
        }[]
      }
      get_next_fifo_position: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      lookup_referral_code: {
        Args: { code: string }
        Returns: {
          profile_id: string
          referral_code: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "client"
      batch_status: "processing" | "ready" | "partial_sold" | "sold"
      batch_type: "composting" | "vermicomposting"
      pro_status: "pending" | "processing" | "ready" | "sold" | "paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "client"],
      batch_status: ["processing", "ready", "partial_sold", "sold"],
      batch_type: ["composting", "vermicomposting"],
      pro_status: ["pending", "processing", "ready", "sold", "paid"],
    },
  },
} as const

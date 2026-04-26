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
      activation_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          expires_at: string
          id: string
          max_uses: number
          note: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          expires_at: string
          id?: string
          max_uses?: number
          note?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          expires_at?: string
          id?: string
          max_uses?: number
          note?: string | null
        }
        Relationships: []
      }
      activations: {
        Row: {
          code_id: string
          created_at: string
          device_id: string
          email: string
          id: string
          user_id: string
          valid_until: string
        }
        Insert: {
          code_id: string
          created_at?: string
          device_id: string
          email: string
          id?: string
          user_id: string
          valid_until: string
        }
        Update: {
          code_id?: string
          created_at?: string
          device_id?: string
          email?: string
          id?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "activations_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_free_purchases: {
        Row: {
          amount: number
          currency: string
          device_id: string
          expires_at: string
          id: string
          paypal_order_id: string
          purchased_at: string
        }
        Insert: {
          amount: number
          currency?: string
          device_id: string
          expires_at?: string
          id?: string
          paypal_order_id: string
          purchased_at?: string
        }
        Update: {
          amount?: number
          currency?: string
          device_id?: string
          expires_at?: string
          id?: string
          paypal_order_id?: string
          purchased_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          replied_at: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          replied_at?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          replied_at?: string | null
        }
        Relationships: []
      }
      google_play_subscriptions: {
        Row: {
          acknowledgement_state: number | null
          auto_renewing: boolean | null
          cancel_reason: number | null
          country_code: string | null
          created_at: string
          device_id: string
          expiry_time: string
          id: string
          order_id: string | null
          payment_state: number | null
          price_amount_micros: string | null
          price_currency_code: string | null
          product_id: string
          purchase_token: string
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledgement_state?: number | null
          auto_renewing?: boolean | null
          cancel_reason?: number | null
          country_code?: string | null
          created_at?: string
          device_id: string
          expiry_time: string
          id?: string
          order_id?: string | null
          payment_state?: number | null
          price_amount_micros?: string | null
          price_currency_code?: string | null
          product_id?: string
          purchase_token: string
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledgement_state?: number | null
          auto_renewing?: boolean | null
          cancel_reason?: number | null
          country_code?: string | null
          created_at?: string
          device_id?: string
          expiry_time?: string
          id?: string
          order_id?: string | null
          payment_state?: number | null
          price_amount_micros?: string | null
          price_currency_code?: string | null
          product_id?: string
          purchase_token?: string
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_data: {
        Row: {
          created_at: string
          data: Json
          group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_data_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "shared_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "shared_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_settings: {
        Row: {
          currency: string
          duration_days: number
          id: string
          price: number
          updated_at: string
        }
        Insert: {
          currency?: string
          duration_days?: number
          id?: string
          price?: number
          updated_at?: string
        }
        Update: {
          currency?: string
          duration_days?: number
          id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      shared_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          max_members: number
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          max_members?: number
          name?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          max_members?: number
          name?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

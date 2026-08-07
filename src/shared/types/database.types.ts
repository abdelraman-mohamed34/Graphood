import { PaymentProvider } from "../lib/providers/billings/payment-provider"
import { paymentProvider } from "../lib/schemas/payments.schema"

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coupon_usages: {
        Row: {
          coupon_id: string
          id: string
          order_id: string
          profile_id: string
          system_id: string
          used_at: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id: string
          profile_id: string
          system_id: string
          used_at?: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string
          profile_id?: string
          system_id?: string
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_generated: boolean
          license_type: string | null
          max_discount: number | null
          max_uses: number | null
          max_uses_per_user: number
          min_order_amount: number
          one_use_per_system: boolean
          plan: string | null
          starts_at: string | null
          system_id: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_generated?: boolean
          license_type?: string | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number
          min_order_amount?: number
          one_use_per_system?: boolean
          plan?: string | null
          starts_at?: string | null
          system_id?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_generated?: boolean
          license_type?: string | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number
          min_order_amount?: number
          one_use_per_system?: boolean
          plan?: string | null
          starts_at?: string | null
          system_id?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      developer_api_keys: {
        Row: {
          created_at: string
          encrypted_key: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          last_used_at: string | null
          name: string
          system_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_key?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          last_used_at?: string | null
          name: string
          system_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          last_used_at?: string | null
          name?: string
          system_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_developer_api_keys_system"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["invitation_status"] | null
          tenant_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          message?: string | null
          permissions?: Json | null
          role: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"] | null
          tenant_id: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["invitation_status"] | null
          tenant_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          current_tenant_id: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          permissions: string[] | null
          profile_id: string
          role: Database["public"]["Enums"]["membership_role"]
          status: Database["public"]["Enums"]["global_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_tenant_id?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: string[] | null
          profile_id: string
          role: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["global_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_tenant_id?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: string[] | null
          profile_id?: string
          role?: Database["public"]["Enums"]["membership_role"]
          status?: Database["public"]["Enums"]["global_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          coupon_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount_amount: number
          id: string
          license_type: string
          original_amount: number
          plan: string | null
          profile_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          subscription_id: string | null
          system_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number
          id?: string
          license_type: string
          original_amount?: number
          plan?: string | null
          profile_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subscription_id?: string | null
          system_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount?: number
          id?: string
          license_type?: string
          original_amount?: number
          plan?: string | null
          profile_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subscription_id?: string | null
          system_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          order_id: string
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_integration_id: number | null
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_ref: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_integration_id?: number | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_integration_id?: number | null
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_ref?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_verified: boolean | null
          last_name: string
          phone: string | null
          preferred_language: string | null
          sex: Database["public"]["Enums"]["user_sex"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id: string
          is_verified?: boolean | null
          last_name: string
          phone?: string | null
          preferred_language?: string | null
          sex?: Database["public"]["Enums"]["user_sex"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_verified?: boolean | null
          last_name?: string
          phone?: string | null
          preferred_language?: string | null
          sex?: Database["public"]["Enums"]["user_sex"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          license_type: string | null
          order_id: string | null
          plan_name: string
          price: number
          profile_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          system_id: string
          trial_end_date: string | null
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          license_type?: string | null
          order_id?: string | null
          plan_name: string
          price: number
          profile_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          system_id: string
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          license_type?: string | null
          order_id?: string | null
          plan_name?: string
          price?: number
          profile_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          system_id?: string
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          business_price: number
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          exclusive_price: number
          icon_url: string | null
          id: string
          is_public: boolean | null
          name: string
          owner_id: string
          pro_price: number
          reseller_price: number
          slug: string
          starter_price: number
          status: Database["public"]["Enums"]["global_status"] | null
          tags: string[]
          updated_at: string | null
        }
        Insert: {
          business_price?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          exclusive_price?: number
          icon_url?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          owner_id: string
          pro_price?: number
          reseller_price?: number
          slug: string
          starter_price?: number
          status?: Database["public"]["Enums"]["global_status"] | null
          tags?: string[]
          updated_at?: string | null
        }
        Update: {
          business_price?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          exclusive_price?: number
          icon_url?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          owner_id?: string
          pro_price?: number
          reseller_price?: number
          slug?: string
          starter_price?: number
          status?: Database["public"]["Enums"]["global_status"] | null
          tags?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name_ar: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_ar: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name_ar?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          primary_color: string | null
          slug: string
          status: Database["public"]["Enums"]["global_status"] | null
          subdomain: string | null
          subscription_id: string | null
          system_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          primary_color?: string | null
          slug: string
          status?: Database["public"]["Enums"]["global_status"] | null
          subdomain?: string | null
          subscription_id?: string | null
          system_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          primary_color?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["global_status"] | null
          subdomain?: string | null
          subscription_id?: string | null
          system_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "systems"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_paymob_payment: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_paymob_order_id: number
          p_transaction_ref: string
        }
        Returns: Json
      }
      fail_paymob_payment: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_paymob_order_id: number
        }
        Returns: Json
      }
      cleanup_expired_invitations: { Args: never; Returns: undefined }
      is_tenant_member: { Args: { target_tenant_id: string }; Returns: boolean }
      transfer_workspace_ownership: {
        Args: {
          current_owner_membership_id: string
          new_owner_membership_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      billing_interval: "MONTHLY" | "YEARLY" | "ONE_TIME"
      billing_type_enum: "FREE" | "ONE_TIME" | "SUBSCRIPTION"
      global_status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"
      invitation_status:
      | "PENDING"
      | "ACCEPTED"
      | "REJECTED"
      | "EXPIRED"
      | "CANCELLED"
      membership_role: "OWNER" | "ADMIN" | "STAFF" | "MEMBER"
      order_status: "PENDING" | "PAID" | "FAILED" | "CANCELED" | "REFUNDED"
      payment_provider: PaymentProvider
      payment_status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
      subscription_status:
      | "ACTIVE"
      | "TRIAL"
      | "PAST_DUE"
      | "CANCELED"
      | "EXPIRED"
      user_sex: "male" | "female"
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
      billing_interval: ["MONTHLY", "YEARLY", "ONE_TIME"],
      billing_type_enum: ["FREE", "ONE_TIME", "SUBSCRIPTION"],
      global_status: ["PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"],
      invitation_status: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED",
      ],
      membership_role: ["OWNER", "ADMIN", "STAFF", "MEMBER"],
      order_status: ["PENDING", "PAID", "FAILED", "CANCELED", "REFUNDED"],
      payment_provider: paymentProvider,
      payment_status: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      subscription_status: [
        "ACTIVE",
        "TRIAL",
        "PAST_DUE",
        "CANCELED",
        "EXPIRED",
      ],
      user_sex: ["male", "female"],
    },
  },
} as const

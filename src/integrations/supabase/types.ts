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
      banners: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          position: number
          updated_at: string | null
        }
        Insert: {
          active: boolean
          created_at?: string
          id?: string
          image_url: string
          position: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          display_on_homepage: boolean | null
          homepage_order: number | null
          id: number
          image: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_on_homepage?: boolean | null
          homepage_order?: number | null
          id?: number
          image?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_on_homepage?: boolean | null
          homepage_order?: number | null
          id?: number
          image?: string | null
          name?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          admin_notes: string | null
          admin_read: boolean | null
          created_at: string | null
          deposit: number | null
          discount: number | null
          id: number
          items: Json
          notification_sent: boolean | null
          order_date: string | null
          payment_confirmed_at: string | null
          payment_date: string | null
          payment_slip: string | null
          payment_slip_url: string | null
          profit: number | null
          qr_code_generated: boolean | null
          shipping_cost: number | null
          status: string | null
          total_cost: number | null
          total_selling_price: number | null
          tracking_number: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          admin_read?: boolean | null
          created_at?: string | null
          deposit?: number | null
          discount?: number | null
          id?: number
          items: Json
          notification_sent?: boolean | null
          order_date?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_slip?: string | null
          payment_slip_url?: string | null
          profit?: number | null
          qr_code_generated?: boolean | null
          shipping_cost?: number | null
          status?: string | null
          total_cost?: number | null
          total_selling_price?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          admin_read?: boolean | null
          created_at?: string | null
          deposit?: number | null
          discount?: number | null
          id?: number
          items?: Json
          notification_sent?: boolean | null
          order_date?: string | null
          payment_confirmed_at?: string | null
          payment_date?: string | null
          payment_slip?: string | null
          payment_slip_url?: string | null
          profit?: number | null
          qr_code_generated?: boolean | null
          shipping_cost?: number | null
          status?: string | null
          total_cost?: number | null
          total_selling_price?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          order: number | null
          product_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          order?: number | null
          product_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          order?: number | null
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "public_products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost_thb: number
          created_at: string | null
          description: string | null
          exchange_rate: number
          id: number
          image: string
          import_cost: number
          link: string | null
          name: string
          options: Json | null
          price_yuan: number
          quantity: number
          selling_price: number
          shipment_date: string | null
          shipping_fee: string | null
          sku: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cost_thb?: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number
          id?: number
          image: string
          import_cost?: number
          link?: string | null
          name: string
          options?: Json | null
          price_yuan?: number
          quantity?: number
          selling_price?: number
          shipment_date?: string | null
          shipping_fee?: string | null
          sku: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost_thb?: number
          created_at?: string | null
          description?: string | null
          exchange_rate?: number
          id?: number
          image?: string
          import_cost?: number
          link?: string | null
          name?: string
          options?: Json | null
          price_yuan?: number
          quantity?: number
          selling_price?: number
          shipment_date?: string | null
          shipping_fee?: string | null
          sku?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
          username: string | null
          wishlist: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          username?: string | null
          wishlist?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          username?: string | null
          wishlist?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_products: {
        Row: {
          category: string | null
          description: string | null
          id: number | null
          image: string | null
          name: string | null
          options: Json | null
          selling_price: number | null
          shipment_date: string | null
          sku: string | null
          "status TEXT DEFAULT": string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: number | null
          image?: string | null
          name?: string | null
          options?: Json | null
          selling_price?: number | null
          shipment_date?: string | null
          sku?: string | null
          "status TEXT DEFAULT"?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: number | null
          image?: string | null
          name?: string | null
          options?: Json | null
          selling_price?: number | null
          shipment_date?: string | null
          sku?: string | null
          "status TEXT DEFAULT"?: string | null
        }
        Relationships: []
      }
      publice_orders: {
        Row: {
          admin_notes: string | null
          deposit: number | null
          id: number | null
          item: string | null
          item_json: string | null
          order_date: string | null
          payment_date: string | null
          photo: string | null
          price: string | null
          qty: string | null
          sku: string | null
          status: string | null
          tracking_number: string | null
          username: string | null
        }
        Insert: {
          admin_notes?: string | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          order_date?: string | null
          payment_date?: string | null
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          tracking_number?: string | null
          username?: string | null
        }
        Update: {
          admin_notes?: string | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          order_date?: string | null
          payment_date?: string | null
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          tracking_number?: string | null
          username?: string | null
        }
        Relationships: []
      }
      publine_orders: {
        Row: {
          balance: number | null
          deposit: number | null
          id: number | null
          item: string | null
          item_json: string | null
          photo: string | null
          price: string | null
          qty: string | null
          sku: string | null
          status: string | null
          username: string | null
        }
        Insert: {
          balance?: number | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          username?: string | null
        }
        Update: {
          balance?: number | null
          deposit?: number | null
          id?: number | null
          item?: never
          item_json?: never
          photo?: never
          price?: never
          qty?: never
          sku?: never
          status?: string | null
          username?: string | null
        }
        Relationships: []
      }
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

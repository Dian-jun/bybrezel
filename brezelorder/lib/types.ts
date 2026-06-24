export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type StaffCallType =
  | "call_staff"
  | "request_bill"
  | "request_water"
  | "need_help";

export type TableSessionStatus =
  | "open"
  | "checkout_requested"
  | "paid"
  | "closed";

export type UserRole = "owner" | "staff";
export type RestaurantMembershipRole = "owner" | "manager" | "staff";
export type RestaurantPermission =
  | "can_manage_menu"
  | "can_manage_tables"
  | "can_manage_qr"
  | "can_manage_staff"
  | "can_view_analytics"
  | "can_manage_settings"
  | "can_manage_orders";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          restaurant_id: string | null;
          full_name: string | null;
          email: string | null;
          role: UserRole;
          is_platform_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          restaurant_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          is_platform_admin?: boolean;
        };
        Update: {
          restaurant_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          is_platform_admin?: boolean;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          slug: string;
          address: string | null;
          logo_url: string | null;
          floorplan_image_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          steuer_number: string | null;
          iban: string | null;
          is_live: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          owner_user_id: string;
          name: string;
          slug: string;
          address?: string | null;
          logo_url?: string | null;
          floorplan_image_url?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          steuer_number?: string | null;
          iban?: string | null;
          is_live?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
      };
      restaurant_memberships: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          role: RestaurantMembershipRole;
          permissions: Record<RestaurantPermission, boolean>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          user_id: string;
          role?: RestaurantMembershipRole;
          permissions?: Record<RestaurantPermission, boolean>;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_memberships"]["Insert"]>;
      };
      restaurant_service_days: {
        Row: {
          id: string;
          restaurant_id: string;
          service_date: string;
          opened_at: string;
          closed_at: string | null;
          opened_by_user_id: string | null;
          closed_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          service_date: string;
          opened_at?: string;
          closed_at?: string | null;
          opened_by_user_id?: string | null;
          closed_by_user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_service_days"]["Insert"]>;
      };
      restaurant_tables: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          code: string;
          seats: number | null;
          assigned_membership_id: string | null;
          sort_order: number;
          pos_x: number;
          pos_y: number;
          pos_w: number;
          pos_h: number;
          pos_rotation: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          name: string;
          code: string;
          seats?: number | null;
          assigned_membership_id?: string | null;
          sort_order?: number;
          pos_x?: number;
          pos_y?: number;
          pos_w?: number;
          pos_h?: number;
          pos_rotation?: number;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_tables"]["Insert"]>;
      };
      table_sessions: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          service_day_id: string | null;
          status: TableSessionStatus;
          opened_at: string;
          checkout_requested_at: string | null;
          paid_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          table_id: string;
          service_day_id?: string | null;
          status?: TableSessionStatus;
          opened_at?: string;
          checkout_requested_at?: string | null;
          paid_at?: string | null;
          closed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["table_sessions"]["Insert"]>;
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          name_ko: string | null;
          description: string | null;
          description_ko: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          name: string;
          name_ko?: string | null;
          description?: string | null;
          description_ko?: string | null;
          sort_order?: number;
          is_visible?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["menu_categories"]["Insert"]>;
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          name_ko: string | null;
          description: string | null;
          description_ko: string | null;
          image_url: string | null;
          price_cents: number;
          is_visible: boolean;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          category_id: string;
          name: string;
          name_ko?: string | null;
          description?: string | null;
          description_ko?: string | null;
          image_url?: string | null;
          price_cents: number;
          is_visible?: boolean;
          is_available?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
      };
      menu_item_variants: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          name_ko: string | null;
          price_cents: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          menu_item_id: string;
          name: string;
          name_ko?: string | null;
          price_cents: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["menu_item_variants"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          status: OrderStatus;
          notes: string | null;
          guest_name: string | null;
          guest_email: string | null;
          receipt_email_sent_at: string | null;
          served_at: string | null;
          served_by_membership_id: string | null;
          service_day_id: string | null;
          table_session_id: string | null;
          guest_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          table_id: string;
          status?: OrderStatus;
          notes?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          receipt_email_sent_at?: string | null;
          served_at?: string | null;
          served_by_membership_id?: string | null;
          service_day_id?: string | null;
          table_session_id?: string | null;
          guest_token?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          menu_item_variant_id: string | null;
          name_snapshot: string;
          variant_name_snapshot: string | null;
          price_cents_snapshot: number;
          quantity: number;
          item_note: string | null;
          allergy_note: string | null;
          created_at: string;
        };
        Insert: {
          order_id: string;
          menu_item_id: string;
          menu_item_variant_id?: string | null;
          name_snapshot: string;
          variant_name_snapshot?: string | null;
          price_cents_snapshot: number;
          quantity: number;
          item_note?: string | null;
          allergy_note?: string | null;
        };
        Update: {
          quantity?: number;
          item_note?: string | null;
          allergy_note?: string | null;
        };
      };
      staff_calls: {
        Row: {
          id: string;
          restaurant_id: string;
          table_id: string;
          call_type: StaffCallType;
          status: "open" | "completed";
          message: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          completed_by_membership_id: string | null;
          service_day_id: string | null;
          table_session_id: string | null;
          guest_token: string | null;
        };
        Insert: {
          restaurant_id: string;
          table_id: string;
          call_type: StaffCallType;
          status?: "open" | "completed";
          message?: string | null;
          completed_at?: string | null;
          completed_by_membership_id?: string | null;
          service_day_id?: string | null;
          table_session_id?: string | null;
          guest_token?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["staff_calls"]["Insert"]>;
      };
      pricing_inquiries: {
        Row: {
          id: string;
          restaurant_name: string;
          city: string | null;
          contact_name: string;
          email: string;
          phone: string | null;
          desired_plan: string;
          table_count: number | null;
          status: "new" | "contacted" | "qualified" | "won" | "lost";
          source: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          restaurant_name: string;
          city?: string | null;
          contact_name: string;
          email: string;
          phone?: string | null;
          desired_plan: string;
          table_count?: number | null;
          status?: "new" | "contacted" | "qualified" | "won" | "lost";
          source?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["pricing_inquiries"]["Insert"]>;
      };
    };
  };
};

export type RestaurantWithOwner = Database["public"]["Tables"]["restaurants"]["Row"] & {
  users: Database["public"]["Tables"]["users"]["Row"] | null;
};

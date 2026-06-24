import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AnalyticsOrder = {
  id: string;
  status: "new" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
  guest_name: string | null;
  notes: string | null;
  created_at: string;
  served_at?: string | null;
  restaurant_tables?: { name?: string | null } | null;
  order_items: Array<{
    id: string;
    menu_item_id?: string | null;
    name_snapshot: string;
    variant_name_snapshot?: string | null;
    price_cents_snapshot: number;
    quantity: number;
  }>;
};

export type AnalyticsCall = {
  id: string;
  call_type: "call_staff" | "request_bill" | "request_water" | "need_help";
  status: "open" | "completed";
  created_at: string;
  restaurant_tables?: { name?: string | null } | null;
};

export type AnalyticsCategory = {
  id: string;
  name: string;
  menu_items?: Array<{
    id: string;
    name: string;
    is_available: boolean;
    price_cents: number;
  }>;
};

export async function getRestaurantAnalyticsData(restaurantId: string) {
  const supabase = createServerSupabaseClient();

  const [{ data: orders }, { data: calls }, { data: categories }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, guest_name, notes, created_at, served_at, restaurant_tables(name), order_items(*)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("staff_calls")
      .select("id, call_type, status, created_at, restaurant_tables(name)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("menu_categories")
      .select("id, name, menu_items(id, name, is_available, price_cents)")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true })
  ]);

  return {
    orders: (orders ?? []) as AnalyticsOrder[],
    calls: (calls ?? []) as AnalyticsCall[],
    categories: (categories ?? []) as AnalyticsCategory[]
  };
}

export function getOrderRevenueCents(order: Pick<AnalyticsOrder, "order_items">) {
  return (order.order_items ?? []).reduce(
    (sum, item) => sum + item.price_cents_snapshot * item.quantity,
    0
  );
}

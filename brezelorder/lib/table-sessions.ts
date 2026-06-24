import type { Database } from "@/lib/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type TableSession = Database["public"]["Tables"]["table_sessions"]["Row"];

export async function getOpenTableSession(restaurantId: string, tableId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("table_id", tableId)
    .is("closed_at", null)
    .order("opened_at", { ascending: false })
    .maybeSingle<TableSession>();

  return data ?? null;
}

export async function ensureOpenTableSession(
  restaurantId: string,
  tableId: string,
  serviceDayId?: string | null
) {
  const supabase = createServiceRoleSupabaseClient();
  const existing = await getOpenTableSession(restaurantId, tableId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("table_sessions")
    .insert({
      restaurant_id: restaurantId,
      table_id: tableId,
      service_day_id: serviceDayId ?? null,
      status: "open"
    })
    .select("*")
    .single<TableSession>();

  if (error) {
    const retry = await getOpenTableSession(restaurantId, tableId);
    if (retry) return retry;
    throw error;
  }

  return data;
}

export async function markTableSessionCheckoutRequested(sessionId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("table_sessions")
    .update({
      status: "checkout_requested",
      checkout_requested_at: new Date().toISOString()
    })
    .eq("id", sessionId)
    .is("closed_at", null)
    .select("*")
    .maybeSingle<TableSession>();

  if (error) throw error;
  return data ?? null;
}

export async function closeTableSession(
  sessionId: string,
  status: "paid" | "closed" = "paid"
) {
  const supabase = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("table_sessions")
    .update({
      status,
      paid_at: status === "paid" ? now : null,
      closed_at: now
    })
    .eq("id", sessionId)
    .is("closed_at", null)
    .select("*")
    .maybeSingle<TableSession>();

  if (error) throw error;
  return data ?? null;
}

export async function closeOpenTableSessionsForRestaurant(restaurantId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("table_sessions")
    .update({
      status: "closed",
      closed_at: now
    })
    .eq("restaurant_id", restaurantId)
    .is("closed_at", null);

  if (error) throw error;
}

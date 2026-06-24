import type { Database } from "@/lib/types";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type ServiceDay = Database["public"]["Tables"]["restaurant_service_days"]["Row"];

function getBerlinDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export async function getOpenServiceDay(restaurantId: string) {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("restaurant_service_days")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("closed_at", null)
    .order("opened_at", { ascending: false })
    .maybeSingle<ServiceDay>();

  return data ?? null;
}

export async function ensureOpenServiceDay(
  restaurantId: string,
  openedByUserId?: string | null
) {
  const supabase = createServiceRoleSupabaseClient();
  const existing = await getOpenServiceDay(restaurantId);
  if (existing) return existing;

  const serviceDate = getBerlinDateKey();
  const payloads = [
    {
      restaurant_id: restaurantId,
      service_date: serviceDate,
      opened_by_user_id: openedByUserId ?? null
    },
    {
      restaurant_id: restaurantId,
      service_date: serviceDate
    }
  ];

  let lastError: unknown = null;

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("restaurant_service_days")
      .insert(payload as any)
      .select("*")
      .single<ServiceDay>();

    if (!error && data) {
      return data;
    }

    lastError = error;

    const retry = await getOpenServiceDay(restaurantId);
    if (retry) return retry;
  }

  throw lastError;
}

export async function closeOpenServiceDay(
  restaurantId: string,
  closedByUserId?: string | null
) {
  const supabase = createServiceRoleSupabaseClient();
  const existing = await getOpenServiceDay(restaurantId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const payloads = [
    {
      closed_at: now,
      closed_by_user_id: closedByUserId ?? null
    },
    {
      closed_at: now
    }
  ];

  let lastError: unknown = null;

  for (const payload of payloads) {
    const { data, error } = await supabase
      .from("restaurant_service_days")
      .update(payload as any)
      .eq("id", existing.id)
      .select("*")
      .single<ServiceDay>();

    if (!error) {
      return data;
    }

    lastError = error;
  }

  throw lastError;
}

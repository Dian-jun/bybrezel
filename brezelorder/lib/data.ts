import { cache } from "react";
import { redirect } from "next/navigation";

import type { Database, RestaurantPermission } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
});

export const getCurrentMembership = cache(async () => {
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single<Database["public"]["Tables"]["users"]["Row"]>();

  return data ?? null;
});

export async function isPlatformAdmin() {
  const membership = await getCurrentMembership();
  return membership?.is_platform_admin ?? false;
}

export async function getCurrentRestaurantMembership(restaurantId: string) {
  const authUser = await getCurrentUser();
  if (!authUser) return null;

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurant_memberships")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", authUser.id)
    .single<Database["public"]["Tables"]["restaurant_memberships"]["Row"]>();

  return data ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRestaurantContext() {
  await requireAuth();

  const userRecord = await getCurrentMembership();
  if (!userRecord) {
    redirect("/admin/onboarding");
  }

  if (!userRecord.restaurant_id) {
    redirect("/admin/onboarding");
  }

  const supabase = createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", userRecord.restaurant_id)
    .single<Database["public"]["Tables"]["restaurants"]["Row"]>();

  if (!restaurant) {
    redirect("/admin/onboarding");
  }

  const restaurantMembership = await getCurrentRestaurantMembership(restaurant.id);

  return { membership: userRecord, restaurant, restaurantMembership };
}

export async function requireRestaurantPermission(permission: RestaurantPermission) {
  const { restaurant, membership, restaurantMembership } = await requireRestaurantContext();

  if (membership.is_platform_admin) {
    return { restaurant, membership, restaurantMembership };
  }

  if (!restaurantMembership) {
    redirect("/admin?error=permission");
  }

  const hasPermission =
    restaurantMembership.role === "owner" ||
    restaurantMembership.role === "manager" ||
    restaurantMembership.permissions?.[permission];

  if (!hasPermission) {
    redirect("/admin?error=permission");
  }

  return { restaurant, membership, restaurantMembership };
}

export async function getRestaurantSnapshot(restaurantId: string) {
  const supabase = createServerSupabaseClient();
  const { data: currentServiceDay } = await supabase
    .from("restaurant_service_days")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("closed_at", null)
    .order("opened_at", { ascending: false })
    .maybeSingle();

  const [{ data: categories }, { data: tables }, { data: orders }, { data: calls }, { data: memberships }, { data: tableSessions }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*, menu_items(*, menu_item_variants(*))")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true })
        .order("sort_order", { foreignTable: "menu_items", ascending: true })
        .order("sort_order", { foreignTable: "menu_items.menu_item_variants", ascending: true }),
      supabase
        .from("restaurant_tables")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("orders")
        .select("*, restaurant_tables(name), order_items(*)")
        .eq("restaurant_id", restaurantId)
        .eq("service_day_id", currentServiceDay?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("staff_calls")
        .select("*, restaurant_tables(name)")
        .eq("restaurant_id", restaurantId)
        .eq("service_day_id", currentServiceDay?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("restaurant_memberships")
        .select("id, role, user_id, users!inner(id, full_name, email)")
        .eq("restaurant_id", restaurantId),
      supabase
        .from("table_sessions")
        .select("*, restaurant_tables(name, assigned_membership_id)")
        .eq("restaurant_id", restaurantId)
        .eq("service_day_id", currentServiceDay?.id ?? "")
        .is("closed_at", null)
        .order("opened_at", { ascending: false })
    ]);

  const membershipMap = new Map(
    (memberships ?? []).map((membership: any) => [membership.id, membership])
  );

  const enrichedTables = (tables ?? []).map((table: any) => ({
    ...table,
    assigned_membership: table.assigned_membership_id
      ? membershipMap.get(table.assigned_membership_id) ?? null
      : null
  }));

  const enrichedOrders = (orders ?? []).map((order: any) => ({
    ...order,
    served_by_membership: order.served_by_membership_id
      ? membershipMap.get(order.served_by_membership_id) ?? null
      : null,
    restaurant_tables:
      order.restaurant_tables && "name" in order.restaurant_tables
        ? {
            ...order.restaurant_tables,
            assigned_membership: enrichedTables.find((table: any) => table.id === order.table_id)
              ?.assigned_membership ?? null
          }
        : order.restaurant_tables
  }));

  const enrichedCalls = (calls ?? []).map((call: any) => ({
    ...call,
    completed_by_membership: call.completed_by_membership_id
      ? membershipMap.get(call.completed_by_membership_id) ?? null
      : null,
    restaurant_tables:
      call.restaurant_tables && "name" in call.restaurant_tables
        ? {
            ...call.restaurant_tables,
            assigned_membership: enrichedTables.find((table: any) => table.id === call.table_id)
              ?.assigned_membership ?? null
          }
        : call.restaurant_tables
  }));

  const enrichedTableSessions = (tableSessions ?? []).map((session: any) => ({
    ...session,
    restaurant_tables:
      session.restaurant_tables && "name" in session.restaurant_tables
        ? {
            ...session.restaurant_tables,
            assigned_membership: enrichedTables.find((table: any) => table.id === session.table_id)
              ?.assigned_membership ?? null
          }
        : session.restaurant_tables
  }));

  return {
    categories: categories ?? [],
    tables: enrichedTables,
    orders: enrichedOrders,
    calls: enrichedCalls,
    tableSessions: enrichedTableSessions,
    memberships: memberships ?? [],
    currentServiceDay: currentServiceDay ?? null
  };
}

export async function getRestaurantMemberships(restaurantId: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurant_memberships")
    .select("*, users!inner(id, full_name, email)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getPlatformOverview() {
  const supabase = createServerSupabaseClient();
  const [{ data: restaurants }, { data: memberships }, { data: orders }] = await Promise.all([
    supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
    supabase.from("restaurant_memberships").select("*"),
    supabase.from("orders").select("id, restaurant_id, status, created_at")
  ]);

  return {
    restaurants: restaurants ?? [],
    memberships: memberships ?? [],
    orders: orders ?? []
  };
}

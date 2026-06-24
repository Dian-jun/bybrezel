import { NextResponse } from "next/server";

import { ensureOpenServiceDay } from "@/lib/service-days";
import {
  ensureOpenTableSession,
  markTableSessionCheckoutRequested
} from "@/lib/table-sessions";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const restaurantSlug = String(body.restaurantSlug ?? "");
  const tableCode = String(body.tableCode ?? "");
  const callType = String(body.callType ?? "");
  const guestToken = body.guestToken ? String(body.guestToken) : null;
  const message = body.message ? String(body.message) : null;

  if (!restaurantSlug || !tableCode || !callType) {
    return NextResponse.json({ error: "Missing request details." }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", restaurantSlug)
    .eq("is_live", true)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const { data: table } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("code", tableCode)
    .single();

  if (!table) {
    return NextResponse.json({ error: "Table not found." }, { status: 404 });
  }

  const serviceDay = await ensureOpenServiceDay(restaurant.id);
  const tableSession = await ensureOpenTableSession(restaurant.id, table.id, serviceDay.id);

  const { error } = await supabase.from("staff_calls").insert({
    restaurant_id: restaurant.id,
    table_id: table.id,
    service_day_id: serviceDay.id,
    table_session_id: tableSession.id,
    guest_token: guestToken,
    call_type: callType,
    message
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (callType === "request_bill") {
    await markTableSessionCheckoutRequested(tableSession.id);
  }

  return NextResponse.json({ success: true });
}

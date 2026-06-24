import { NextResponse } from "next/server";

import { getCurrentMembership } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const membership = await getCurrentMembership();
  if (!membership?.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const status = String(body.status ?? "");

  const supabase = createServerSupabaseClient();
  const { data: restaurantMembership } = await supabase
    .from("restaurant_memberships")
    .select("id")
    .eq("restaurant_id", membership.restaurant_id)
    .eq("user_id", membership.id)
    .maybeSingle();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      served_at: status === "served" ? new Date().toISOString() : null,
      served_by_membership_id: status === "served" ? restaurantMembership?.id ?? null : null
    })
    .eq("id", params.id)
    .eq("restaurant_id", membership.restaurant_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

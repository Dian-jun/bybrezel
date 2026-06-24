import { NextResponse } from "next/server";

import { getCurrentMembership } from "@/lib/data";
import { closeTableSession } from "@/lib/table-sessions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const membership = await getCurrentMembership();
  if (!membership?.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "paid");

  const supabase = createServerSupabaseClient();
  const { data: session } = await supabase
    .from("table_sessions")
    .select("id, restaurant_id")
    .eq("id", params.id)
    .eq("restaurant_id", membership.restaurant_id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  const nextStatus = action === "close" ? "closed" : "paid";
  const updated = await closeTableSession(session.id, nextStatus);

  await supabase
    .from("staff_calls")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("restaurant_id", membership.restaurant_id)
    .eq("table_session_id", session.id)
    .eq("status", "open");

  return NextResponse.json({ success: true, tableSession: updated });
}

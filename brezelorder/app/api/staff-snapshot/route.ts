import { NextResponse } from "next/server";

import { getCurrentMembership } from "@/lib/data";
import { getRestaurantSnapshot } from "@/lib/data";

export async function GET() {
  const membership = await getCurrentMembership();

  if (!membership?.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getRestaurantSnapshot(membership.restaurant_id);
  return NextResponse.json({
    orders: snapshot.orders,
    calls: snapshot.calls,
    tableSessions: snapshot.tableSessions,
    currentServiceDay: snapshot.currentServiceDay
  });
}

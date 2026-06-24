import { NextResponse } from "next/server";

import { getCurrentMembership } from "@/lib/data";
import { closeOpenServiceDay, ensureOpenServiceDay, getOpenServiceDay } from "@/lib/service-days";
import { closeOpenTableSessionsForRestaurant } from "@/lib/table-sessions";

export async function GET() {
  const membership = await getCurrentMembership();
  if (!membership?.restaurant_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentServiceDay = await getOpenServiceDay(membership.restaurant_id);
  return NextResponse.json({ currentServiceDay });
}

export async function POST(request: Request) {
  try {
    const membership = await getCurrentMembership();
    if (!membership?.restaurant_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action ?? "open");

    if (action === "close") {
      await closeOpenTableSessionsForRestaurant(membership.restaurant_id);
      const closed = await closeOpenServiceDay(
        membership.restaurant_id,
        membership.id
      );
      return NextResponse.json({ currentServiceDay: null, closedServiceDay: closed });
    }

    const currentServiceDay = await ensureOpenServiceDay(
      membership.restaurant_id,
      membership.id
    );
    return NextResponse.json({ currentServiceDay });
  } catch (error) {
    console.error("Service day request failed", error);
    const message =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message ?? "")
        : "";

    return NextResponse.json(
      {
        error: message
          ? `Could not update service day. ${message}`
          : "Could not update service day."
      },
      { status: 500 }
    );
  }
}

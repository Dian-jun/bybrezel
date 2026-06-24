import { NextResponse } from "next/server";

import { sendReceiptEmail } from "@/lib/receipts";
import { ensureOpenServiceDay } from "@/lib/service-days";
import { ensureOpenTableSession } from "@/lib/table-sessions";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type IncomingOrderItem = {
  menuItemId: string;
  variantId?: string | null;
  quantity: number;
  itemNote?: string | null;
  allergyNote?: string | null;
};

async function insertOrderWithFallback(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  payloads: Array<Record<string, unknown>>
) {
  let lastError: any = null;

  for (const payload of payloads) {
    const { data, error } = await supabase.from("orders").insert(payload).select("*").single();
    if (!error && data) return data;
    lastError = error;
  }

  throw lastError;
}

async function insertOrderItemsWithFallback(
  supabase: ReturnType<typeof createServiceRoleSupabaseClient>,
  payloads: Array<Array<Record<string, unknown>>>
) {
  let lastError: any = null;

  for (const payload of payloads) {
    const { error } = await supabase.from("order_items").insert(payload);
    if (!error) return;
    lastError = error;
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const restaurantId = body.restaurantId ? String(body.restaurantId) : "";
    const tableId = body.tableId ? String(body.tableId) : "";
    const restaurantSlug = String(body.restaurantSlug ?? "");
    const tableCode = String(body.tableCode ?? "");
    const guestName = body.guestName ? String(body.guestName) : null;
    const guestEmail = body.guestEmail ? String(body.guestEmail).trim() : null;
    const guestToken = body.guestToken ? String(body.guestToken) : null;
    const notes = body.notes ? String(body.notes) : null;
    const items: IncomingOrderItem[] = Array.isArray(body.items) ? body.items : [];

    const hasDirectIds = Boolean(restaurantId && tableId);
    const hasPublicRoute = Boolean(restaurantSlug && tableCode);

    if ((!hasDirectIds && !hasPublicRoute) || items.length === 0) {
      return NextResponse.json({ error: "Missing order details." }, { status: 400 });
    }

    const supabase = createServiceRoleSupabaseClient();
    const restaurantQuery = supabase.from("restaurants").select("*");
    const { data: restaurant } = hasDirectIds
      ? await restaurantQuery.eq("id", restaurantId).single()
      : await restaurantQuery.eq("slug", restaurantSlug).eq("is_live", true).single();

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    const tableQuery = supabase
      .from("restaurant_tables")
      .select("*")
      .eq("restaurant_id", restaurant.id);
    const { data: table } = hasDirectIds
      ? await tableQuery.eq("id", tableId).single()
      : await tableQuery.eq("code", tableCode).single();

    if (!table) {
      return NextResponse.json({ error: "Table not found." }, { status: 404 });
    }

    const itemIds = items.map((item) => item.menuItemId);
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("*, menu_item_variants(*)")
      .eq("restaurant_id", restaurant.id)
      .in("id", itemIds)
      .eq("is_visible", true)
      .eq("is_available", true);

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({ error: "No valid menu items found." }, { status: 400 });
    }

    const itemMap = new Map(menuItems.map((item) => [item.id, item]));
    const orderItems = items
      .map((item) => ({
        menuItem: itemMap.get(item.menuItemId),
        variant:
          item.variantId && itemMap.get(item.menuItemId)
            ? (itemMap.get(item.menuItemId)?.menu_item_variants ?? []).find(
                (variant: { id: string }) => variant.id === item.variantId
              ) ?? null
            : null,
        quantity: Math.max(1, Number(item.quantity) || 1),
        itemNote: item.itemNote ? String(item.itemNote) : null,
        allergyNote: item.allergyNote ? String(item.allergyNote) : null
      }))
      .filter((item) => item.menuItem);

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Items are unavailable." }, { status: 400 });
    }

    let serviceDayId: string | null = null;
    let tableSessionId: string | null = null;

    try {
      const serviceDay = await ensureOpenServiceDay(restaurant.id);
      serviceDayId = serviceDay.id;

      const tableSession = await ensureOpenTableSession(
        restaurant.id,
        table.id,
        serviceDay.id
      );
      tableSessionId = tableSession.id;
    } catch (sessionError) {
      console.error("Service day or table session setup failed", sessionError);
    }

    const order = await insertOrderWithFallback(supabase, [
      {
        restaurant_id: restaurant.id,
        table_id: table.id,
        service_day_id: serviceDayId,
        table_session_id: tableSessionId,
        guest_token: guestToken,
        notes,
        guest_name: guestName,
        guest_email: guestEmail,
        status: "new"
      },
      {
        restaurant_id: restaurant.id,
        table_id: table.id,
        notes,
        guest_name: guestName,
        guest_email: guestEmail,
        status: "new"
      },
      {
        restaurant_id: restaurant.id,
        table_id: table.id,
        notes,
        guest_name: guestName,
        status: "new"
      }
    ]);

    await insertOrderItemsWithFallback(supabase, [
      orderItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        menu_item_variant_id: item.variant?.id ?? null,
        name_snapshot: item.menuItem.name,
        variant_name_snapshot: item.variant?.name ?? null,
        price_cents_snapshot: item.variant?.price_cents ?? item.menuItem.price_cents,
        quantity: item.quantity,
        item_note: item.itemNote,
        allergy_note: item.allergyNote
      })),
      orderItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        name_snapshot: item.menuItem.name,
        price_cents_snapshot: item.variant?.price_cents ?? item.menuItem.price_cents,
        quantity: item.quantity
      }))
    ]);

    if (guestEmail) {
      try {
        const receiptResult = await sendReceiptEmail({
          restaurant,
          order: {
            id: order.id,
            guest_name: guestName,
            guest_email: guestEmail,
            table_name: table.name,
            created_at: order.created_at,
            items: orderItems.map((item) => ({
              name: item.menuItem.name,
              variantName: item.variant?.name ?? null,
              quantity: item.quantity,
              unitPriceCents: item.variant?.price_cents ?? item.menuItem.price_cents
            }))
          }
        });

        if (receiptResult.sent) {
          await supabase
            .from("orders")
            .update({ receipt_email_sent_at: new Date().toISOString() })
            .eq("id", order.id);
        }
      } catch (receiptError) {
        console.error("Receipt email failed", receiptError);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order submission failed", error);
    const message =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message ?? "")
        : "";
    return NextResponse.json(
      {
        error: message
          ? `Could not submit order right now. ${message}`
          : "Could not submit order right now."
      },
      { status: 500 }
    );
  }
}

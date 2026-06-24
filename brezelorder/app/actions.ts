"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth, requireRestaurantContext, requireRestaurantPermission } from "@/lib/data";
import { getPermissionFlags } from "@/lib/permissions";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

function requiredString(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function requiredNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDefaultTableLayout(sortOrder: number) {
  const index = Math.max(0, sortOrder);
  return {
    pos_x: (index % 4) * 3,
    pos_y: Math.floor(index / 4) * 3,
    pos_w: 2,
    pos_h: 2,
    pos_rotation: 0
  };
}

function buildStripeCheckoutBody({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl
}: {
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("success_url", successUrl);
  body.set("cancel_url", cancelUrl);
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("subscription_data[trial_period_days]", "7");

  if (customerEmail) {
    body.set("customer_email", customerEmail);
  }

  return body;
}

type VariantInput = {
  id?: string;
  name: string;
  nameKo?: string;
  priceEuro: number;
  sortOrder: number;
};

function parseVariants(formData: FormData) {
  const raw = requiredString(formData.get("variantsJson"));
  if (!raw) return [] as VariantInput[];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((variant) => ({
        id: typeof variant.id === "string" ? variant.id : undefined,
        name: String(variant.name ?? "").trim(),
        nameKo: String(variant.nameKo ?? "").trim(),
        priceEuro: Number(variant.priceEuro ?? 0),
        sortOrder: Number(variant.sortOrder ?? 0)
      }))
      .filter((variant) => variant.name);
  } catch {
    return [];
  }
}

async function uploadRestaurantAsset(
  restaurantId: string,
  file: File,
  prefix: string
) {
  const service = createServiceRoleSupabaseClient();
  const extension = file.name.split(".").pop() || "png";
  const filePath = `${restaurantId}/${prefix}-${Date.now()}.${extension}`;

  const { error } = await service.storage
    .from("restaurant-assets")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type
    });

  if (error) return null;

  const { data } = service.storage.from("restaurant-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

async function syncMenuItemVariants(menuItemId: string, variants: VariantInput[]) {
  const supabase = createServerSupabaseClient();
  const { data: existingVariants } = await supabase
    .from("menu_item_variants")
    .select("id")
    .eq("menu_item_id", menuItemId);

  const nextIds = new Set(variants.map((variant) => variant.id).filter(Boolean));
  const deleteIds = (existingVariants ?? [])
    .map((variant) => variant.id)
    .filter((id) => !nextIds.has(id));

  if (deleteIds.length > 0) {
    await supabase.from("menu_item_variants").delete().in("id", deleteIds);
  }

  for (const variant of variants) {
    const payload = {
      menu_item_id: menuItemId,
      name: variant.name,
      name_ko: variant.nameKo || null,
      price_cents: Math.round(variant.priceEuro * 100),
      sort_order: variant.sortOrder
    };

    if (variant.id) {
      await supabase.from("menu_item_variants").update(payload).eq("id", variant.id);
    } else {
      await supabase.from("menu_item_variants").insert(payload);
    }
  }
}

export async function signInAction(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = requiredString(formData.get("email"));
  const password = requiredString(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function signUpAction(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const email = requiredString(formData.get("email"));
  const password = requiredString(formData.get("password"));
  const fullName = requiredString(formData.get("fullName"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await supabase.from("users").upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: "owner"
    });
  }

  redirect("/admin/onboarding");
}

export async function signOutAction() {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function submitPricingInquiryAction(formData: FormData) {
  const service = createServiceRoleSupabaseClient();
  const restaurantName = requiredString(formData.get("restaurantName"));
  const contactName = requiredString(formData.get("contactName"));
  const email = requiredString(formData.get("email")).toLowerCase();

  if (!restaurantName || !contactName || !email) {
    redirect("/pricing?inquiry=missing");
  }

  const { error } = await service.from("pricing_inquiries").insert({
    restaurant_name: restaurantName,
    city: requiredString(formData.get("city")) || null,
    contact_name: contactName,
    email,
    phone: requiredString(formData.get("phone")) || null,
    desired_plan: requiredString(formData.get("desiredPlan")) || "starter",
    table_count: requiredNumber(formData.get("tableCount"), 0) || null,
    source: "pricing-page",
    notes: requiredString(formData.get("message")) || null
  });

  if (error) {
    redirect("/pricing?inquiry=error");
  }

  redirect("/pricing?inquiry=success");
}

export async function startPricingCheckoutAction(formData: FormData) {
  const plan = requiredString(formData.get("plan")).toLowerCase();
  const email = requiredString(formData.get("email")).toLowerCase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const priceId =
    plan === "starter"
      ? process.env.STRIPE_PRICE_STARTER_MONTHLY
      : plan === "team"
        ? process.env.STRIPE_PRICE_TEAM_MONTHLY
        : "";

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !priceId) {
    redirect(`/pricing?checkout=not-ready&plan=${encodeURIComponent(plan)}`);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: buildStripeCheckoutBody({
      priceId,
      customerEmail: email || undefined,
      successUrl: `${baseUrl}/pricing?checkout=success`,
      cancelUrl: `${baseUrl}/pricing?checkout=cancelled`
    })
  });

  if (!response.ok) {
    redirect(`/pricing?checkout=error&plan=${encodeURIComponent(plan)}`);
  }

  const session = (await response.json()) as { url?: string };

  if (!session.url) {
    redirect(`/pricing?checkout=error&plan=${encodeURIComponent(plan)}`);
  }

  redirect(session.url);
}

export async function createRestaurantAction(formData: FormData) {
  const authUser = await requireAuth();
  const supabase = createServerSupabaseClient();

  const name = requiredString(formData.get("name"));
  const slugInput = requiredString(formData.get("slug")) || slugify(name);
  const address = requiredString(formData.get("address"));
  const contactEmail = requiredString(formData.get("contactEmail"));
  const contactPhone = requiredString(formData.get("contactPhone"));

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert({
      owner_user_id: authUser.id,
      name,
      slug: slugInput,
      address,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      is_live: true
    })
    .select("*")
    .single();

  if (error || !restaurant) {
    redirect(`/admin/onboarding?error=${encodeURIComponent(error?.message ?? "Could not create restaurant")}`);
  }

  await supabase.from("users").upsert({
    id: authUser.id,
    restaurant_id: restaurant.id,
    role: "owner"
  });

  await supabase.from("restaurant_memberships").upsert({
    restaurant_id: restaurant.id,
    user_id: authUser.id,
    role: "owner",
    permissions: {
      can_manage_menu: true,
      can_manage_tables: true,
      can_manage_qr: true,
      can_manage_staff: true,
      can_view_analytics: true,
      can_manage_settings: true,
      can_manage_orders: true
    }
  });

  await supabase.from("restaurant_tables").insert([
    {
      restaurant_id: restaurant.id,
      name: "Table 1",
      code: crypto.randomUUID().slice(0, 8),
      sort_order: 1
    },
    {
      restaurant_id: restaurant.id,
      name: "Table 2",
      code: crypto.randomUUID().slice(0, 8),
      sort_order: 2
    }
  ]);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateRestaurantSettingsAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_settings");
  const supabase = createServerSupabaseClient();

  await supabase
    .from("restaurants")
    .update({
      name: requiredString(formData.get("name")),
      address: requiredString(formData.get("address")),
      contact_email: requiredString(formData.get("contactEmail")),
      contact_phone: requiredString(formData.get("contactPhone")),
      steuer_number: requiredString(formData.get("steuerNumber")),
      iban: requiredString(formData.get("iban")),
      is_live: requiredString(formData.get("isLive")) === "on"
    })
    .eq("id", restaurant.id);

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const service = createServiceRoleSupabaseClient();
    const extension = logo.name.split(".").pop() || "png";
    const filePath = `${restaurant.id}/logo-${Date.now()}.${extension}`;

    const { error } = await service.storage
      .from("restaurant-assets")
      .upload(filePath, logo, {
        cacheControl: "3600",
        upsert: true,
        contentType: logo.type
      });

    if (!error) {
      const { data } = service.storage.from("restaurant-assets").getPublicUrl(filePath);
      await supabase
        .from("restaurants")
        .update({
          logo_url: data.publicUrl
        })
        .eq("id", restaurant.id);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/platform");
}

export async function saveRestaurantFloorplanAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_tables");
  const supabase = createServerSupabaseClient();
  const floorplan = formData.get("floorplan");

  if (!(floorplan instanceof File) || floorplan.size === 0) {
    redirect("/admin/tables?toast=floorplan-empty");
  }

  const imageUrl = await uploadRestaurantAsset(restaurant.id, floorplan, "floorplan");

  if (!imageUrl) {
    redirect("/admin/tables?toast=floorplan-failed");
  }

  await supabase
    .from("restaurants")
    .update({ floorplan_image_url: imageUrl })
    .eq("id", restaurant.id);

  revalidatePath("/admin/tables");
  revalidatePath("/pos");
  redirect("/admin/tables?toast=floorplan-saved");
}

export async function createCategoryAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();

  await supabase.from("menu_categories").insert({
    restaurant_id: restaurant.id,
    name: requiredString(formData.get("name")),
    name_ko: requiredString(formData.get("nameKo")) || null,
    description: requiredString(formData.get("description")),
    description_ko: requiredString(formData.get("descriptionKo")) || null,
    sort_order: requiredNumber(formData.get("sortOrder"), 0)
  });

  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=category-created");
}

export async function updateCategoryAction(formData: FormData) {
  await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();
  const categoryId = requiredString(formData.get("categoryId"));

  await supabase
    .from("menu_categories")
    .update({
      name: requiredString(formData.get("name")),
      name_ko: requiredString(formData.get("nameKo")) || null,
      description: requiredString(formData.get("description")),
      description_ko: requiredString(formData.get("descriptionKo")) || null,
      sort_order: requiredNumber(formData.get("sortOrder"), 0),
      is_visible: requiredString(formData.get("isVisible")) === "on"
    })
    .eq("id", categoryId);

  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=category-saved");
}

export async function deleteCategoryAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();
  const categoryId = requiredString(formData.get("categoryId"));

  const { error } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", categoryId)
    .eq("restaurant_id", restaurant.id);

  if (error) {
    const toast =
      error.code === "23503" ? "category-delete-blocked" : "category-delete-failed";
    redirect(`/admin/menu?toast=${toast}&toastType=error`);
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=category-deleted");
}

export async function createMenuItemAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();
  const image = formData.get("image");
  const variants = parseVariants(formData);
  const imageUrl = image instanceof File && image.size > 0
    ? await uploadRestaurantAsset(restaurant.id, image, "menu-item")
    : null;

  const { data: item } = await supabase
    .from("menu_items")
    .insert({
      restaurant_id: restaurant.id,
      category_id: requiredString(formData.get("categoryId")),
      name: requiredString(formData.get("name")),
      name_ko: requiredString(formData.get("nameKo")) || null,
      description: requiredString(formData.get("description")),
      description_ko: requiredString(formData.get("descriptionKo")) || null,
      image_url: imageUrl,
      price_cents: Math.round(requiredNumber(formData.get("priceEuro"), 0) * 100),
      sort_order: requiredNumber(formData.get("sortOrder"), 0)
    })
    .select("id")
    .single();

  if (item) {
    await syncMenuItemVariants(item.id, variants);
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=item-created");
}

export async function updateMenuItemAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();
  const itemId = requiredString(formData.get("itemId"));
  const variants = parseVariants(formData);
  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0
    ? await uploadRestaurantAsset(restaurant.id, image, "menu-item")
    : null;

  const updatePayload: Record<string, string | number | boolean | null> = {
    name: requiredString(formData.get("name")),
    name_ko: requiredString(formData.get("nameKo")) || null,
    description: requiredString(formData.get("description")),
    description_ko: requiredString(formData.get("descriptionKo")) || null,
    price_cents: Math.round(requiredNumber(formData.get("priceEuro"), 0) * 100),
    sort_order: requiredNumber(formData.get("sortOrder"), 0),
    is_visible: requiredString(formData.get("isVisible")) === "on",
    is_available: requiredString(formData.get("isAvailable")) === "on"
  };

  if (imageUrl) {
    updatePayload.image_url = imageUrl;
  }

  await supabase
    .from("menu_items")
    .update(updatePayload)
    .eq("id", itemId);

  await syncMenuItemVariants(itemId, variants);

  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=item-saved");
}

export async function deleteMenuItemAction(formData: FormData) {
  await requireRestaurantPermission("can_manage_menu");
  const supabase = createServerSupabaseClient();

  await supabase.from("menu_items").delete().eq("id", requiredString(formData.get("itemId")));
  revalidatePath("/admin/menu");
  redirect("/admin/menu?toast=item-deleted");
}

export async function createTableAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_tables");
  const supabase = createServerSupabaseClient();
  const sortOrder = requiredNumber(formData.get("sortOrder"), 0);
  const defaultLayout = getDefaultTableLayout(sortOrder);

  await supabase.from("restaurant_tables").insert({
    restaurant_id: restaurant.id,
    name: requiredString(formData.get("name")),
    seats: requiredNumber(formData.get("seats"), 0) || null,
    sort_order: sortOrder,
    pos_x: requiredNumber(formData.get("posX"), defaultLayout.pos_x),
    pos_y: requiredNumber(formData.get("posY"), defaultLayout.pos_y),
    pos_w: Math.max(1, requiredNumber(formData.get("posW"), defaultLayout.pos_w)),
    pos_h: Math.max(1, requiredNumber(formData.get("posH"), defaultLayout.pos_h)),
    pos_rotation: requiredNumber(formData.get("posRotation"), defaultLayout.pos_rotation),
    code: crypto.randomUUID().slice(0, 8)
  });

  revalidatePath("/admin/tables");
  revalidatePath("/admin/qr");
  revalidatePath("/pos");
  redirect("/admin/tables?toast=table-created");
}

export async function updateTableAction(formData: FormData) {
  const { membership, restaurantMembership } = await requireRestaurantPermission("can_manage_tables");
  const supabase = createServerSupabaseClient();
  const permissions = getPermissionFlags(restaurantMembership, membership.is_platform_admin);

  const payload: Record<string, string | number | null> = {
    name: requiredString(formData.get("name")),
    seats: requiredNumber(formData.get("seats"), 0) || null,
    sort_order: requiredNumber(formData.get("sortOrder"), 0)
  };

  const posX = requiredString(formData.get("posX"));
  const posY = requiredString(formData.get("posY"));
  const posW = requiredString(formData.get("posW"));
  const posH = requiredString(formData.get("posH"));

  if (posX) payload.pos_x = Math.max(0, Number(posX) || 0);
  if (posY) payload.pos_y = Math.max(0, Number(posY) || 0);
  if (posW) payload.pos_w = Math.max(1, Number(posW) || 2);
  if (posH) payload.pos_h = Math.max(1, Number(posH) || 2);
  const posRotation = requiredString(formData.get("posRotation"));
  if (posRotation) payload.pos_rotation = Number(posRotation) === 90 ? 90 : 0;

  if (permissions.can_manage_staff) {
    payload.assigned_membership_id = requiredString(formData.get("assignedMembershipId")) || null;
  }

  await supabase
    .from("restaurant_tables")
    .update(payload)
    .eq("id", requiredString(formData.get("tableId")));

  revalidatePath("/admin/tables");
  revalidatePath("/admin/qr");
  revalidatePath("/pos");
  redirect("/admin/tables?toast=table-saved");
}

export async function saveTableLayoutsAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_tables");
  const supabase = createServerSupabaseClient();
  const raw = requiredString(formData.get("layoutsJson"));

  if (!raw) {
    revalidatePath("/admin/tables");
    return;
  }

  let layouts: Array<{
    id: string;
    pos_x: number;
    pos_y: number;
    pos_w: number;
    pos_h: number;
    pos_rotation: number;
  }> = [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      layouts = parsed
        .map((entry) => ({
          id: String(entry.id ?? ""),
          pos_x: Math.max(0, Number(entry.pos_x) || 0),
          pos_y: Math.max(0, Number(entry.pos_y) || 0),
          pos_w: Math.max(1, Number(entry.pos_w) || 1),
          pos_h: Math.max(1, Number(entry.pos_h) || 1),
          pos_rotation: Number(entry.pos_rotation) === 90 ? 90 : 0
        }))
        .filter((entry) => entry.id);
    }
  } catch {
    return;
  }

  const { data: tables } = await supabase
    .from("restaurant_tables")
    .select("id")
    .eq("restaurant_id", restaurant.id);

  const allowedIds = new Set((tables ?? []).map((table) => table.id));

  for (const layout of layouts) {
    if (!allowedIds.has(layout.id)) continue;

    await supabase
      .from("restaurant_tables")
        .update({
          pos_x: layout.pos_x,
          pos_y: layout.pos_y,
          pos_w: layout.pos_w,
          pos_h: layout.pos_h,
          pos_rotation: layout.pos_rotation
        })
      .eq("id", layout.id);
  }

  revalidatePath("/admin/tables");
  revalidatePath("/pos");
  redirect("/admin/tables?toast=layout-saved");
}

export async function deleteTableAction(formData: FormData) {
  await requireRestaurantPermission("can_manage_tables");
  const supabase = createServerSupabaseClient();

  await supabase.from("restaurant_tables").delete().eq("id", requiredString(formData.get("tableId")));

  revalidatePath("/admin/tables");
  revalidatePath("/admin/qr");
  revalidatePath("/pos");
  redirect("/admin/tables?toast=table-deleted");
}

export async function setActiveRestaurantAction(formData: FormData) {
  const authUser = await requireAuth();
  const supabase = createServerSupabaseClient();
  const restaurantId = requiredString(formData.get("restaurantId"));
  const { data: userRecord } = await supabase.from("users").select("is_platform_admin").eq("id", authUser.id).single();
  const { data: membership } = await supabase
    .from("restaurant_memberships")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (!userRecord?.is_platform_admin && !membership) {
    redirect("/platform?error=permission");
  }

  await supabase.from("users").update({ restaurant_id: restaurantId }).eq("id", authUser.id);

  revalidatePath("/admin");
  revalidatePath("/platform");
  redirect("/admin");
}

export async function saveRestaurantMembershipAction(formData: FormData) {
  const { restaurant } = await requireRestaurantPermission("can_manage_staff");
  const supabase = createServerSupabaseClient();
  const email = requiredString(formData.get("email")).toLowerCase();
  const role = requiredString(formData.get("role"), "staff");
  const membershipId = requiredString(formData.get("membershipId"));

  const permissions = {
    can_manage_menu: requiredString(formData.get("canManageMenu")) === "on",
    can_manage_tables: requiredString(formData.get("canManageTables")) === "on",
    can_manage_qr: requiredString(formData.get("canManageQr")) === "on",
    can_manage_staff: requiredString(formData.get("canManageStaff")) === "on",
    can_view_analytics: requiredString(formData.get("canViewAnalytics")) === "on",
    can_manage_settings: requiredString(formData.get("canManageSettings")) === "on",
    can_manage_orders: requiredString(formData.get("canManageOrders")) === "on"
  };

  if (membershipId) {
    await supabase
      .from("restaurant_memberships")
      .update({ role, permissions })
      .eq("id", membershipId);
  } else {
    const { data: userRecord } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!userRecord) {
      redirect("/admin/team?toast=member-not-found&toastType=error");
    }

    await supabase.from("restaurant_memberships").upsert({
      restaurant_id: restaurant.id,
      user_id: userRecord.id,
      role,
      permissions
    });
  }

  revalidatePath("/admin/team");
  redirect("/admin/team?toast=member-saved");
}

# Brezel Order

Brezel Order is a mobile-first QR ordering MVP for German restaurants. It focuses on the real operational gap many restaurants have right now: guests want faster service, but restaurants do not want to replace their POS, payment terminal, or accounting workflow.

The MVP includes:

- Premium SaaS landing page
- Owner authentication with Supabase Auth
- Restaurant onboarding and settings
- Menu category and item management
- Table management with per-table QR links
- Bulk QR PDF export and single PNG downloads
- Guest ordering without login
- Guest staff requests for service, bill, water, and help
- Realtime staff dashboard using Supabase Realtime

## Product architecture

- Frontend: Next.js App Router with TypeScript
- Styling: Tailwind CSS
- Backend and auth: Supabase
- Database: PostgreSQL on Supabase
- Hosting: Vercel
- Realtime: Supabase Realtime on `orders` and `staff_calls`
- QR generation: `qrcode`
- PDF export: `jspdf`

## Why this architecture

- It keeps the MVP small enough to launch within weeks.
- It uses managed infrastructure that a small team can operate.
- It avoids brittle integrations before product-market fit.
- It supports secure owner workflows and public guest flows with minimal moving parts.

## Folder structure

```text
app/
  admin/
    onboarding/
    menu/
    tables/
    qr/
  api/
    orders/
    staff-calls/
    staff-snapshot/
  login/
  r/[restaurantSlug]/table/[tableCode]/
  staff/
components/
  auth/
  guest/
  qr/
  staff/
  ui/
lib/
  supabase/
supabase/
  migrations/
```

## Database schema

Core tables:

- `users`: maps Supabase Auth users to restaurant membership and role
- `restaurants`: restaurant profile and live status
- `restaurant_tables`: dining room tables with unique QR codes
- `menu_categories`: guest-facing menu groups
- `menu_items`: menu entries with visibility and availability
- `orders`: submitted guest orders
- `order_items`: immutable order line item snapshots
- `staff_calls`: service requests from guests

Important design choices:

- Prices are stored in cents to avoid floating point issues.
- Order items snapshot the item name and price at order time.
- Visibility and availability are separate so owners can keep items hidden or temporarily unavailable.
- Public guest reads are restricted to live restaurants and visible menu content.

## Local setup

1. Create a new Supabase project.
2. In the Supabase SQL editor, run [supabase/migrations/001_init.sql](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/supabase/migrations/001_init.sql).
3. Then run [supabase/migrations/002_api_grants.sql](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/supabase/migrations/002_api_grants.sql).
4. Run any later feature migrations you need, including [supabase/migrations/003_menu_images_and_variants.sql](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/supabase/migrations/003_menu_images_and_variants.sql), [supabase/migrations/004_permissions_receipts_platform.sql](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/supabase/migrations/004_permissions_receipts_platform.sql), and [supabase/migrations/008_pricing_inquiries.sql](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/supabase/migrations/008_pricing_inquiries.sql).
5. Copy [.env.example](/Users/kim_dian/Documents/Codex/2026-06-13/you-are-a-senior-saas-architect/.env.example) to `.env.local`.
6. Fill in:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
RECEIPT_FROM_EMAIL=...
STRIPE_SECRET_KEY=...
STRIPE_PRICE_STARTER_MONTHLY=...
STRIPE_PRICE_TEAM_MONTHLY=...
```

7. In Supabase Auth settings, disable email confirmation for the first MVP if you want immediate owner signup.
8. Install dependencies:

```bash
npm install
```

9. Start the app:

```bash
npm run dev
```

If development styling or module loading looks stale, use the clean restart command:

```bash
npm run clean-dev
```

This command:

- stops old local dev servers on ports `3000`, `3001`, and `3002`
- clears the `.next` cache
- starts a fresh Next.js dev server again

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the same environment variables from `.env.local`.
4. Deploy.

### Supabase

1. Keep row level security enabled.
2. Verify the `restaurant-assets` storage bucket exists.
3. Confirm `orders` and `staff_calls` are part of the `supabase_realtime` publication.

## MVP workflow

### Owner setup

1. Create account at `/login`
2. Create restaurant at `/admin/onboarding`
3. Add menu categories and items at `/admin/menu`
4. Add tables at `/admin/tables`
5. Generate and print QR codes at `/admin/qr`

### Sales flow

1. Marketing visitors land on `/`
2. Pricing and conversion happens at `/pricing`
3. Sales inquiries from the pricing form are stored in `pricing_inquiries`
4. If Stripe keys are configured, Starter and Team can open Stripe Checkout directly

### Guest ordering

1. Guest scans `/r/[restaurantSlug]/table/[tableCode]`
2. Guest browses the live menu
3. Guest submits order or sends a service request
4. Staff dashboard updates instantly

### Staff service

1. Staff opens `/staff`
2. New orders appear immediately
3. Staff moves orders through `new`, `accepted`, `preparing`, and `served`
4. Staff resolves service requests as they are completed

## Notes for the first paying restaurant

- Keep the first rollout operationally simple.
- Use the owner account for staff dashboard access in the MVP, or create additional `users` rows with role `staff`.
- Print laminated QR codes and keep one spare set behind the counter.
- Start with 10 to 20 menu items, not the full POS menu, to reduce setup time and support adoption.

## Next practical improvements after MVP

- Add multilingual menu content for tourists
- Add kitchen printer or simple webhook notifications
- Add optional staff PIN login
- Add analytics for top tables, top items, and request volume

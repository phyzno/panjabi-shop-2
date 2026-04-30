# Punjabi Shop - Claude Code Context

## Project Overview
Custom Panjabi e-commerce website for the Bangladeshi market. Supports both panjabi and shirt customization with Bengali language support.

## Tech Stack
- **Framework**: Next.js 15.5.15 (App Router)
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4, Base UI, Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom admin auth via cookies (admin_session)
- **State**: Zustand
- **Language**: TypeScript

## Project Structure
```
app/
  layout.tsx          # Root layout with html/body, Header, Footer
  page.tsx             # Home page
  shop/page.tsx         # Product listing
  customize/[id]/page.tsx  # Product customization
  cart/page.tsx          # Shopping cart
  checkout/page.tsx      # Checkout flow
  admin/
    layout.tsx           # Admin base layout (no auth check)
    login/page.tsx        # Admin login (client component)
    (protected)/         # Route group - protected admin pages
      layout.tsx         # Auth check + admin header
      page.tsx            # Dashboard (orders list)
      products/
        page.tsx         # Manage products (CRUD)
        edit/[id]/page.tsx  # Edit product
      fabrics/
        page.tsx         # Manage fabrics (CRUD)
        edit/[id]/page.tsx  # Edit fabric
      collars/
        page.tsx         # Manage collars (CRUD)
        edit/[id]/page.tsx  # Edit collar
lib/
  actions/
    admin.ts             # Server actions for admin (login, logout, CRUD)
    auth.ts              # User auth actions
    orders.ts            # Order-related actions
  utils/supabase/
    client.ts            # Browser client (client components)
    server.ts            # Server client (server components/actions)
    middleware.ts        # Supabase session refresh middleware
middleware.ts           # Root middleware (runs on all routes)
```

## Key Patterns

### Admin Auth
- Cookie-based: `admin_session=true` (httpOnly, sameSite: strict)
- Protected routes use `(protected)` route group with auth check in layout
- Login page is OUTSIDE the protected group (no auth required)
- Middleware uses Node.js runtime (`export const runtime = 'nodejs'`)

### Server Actions
- All admin mutations in `lib/actions/admin.ts`
- Pattern: `createClient()` → DB operation → `redirect()`
- Delete operations cascade: e.g., delete order → delete order_items first

### Environment Variables
- Prefix: `NEXT_PUBLIC_` (Next.js convention)
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Admin credentials: hardcoded (`admin`/`admin`) in `loginAdmin` action

### Dynamic Routes (Next.js 15)
- Params are Promises: `params: Promise<{ id: string }>`
- Await in server components: `const { id } = await params`

## Common Tasks
- **Add a new admin page**: Create in `app/admin/(protected)/`, it auto-inherits auth + layout
- **Add CRUD for new entity**: Add server actions to `lib/actions/admin.ts`, create list+edit pages
- **Modify admin layout**: Edit `app/admin/(protected)/layout.tsx`

## Development
```bash
npm run dev          # Start dev server (no Turbopack - Turbopack has chunk loading issues)
npm run build        # Build with Turbopack
npm start            # Start production server
```

## Notes
- Don't use Turbopack (`--turbopack`) - causes chunk loading errors with middleware
- Admin edit pages use `Promise<{ id: string }>` for params (Next.js 15 pattern)
- Supabase env vars must match between `.env.local` and code (`NEXT_PUBLIC_` prefix)

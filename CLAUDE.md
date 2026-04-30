# Punjabi Shop - Claude Code Context

## Overarching Goal
Build a custom Panjabi e-commerce website for the Bangladeshi market. Supports both panjabi and shirt customization with Bengali language support. Admin panel needs full CRUD for products, fabrics, collars, and order management.

## Tech Stack
- **Framework**: Next.js 15.5.15 (App Router)
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4, Base UI, Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom admin auth via cookies (`admin_session`)
- **State**: Zustand
- **Language**: TypeScript
- **Skills**: `find-skills` from `vercel-labs/skills` installed at `.agents/skills/` (symlinked to Claude Code)

## Project Structure
```
app/
  layout.tsx              # Root layout with html/body, Header, Footer
  page.tsx                 # Home page
  shop/page.tsx             # Product listing
  customize/[id]/page.tsx  # Product customization
  cart/page.tsx              # Shopping cart
  checkout/page.tsx          # Checkout flow
  admin/
    layout.tsx               # Admin base layout (NO auth check - simple wrapper)
    login/page.tsx            # Admin login (client component, 'use client')
    (protected)/             # Route group - ALL protected admin pages
      layout.tsx             # Auth check + admin header (logout, nav links)
      page.tsx                # Dashboard (orders list with stats)
      products/
        page.tsx             # Manage products (CRUD list)
        edit/[id]/page.tsx    # Edit product form
      fabrics/
        page.tsx             # Manage fabrics (CRUD list)
        edit/[id]/page.tsx    # Edit fabric form
      collars/
        page.tsx             # Manage collars (CRUD list)
        edit/[id]/page.tsx    # Edit collar form
lib/
  actions/
    admin.ts                 # Server actions: login, logout, CRUD for products/fabrics/collars/orders
    auth.ts                  # User auth actions
    orders.ts                # Order-related actions
  utils/supabase/
    client.ts                # Browser client (client components)
    server.ts                # Server client (server components/actions)
    middleware.ts            # Supabase session refresh middleware
middleware.ts               # Root middleware (Node.js runtime, runs on all routes)
```

## Key Technical Decisions Made

### Admin Route Structure (CRITICAL - fixed redirect loop)
- `app/admin/layout.tsx` = simple wrapper with NO auth check
- `app/admin/login/page.tsx` = OUTSIDE protected group (no auth required)
- `app/admin/(protected)/layout.tsx` = auth check + admin header + logout form
- All protected pages go in `app/admin/(protected)/` and inherit auth automatically
- This fixed the 307 redirect loop where layout auth check blocked login page

### Middleware Runtime (CRITICAL - fixed chunk loading errors)
- Added `export const runtime = 'nodejs'` to `middleware.ts`
- Edge runtime + Turbopack caused `ENOENT: no such file or directory` chunk errors
- Turbopack (`--turbopack`) removed from `package.json` dev script entirely

### Next.js 15 Patterns
- Dynamic route params are Promises: `params: Promise<{ id: string }>`
- Await in server components: `const { id } = await params`
- `'use server'` at top of `lib/actions/admin.ts` for server actions
- `export const dynamic = 'force-dynamic'` on all admin pages (cookie-based auth)

### Admin Auth
- Cookie-based: `admin_session=true` (httpOnly, sameSite: strict, path: '/')
- Credentials hardcoded in `loginAdmin`: username=`admin`, password=`admin`
- `loginAdmin(formData)` sets cookie, `logoutAdmin()` deletes cookie
- Protected layout checks cookie and redirects to `/admin/login` if missing

### Server Actions Pattern
- All in `lib/actions/admin.ts`
- Pattern: `createClient()` → DB operation → `redirect()`
- Update actions use `bind(null, id)` to pass ID: `updateProduct.bind(null, id)`
- Delete actions also use bind: `deleteProduct.bind(null, product.id)`
- Cascade deletes: `deleteOrder` → delete `order_items` first, then `orders`

### Environment Variables
- Prefix: `NEXT_PUBLIC_` (Next.js convention)
- `.env.local` has: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Code references `process.env.NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Admin credentials are hardcoded (not in env vars)

## Files Modified This Session

### Created:
- `app/admin/(protected)/layout.tsx` — auth check + admin header
- `app/admin/(protected)/products/edit/[id]/page.tsx` — edit product form
- `app/admin/(protected)/fabrics/edit/[id]/page.tsx` — edit fabric form
- `app/admin/(protected)/collars/edit/[id]/page.tsx` — edit collar form
- `CLAUDE.md` — this file

### Modified:
- `lib/actions/admin.ts` — added `updateProduct`, `updateFabric`, `updateCollar` server actions
- `app/admin/layout.tsx` — simplified to remove auth check (moved to protected layout)
- `app/admin/products/page.tsx` — wired Pencil icon to `/admin/products/edit/${product.id}`
- `app/admin/fabrics/page.tsx` — wired Pencil icon to `/admin/fabrics/edit/${fabric.id}`
- `app/admin/collars/page.tsx` — wired Pencil icon to `/admin/collars/edit/${collar.id}`
- `middleware.ts` — added `export const runtime = 'nodejs'`
- `package.json` — removed `--turbopack` from dev script

### Current State:
- Build succeeds (`npm run build` works with Turbopack)
- Dev server works (`npm run dev` without Turbopack, port 3000)
- Admin login returns 200, dashboard redirects to login (307) without session
- All admin pages return 200 with valid session cookie
- CRUD complete for products, fabrics, collars (create, read, update, delete)
- Edit pages pre-fill forms with existing data from Supabase
- Dev server is currently STOPPED

## Exact Next Steps to Resume

1. **Start dev server**: `npm run dev` (uses port 3000 by default, no Turbopack)
2. **Test admin login**: Visit `http://localhost:3000/admin/login` — should show login form
3. **Login**: Use `admin`/`admin` — should redirect to `/admin` dashboard
4. **Test all CRUD**:
   - Add product/fabric/collar → check list appears
   - Click Pencil icon → should open edit page with pre-filled data
   - Update → should save and redirect back to list
   - Delete → should remove and refresh list
5. **Test order management**: Dashboard shows orders, can mark delivered, can delete
6. **If Supabase connection fails**: Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Development Commands
```bash
npm run dev          # Start dev server (NO Turbopack - removed from script)
npm run build        # Build with Turbopack (works for production builds)
npm start            # Start production server
```

## Notes
- Don't use Turbopack in dev (`--turbopack` flag) — causes chunk loading errors with middleware
- Admin edit pages use `Promise<{ id: string }>` for params (Next.js 15 pattern)
- Supabase env vars: code uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (check spelling matches `.env.local`)
- When adding new admin pages: create in `app/admin/(protected)/` — inherits auth + layout automatically
- `find-skills` skill available for discovering more skills: use `/find-skills` or Skill tool

# Punjabi Shop - Claude Code Context

## Overarching Goal
Build a custom Panjabi e-commerce website for the Bangladeshi market. Supports both panjabi and shirt customization with Bengali language support. Admin panel needs full CRUD for products, fabrics, collars, and order management.

## Tech Stack
- **Framework**: Next.js 15.5.15 (App Router)
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4, Base UI, Lucide React icons
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom admin auth via cookies (`admin_session`) + Supabase user auth
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
  (auth)/                    # User auth route group
    layout.tsx               # Auth layout (bg-[#FAF7F2])
    login/
      page.tsx               # Login page (server component)
      LoginForm.tsx          # Login form (client component)
    signup/
      page.tsx               # Signup page (server component)
      SignupForm.tsx         # Signup form (client component, password strength)
    forgot-password/
      page.tsx               # Forgot password page (server component)
      ForgotPasswordForm.tsx  # Forgot password form (client component)
    (protected)/             # Protected user routes
      layout.tsx             # Auth guard (redirects to /login if no session)
      dashboard/page.tsx     # User dashboard (stats, orders, quick actions)
  auth/
    callback/route.ts        # Supabase email verification callback
    reset-password/page.tsx  # Password reset page
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
    auth.ts                  # User auth actions (signup, signin, signout, reset password)
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

### User Auth Route Structure (CRITICAL - Next.js 15 pattern)
- `app/(auth)/` = route group for all user auth pages
- `app/(auth)/login/`, `signup/`, `forgot-password/` = server components that receive `searchParams` as Promise
- Each auth page has a separate client component (e.g., `LoginForm.tsx`) that receives resolved props
- `app/(auth)/(protected)/layout.tsx` = auth guard checking Supabase session
- This avoids `useSearchParams()` Suspense boundary issues during static prerender

### Middleware Runtime (CRITICAL - fixed chunk loading errors)
- Added `export const runtime = 'nodejs'` to `middleware.ts`
- Edge runtime + Turbopack caused `ENOENT: no such file or directory` chunk errors
- Turbopack (`--turbopack`) removed from `package.json` dev script entirely

### Next.js 15 Patterns
- Dynamic route params are Promises: `params: Promise<{ id: string }>`
- Auth page searchParams: `searchParams: Promise<{ error?: string; message?: string }>`
- Await in server components: `const { id } = await params`
- `'use server'` at top of `lib/actions/admin.ts` and `lib/actions/auth.ts`
- `export const dynamic = 'force-dynamic'` on admin pages (cookie-based auth)

### Admin Auth
- Cookie-based: `admin_session=true` (httpOnly, sameSite: strict, path: '/')
- Credentials hardcoded in `loginAdmin`: username=`admin`, password=`admin`
- `loginAdmin(formData)` sets cookie, `logoutAdmin()` deletes cookie
- Protected layout checks cookie and redirects to `/admin/login` if missing

### User Auth (Supabase)
- Supabase Auth for user registration/login
- Server actions in `lib/actions/auth.ts`: `signUpWithEmail`, `signInWithEmail`, `signOut`, `sendResetEmail`
- Email verification via `/auth/callback` route
- Password reset via `/auth/reset-password`
- Profiles stored in `profiles` table linked to `auth.users`
- Header already has user auth dropdown (avatar, dashboard link, logout)

### Server Actions Pattern
- All in `lib/actions/admin.ts` and `lib/actions/auth.ts`
- Pattern: `createClient()` → DB operation → `redirect()`
- Update actions use `bind(null, id)` to pass ID: `updateProduct.bind(null, id)`
- Delete actions also use bind: `deleteProduct.bind(null, product.id)`
- Cascade deletes: `deleteOrder` → delete `order_items` first, then `orders`

### Environment Variables
- Prefix: `NEXT_PUBLIC_` (Next.js convention)
- `.env.local` has: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- **CRITICAL**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the JWT anon key (not publishable key starting with `sb_publishable_`)
- Admin credentials are hardcoded (not in env vars)
- `NEXT_PUBLIC_SITE_URL=https://punjabi-shop.vercel.app`

## Session Summary (2026-05-01)

### Problem We Fixed:
1. **Login page 404 error** — `/login`, `/signup`, `/dashboard` pages NEVER EXISTED. Previous session stopped before creating them.
2. **Dashboard showed "Account Temporarily Unavailable"** — `.env.local` had wrong `NEXT_PUBLIC_SUPABASE_ANON_KEY` (was `sb_publishable_...` instead of JWT anon key).
3. **Build failures** — `useSearchParams()` caused Suspense boundary errors during static prerender.

### What We Built:
- Complete user authentication system (login, signup, forgot password, reset password, dashboard)
- All auth pages use Next.js 15 pattern: **server component receives `searchParams` as Promise, passes resolved props to client form component**
- Example: `app/(auth)/login/page.tsx` (server) → `LoginForm.tsx` (client) receives `error` and `message` as props
- This avoids `useSearchParams()` Suspense issues

### Critical Fixes:
- Fixed `.env.local`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` changed from publishable key to JWT anon key
- Removed `.playwright-mcp/` directory (25 files: logs + yml snapshots)
- Fixed unescaped apostrophes in JSX (`we'll` → `we&apos;ll`)
- Removed unused imports (`useRouter` in login page)

## Files Created This Session

### User Auth Pages:
- `app/(auth)/layout.tsx` — auth layout with warm bg
- `app/(auth)/login/page.tsx` — login page (server component, Next.js 15 pattern)
- `app/(auth)/login/LoginForm.tsx` — login form (client, server action)
- `app/(auth)/signup/page.tsx` — signup page (server component)
- `app/(auth)/signup/SignupForm.tsx` — signup form (password strength indicator)
- `app/(auth)/forgot-password/page.tsx` — forgot password page
- `app/(auth)/forgot-password/ForgotPasswordForm.tsx` — forgot password form
- `app/(auth)/(protected)/layout.tsx` — auth guard (redirects if no session)
- `app/(auth)/(protected)/dashboard/page.tsx` — user dashboard (stats, orders, quick actions)
- `app/auth/callback/route.ts` — Supabase email verification callback
- `app/auth/reset-password/page.tsx` — password reset page

### Modified:
- `.env.local` — fixed `NEXT_PUBLIC_SUPABASE_ANON_KEY` (was publishable key, now JWT anon key)

### Cleanup:
- Removed `.playwright-mcp/` directory (13 log files + 12 yml snapshots)

## Current State:
- **Build succeeds** (`npm run build` works with Turbopack)
- **Dev server**: currently STOPPED (run `npm run dev` to start)
- **Admin auth**: login returns 200, dashboard redirects to login (307) without session
- **Admin CRUD**: complete for products, fabrics, collars (create, read, update, delete)
- **User auth pages**: all created, wired to server actions, build passes
- **Header**: already has user auth logic (avatar, dropdown, logout)
- **Pending Supabase setup**: `profiles` table, RLS policies, verify `orders.user_email` column

## Exact Next Steps to Resume

1. **Start dev server**: `npm run dev` (uses port 3000 by default, no Turbopack)
2. **Test admin login**: Visit `http://localhost:3000/admin/login` — should show login form
3. **Test user auth flow**:
   - Visit `http://localhost:3000/signup` — create account
   - Check email → click verify link → redirects to `/dashboard`
   - Visit `/login` → sign in → should see dashboard
   - Test logout → should redirect to home
4. **Supabase setup** (run in Supabase dashboard SQL editor):
   ```sql
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     full_name TEXT,
     phone TEXT,
     email TEXT,
     address TEXT,
     city TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
   ```
5. **Push env vars to Vercel**: Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (corrected) and `NEXT_PUBLIC_SITE_URL`
6. **Update Supabase email template**: Set redirect URL to `https://punjabi-shop.vercel.app/auth/callback`

## Development Commands
```bash
npm run dev          # Start dev server (NO Turbopack - removed from script)
npm run build        # Build with Turbopack (works for production builds)
npm start            # Start production server
```

## Notes
- Don't use Turbopack in dev (`--turbopack` flag) — causes chunk loading errors with middleware
- Admin edit pages use `Promise<{ id: string }>` for params (Next.js 15 pattern)
- User auth pages use `Promise<{ error?, message? }>` for searchParams (Next.js 15 pattern)
- Supabase env vars: code uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (check spelling matches `.env.local`)
- When adding new admin pages: create in `app/admin/(protected)/` — inherits auth + layout automatically
- When adding new user auth pages: create in `app/(auth)/` — use server component with Promise searchParams
- `find-skills` skill available for discovering more skills: use `/find-skills` or Skill tool
- Profile table needed in Supabase for user registration to work completely

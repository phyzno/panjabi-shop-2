# Punjabi Shop - Project Context (Gemini CLI)

## Overarching Goal
Build a custom Panjabi e-commerce website for the Bangladeshi market. Supports both panjabi and shirt customization with Bengali language support. Admin panel needs full CRUD for products, fabrics, collars, and order management.

## Tech Stack
- **Framework**: Next.js 15.5.15 (App Router)
- **Runtime**: React 19.1.0
- **Styling**: Tailwind CSS 4, Base UI, Lucide React icons
- **UI Components**: shadcn/ui (Select, Slider, Dialog, DropdownMenu, etc.)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom admin auth via cookies (`admin_session`) + Supabase user auth
- **State**: Zustand (Cart, Wishlist)
- **Language**: TypeScript

## Project Structure
```
app/
  (auth)/                    # User auth route group
    (protected)/             # Protected user routes
      dashboard/
        page.tsx             # User dashboard (stats, orders, measurements)
        measurements/
          page.tsx           # My Measurements list
          MeasurementForm.tsx # Add/Edit measurement modal
        orders/
          page.tsx           # Order history list
    login/                   # Login page
    signup/                  # Signup page
    forgot-password/         # Forgot password page
  (public)/                  # Publicly accessible routes
    shop/page.tsx            # Product listing with filters/sorting
    customize/[id]/page.tsx  # Product customization
    checkout/page.tsx        # Checkout flow with district selection
  admin/                     # Admin panel
    (protected)/             # Protected admin routes (CRUDs)
    login/                   # Admin login
components/
  ui/                        # shadcn/ui components
  shop/                      # Shop-specific components (ProductCard, ShopContent)
  layout/                    # Header, Footer, AnnouncementBar
  dashboard/                 # Dashboard-specific components (WishlistStat)
lib/
  actions/                   # Server Actions
    auth.ts                  # User auth logic
    admin.ts                 # Admin CRUD logic
    measurements.ts          # Measurements CRUD
    orders.ts                # Order placement and fetching
    products.ts              # Product fetching and categories
store/
  cartStore.ts               # Zustand cart state
  wishlistStore.ts           # Zustand wishlist state
```

## Key Technical Patterns
- **Next.js 15 Async APIs**: `params` and `searchParams` are treated as Promises.
- **Base UI Integration**: shadcn components use Base UI; triggers use `render` instead of `asChild` for compatibility.
- **Server Actions**: All database mutations and sensitive fetches are handled via `'use server'` actions.
- **State Management**: Zustand handles client-side state like shopping cart and user wishlist.
- **Form Handling**: Combination of Server Actions and client-side validation/state.

## Session Summary (2026-05-01)
### Improvements Implemented:
1. **User Dashboard**: Created functional subpages for **Measurements** and **Order History**. Measurements support full CRUD operations.
2. **Shop Page**: Refactored to use live data from Supabase. Added client-side filtering (category, price) and sorting.
3. **Wishlist**: Added a global wishlist feature with persistence.
4. **UI Modernization**: Replaced basic HTML selects with accessible **shadcn Select** components. Improved Header profile navigation.
5. **Checkout**: Added a comprehensive district selection dropdown and improved form styling.
6. **Build Success**: Resolved all TypeScript/ESLint errors and unescaped characters.

## Next Steps
1. **RLS Policies**: Verify and tighten Row Level Security in Supabase for `measurements` and `orders`.
2. **Persistence**: Verify Zustand persistence for the wishlist.
3. **Admin Enhancements**: Extend admin dashboard to view detailed customization data for each order item.
4. **Loyalty System**: Implement the planned points system.

## Development Commands
- `npm run dev`: Start development server (no Turbopack for middleware compatibility).
- `npm run build`: Production build and type check.
- `npx shadcn@latest add <component>`: Add new UI components.

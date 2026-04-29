# Punjabi-Shop Project Documentation

> **For AI Agents**: This file contains comprehensive information about the project. Read this before starting any coding task to understand the architecture, dependencies, and conventions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Environment Variables](#environment-variables)
6. [Key Features](#key-features)
7. [Known Issues & Fixes](#known-issues--fixes)
8. [Development Guidelines](#development-guidelines)
9. [Deployment](#deployment)

---

## Project Overview

**Project Name**: Punjabi-Shop (Panjabi Bangladesh)  
**Type**: E-commerce Web Application  
**Purpose**: A premium custom Punjabi stitching service that allows customers to design and order custom-fit Punjabi suits online. Customers can customize fabric, collar, sleeve, buttons, pockets, and provide custom measurements.  
**Target Audience**: Bangladeshi diaspora and international customers seeking authentic Punjabi clothing with custom tailoring.

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.5.15 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.1.0 |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase | - |
| Auth | Supabase Auth | @supabase/ssr |
| State Management | Zustand | 5.0.12 |
| Icons | Lucide React | 1.11.0 |
| Build Tool | Turbopack | (bundled with Next.js) |
| Deployment | Vercel | - |

### Key Dependencies

```json
{
  "@supabase/ssr": "^0.10.2",
  "@supabase/supabase-js": "^2.104.1",
  "next": "15.5.15",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "zustand": "^5.0.12",
  "lucide-react": "^1.11.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0"
}
```

---

## Project Structure

```
Punjabi-Shop/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx       # Login page
│   │   └── register/page.tsx    # Registration page
│   ├── (public)/                # Public routes group
│   │   ├── page.tsx             # Home page
│   │   ├── about/page.tsx       # About page
│   │   ├── cart/page.tsx        # Shopping cart
│   │   ├── checkout/page.tsx    # Checkout page
│   │   ├── customize/[id]/page.tsx  # Product customizer
│   │   ├── faq/page.tsx         # FAQ page
│   │   ├── order-confirmation/[id]/page.tsx  # Order confirmation
│   │   ├── privacy/page.tsx     # Privacy policy
│   │   ├── returns/page.tsx     # Returns policy
│   │   ├── shipping/page.tsx    # Shipping info
│   │   ├── shop/page.tsx        # Shop/Products page
│   │   ├── terms/page.tsx       # Terms of service
│   │   └── track-order/page.tsx  # Order tracking
│   ├── admin/page.tsx           # Admin dashboard
│   ├── dashboard/page.tsx       # User dashboard
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/
│   ├── customizer/              # Customization components
│   │   ├── FabricSwatch.tsx     # Fabric color swatches
│   │   └── PanjabiCanvas.tsx    # Visual preview canvas
│   ├── layout/                  # Layout components
│   │   ├── AnnouncementBar.tsx  # Top announcement bar
│   │   ├── Footer.tsx           # Site footer
│   │   └── Header.tsx           # Site header
│   ├── shop/                    # Shop components
│   │   └── ProductCard.tsx      # Product display card
│   └── ui/                      # UI components (shadcn)
│       └── button.tsx            # Button component
│
├── lib/
│   ├── actions/                 # Server actions
│   │   ├── auth.ts              # Auth actions (login, signup, signout)
│   │   └── orders.ts            # Order actions
│   ├── canvas/                  # Canvas utilities
│   │   ├── fabricPatterns.ts    # Fabric pattern definitions
│   │   └── textureEngine.ts     # Texture rendering
│   ├── supabase/                # Supabase utilities (legacy)
│   └── utils.ts                 # General utilities
│
├── store/
│   └── cartStore.ts             # Zustand cart state management
│
├── supabase/
│   └── migrations/
│       └── 0000_initial_schema.sql  # Database schema
│
├── types/                       # TypeScript type definitions (empty)
│
├── utils/
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       ├── middleware.ts        # Session middleware
│       └── server.ts            # Server Supabase client
│
├── public/
│   └── assets/
│       └── collars/             # Collar style assets
│           └── punjabi/         # Punjabi collar images
│
├── components.json              # shadcn configuration
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── middleware.ts                # Edge middleware
├── package.json                 # Dependencies
├── postcss.config.mjs           # PostCSS configuration
└── eslint.config.mjs            # ESLint configuration
```

---

## Database Schema

### Tables

#### 1. `profiles`
Extends Supabase auth.users with additional user information.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users | User ID |
| full_name | TEXT | | User's full name |
| phone | TEXT | UNIQUE | Contact phone number |
| address | TEXT | | Delivery address |
| city | TEXT | | City |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### 2. `measurements`
Stores user body measurements for custom tailoring.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | UUID | REFERENCES profiles(id) | Owner user |
| label | TEXT | DEFAULT 'My Measurements' | Measurement set name |
| chest | DECIMAL | | Chest measurement |
| shoulder | DECIMAL | | Shoulder width |
| sleeve_length | DECIMAL | | Sleeve length |
| body_length | DECIMAL | | Body length |
| neck | DECIMAL | | Neck circumference |
| waist | DECIMAL | | Waist measurement |
| hip | DECIMAL | | Hip measurement |
| thigh | DECIMAL | | Thigh measurement |
| ankle | DECIMAL | | Ankle measurement |
| is_default | BOOLEAN | DEFAULT false | Default measurement set |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### 3. `fabrics`
Available fabric options for Punjabi customization.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| name | TEXT | NOT NULL | Fabric name |
| name_bn | TEXT | | Bengali name |
| fabric_type | TEXT | NOT NULL | Type (cotton, silk, etc.) |
| description | TEXT | | Fabric description |
| price_per_yard | DECIMAL | NOT NULL | Price per yard |
| color_hex | TEXT | | Color code |
| image_url | TEXT | | Fabric image |
| youtube_url | TEXT | | Video demonstration |
| in_stock | BOOLEAN | DEFAULT true | Availability |
| sort_order | INT | DEFAULT 0 | Display order |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### 4. `design_options`
Customization options (collar, sleeve, buttons, etc.).

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| type | TEXT | NOT NULL | Option type (collar, sleeve, etc.) |
| name | TEXT | NOT NULL | Option name |
| name_bn | TEXT | | Bengali name |
| image_url | TEXT | | Visual preview |
| price_addition | DECIMAL | DEFAULT 0 | Additional cost |
| for_product | TEXT | DEFAULT 'both' | Applicable product type |
| sort_order | INT | DEFAULT 0 | Display order |

#### 5. `products`
Available product types.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| type | TEXT | NOT NULL | Product type |
| category | TEXT | | Product category |
| name | TEXT | NOT NULL | Product name |
| name_bn | TEXT | | Bengali name |
| description | TEXT | | Product description |
| base_price | DECIMAL | NOT NULL | Base price |
| stitching_charge | DECIMAL | DEFAULT 450 | Tailoring charge |
| image_urls | TEXT[] | DEFAULT '{}' | Product images |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### 6. `orders`
Customer orders.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| order_number | TEXT | UNIQUE, NOT NULL | Unique order ID |
| user_id | UUID | REFERENCES profiles(id) | Customer |
| guest_name | TEXT | | Guest customer name |
| guest_phone | TEXT | | Contact phone |
| guest_address | TEXT | | Delivery address |
| guest_city | TEXT | | Delivery city |
| status | TEXT | DEFAULT 'pending' | Order status |
| subtotal | DECIMAL | NOT NULL | Items subtotal |
| stitching_charge | DECIMAL | DEFAULT 0 | Tailoring total |
| delivery_charge | DECIMAL | DEFAULT 60 | Shipping cost |
| total | DECIMAL | NOT NULL | Grand total |
| advance_required | DECIMAL | DEFAULT 0 | Advance payment required |
| advance_paid | DECIMAL | DEFAULT 0 | Advance paid |
| remaining_amount | DECIMAL | | Balance due |
| payment_method | TEXT | | Payment method |
| delivery_address | TEXT | | Full delivery address |
| delivery_city | TEXT | | Delivery city |
| notes | TEXT | | Special instructions |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Order timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update |

#### 7. `order_items`
Individual items in an order.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated |
| order_id | UUID | REFERENCES orders(id) | Parent order |
| product_id | UUID | REFERENCES products(id) | Product |
| product_name | TEXT | NOT NULL | Product name at time of order |
| fabric_id | UUID | REFERENCES fabrics(id) | Selected fabric |
| fabric_name | TEXT | | Fabric name |
| color_hex | TEXT | | Color code |
| color_name | TEXT | | Color name |
| collar_style | TEXT | | Selected collar |
| sleeve_style | TEXT | | Selected sleeve |
| button_style | TEXT | | Selected buttons |
| pocket_style | TEXT | | Selected pocket |
| length_style | TEXT | | Length style |
| size_type | TEXT | | 'standard' or 'custom' |
| standard_size | TEXT | | If standard size selected |
| measurements | JSONB | | Custom measurements |
| special_instructions | TEXT | | Custom instructions |
| quantity | INT | DEFAULT 1 | Item quantity |
| unit_price | DECIMAL | NOT NULL | Price per item |
| total | DECIMAL | NOT NULL | Item total |

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get these values:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key

---

## Key Features

### 1. Product Customization
- Interactive Punjabi customizer with visual canvas
- Fabric selection with color swatches
- Collar style options (Classic, Mandarin, Round, etc.)
- Sleeve style options (Long, Half, Short, etc.)
- Button style options (Knot, Metal, Pearl, etc.)
- Pocket style options
- Length customization

### 2. Size Options
- Standard sizes (S, M, L, XL, XXL)
- Custom measurements input
- Saved measurement profiles for registered users

### 3. Shopping Cart
- Persistent cart using Zustand
- Add/remove items
- Quantity adjustment
- Price calculation with customization options

### 4. Checkout & Orders
- Guest checkout option
- Order confirmation with order number
- Order tracking system

### 5. User Dashboard
- View order history
- Manage saved measurements
- Profile management

### 6. Admin Panel
- View all orders
- Order status management
- Revenue statistics

### 7. Authentication
- Email/password authentication via Supabase
- Session management with middleware
- Protected routes for authenticated users

---

## Known Issues & Fixes

### Issue 1: Type Error in Admin Page (FIXED)

**Error Message**:
```
Type error: Argument of type 'User' is not assignable to parameter of type 'SetStateAction<User | null>'.
Type 'import("/vercel/path0/node_modules/@supabase/auth-js/dist/module/lib/types").User' is not assignable to type 'User'.
Types of property 'email' are incompatible.
Type 'string | undefined' is not assignable to type 'string'.
```

**Root Cause**: The local `User` interface defined in `app/admin/page.tsx` had `email: string` as required, but Supabase's `User` type has `email?: string` (optional).

**Fix Applied**: Changed the local `User` interface to have `email?: string` (optional):

```typescript
interface User {
  id: string
  email?: string  // Made optional to match Supabase User type
  // add other fields if needed
}
```

### Issue 2: Dashboard Dynamic Route Warning

**Warning**: 
```
Route /dashboard couldn't be rendered statically because it used `cookies`.
```

**Status**: This is expected behavior - the dashboard page uses cookies for authentication, so it must be dynamically rendered. This is not an error, just an informational warning showing that the route is dynamic (ƒ) rather than static (○).

---

## Development Guidelines

### Code Style

1. **TypeScript**: Always use explicit types for function parameters and return values
2. **Components**: Use functional components with hooks
3. **Server Components**: Mark with `"use server"` for server actions
4. **Client Components**: Mark with `"use client"` for interactive components

### Naming Conventions

- **Files**: Use kebab-case (e.g., `product-card.tsx`)
- **Components**: Use PascalCase (e.g., `ProductCard`)
- **Functions**: Use camelCase (e.g., `getProducts`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_QUANTITY`)

### Import Aliases

The project uses path aliases configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
```

### State Management

- **Server State**: Use React Server Components and Server Actions
- **Client State**: Use Zustand for global client state (cart, user session)
- **Component State**: Use `useState` and `useEffect` for local state

### UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. The configuration is in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral"
  },
  "iconLibrary": "lucide"
}
```

---

## Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add the following in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**: Vercel will automatically detect Next.js and deploy

### Build Command

```bash
npm run build
# or
next build --turbopack
```

### Build Output

The build produces:
- Optimized production build
- Type checking
- ESLint validation

### Common Deployment Issues

1. **Type Errors**: Ensure all TypeScript types are correct before deploying
2. **Environment Variables**: Verify all required env vars are set in Vercel
3. **Build Cache**: Vercel caches builds; you may need to clear cache for fresh builds

---

## API Reference

### Supabase Client

**Browser Client** (`utils/supabase/client.ts`):
```typescript
import { createClient } from '@/utils/supabase/client'
const supabase = createClient()
```

**Server Client** (`utils/supabase/server.ts`):
```typescript
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()
```

### Server Actions

**Auth Actions** (`lib/actions/auth.ts`):
- `login(formData: FormData)` - User login
- `signup(formData: FormData)` - User registration
- `signOut()` - User logout

---

## Future Enhancements

- Payment gateway integration (Stripe, bKash)
- Order status email notifications
- Admin panel enhancements (product management)
- Review and rating system
- Wishlist functionality
- Multi-language support (English, Bengali)

---

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **Zustand**: https://zustand-demo.pmnd.rs/

---

*Last Updated: April 29, 2026*
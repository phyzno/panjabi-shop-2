# 📚 Punjabi Shop - Complete Project Structure Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [How Data Flows](#how-data-flows)
5. [Authentication Architecture](#authentication-architecture)
6. [Key Development Patterns](#key-development-patterns)
7. [Common Development Commands](#common-development-commands)
8. [Important Files](#important-files)
9. [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

**Punjabi Shop** is an **e-commerce web application** for custom Punjabi (Panjabi) clothing. 

### Key Features:
- Browse and customize Punjabi suits
- Customize fabrics, collars, sleeves, buttons, and pockets
- Input custom measurements
- Place orders with delivery tracking
- Track order status
- User dashboard for measurements and order history
- Admin panel for product management

**Target Users**: Bangladeshi diaspora and international customers seeking authentic Punjabi clothing with custom tailoring.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 15.5.15 (App Router) |
| **Language** | TypeScript 5.x |
| **UI Library** | React 19.1.0 |
| **Styling** | Tailwind CSS 4.x |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (user) + Cookie-based admin auth |
| **State Management** | Zustand 5.0.12 (cart, wishlist) |
| **UI Components** | shadcn/ui (button, select, dialog, etc.) |
| **Icons** | Lucide React 1.11.0 |
| **Deployment** | Vercel |

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

## 📁 Folder Structure

### Root Structure

```
Punjabi-Shop/
├── app/                          # Next.js App Router (Pages & Routes)
├── components/                   # Reusable UI Components
├── lib/                          # Business Logic & Utilities
├── store/                        # Zustand State Management
├── supabase/                     # Database Migrations
├── types/                        # TypeScript Type Definitions
├── utils/                        # Utility Functions
├── public/                       # Static Assets
├── scripts/                      # Development & Build Scripts
├── components.json               # shadcn/ui Configuration
├── next.config.ts                # Next.js Configuration
├── tsconfig.json                 # TypeScript Configuration
├── middleware.ts                 # Edge Middleware
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS Configuration
└── eslint.config.mjs             # ESLint Configuration
```

---

### 📄 `app/` — Next.js App Router (Pages & Routes)

```
app/
├── (auth)/                       # Authentication Route Group
│   ├── (protected)/              # Protected User Routes (Requires Login)
│   │   └── dashboard/            # User Dashboard
│   │       ├── page.tsx          # Main Dashboard (stats, orders, measurements)
│   │       ├── measurements/     # User's Saved Measurements
│   │       │   ├── page.tsx
│   │       │   └── MeasurementForm.tsx
│   │       └── orders/           # Order History
│   │           └── page.tsx
│   ├── login/                    # User Login Page
│   ├── signup/                   # User Registration Page
│   └── forgot-password/          # Password Recovery
│       └── ForgotPasswordForm.tsx
│
├── (public)/                     # Public Route Group (No Login Required)
│   ├── page.tsx                  # Home Page
│   ├── shop/page.tsx             # Product Listing & Browsing
│   ├── customize/[id]/           # Product Customizer
│   ├── checkout/page.tsx         # Checkout & Order Placement
│   ├── order-confirmation/[id]/  # Order Confirmation Page
│   ├── cart/page.tsx             # Shopping Cart
│   ├── track-order/page.tsx      # Order Tracking
│   ├── about/page.tsx            # About Page
│   ├── faq/page.tsx              # FAQ
│   ├── privacy/page.tsx          # Privacy Policy
│   ├── terms/page.tsx            # Terms of Service
│   ├── shipping/page.tsx         # Shipping Information
│   └── returns/page.tsx          # Return Policy
│
├── admin/                        # Admin Panel
│   ├── login/                    # Admin Login Page
│   └── (protected)/              # Protected Admin Routes
│       └── [CRUD pages for products, fabrics, etc.]
│
├── api/                          # API Routes & Webhooks
│   ├── admin/                    # Admin API Endpoints
│   └── resend-verification/      # Email Verification via Resend
│
├── auth/                         # Authentication API Routes
│   ├── callback/                 # OAuth Callback
│   ├── login/                    # Login Endpoint
│   ├── signup/                   # Signup Endpoint
│   ├── forgot-password/          # Password Recovery Endpoint
│   ├── reset-password/           # Password Reset Endpoint
│   └── protected/                # Protected Auth Endpoints
│
├── layout.tsx                    # Root Layout (Header, Footer Wrapper)
└── globals.css                   # Global Tailwind Styles
```

**💡 Key Pattern**: Route groups (folders with parentheses like `(auth)` and `(public)`) organize routes without affecting URLs. They allow shared layouts and better code organization.

**Dynamic Routes**:
- `customize/[id]` → `/customize/123`
- `order-confirmation/[id]` → `/order-confirmation/abc123`

---

### 🎨 `components/` — Reusable UI Components

```
components/
├── ui/                           # shadcn/ui Components
│   ├── button.tsx                # Reusable Button
│   ├── select.tsx                # Dropdown/Select
│   ├── dialog.tsx                # Modal Dialogs
│   ├── input.tsx                 # Text Input
│   ├── card.tsx                  # Card Container
│   ├── slider.tsx                # Range Slider
│   ├── dropdown-menu.tsx         # Dropdown Menus
│   ├── label.tsx                 # Form Labels
│   ├── badge.tsx                 # Status Badges
│   ├── checkbox.tsx              # Checkboxes
│   └── separator.tsx             # Dividers
│
├── layout/                       # Global Layout Components
│   ├── Header.tsx                # Navigation Bar (Logo, Menu, User Profile)
│   ├── Footer.tsx                # Footer Section
│   └── AnnouncementBar.tsx       # Top Announcement Banner
│
├── shop/                         # Shop Feature Components
│   ├── ProductCard.tsx           # Single Product Display Card
│   ├── ShopContent.tsx           # Product List with Filters & Sorting
│
├── customizer/                   # Customization Feature Components
│   ├── PanjabiCanvas.tsx         # Visual 2D/3D Preview of Punjabi
│   ├── FabricSwatch.tsx          # Fabric Color Selection
│   └── CustomizeClient.tsx       # Main Customizer Logic
│
├── dashboard/                    # User Dashboard Components
│   └── WishlistStat.tsx          # Wishlist Statistics Widget
│
└── admin/                        # Admin Panel Components
    ├── ColorPicker.tsx           # Color Selector for Admin
    ├── ImageUpload.tsx           # Image Uploader
    ├── InstantDeleteButton.tsx   # Quick Delete Button
    └── SubmitButton.tsx          # Form Submit Button
```

**💡 Key Pattern**: Components are modular and reusable. UI components are imported from shadcn/ui, which is Base UI compatible.

---

### 📚 `lib/` — Business Logic & Utilities

```
lib/
├── actions/                      # Server Actions (Next.js 15)
│   ├── auth.ts                   # Login, Signup, Logout, Signout Logic
│   ├── products.ts               # Fetch Products, Categories
│   ├── orders.ts                 # Place Order, Fetch Order History
│   ├── measurements.ts           # CRUD for User Measurements
│   └── admin.ts                  # Admin CRUD for Products/Fabrics
│
├── canvas/                       # Canvas/Customization Engine
│   ├── fabricPatterns.ts         # Fabric Texture Definitions
│   └── textureEngine.ts          # Texture Rendering Logic
│
├── supabase/                     # Supabase Utilities (Legacy)
│   └── [utility files]
│
├── catalogPlaceholders.ts        # Placeholder Product Data
├── demoCatalog.ts                # Demo Products for Testing
├── email.ts                      # Email Utilities (Resend Integration)
├── productImages.ts              # Product Image Mappings
└── utils.ts                      # General Helper Functions
```

**💡 Key Pattern**: Server Actions (`'use server'`) handle all database mutations and sensitive operations securely on the server. They prevent exposing secrets or database queries to the client.

---

### 🔄 `utils/supabase/` — Database Client Setup

```
utils/supabase/
├── client.ts                     # Browser-side Supabase Client (Anon Key)
│                                # Use for: Public reads (getProducts)
│
├── server.ts                     # Server-side Supabase Client
│                                # Use for: Protected routes, secure operations
│
├── service.ts                    # Admin/Service Client (Service Role Key)
│                                # Use for: Admin mutations (seed data, etc.)
│
└── middleware.ts                 # Session Refresh Middleware
```

**⚠️ Important**:
- `client.ts` = Uses public anon key, no secrets exposed
- `server.ts` = Uses service role key, hidden from client, only on server
- `service.ts` = Admin operations, requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- `middleware.ts` = Refreshes session on each request

---

### 🎛️ `store/` — Zustand State Management

```
store/
├── cartStore.ts                  # Shopping Cart State
│                                # Manages: items, quantity, total
│                                # Persisted: Yes (localStorage)
│
└── wishlistStore.ts              # User Wishlist State
                                 # Manages: favorited products
                                 # Persisted: Yes (localStorage)
```

**💡 Key Pattern**: Zustand stores are global client-side state with localStorage persistence. Data survives across browser sessions.

---

### 🗄️ `supabase/migrations/` — Database Schema

```
supabase/migrations/
├── 0000_initial_schema.sql       # Initial Database Tables
└── 0001_add_missing_product_columns.sql  # Schema Updates
```

**Key Tables**:
- `profiles` — Extended user information
- `products` — Punjabi products catalog
- `fabrics` — Fabric types and colors
- `collars` — Collar styles
- `buttons` — Button types
- `orders` — Customer orders
- `order_items` — Individual items in orders with customization details
- `measurements` — User body measurements

---

### 📦 `public/assets/` — Static Assets

```
public/
└── assets/
    ├── collars/                  # Collar Style Images
    │   └── punjabi/              # Punjabi Collar Images
    └── punjabi/                  # Punjabi Dress Images
```

---

## 🔄 How Data Flows

### 1. **User Browses Shop**
```
GET /shop
  ↓
ShopContent component renders
  ↓
lib/actions/products.ts → getProducts()
  ↓
Supabase (getProducts with anon key)
  ↓
Display ProductCard components
```

### 2. **User Customizes Item**
```
GET /customize/[id]
  ↓
PanjabiCanvas renders 3D/2D preview
  ↓
User selects: Fabric, Collar, Buttons, Pockets, Sleeves
  ↓
Selection stored in Zustand cartStore (temporary state)
```

### 3. **User Adds to Cart**
```
Click "Add to Cart"
  ↓
cartStore.addItem(customization)
  ↓
Data persisted to localStorage
  ↓
Cart icon updates in Header
```

### 4. **User Checks Out**
```
GET /checkout
  ↓
Collect: Measurements, Shipping Address, District Selection
  ↓
POST → lib/actions/orders.ts → placeOrder()
  ↓
Supabase: Insert into `orders` & `order_items` tables
  ↓
GET /order-confirmation/[id]
  ↓
Display order summary & confirmation
```

### 5. **User Tracks Order**
```
GET /track-order
  ↓
lib/actions/orders.ts → getOrderHistory()
  ↓
Supabase: Query orders table (with RLS policy)
  ↓
Display order status, tracking info
```

### 6. **Admin Manages Products**
```
GET /admin
  ↓
Check admin_session cookie (custom auth)
  ↓
Protected admin pages with CRUD forms
  ↓
lib/actions/admin.ts → Mutations
  ↓
Supabase (using service role key)
  ↓
Create, Update, Delete products/fabrics/collars
```

---

## 🔐 Authentication Architecture

### User Authentication Flow

```
User Registration/Login
  ↓
Supabase Auth handles credentials
  ↓
Session token stored in secure cookie
  ↓
middleware.ts refreshes session on each request
  ↓
utils/supabase/server.ts uses session for protected routes
```

### Admin Authentication Flow

```
Admin Signup (special endpoint)
  ↓
Custom admin_session cookie created
  ↓
Admin routes check for valid admin session
  ↓
Admin operations use service role key
```

| Type | Method | Storage | Use Case |
|------|--------|---------|----------|
| **User Auth** | Supabase Auth | Session cookie | Customers login, place orders |
| **Admin Auth** | Cookie-based | `admin_session` cookie | Admin panel CRUD access |

---

## 📋 Key Development Patterns

### 1. **Server Actions Pattern**

Server Actions run exclusively on the server. They're safe for database access and hiding secrets.

```typescript
// lib/actions/products.ts
'use server'  // ← This tells Next.js to run only on server

export async function getProducts() {
  const supabase = createServerClient();
  return await supabase.from('products').select('*');
}
```

**Benefits**:
- Database queries don't expose connection strings to client
- No API endpoint needed—call like a function
- Automatic CSRF protection
- Automatic authentication context (cookies sent automatically)

---

### 2. **Route Groups (No URL Impact)**

Route groups organize code without affecting URLs. Use parentheses in folder names.

```
app/(public)/shop/page.tsx   → URL: /shop (not /public/shop)
app/(auth)/login/page.tsx    → URL: /login (not /auth/login)
app/(auth)/(protected)/dashboard/page.tsx → URL: /dashboard
```

**Benefits**:
- Organize related routes together
- Share layouts within a group
- Cleaner URL structure

---

### 3. **Zustand Store Pattern**

Global state management with localStorage persistence.

```typescript
// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      }))
    }),
    {
      name: 'cart-storage' // localStorage key
    }
  )
);
```

**Usage in Components**:
```typescript
// In a client component
'use client'
import { useCartStore } from '@/store/cartStore';

export function CartButton() {
  const { items, addItem } = useCartStore();
  return <button onClick={() => addItem(product)}>Add ({items.length})</button>;
}
```

---

### 4. **Dynamic Routes with [id]**

Dynamic segments capture URL parameters.

```
app/(public)/customize/[id]/page.tsx  → /customize/123
app/(public)/order-confirmation/[id]/ → /order-confirmation/abc123

// In page.tsx:
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ← params is a Promise in Next.js 15
  return <div>Product ID: {id}</div>;
}
```

---

### 5. **Async Components Pattern**

Components can be async in Next.js 15 using Server Components.

```typescript
// components/shop/ProductList.tsx
export default async function ProductList() {
  const products = await getProducts();  // ← Direct await
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

### 6. **Client Component Boundaries with 'use client'**

Mark interactivity boundary with `'use client'` at the top.

```typescript
// components/customizer/PanjabiCanvas.tsx
'use client'  // ← This makes the whole file a client component

import { useState } from 'react';

export default function PanjabiCanvas() {
  const [fabric, setFabric] = useState('silk');
  return <canvas ref={...} />;
}
```

---

## 🚀 Common Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed sample catalog data
npm run seed

# Add a new shadcn component
npx shadcn@latest add <component-name>

# Example: Add a new component
npx shadcn@latest add input
npx shadcn@latest add dialog

# Linting
npm run lint

# Type checking
npm run typecheck
```

---

## ⚙️ Important Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Edge middleware that refreshes user sessions on each request |
| `next.config.ts` | Next.js configuration (build settings, redirects, etc.) |
| `components.json` | shadcn/ui configuration (component paths, aliases) |
| `tsconfig.json` | TypeScript compiler configuration (path aliases, strict mode) |
| `postcss.config.mjs` | PostCSS & Tailwind CSS configuration |
| `eslint.config.mjs` | ESLint rules and standards |
| `package.json` | Project dependencies and npm scripts |

---

## 📝 Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Admin only - Service Role Key (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
RESEND_API_KEY=your-resend-api-key

# Optional: Admin email for notifications
ADMIN_EMAIL=admin@example.com
```

**⚠️ Security**: 
- Never commit `.env.local` to Git
- `SUPABASE_SERVICE_ROLE_KEY` is sensitive—only use on server
- `NEXT_PUBLIC_*` variables are exposed to the browser

---

## 💡 Summary for New Developers

### To Understand the Codebase:

1. **Routes & Pages**: Check `app/` folder for route structure
   - Route groups `(auth)` and `(public)` organize pages without affecting URLs
   - Dynamic routes use `[id]` syntax

2. **UI Components**: Reusable components in `components/`
   - shadcn/ui components for consistency
   - Styled with Tailwind CSS

3. **Business Logic**: Server-side logic in `lib/actions/`
   - Server Actions run only on server
   - Use for database access, auth checks

4. **Database**: Supabase PostgreSQL
   - Schema in `supabase/migrations/`
   - RLS policies for row-level security

5. **State Management**: Zustand for client-side state
   - Cart and wishlist with localStorage persistence

6. **Authentication**: Supabase Auth for users + custom cookie auth for admin

### Key Takeaway:
**Punjabi Shop is a full-stack Next.js 15 application** where:
- The **server** handles database operations, auth, and sensitive logic (Server Actions)
- The **client** manages UI state (Zustand) and interactivity
- **Supabase** provides authentication, database, and API services
- **Tailwind CSS & shadcn/ui** ensure consistent, accessible UI

---

## 🔗 Quick Links

- **Tech Docs**: See `PROJECT_DOCS.md` for architecture and schema details
- **Stack & Folder**: See `GEMINI.md` for detailed tech stack info
- **Agent Context**: See `CLAUDE.md` for Supabase and development setup

---

**Last Updated**: May 7, 2026  
**For**: Developer Onboarding

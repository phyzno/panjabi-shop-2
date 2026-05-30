import { pgTable, serial, text, boolean, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";

// ১. Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// ২. Products Table (With multiple sizes, stock, and featured toggle)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  sizes: jsonb("sizes").notNull(), // Example: ["M", "L", "38", "40"]
  stock: jsonb("stock").default({}), // Example: {"M": 15, "L": 8, "40": 20}
  is_featured: boolean("is_featured").default(false),
  images: jsonb("images").notNull(), // Cloudinary URLs array
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ৩. Fabrics Table (For Customizer Canvas)
export const fabrics = pgTable("fabrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  colors: jsonb("colors"), // Example: ["Red", "Navy Blue"]
  patterns: jsonb("patterns"), // Example: ["Solid", "Stripe", "Cotton"]
  yards: real("yards").default(0), // Fabric stock in yards
  texture_url: text("texture_url").notNull(), // Cloudinary Processed Seamless URL
  raw_image_url: text("raw_image_url"), // Cloudinary Raw Uploaded Image
  is_featured: boolean("is_featured").default(false),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ৪. Site Settings (For Offer List, Colors, Patterns & Dynamic Header)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  active_offer_id: text("active_offer_id"), 
  offers: jsonb("offers").default([]), 
  fabric_colors: jsonb("fabric_colors").default([]), // Global Color Checklist
  fabric_patterns: jsonb("fabric_patterns").default([]), // Global Pattern Checklist
  updated_at: timestamp("updated_at").defaultNow(),
});

// ৫. Users Table (Supabase Auth এর সাথে সিঙ্ক করার জন্য)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Supabase থেকে আসা UUID স্ট্রিং হিসেবে সেভ হবে
  name: text("name"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").default("customer"), // admin অথবা customer
  created_at: timestamp("created_at").defaultNow(),
});

// ৬. Saved Measurements Table (ইউজারের কাস্টম টেইলরিং প্রোফাইল)
export const savedMeasurements = pgTable("saved_measurements", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  profile_name: text("profile_name").notNull(), 
  measurements: jsonb("measurements").notNull(), 
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ৭. Wishlists Table (ইউজারের ফেভারিট প্রোডাক্ট)
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  product_id: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

// ৮. Orders Table (Full Order Management)
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // Custom ID like: OLV-2026-001
  user_id: text("user_id").references(() => users.id, { onDelete: "set null" }),
  
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_address: text("customer_address").notNull(),
  
  sub_total: integer("sub_total").notNull(),
  delivery_charge: integer("delivery_charge").notNull(),
  discount: integer("discount").default(0),
  grand_total: integer("grand_total").notNull(),
  
  order_status: text("order_status").default("pending"), // pending, processing, shipped, delivered, canceled, returned
  payment_status: text("payment_status").default("unpaid"), // unpaid, paid, refunded
  is_archived: boolean("is_archived").default(false),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ৯. Order Items Table (Detailed Customized Items)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  product_type: text("product_type").notNull(), // readymade, custom_fabric_only, custom_tailored
  quantity: integer("quantity").notNull(),
  unit_price: integer("unit_price").notNull(),
  
  // নতুন যুক্ত করা কলামগুলো
  stitching_charge: integer("stitching_charge").default(0),
  fabric_id: text("fabric_id"),
  fabric_name: text("fabric_name"),
  
  total_price: integer("total_price").notNull(),
  
  // Sizing & Customizations (Optional/Nullable fields for custom orders)
  size_mode: text("size_mode"), // preset, numbered, custom_measurements
  size_value: text("size_value"), 
  measurements: jsonb("measurements"), // Example: { length: 42, chest: 40, shoulder: 18, sleeve: 24 }
  fabric_yards: real("fabric_yards"), // changed from real to integer based on your previous schema
  collar_type: text("collar_type"),
});
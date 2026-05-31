import { pgTable, serial, text, boolean, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  category_id: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  sizes: jsonb("sizes").notNull(),
  stock: jsonb("stock").default({}),
  is_featured: boolean("is_featured").default(false),
  images: jsonb("images").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const fabrics = pgTable("fabrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  colors: jsonb("colors"),
  patterns: jsonb("patterns"),
  yards: real("yards").default(0),
  texture_url: text("texture_url").notNull(),
  raw_image_url: text("raw_image_url"),
  is_featured: boolean("is_featured").default(false),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  active_offer_id: text("active_offer_id"), 
  offers: jsonb("offers").default([]), 
  fabric_colors: jsonb("fabric_colors").default([]),
  fabric_patterns: jsonb("fabric_patterns").default([]),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").default("customer"),
  created_at: timestamp("created_at").defaultNow(),
});

export const savedMeasurements = pgTable("saved_measurements", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  profile_name: text("profile_name").notNull(), 
  measurements: jsonb("measurements").notNull(), 
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  product_id: integer("product_id").references(() => products.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "set null" }),
  
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_address: text("customer_address").notNull(),
  
  sub_total: integer("sub_total").notNull(),
  delivery_charge: integer("delivery_charge").notNull(),
  discount: integer("discount").default(0),
  grand_total: integer("grand_total").notNull(),
  
  order_status: text("order_status").default("pending"),
  payment_status: text("payment_status").default("unpaid"),
  is_archived: boolean("is_archived").default(false),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  product_type: text("product_type").notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: integer("unit_price").notNull(),
  
  stitching_charge: integer("stitching_charge").default(0),
  fabric_id: text("fabric_id"),
  fabric_name: text("fabric_name"),
  
  total_price: integer("total_price").notNull(),
  
  size_mode: text("size_mode"),
  size_value: text("size_value"), 
  measurements: jsonb("measurements"),
  fabric_yards: real("fabric_yards"),
  collar_type: text("collar_type"),
});
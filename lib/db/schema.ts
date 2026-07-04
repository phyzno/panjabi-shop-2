import { pgTable, serial, text, boolean, integer, jsonb, timestamp, real, AnyPgColumn } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parent_id: integer("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }), // Self-referencing for Sub-categories
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sort_order: integer("sort_order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(), // Changed from serial to text for Custom ID/SKU
  category_id: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  discount_percentage: integer("discount_percentage").default(0), // New field for product specific discount
  sizes: jsonb("sizes").notNull(),
  stock: jsonb("stock").default({}),
  is_featured: boolean("is_featured").default(false),
  images: jsonb("images").notNull(),
  video_url: text("video_url"),

  rating: real("rating").default(4.8), 
  review_count: integer("review_count").default(24), 
  additional_details: jsonb("additional_details").default([]), 
  has_size_guide: boolean("has_size_guide").default(true),
  size_guide_template: text("size_guide_template").default("panjabi"),

  has_price_variation: boolean("has_price_variation").default(false),
  size_prices: jsonb("size_prices").default({}),
  
  // Multi-color Product Variants এর জন্য নতুন ৩টি কলাম
  group_id: text("group_id"), 
  color_name: text("color_name"), 
  color_hex: text("color_hex"), 

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const fabrics = pgTable("fabrics", {
  id: text("id").primaryKey(), // Custom ID/SKU, same contract as products.id
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  discount_percentage: integer("discount_percentage").default(0), // নতুন ফিল্ড ডিসকাউন্টের জন্য
  colors: jsonb("colors"),
  patterns: jsonb("patterns"),
  yards: real("yards").default(0),
  texture_url: text("texture_url").notNull(),
  raw_image_url: text("raw_image_url"),
  
  // নতুন যুক্ত করা কলামগুলো (Products টেবিলের মতো)
  preview_images: jsonb("preview_images").default([]), 
  video_url: text("video_url"),
  group_id: text("group_id"), 
  color_name: text("color_name"), 
  color_hex: text("color_hex"), 
  allowed_products: jsonb("allowed_products").default([]), // ["Panjabi", "Jubba", "Shirt", "Pant", "Pajama"] এর মতো স্ট্রিং রাখার জন্য

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
  person_name: text("person_name").notNull(), 
  fit_name: text("fit_name").notNull(), 
  product_type: text("product_type").notNull(), 
  measurements: jsonb("measurements").notNull(), 
  is_default: boolean("is_default").default(false), // এটি ট্র্যাক করবে নির্দিষ্ট প্রোডাক্টের জন্য Featured Fit
  is_person_default: boolean("is_person_default").default(false), // এটি ট্র্যাক করবে Featured Person
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  product_id: text("product_id").references(() => products.id, { onDelete: "cascade" }), // Changed from integer to text
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
  product_styles: jsonb("product_styles"), 
  tailoring_details: jsonb("tailoring_details"),
  original_unit_price: integer("original_unit_price"),
  discount_percentage: integer("discount_percentage").default(0),
  special_instructions: text("special_instructions"),
});

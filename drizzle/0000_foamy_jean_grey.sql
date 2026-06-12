CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "fabrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"colors" jsonb,
	"patterns" jsonb,
	"yards" real DEFAULT 0,
	"texture_url" text NOT NULL,
	"raw_image_url" text,
	"is_featured" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text,
	"name" text NOT NULL,
	"product_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"stitching_charge" integer DEFAULT 0,
	"fabric_id" text,
	"fabric_name" text,
	"total_price" integer NOT NULL,
	"size_mode" text,
	"size_value" text,
	"measurements" jsonb,
	"fabric_yards" real,
	"collar_type" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_address" text NOT NULL,
	"sub_total" integer NOT NULL,
	"delivery_charge" integer NOT NULL,
	"discount" integer DEFAULT 0,
	"grand_total" integer NOT NULL,
	"order_status" text DEFAULT 'pending',
	"payment_status" text DEFAULT 'unpaid',
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"discount_percentage" integer DEFAULT 0,
	"sizes" jsonb NOT NULL,
	"stock" jsonb DEFAULT '{}'::jsonb,
	"is_featured" boolean DEFAULT false,
	"images" jsonb NOT NULL,
	"group_id" text,
	"color_name" text,
	"color_hex" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"profile_name" text NOT NULL,
	"measurements" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"active_offer_id" text,
	"offers" jsonb DEFAULT '[]'::jsonb,
	"fabric_colors" jsonb DEFAULT '[]'::jsonb,
	"fabric_patterns" jsonb DEFAULT '[]'::jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'customer',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"product_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_measurements" ADD CONSTRAINT "saved_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
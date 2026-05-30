'use server';

import { db } from "@/lib/db";
import { wishlists, products, categories, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// উইশলিস্টে আইটেম যোগ বা রিমুভ করা
export async function toggleWishlistItem(userId: string, productId: number) {
  try {
    const userCheck = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (userCheck.length === 0) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && user.id === userId) {
        await db.insert(users).values({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: 'customer'
        });
      } else {
        return { success: false, error: "Unauthorized" };
      }
    }

    // === মেইন উইশলিস্ট লজিক ===
    const existing = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.user_id, userId), eq(wishlists.product_id, productId)));

    if (existing.length > 0) {
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
    } else {
      await db.insert(wishlists).values({ user_id: userId, product_id: productId });
    }

    revalidatePath('/dashboard/wishlist');
    return { success: true };
  } catch (error) {
    console.error("Wishlist Toggle Error:", error);
    return { success: false, error: "Failed to update wishlist." };
  }
}

// ইউজারের উইশলিস্ট ডেটা ফেচ করা (সঠিক ক্যাটাগরি নাম সহ)
export async function getUserWishlist(userId: string) {
  try {
    const userWishlist = await db.select({
      wishlist_id: wishlists.id,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        sizes: products.sizes,
        stock: products.stock,
        is_featured: products.is_featured,
        images: products.images,
        // ক্যাটাগরি টেবিল থেকে নাম নিয়ে আসা হচ্ছে
        category: categories.name, 
      }
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.product_id, products.id))
    // ক্যাটাগরি টেবিলের সাথে লেফট জয়েন (Left Join) করা হলো
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(eq(wishlists.user_id, userId));

    return { success: true, data: userWishlist };
  } catch (error) {
    console.error("Fetch Wishlist Error:", error);
    return { success: false, error: "Failed to fetch wishlist." };
  }
}
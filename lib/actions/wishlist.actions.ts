'use server';

import { db } from "@/lib/db";
import { wishlists, products, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// উইশলিস্টে আইটেম যোগ বা রিমুভ করা
export async function toggleWishlistItem(userId: string, productId: number) {
  try {
    const existing = await db.select()
      .from(wishlists)
      .where(and(eq(wishlists.user_id, userId), eq(wishlists.product_id, productId)));

    if (existing.length > 0) {
      // যদি আগে থেকেই থাকে, তবে রিমুভ করে দেবে
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
    } else {
      // না থাকলে নতুন করে যোগ করবে
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
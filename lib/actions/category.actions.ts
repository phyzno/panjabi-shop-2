"use server";

import { db } from "@/lib/db"; // আপনার ডেটাবেস কানেকশন ফাইল
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

// ১. ক্যাটাগরি যোগ করা (Add Category)
export async function addCategory(data: { name: string; slug: string; sort_order?: number }) {
  try {
    await db.insert(categories).values({
      name: data.name,
      slug: data.slug,
      sort_order: data.sort_order || 0,
    });
    
    // ম্যাজিক: ক্যাটাগরি আপডেটের সাথে সাথে ক্যাশ ক্লিয়ার হয়ে যাবে!
    revalidateTag('categories'); 
    
    return { success: true, message: "Category added successfully!" };
  } catch (error) {
    console.error("Add Category Error:", error);
    return { success: false, error: "Failed to add category." };
  }
}

// ২. ক্যাটাগরি ডিলিট করা (Delete Category)
export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    
    // ক্যাশ ক্লিয়ার
    revalidateTag('categories'); 
    
    return { success: true, message: "Category deleted successfully!" };
  } catch (error) {
    console.error("Delete Category Error:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

// ৩. ক্যাটাগরি ফেচ করা (Fetch Categories - for Frontend)
export async function getCategories() {
  try {
    const data = await db.select().from(categories).orderBy(categories.sort_order);
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Category Error:", error);
    return { success: false, error: "Failed to fetch categories." };
  }
}
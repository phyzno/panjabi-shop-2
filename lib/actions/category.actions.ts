"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function addCategory(data: { name: string; slug: string; sort_order?: number }) {
  try {
    await db.insert(categories).values({
      name: data.name,
      slug: data.slug,
      sort_order: data.sort_order || 0,
    });
    
    revalidateTag('categories'); 
    
    return { success: true, message: "Category added successfully!" };
  } catch (error) {
    console.error("Add Category Error:", error);
    return { success: false, error: "Failed to add category." };
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    
    revalidateTag('categories'); 
    
    return { success: true, message: "Category deleted successfully!" };
  } catch (error) {
    console.error("Delete Category Error:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

export async function getCategories() {
  try {
    const data = await db.select().from(categories).orderBy(categories.sort_order);
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Category Error:", error);
    return { success: false, error: "Failed to fetch categories." };
  }
}
// lib/actions/category.actions.ts
"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

// lib/actions/category.actions.ts

export async function addCategory(data: { 
  name: string; 
  parent_id?: number | null; 
  sort_order?: number 
}) {
  try {
    // বেসিক স্লাগ তৈরি
    let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let finalSlug = baseSlug;

    // যদি প্যারেন্ট ক্যাটাগরি থাকে, তবে স্লাগ ইউনিক করার জন্য প্যারেন্টের স্লাগ প্রিফিক্স হিসেবে যুক্ত করা হবে
    if (data.parent_id) {
      const parent = await db.select().from(categories).where(eq(categories.id, data.parent_id));
      if (parent.length > 0) {
        finalSlug = `${parent[0].slug}-${baseSlug}`;
      }
    }

    // ডুপ্লিকেট চেক ফলব্যাক (যদি এরপরও একই স্লাগ থাকে)
    const existing = await db.select().from(categories).where(eq(categories.slug, finalSlug));
    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    await db.insert(categories).values({
      name: data.name,
      slug: finalSlug,
      parent_id: data.parent_id || null,
      sort_order: data.sort_order || 0,
    });
    
    revalidateTag('categories'); 
    
    return { success: true, message: "Category added successfully!" };
  } catch (error) {
    console.error("Add Category Error:", error);
    return { success: false, error: "Failed to add category." };
  }
}

export async function updateCategory(id: number, name: string) {
  try {
    // শুধু নাম পরিবর্তন করার সুযোগ দেওয়া হলো (স্লাগ আগেরটাই থাকবে যাতে প্রোডাক্ট বা SEO এর লিঙ্কে সমস্যা না হয়)
    await db.update(categories)
      .set({ name: name })
      .where(eq(categories.id, id));
    
    revalidateTag('categories'); 
    return { success: true, message: "Category updated successfully!" };
  } catch (error) {
    console.error("Update Category Error:", error);
    return { success: false, error: "Failed to update category." };
  }
}
// আপনার ফাইলের বাকি deleteCategory, getCategories, getCategoryTree ফাংশনগুলো আগের মতোই থাকবে।

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

// নতুন ফাংশন: UI-তে Parent-Child রিলেশন দেখানোর জন্য
export async function getCategoryTree() {
  try {
    const { data } = await getCategories();
    if (!data) return { success: false, data: [] };

    // Flat data কে Tree structure-এ কনভার্ট করা
    const categoryMap = new Map();
    const tree: any[] = [];

    data.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] }));

    data.forEach(cat => {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        tree.push(categoryMap.get(cat.id));
      }
    });

    return { success: true, data: tree };
  } catch (error) {
    console.error("Fetch Category Tree Error:", error);
    return { success: false, error: "Failed to build category tree." };
  }
}
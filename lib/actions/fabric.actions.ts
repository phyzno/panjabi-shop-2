"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { fabrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { deleteImageFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

// fabric.actions.ts

// ১. নতুন ফ্যাব্রিক যোগ করা
export async function addFabric(formData: FormData) {
  try {
    // FormData থেকে স্ট্রিং ও নাম্বারগুলো এক্সট্রাক্ট করা হচ্ছে
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const texture_url = formData.get("texture_url") as string;
    const raw_image_url = formData.get("raw_image_url") as string;
    
    // JSON স্ট্রিং থেকে অ্যারে পার্স করা হচ্ছে (নিরাপদ উপায়)
    const colors = JSON.parse(formData.get("colors") as string || "[]");
    const patterns = JSON.parse(formData.get("patterns") as string || "[]");

    await db.insert(fabrics).values({
      name,
      description,
      price,
      colors,
      patterns,
      yards: 0,
      texture_url,
      raw_image_url,
      is_active: true,
      is_featured: false,
    });

    revalidateTag('fabrics'); 
    return { success: true, message: "Fabric added successfully!" };
  } catch (error) {
    console.error("Add Fabric Error:", error);
    return { success: false, error: "Failed to add fabric." };
  }
}

// ২. ফ্যাব্রিক আপডেট করা
export async function updateFabric(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const texture_url = formData.get("texture_url") as string;
    const raw_image_url = formData.get("raw_image_url") as string;
    
    const colors = JSON.parse(formData.get("colors") as string || "[]");
    const patterns = JSON.parse(formData.get("patterns") as string || "[]");

    await db.update(fabrics).set({
      name,
      description,
      price,
      colors,
      patterns,
      texture_url,
      raw_image_url: raw_image_url || null,
    }).where(eq(fabrics.id, id));

    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);

    return { success: true, message: "Fabric updated successfully!" };
  } catch (error) {
    console.error("Update Fabric Error:", error);
    return { success: false, error: "Failed to update fabric." };
  }
}

// ৩. ফ্যাব্রিক ডিলিট করা
export async function deleteFabric(id: number, imageUrls: string[]) {
  try {
    // Cloudinary থেকে Texture এবং Raw Image রিমুভ করা
    for (const url of imageUrls) {
      if (url) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }
    }

    await db.delete(fabrics).where(eq(fabrics.id, id));

    // Tier 2 Cache Clear
    revalidateTag('fabrics');
    return { success: true, message: "Fabric deleted permanently!" };
  } catch (error) {
    console.error("Delete Fabric Error:", error);
    return { success: false, error: "Failed to delete fabric." };
  }
}

// ৪. সব ফ্যাব্রিক ফেচ করা
export async function getFabrics() {
  try {
    const data = await db.select().from(fabrics).where(eq(fabrics.is_active, true));
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Fabrics Error:", error);
    return { success: false, error: "Failed to fetch fabrics." };
  }
}

// ৪. সিঙ্গেল ফ্যাব্রিক ফেচ করা
export async function getFabricById(id: number) {
  try {
    const data = await db.select().from(fabrics).where(eq(fabrics.id, id));
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Fetch Fabric By ID Error:", error);
    return { success: false, error: "Failed to fetch fabric details." };
  }
}

// ৫. ফ্যাব্রিক স্টক (Yards) আপডেট করা
export async function updateFabricStock(id: number, yards: number) {
  try {
    await db.update(fabrics).set({ yards }).where(eq(fabrics.id, id));
    
    // Tier 2 & Tier 3 Cache Clear
    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);
    
    return { success: true, message: "Fabric stock updated!" };
  } catch (error) {
    console.error("Update Fabric Stock Error:", error);
    return { success: false, error: "Failed to update stock." };
  }
}

// ৬. ফ্যাব্রিক ফিচার্ড স্ট্যাটাস টগল করা
export async function toggleFabricFeatured(id: number, is_featured: boolean) {
  try {
    await db.update(fabrics).set({ is_featured }).where(eq(fabrics.id, id));
    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    return { success: false, error: "Failed to update featured status." };
  }
}

export async function getCachedAllFabrics() {
  return await unstable_cache(
    async () => {
      try {
        // শুধুমাত্র অ্যাক্টিভ ফ্যাব্রিকগুলো ফেচ করছি
        const data = await db.select().from(fabrics).where(eq(fabrics.is_active, true));
        return { success: true, data };
      } catch (error) {
        console.error("Fetch All Fabrics Error:", error);
        return { success: false, data: [] };
      }
    },
    ['all-fabrics-cache'],
    { tags: ['fabrics'] } // Tier 2 Tag
  )();
}
"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { fabrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { deleteImageFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";


export async function addFabric(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const texture_url = formData.get("texture_url") as string;
    const raw_image_url = formData.get("raw_image_url") as string;
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

export async function deleteFabric(id: number, imageUrls: string[]) {
  try {
    for (const url of imageUrls) {
      if (url) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }
    }

    await db.delete(fabrics).where(eq(fabrics.id, id));

    revalidateTag('fabrics');
    return { success: true, message: "Fabric deleted permanently!" };
  } catch (error) {
    console.error("Delete Fabric Error:", error);
    return { success: false, error: "Failed to delete fabric." };
  }
}

export async function getFabrics() {
  try {
    const data = await db.select().from(fabrics).where(eq(fabrics.is_active, true));
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Fabrics Error:", error);
    return { success: false, error: "Failed to fetch fabrics." };
  }
}

export async function getFabricById(id: number) {
  try {
    const data = await db.select().from(fabrics).where(eq(fabrics.id, id));
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Fetch Fabric By ID Error:", error);
    return { success: false, error: "Failed to fetch fabric details." };
  }
}

export async function updateFabricStock(id: number, yards: number) {
  try {
    await db.update(fabrics).set({ yards }).where(eq(fabrics.id, id));
    
    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);
    
    return { success: true, message: "Fabric stock updated!" };
  } catch (error) {
    console.error("Update Fabric Stock Error:", error);
    return { success: false, error: "Failed to update stock." };
  }
}

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
        const data = await db.select().from(fabrics).where(eq(fabrics.is_active, true));
        return { success: true, data };
      } catch (error) {
        console.error("Fetch All Fabrics Error:", error);
        return { success: false, data: [] };
      }
    },
    ['all-fabrics-cache'],
    { tags: ['fabrics'] }
  )();
}
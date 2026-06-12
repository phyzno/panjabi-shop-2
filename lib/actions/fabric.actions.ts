"use server";

import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { fabrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { deleteCloudinaryUrl } from "@/lib/cloudinary";

function extractVideoUrl(input: string | null): string | null {
  if (!input) return null;
  const trimmedInput = input.trim();
  
  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/i;
  const match = trimmedInput.match(iframeRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return trimmedInput;
}

export async function checkFabricIdExists(id: string) {
  try {
    const existingFabric = await db
      .select({ id: fabrics.id })
      .from(fabrics)
      .where(eq(fabrics.id, id));
      
    return { success: true, exists: existingFabric.length > 0 };
  } catch (error) {
    console.error("Check Fabric ID Error:", error);
    return { success: false, error: "Failed to check ID availability." };
  }
}

export async function addFabric(data: {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount_percentage?: number;
  texture_url: string;
  raw_image_url?: string | null;
  video_url?: string | null;
  colors?: string[];
  patterns?: string[];
  preview_images?: string[];
  allowed_products?: string[];
  group_id?: string | null;
  color_name?: string | null;
  color_hex?: string | null;
}) {
  try {
    const cleanVideoUrl = extractVideoUrl(data.video_url ?? null);

    await db.insert(fabrics).values({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      texture_url: data.texture_url,
      raw_image_url: data.raw_image_url || null,
      video_url: cleanVideoUrl,
      colors: data.colors || [],
      patterns: data.patterns || [],
      preview_images: data.preview_images || [],
      allowed_products: data.allowed_products || [],
      yards: 0,
      group_id: data.group_id || null,
      color_name: data.color_name || null,
      color_hex: data.color_hex || null,
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

export async function updateFabric(
  id: string, 
  data: {
    name: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    texture_url: string;
    raw_image_url?: string | null;
    video_url?: string | null;
    colors?: string[];
    patterns?: string[];
    preview_images?: string[];
    allowed_products?: string[];
    group_id?: string | null;
    color_name?: string | null;
    color_hex?: string | null;
  }
) {
  try {
    const cleanVideoUrl = extractVideoUrl(data.video_url ?? null);

    await db.update(fabrics).set({
      name: data.name,
      description: data.description,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      texture_url: data.texture_url,
      raw_image_url: data.raw_image_url || null,
      video_url: cleanVideoUrl,
      colors: data.colors || [],
      patterns: data.patterns || [],
      preview_images: data.preview_images || [],
      allowed_products: data.allowed_products || [],
      group_id: data.group_id !== undefined ? data.group_id : null,
      color_name: data.color_name !== undefined ? data.color_name : null,
      color_hex: data.color_hex !== undefined ? data.color_hex : null,
      updated_at: new Date(),
    }).where(eq(fabrics.id, id));

    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);
    if (data.group_id) {
      revalidateTag(`fabric-variants-${data.group_id}`);
    }

    return { success: true, message: "Fabric updated successfully!" };
  } catch (error) {
    console.error("Update Fabric Error:", error);
    return { success: false, error: "Failed to update fabric." };
  }
}

export async function deleteFabric(id: string, imageUrls: string[] = []) {
  try {
    const fabricData = await db
      .select({
        group_id: fabrics.group_id,
        texture_url: fabrics.texture_url,
        raw_image_url: fabrics.raw_image_url,
        preview_images: fabrics.preview_images,
        video_url: fabrics.video_url,
      })
      .from(fabrics)
      .where(eq(fabrics.id, id));
      
    const currentFabric = fabricData[0];
    const currentGroupId = currentFabric?.group_id;

    if (!currentFabric) {
      return { success: false, error: "Fabric not found." };
    }

    const previewImageUrls = Array.isArray(currentFabric.preview_images) ? currentFabric.preview_images : [];
    const mediaUrls = Array.from(new Set([
      currentFabric.texture_url,
      currentFabric.raw_image_url,
      ...previewImageUrls,
      ...imageUrls,
      currentFabric.video_url,
    ].filter(Boolean) as string[]));

    for (const url of mediaUrls) {
      await deleteCloudinaryUrl(url);
    }

    await db.delete(fabrics).where(eq(fabrics.id, id));

    revalidateTag('fabrics');
    if (currentGroupId) {
      revalidateTag(`fabric-variants-${currentGroupId}`);
    }
    
    return { success: true, message: "Fabric and related media deleted permanently!" };
  } catch (error) {
    console.error("Delete Fabric Error:", error);
    return { success: false, error: "Failed to delete fabric." };
  }
}

export async function getFabrics() {
  try {
    const data = await db
      .select()
      .from(fabrics)
      .where(eq(fabrics.is_active, true));
    return { success: true, data };
  } catch (error) {
    console.error("Fetch Fabrics Error:", error);
    return { success: false, error: "Failed to fetch fabrics." };
  }
}

export async function getFabricById(id: string) {
  try {
    const data = await db
      .select()
      .from(fabrics)
      .where(eq(fabrics.id, id));
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Fetch Fabric By ID Error:", error);
    return { success: false, error: "Failed to fetch fabric details." };
  }
}

export async function updateFabricStock(id: string, yards: number) {
  try {
    await db
      .update(fabrics)
      .set({ yards, updated_at: new Date() })
      .where(eq(fabrics.id, id));
    
    revalidateTag('fabrics');
    revalidateTag(`fabric-${id}`);
    
    return { success: true, message: "Fabric stock updated!" };
  } catch (error) {
    console.error("Update Fabric Stock Error:", error);
    return { success: false, error: "Failed to update stock." };
  }
}

export async function toggleFabricFeatured(id: string, is_featured: boolean) {
  try {
    await db
      .update(fabrics)
      .set({ is_featured, updated_at: new Date() })
      .where(eq(fabrics.id, id));
      
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
        const data = await db
          .select()
          .from(fabrics)
          .where(eq(fabrics.is_active, true));
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

export async function getFabricVariants(groupId: string, currentFabricId: string) {
  if (!groupId) return { success: true, data: [] };

  try {
    const groupFabrics = await unstable_cache(
      async () => {
        return await db
          .select({
            id: fabrics.id,
            color_name: fabrics.color_name,
            color_hex: fabrics.color_hex,
          })
          .from(fabrics)
          .where(eq(fabrics.group_id, groupId));
      },
      [`fabric-group-${groupId}-cache`],
      { tags: [`fabric-variants-${groupId}`, 'fabrics'] }
    )();

    const siblingVariants = groupFabrics
      .filter((fabric) => fabric.id !== currentFabricId)
      .map((fabric) => ({
        id: fabric.id,
        color_name: fabric.color_name,
        color_hex: fabric.color_hex,
      }));

    return { success: true, data: siblingVariants };
  } catch (error) {
    console.error("Fetch Fabric Variants Error:", error);
    return { success: false, data: [] };
  }
}

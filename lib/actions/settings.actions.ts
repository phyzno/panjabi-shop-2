"use server";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { revalidateTag } from "next/cache";

// সেটিংস ডেটা ফেচ করা (id = 1 এর জন্য)
export async function getSiteSettings() {
  try {
    const data = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    
    // যদি কোনো সেটিংস রো না থাকে, তবে একটি ডিফল্ট রো তৈরি করবে
    if (data.length === 0) {
      const defaultRow = await db.insert(siteSettings).values({
        active_offer_id: "default",
        offers: [{ id: "default", text: "Free delivery on orders above ৳2000 | bKash & Nagad accepted" }],
        fabric_colors: ["White", "Black", "Navy Blue"],
        fabric_patterns: ["Solid", "Stripe", "Check"],
      }).returning();
      return { success: true, data: defaultRow[0] };
    }
    
    return { success: true, data: data[0] };
  } catch (error) {
    console.error("Get Settings Error:", error);
    return { success: false, error: "Failed to load settings." };
  }
}

// ডাটাবেস থেকে পড়ার সময় Next.js ক্যাশ ব্যবহার করার জন্য র্যাপার
export const getCachedSiteSettings = unstable_cache(
  async () => {
    return await getSiteSettings();
  },
  ["global-site-settings"], // Cache key
  { tags: ["site-settings"], revalidate: 3600 } // Tier 1 Tag
);

// গ্লোবাল সেটিংস আপডেট করার কোর অ্যাকশন
export async function updateSiteSettings(payload: {
  active_offer_id?: string;
  offers?: any[];
  fabric_colors?: string[];
  fabric_patterns?: string[];
}) {
  try {
    await db.update(siteSettings)
      .set({
        ...payload,
        updated_at: new Date(),
      })
      .where(eq(siteSettings.id, 1));

    // মাইক্রো-ক্যাশিং রিভ্যালিডেশন: হেডার এবং ফ্যাব্রিক ফর্ম সাথে সাথে আপডেট হবে
    revalidateTag("site-settings");
    
    return { success: true, message: "Settings updated successfully!" };
  } catch (error) {
    console.error("Update Settings Error:", error);
    return { success: false, error: "Failed to save settings." };
  }
}
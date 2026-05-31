'use server';

import { db } from "@/lib/db";
import { savedMeasurements } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addMeasurementProfile(userId: string, data: any) {
  try {
    if (data.is_default) {
      await db.update(savedMeasurements)
        .set({ is_default: false })
        .where(eq(savedMeasurements.user_id, userId));
    }

    await db.insert(savedMeasurements).values({
      user_id: userId,
      profile_name: data.profile_name,
      measurements: data.measurements,
      is_default: data.is_default,
    });

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save measurement." };
  }
}

export async function deleteMeasurementProfile(id: number) {
  try {
    await db.delete(savedMeasurements).where(eq(savedMeasurements.id, id));
    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete measurement." };
  }
}

export async function setDefaultProfile(id: number, userId: string) {
  try {
    await db.update(savedMeasurements)
      .set({ is_default: false })
      .where(eq(savedMeasurements.user_id, userId));

    await db.update(savedMeasurements)
      .set({ is_default: true })
      .where(eq(savedMeasurements.id, id));

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update default profile." };
  }
}
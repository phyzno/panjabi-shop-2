'use server';

import { db } from "@/lib/db";
import { savedMeasurements } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- PERSON ACTIONS ---

export async function createPersonProfile(userId: string, personName: string) {
  try {
    const existing = await db.select().from(savedMeasurements).where(eq(savedMeasurements.user_id, userId));
    const isFirst = existing.length === 0;

    await db.insert(savedMeasurements).values({
      user_id: userId,
      person_name: personName,
      fit_name: 'INITIAL_EMPTY',
      product_type: 'none',
      measurements: {},
      is_default: false,
      is_person_default: isFirst,
    });

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create person." };
  }
}

export async function updatePersonName(userId: string, oldName: string, newName: string) {
  try {
    await db.update(savedMeasurements)
      .set({ person_name: newName })
      .where(and(
        eq(savedMeasurements.user_id, userId),
        eq(savedMeasurements.person_name, oldName)
      ));
      
    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update person name." };
  }
}

export async function deletePersonProfile(userId: string, personName: string) {
  try {
    await db.delete(savedMeasurements)
      .where(and(
        eq(savedMeasurements.user_id, userId),
        eq(savedMeasurements.person_name, personName)
      ));
    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete person." };
  }
}

export async function setFeaturedPerson(userId: string, personName: string) {
  try {
    await db.update(savedMeasurements)
      .set({ is_person_default: false })
      .where(eq(savedMeasurements.user_id, userId));

    await db.update(savedMeasurements)
      .set({ is_person_default: true })
      .where(and(
        eq(savedMeasurements.user_id, userId),
        eq(savedMeasurements.person_name, personName)
      ));

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to set featured person." };
  }
}

// --- FIT MEASUREMENT ACTIONS ---

export async function addFitMeasurement(userId: string, data: any) {
  try {
    if (data.is_default) {
      await db.update(savedMeasurements)
        .set({ is_default: false })
        .where(and(
          eq(savedMeasurements.user_id, userId),
          eq(savedMeasurements.person_name, data.person_name),
          eq(savedMeasurements.product_type, data.product_type)
        ));
    }

    await db.insert(savedMeasurements).values({
      user_id: userId,
      person_name: data.person_name,
      fit_name: data.fit_name,
      product_type: data.product_type,
      measurements: data.measurements,
      is_default: data.is_default,
      is_person_default: data.is_person_default, // Inherit current person status
    });

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save measurement." };
  }
}

export async function setFeaturedFit(userId: string, personName: string, productType: string, id: number) {
  try {
    await db.update(savedMeasurements)
      .set({ is_default: false })
      .where(and(
        eq(savedMeasurements.user_id, userId),
        eq(savedMeasurements.person_name, personName),
        eq(savedMeasurements.product_type, productType)
      ));

    await db.update(savedMeasurements)
      .set({ is_default: true })
      .where(eq(savedMeasurements.id, id));

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to set featured fit." };
  }
}

export async function deleteFitMeasurement(id: number) {
  try {
    await db.delete(savedMeasurements).where(eq(savedMeasurements.id, id));
    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete measurement." };
  }
}

export async function updateFitMeasurement(id: number, data: any) {
  try {
    await db.update(savedMeasurements)
      .set({
        fit_name: data.fit_name,
        measurements: data.measurements,
        is_default: data.is_default,
      })
      .where(eq(savedMeasurements.id, id));

    revalidatePath('/dashboard/measurements');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update measurement." };
  }
}
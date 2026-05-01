'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function getMeasurements() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching measurements:', error)
    return []
  }

  return data || []
}

export async function addMeasurement(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  
  const measurement = {
    user_id: user.id,
    label: formData.get('label') as string || 'My Measurements',
    chest: parseFloat(formData.get('chest') as string) || null,
    shoulder: parseFloat(formData.get('shoulder') as string) || null,
    sleeve_length: parseFloat(formData.get('sleeve_length') as string) || null,
    body_length: parseFloat(formData.get('body_length') as string) || null,
    neck: parseFloat(formData.get('neck') as string) || null,
    waist: parseFloat(formData.get('waist') as string) || null,
    hip: parseFloat(formData.get('hip') as string) || null,
    thigh: parseFloat(formData.get('thigh') as string) || null,
    ankle: parseFloat(formData.get('ankle') as string) || null,
    is_default: formData.get('is_default') === 'true'
  }

  if (measurement.is_default) {
    // Set all others to false first
    await supabase
      .from('measurements')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase.from('measurements').insert(measurement)

  if (error) {
    console.error('Error adding measurement:', error)
    throw new Error('Failed to add measurement')
  }

  revalidatePath('/dashboard/measurements')
}

export async function updateMeasurement(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  
  const measurement = {
    label: formData.get('label') as string,
    chest: parseFloat(formData.get('chest') as string) || null,
    shoulder: parseFloat(formData.get('shoulder') as string) || null,
    sleeve_length: parseFloat(formData.get('sleeve_length') as string) || null,
    body_length: parseFloat(formData.get('body_length') as string) || null,
    neck: parseFloat(formData.get('neck') as string) || null,
    waist: parseFloat(formData.get('waist') as string) || null,
    hip: parseFloat(formData.get('hip') as string) || null,
    thigh: parseFloat(formData.get('thigh') as string) || null,
    ankle: parseFloat(formData.get('ankle') as string) || null,
    is_default: formData.get('is_default') === 'true'
  }

  if (measurement.is_default) {
    await supabase
      .from('measurements')
      .update({ is_default: false })
      .eq('user_id', user.id)
  }

  const { error } = await supabase
    .from('measurements')
    .update(measurement)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating measurement:', error)
    throw new Error('Failed to update measurement')
  }

  revalidatePath('/dashboard/measurements')
}

export async function deleteMeasurement(id: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting measurement:', error)
    throw new Error('Failed to delete measurement')
  }

  revalidatePath('/dashboard/measurements')
}

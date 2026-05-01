'use server'

import { createClient } from '@/utils/supabase/server'

export async function getProducts(filters?: {
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  sort?: string
}) {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').eq('is_active', true)

  if (filters?.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice)
  }

  if (filters?.sort) {
    switch (filters.sort) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

export async function getProductCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_unique_categories')
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: products } = await supabase.from('products').select('category')
    const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean)))
    return categories
  }

  return data
}

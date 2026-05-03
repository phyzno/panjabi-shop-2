'use server'

import { getDemoCatalog, getDemoCategoryList } from '@/lib/demoCatalog'
import { createClient } from '@/utils/supabase/server'

function normalizeCategoryList(data: unknown): string[] {
  if (data == null) return []
  if (!Array.isArray(data)) return []
  if (data.length === 0) return []
  const first = data[0]
  if (typeof first === 'string') return data as string[]
  if (typeof first === 'object' && first !== null && 'category' in first) {
    return (data as { category: string | null }[])
      .map((r) => r.category)
      .filter((c): c is string => Boolean(c))
  }
  return []
}

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
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  const rows = data ?? []
  return rows.length > 0 ? rows : getDemoCatalog()
}

export async function getProductCategories() {
  const supabase = await createClient()
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_unique_categories')

  if (!rpcError && rpcData != null) {
    const normalized = normalizeCategoryList(rpcData)
    if (normalized.length > 0) return normalized
  }

  const { data: products } = await supabase.from('products').select('category')
  const fromDb = Array.from(
    new Set((products ?? []).map((p) => p.category).filter(Boolean) as string[])
  )
  return fromDb.length > 0 ? fromDb : getDemoCategoryList()
}

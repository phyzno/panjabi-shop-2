'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Requires 'product-images' bucket in Supabase Storage
//  Dashboard → Storage → New bucket → name: product-images
//  Set to Public

export async function uploadImage(formData: FormData): Promise<string> {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file || file.size === 0) return ''

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error('Image upload failed')
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function loginAdmin(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username === 'admin' && password === 'admin') {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    })
    redirect('/admin')
  }

  redirect('/admin/login?error=Invalid+credentials')
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

// Order management
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  redirect('/admin')
}

export async function deleteOrder(orderId: string) {
  const supabase = await createClient()
  await supabase.from('order_items').delete().eq('order_id', orderId)
  await supabase.from('orders').delete().eq('id', orderId)
  redirect('/admin')
}

// Product CRUD
export async function addProduct(formData: FormData) {
  const supabase = await createClient()
  const rawImageUrls = formData.getAll('image_url')
  const imageUrls = rawImageUrls
    .filter((url): url is string => typeof url === 'string')
    .map(url => url.trim())
    .filter(url => url !== '')

  await supabase.from('products').insert({
    type: formData.get('type') as string,
    category: formData.get('category') as string || null,
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    description: formData.get('description') as string || null,
    base_price: parseFloat(formData.get('base_price') as string),
    stitching_charge: parseFloat(formData.get('stitching_charge') as string) || 450,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    is_active: formData.get('is_active') === 'true',
  })
  redirect('/admin/products')
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', productId)
  redirect('/admin/products')
}

// Fabric CRUD
export async function addFabric(formData: FormData) {
  const supabase = await createClient()

  await supabase.from('fabrics').insert({
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    fabric_type: formData.get('fabric_type') as string,
    description: formData.get('description') as string || null,
    price_per_yard: parseFloat(formData.get('price_per_yard') as string),
    color_hex: formData.get('color_hex') as string || null,
    image_url: formData.get('image_url') as string || null,
    youtube_url: formData.get('youtube_url') as string || null,
    in_stock: formData.get('in_stock') === 'true',
  })
  redirect('/admin/fabrics')
}

export async function deleteFabric(fabricId: string) {
  const supabase = await createClient()
  await supabase.from('fabrics').delete().eq('id', fabricId)
  redirect('/admin/fabrics')
}

// Collar (design_options) CRUD
export async function addCollar(formData: FormData) {
  const supabase = await createClient()

  await supabase.from('design_options').insert({
    type: 'collar',
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    image_url: formData.get('image_url') as string || null,
    price_addition: parseFloat(formData.get('price_addition') as string) || 0,
    for_product: formData.get('for_product') as string || 'panjabi',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  })
  redirect('/admin/collars')
}

export async function deleteCollar(collarId: string) {
  const supabase = await createClient()
  await supabase.from('design_options').delete().eq('id', collarId)
  redirect('/admin/collars')
}

// Update actions
export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient()
  const rawImageUrls = formData.getAll('image_url')
  const imageUrls = rawImageUrls
    .filter((url): url is string => typeof url === 'string')
    .map(url => url.trim())
    .filter(url => url !== '')

  await supabase.from('products').update({
    type: formData.get('type') as string,
    category: formData.get('category') as string || null,
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    description: formData.get('description') as string || null,
    base_price: parseFloat(formData.get('base_price') as string),
    stitching_charge: parseFloat(formData.get('stitching_charge') as string) || 450,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    is_active: formData.get('is_active') === 'true',
    updated_at: new Date().toISOString(),
  }).eq('id', productId)
  redirect('/admin/products')
}

export async function updateFabric(fabricId: string, formData: FormData) {
  const supabase = await createClient()

  await supabase.from('fabrics').update({
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    fabric_type: formData.get('fabric_type') as string,
    description: formData.get('description') as string || null,
    price_per_yard: parseFloat(formData.get('price_per_yard') as string),
    color_hex: formData.get('color_hex') as string || null,
    image_url: formData.get('image_url') as string || null,
    youtube_url: formData.get('youtube_url') as string || null,
    in_stock: formData.get('in_stock') === 'true',
    updated_at: new Date().toISOString(),
  }).eq('id', fabricId)
  redirect('/admin/fabrics')
}

export async function updateCollar(collarId: string, formData: FormData) {
  const supabase = await createClient()

  await supabase.from('design_options').update({
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    image_url: formData.get('image_url') as string || null,
    price_addition: parseFloat(formData.get('price_addition') as string) || 0,
    for_product: formData.get('for_product') as string || 'panjabi',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
    updated_at: new Date().toISOString(),
  }).eq('id', collarId)
  redirect('/admin/collars')
}

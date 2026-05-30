'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServiceRoleClient } from '@/utils/supabase/service'

function getImageUrls(formData: FormData) {
  return formData
    .getAll('image_url')
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
}

async function requireAdminSession() {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_session')?.value !== 'true') {
    redirect('/admin/login')
  }
}

// Requires 'product-images' bucket in Supabase Storage
//  Dashboard → Storage → New bucket → name: product-images
//  Set to Public

export async function uploadImage(formData: FormData): Promise<string> {
  await requireAdminSession()
  const supabase = createServiceRoleClient()
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
  await requireAdminSession()
  const supabase = createServiceRoleClient()
  await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
  redirect('/admin')
}

export async function deleteOrder(orderId: string) {
  await requireAdminSession()
  const supabase = createServiceRoleClient()
  await supabase.from('order_items').delete().eq('order_id', orderId)
  await supabase.from('orders').delete().eq('id', orderId)
  redirect('/admin')
}

// Product CRUD
export async function addProduct(formData: FormData) {
  console.log('addProduct action started')
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const imageUrls = getImageUrls(formData)

  const productData = {
    type: formData.get('type') as string,
    category: (formData.get('category') as string || '').trim() || null,
    name: (formData.get('name') as string || '').trim(),
    name_bn: (formData.get('name_bn') as string || '').trim() || null,
    description: (formData.get('description') as string || '').trim() || null,
    base_price: parseFloat(formData.get('base_price') as string) || 0,
    stitching_charge: parseFloat(formData.get('stitching_charge') as string) || 450,
    image_urls: imageUrls,
    is_active: formData.get('is_active') === 'true',
  }
  
  console.log('Attempting to insert product:', productData)

  const { data, error } = await supabase.from('products').insert(productData).select()

  if (error) {
    console.error('Add Product Error:', error)
    throw new Error(error.message)
  }

  console.log('Product added successfully:', data)
  revalidatePath('/admin/products')
  redirect('/admin/products?success=Product+added')
}

export async function deleteProduct(productId: string) {
  await requireAdminSession()
  const supabase = createServiceRoleClient()
  await supabase.from('products').delete().eq('id', productId)
  revalidatePath('/admin/products')
  redirect('/admin/products')
}

// Fabric CRUD
export async function addFabric(formData: FormData) {
  console.log('addFabric action started')
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const fabricData = {
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    fabric_type: formData.get('fabric_type') as string,
    description: formData.get('description') as string || null,
    price_per_yard: parseFloat(formData.get('price_per_yard') as string) || 0,
    color_hex: formData.get('color_hex') as string || null,
    image_url: formData.get('image_url') as string || null,
    original_image_url: formData.get('original_image_url') as string || null,
    youtube_url: formData.get('youtube_url') as string || null,
    in_stock: formData.get('in_stock') === 'true',
  }
  
  console.log('Attempting to insert fabric:', fabricData)

  const { data, error } = await supabase.from('fabrics').insert(fabricData).select()

  if (error) {
    console.error('Add Fabric Error:', error)
    throw new Error(error.message)
  }

  console.log('Fabric added successfully:', data)
  revalidatePath('/admin/fabrics')
  redirect('/admin/fabrics?success=Fabric+added')
}

export async function deleteFabric(fabricId: string) {
  await requireAdminSession()
  const supabase = createServiceRoleClient()
  await supabase.from('fabrics').delete().eq('id', fabricId)
  revalidatePath('/admin/fabrics')
  redirect('/admin/fabrics')
}

// Collar (design_options) CRUD
export async function addCollar(formData: FormData) {
  console.log('addCollar action started')
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const collarData = {
    type: 'collar',
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    image_url: formData.get('image_url') as string || null,
    price_addition: parseFloat(formData.get('price_addition') as string) || 0,
    for_product: formData.get('for_product') as string || 'panjabi',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }
  
  console.log('Attempting to insert collar:', collarData)

  const { data, error } = await supabase.from('design_options').insert(collarData).select()

  if (error) {
    console.error('Add Collar Error:', error)
    throw new Error(error.message)
  }

  console.log('Collar added successfully:', data)
  revalidatePath('/admin/collars')
  redirect('/admin/collars?success=Collar+added')
}

export async function deleteCollar(collarId: string) {
  await requireAdminSession()
  const supabase = createServiceRoleClient()
  await supabase.from('design_options').delete().eq('id', collarId)
  revalidatePath('/admin/collars')
  redirect('/admin/collars')
}

// Update actions
export async function updateProduct(productId: string, formData: FormData) {
  console.log('updateProduct action started for ID:', productId)
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const imageUrls = getImageUrls(formData)

  const productData = {
    type: formData.get('type') as string,
    category: (formData.get('category') as string || '').trim() || null,
    name: (formData.get('name') as string || '').trim(),
    name_bn: (formData.get('name_bn') as string || '').trim() || null,
    description: (formData.get('description') as string || '').trim() || null,
    base_price: parseFloat(formData.get('base_price') as string) || 0,
    stitching_charge: parseFloat(formData.get('stitching_charge') as string) || 450,
    image_urls: imageUrls,
    is_active: formData.get('is_active') === 'true',
  }
  
  console.log('Attempting to update product:', productData)

  const { data, error } = await supabase.from('products').update(productData).eq('id', productId).select()

  if (error) {
    console.error('Update Product Error:', error)
    throw new Error(error.message)
  }

  console.log('Product updated successfully:', data)
  revalidatePath('/admin/products')
  redirect('/admin/products?success=Product+updated')
}

export async function updateFabric(fabricId: string, formData: FormData) {
  console.log('updateFabric action started for ID:', fabricId)
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const fabricData = {
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    fabric_type: formData.get('fabric_type') as string,
    description: formData.get('description') as string || null,
    price_per_yard: parseFloat(formData.get('price_per_yard') as string) || 0,
    color_hex: formData.get('color_hex') as string || null,
    image_url: formData.get('image_url') as string || null,
    original_image_url: formData.get('original_image_url') as string || null,
    youtube_url: formData.get('youtube_url') as string || null,
    in_stock: formData.get('in_stock') === 'true',
  }
  
  console.log('Attempting to update fabric:', fabricData)

  const { data, error } = await supabase.from('fabrics').update(fabricData).eq('id', fabricId).select()

  if (error) {
    console.error('Update Fabric Error:', error)
    throw new Error(error.message)
  }

  console.log('Fabric updated successfully:', data)
  revalidatePath('/admin/fabrics')
  redirect('/admin/fabrics?success=Fabric+updated')
}

export async function updateCollar(collarId: string, formData: FormData) {
  console.log('updateCollar action started for ID:', collarId)
  await requireAdminSession()
  const supabase = createServiceRoleClient()

  const collarData = {
    name: formData.get('name') as string,
    name_bn: formData.get('name_bn') as string || null,
    image_url: formData.get('image_url') as string || null,
    price_addition: parseFloat(formData.get('price_addition') as string) || 0,
    for_product: formData.get('for_product') as string || 'panjabi',
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }
  
  console.log('Attempting to update collar:', collarData)

  const { data, error } = await supabase.from('design_options').update(collarData).eq('id', collarId).select()

  if (error) {
    console.error('Update Collar Error:', error)
    throw new Error(error.message)
  }

  console.log('Collar updated successfully:', data)
  revalidatePath('/admin/collars')
  redirect('/admin/collars?success=Collar+updated')
}

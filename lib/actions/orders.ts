'use server'

import { createClient } from '@/utils/supabase/server'
import { sendOrderEmail } from '@/lib/email'

interface CartItem {
  productId: string;
  productName: string;
  color: string;
  colorName: string;
  fabricName: string;
  fabricType: string;
  collarStyle: string;
  sizeType: string;
  standardSize?: string;
  specialInstructions?: string;
  previewDataUrl?: string;
  total: number;
}

export async function placeOrder(orderData: {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  subtotal: number;
  delivery: number;
  total: number;
  items: CartItem[];
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Insert into orders table
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      guest_name: orderData.name,
      guest_phone: orderData.phone,
      guest_address: orderData.address,
      guest_city: orderData.city,
      subtotal: orderData.subtotal,
      delivery_charge: orderData.delivery,
      total: orderData.total,
      payment_method: 'cash_on_call',
      status: 'pending',
    })
    .select()
    .single()

  if (orderError) {
    console.error('Order Error:', orderError)
    throw new Error('Failed to place order')
  }

  // 2. Insert order items
  const itemsToInsert = orderData.items.map((item: CartItem) => ({
    order_id: order.id,
    product_id: item.productId === 'new' ? null : item.productId,
    product_name: item.productName,
    color_hex: item.color,
    color_name: item.colorName,
    fabric_name: item.fabricName,
    fabric_type: item.fabricType,
    collar_style: item.collarStyle,
    size_type: item.sizeType,
    standard_size: item.standardSize,
    special_instructions: item.specialInstructions,
    preview_image_url: item.previewDataUrl,
    unit_price: item.total,
    total_price: item.total,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    console.error('Items Error:', itemsError)
  }

  // 3. Send email notification
  try {
    await sendOrderEmail({
      orderNumber: order.order_number,
      customerName: orderData.name,
      customerPhone: orderData.phone,
      customerEmail: orderData.email,
      address: orderData.address,
      city: orderData.city,
      items: orderData.items,
      total: orderData.total,
    })
  } catch (emailError) {
    console.error('Email sending failed:', emailError)
    // Don't fail the order if email fails
  }

  return order.order_number
}

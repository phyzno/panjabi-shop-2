"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { revalidateTag } from "next/cache";

// ১. অ্যাডমিন প্যানেলের জন্য সব অর্ডার এবং তার আইটেম ফেচ করা
export async function getAdminOrders() {
  try {
    // Drizzle ORM দিয়ে অর্ডার এবং আইটেম আলাদাভাবে এনে মেমোরিতে ম্যাপ করা হচ্ছে (সুপার ফাস্ট)
    const allOrders = await db.select().from(orders).orderBy(desc(orders.created_at));
    const allItems = await db.select().from(orderItems);

    // ডেটাবেসের রিলেশনাল ডেটাকে ফ্রন্টএন্ডের MOCK_ORDERS-এর স্ট্রাকচারে ম্যাপ করা হচ্ছে
    const formattedOrders = allOrders.map(order => {
      const itemsForOrder = allItems.filter(item => item.order_id === order.id);

      return {
        id: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        // ISO Date থেকে শুধু YYYY-MM-DD বের করা হচ্ছে
        date: order.created_at ? order.created_at.toISOString().split('T')[0] : "Unknown",

        subTotal: order.sub_total,
        deliveryCharge: order.delivery_charge,
        discount: order.discount,
        grandTotal: order.grand_total,

        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        isArchived: order.is_archived,

        // অর্ডার আইটেমগুলোকে ম্যাপ করা
        items: itemsForOrder.map(item => ({
          id: item.id.toString(),
          name: item.name,
          productType: item.product_type,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          sizeMode: item.size_mode || undefined,
          sizeValue: item.size_value || undefined,
          measurements: item.measurements || undefined,
          fabricYards: item.fabric_yards || undefined,
          collarType: item.collar_type || undefined,
          fabricName: item.fabric_name || undefined,
          stitchingCharge: item.stitching_charge ? Number(item.stitching_charge) : undefined
        }))
      };
    });

    return { success: true, data: formattedOrders };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}

// ২. অর্ডার স্ট্যাটাস আপডেট করা (Dropdown Action)
export async function updateOrderStatus(id: string, status: string) {
  try {
    await db.update(orders).set({ order_status: status, updated_at: new Date() }).where(eq(orders.id, id));

    // Tier 2 Cache Update
    revalidateTag('orders');
    return { success: true };
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

// ৩. পেমেন্ট স্ট্যাটাস আপডেট করা (Dropdown Action)
export async function updatePaymentStatus(id: string, status: string) {
  try {
    await db.update(orders).set({ payment_status: status, updated_at: new Date() }).where(eq(orders.id, id));

    // Tier 2 Cache Update
    revalidateTag('orders');
    return { success: true };
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    return { success: false, error: "Failed to update payment status." };
  }
}

// ৪. বাল্ক অর্ডার আর্কাইভ বা রিস্টোর করা (Multi-select Action)
export async function bulkToggleArchiveOrders(ids: string[], isArchived: boolean) {
  try {
    if (ids.length === 0) return { success: true };

    await db.update(orders).set({ is_archived: isArchived, updated_at: new Date() }).where(inArray(orders.id, ids));

    // Tier 2 Cache Update
    revalidateTag('orders');
    return { success: true, message: `Orders ${isArchived ? 'archived' : 'restored'} successfully.` };
  } catch (error) {
    console.error("Bulk Archive Error:", error);
    return { success: false, error: "Failed to process archive request." };
  }
}

// ৫. কাস্টমারের ট্র্যাকিং এর জন্য সিঙ্গেল অর্ডার ফেচ করা
export async function getOrderById(orderId: string) {
  try {
    const orderRecord = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    
    if (orderRecord.length === 0) {
      return { success: false, error: "Order not found" };
    }

    const order = orderRecord[0];
    const itemsRecord = await db.select().from(orderItems).where(eq(orderItems.order_id, orderId));

    const formattedOrder = {
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerAddress: order.customer_address,
      date: order.created_at ? order.created_at.toISOString().split('T')[0] : "Unknown",

      subTotal: order.sub_total,
      deliveryCharge: order.delivery_charge,
      discount: order.discount,
      grandTotal: order.grand_total,

      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      isArchived: order.is_archived,

      items: itemsRecord.map(item => ({
        id: item.id.toString(),
        name: item.name,
        productType: item.product_type,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        sizeMode: item.size_mode || undefined,
        sizeValue: item.size_value || undefined,
        measurements: item.measurements || undefined,
        fabricYards: item.fabric_yards || undefined,
        collarType: item.collar_type || undefined,
        fabricName: item.fabric_name || undefined,
        stitchingCharge: item.stitching_charge ? Number(item.stitching_charge) : undefined
      }))
    };

    return { success: true, data: formattedOrder };
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    return { success: false, error: "Failed to fetch order details." };
  }
}
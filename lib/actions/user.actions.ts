"use server";

import { db } from "@/lib/db";
import { orders, orderItems, savedMeasurements } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

// ১. ইউজারের Order History ফেচ করা
export async function getUserOrders(userId: string) {
  try {
    if (!userId) return { success: false, error: "User ID is required" };

    // ইউজারের সব অর্ডার ফেচ করা
    const userOrders = await db.select()
      .from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));

    if (userOrders.length === 0) {
      return { success: true, data: [] };
    }

    // অর্ডারগুলোর সাথে সম্পর্কিত আইটেমগুলো ফেচ করা
    const orderIds = userOrders.map((order) => order.id);
    const userOrderItems = await db.select()
      .from(orderItems)
      .where(inArray(orderItems.order_id, orderIds));

    // ডেটা স্ট্রাকচারিং: অর্ডার এবং তার আইটেমগুলোকে একসাথে ম্যাপ করা
    const formattedOrders = userOrders.map((order) => {
      const itemsForOrder = userOrderItems.filter((item) => item.order_id === order.id);

      return {
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

        items: itemsForOrder.map(item => ({
          id: item.id.toString(),
          name: item.name,
          productType: item.product_type,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          // User side specific data mapping
          stitchingCharge: item.stitching_charge || 0,
          fabricName: item.fabric_name || undefined,
          sizeMode: item.size_mode || undefined,
          sizeValue: item.size_value || undefined,
          measurements: item.measurements || undefined,
          fabricYards: item.fabric_yards || undefined,
          collarType: item.collar_type || undefined
        }))
      };
    });

    return { success: true, data: formattedOrders };

    return { success: true, data: formattedOrders };
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    return { success: false, error: "Failed to fetch order history." };
  }
}

// ২. ইউজারের Saved Measurements ফেচ করা
export async function getUserMeasurements(userId: string) {
  try {
    if (!userId) return { success: false, error: "User ID is required" };

    const measurements = await db.select()
      .from(savedMeasurements)
      .where(eq(savedMeasurements.user_id, userId))
      .orderBy(desc(savedMeasurements.updated_at));

    return { success: true, data: measurements };
  } catch (error) {
    console.error("Fetch Measurements Error:", error);
    return { success: false, error: "Failed to fetch measurements." };
  }
}
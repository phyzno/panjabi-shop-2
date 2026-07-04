"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export async function getAdminOrders() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.created_at));
    const allItems = await db.select().from(orderItems);
    const formattedOrders = allOrders.map(order => {
      const itemsForOrder = allItems.filter(item => item.order_id === order.id);

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
          sizeMode: item.size_mode || undefined,
          sizeValue: item.size_value || undefined,
          measurements: item.measurements || undefined,
          fabricYards: item.fabric_yards || undefined,
          fabricName: item.fabric_name || undefined,
          stitchingCharge: item.stitching_charge ? Number(item.stitching_charge) : undefined,
          productStyles: item.product_styles || undefined,
          tailoringDetails: item.tailoring_details || undefined,
          specialInstructions: item.special_instructions || undefined,
          originalUnitPrice: item.original_unit_price,
          discountPercentage: item.discount_percentage
        }))
      };
    });

    return { success: true, data: formattedOrders };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await db.update(orders).set({ order_status: status, updated_at: new Date() }).where(eq(orders.id, id));

    revalidateTag('orders');
    return { success: true };
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

export async function updatePaymentStatus(id: string, status: string) {
  try {
    await db.update(orders).set({ payment_status: status, updated_at: new Date() }).where(eq(orders.id, id));

    revalidateTag('orders');
    return { success: true };
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    return { success: false, error: "Failed to update payment status." };
  }
}

export async function bulkToggleArchiveOrders(ids: string[], isArchived: boolean) {
  try {
    if (ids.length === 0) return { success: true };

    await db.update(orders).set({ is_archived: isArchived, updated_at: new Date() }).where(inArray(orders.id, ids));

    revalidateTag('orders');
    return { success: true, message: `Orders ${isArchived ? 'archived' : 'restored'} successfully.` };
  } catch (error) {
    console.error("Bulk Archive Error:", error);
    return { success: false, error: "Failed to process archive request." };
  }
}

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
        fabricName: item.fabric_name || undefined,
        stitchingCharge: item.stitching_charge ? Number(item.stitching_charge) : undefined,
        productStyles: item.product_styles || undefined,
        tailoringDetails: item.tailoring_details || undefined,
        specialInstructions: item.special_instructions || undefined,
        originalUnitPrice: item.original_unit_price,
        discountPercentage: item.discount_percentage
      }))
    };

    return { success: true, data: formattedOrder };
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    return { success: false, error: "Failed to fetch order details." };
  }
}
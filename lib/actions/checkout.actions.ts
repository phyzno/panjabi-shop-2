"use server";

import { txDb } from "@/lib/db";
import { orders, orderItems, products, fabrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

interface CheckoutPayload {
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryCharge: number;
  discount: number;
  paymentMethod: "cod" | "online";
  items: Array<{
    productId?: string;
    productName: string;
    productType: string;
    quantity: number;
    unitPrice: number;
    originalUnitPrice?: number | null;
    discountPercentage?: number | null;
    stitchingCharge?: number | null;
    totalPrice: number;
    sizeMode?: string | null;
    sizeValue?: string | null;
    fabricId?: string | null;
    fabricName?: string | null;
    yardage?: number | null;
    customMeasurements?: Record<string, string | number> | null;
    productStyles?: Record<string, string> | null;
    tailoringDetails?: Record<string, string> | null;
  }>;
}

export async function createOrder(payload: CheckoutPayload) {
  try {
    const subTotal = payload.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const grandTotal = subTotal + (payload.deliveryCharge || 0) - (payload.discount || 0);

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${datePart}-${randomPart}`;

    await txDb.transaction(async (tx) => {
      
      for (const item of payload.items) {
        
        if (item.productType === "readymade" && item.productId && item.sizeValue) {
          const productRecord = await tx.select().from(products).where(eq(products.id, String(item.productId))).limit(1);
          
          if (productRecord.length === 0) throw new Error(`Product ${item.productName} not found.`);
          
          const currentStockObj = (productRecord[0].stock as Record<string, number>) || {};
          const currentSizeStock = currentStockObj[item.sizeValue] || 0;

          if (currentSizeStock < item.quantity) {
            throw new Error(`Only ${currentSizeStock} left for ${item.productName} (Size: ${item.sizeValue}).`);
          }

          const updatedStock = { ...currentStockObj, [item.sizeValue]: currentSizeStock - item.quantity };
          await tx.update(products).set({ stock: updatedStock }).where(eq(products.id, String(item.productId)));
        }

        if ((item.productType === "custom_fabric_only" || item.productType === "custom_tailored") && item.fabricId && item.yardage) {
          const fabricRecord = await tx.select().from(fabrics).where(eq(fabrics.id, String(item.fabricId))).limit(1);
          
          if (fabricRecord.length === 0) throw new Error(`Fabric ${item.fabricName} not found.`);
          
          const requiredYards = Number(item.yardage) * item.quantity;
          const currentYards = fabricRecord[0].yards || 0;

          if (currentYards < requiredYards) {
            throw new Error(`Insufficient stock for ${item.fabricName}. Only ${currentYards} yards available.`);
          }

          const newYards = currentYards - requiredYards;
          await tx.update(fabrics).set({ yards: newYards }).where(eq(fabrics.id, String(item.fabricId)));
        }
      }

      await tx.insert(orders).values({
        id: orderId,
        user_id: payload.userId || null,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_address: payload.customerAddress,
        sub_total: subTotal,
        delivery_charge: payload.deliveryCharge,
        discount: payload.discount,
        grand_total: grandTotal,
        order_status: "pending",
        payment_status: "unpaid",
      });

      const itemsToInsert = payload.items.map((item) => ({
        order_id: orderId,
        name: item.productName,
        product_type: item.productType || "readymade",
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        original_unit_price: item.originalUnitPrice || item.unitPrice || 0,
        discount_percentage: item.discountPercentage || 0,
        stitching_charge: item.stitchingCharge || 0,
        fabric_id: item.fabricId ? String(item.fabricId) : null,
        fabric_name: item.fabricName || null,
        total_price: item.totalPrice || 0,
        size_mode: item.sizeMode || null,
        size_value: item.sizeValue || null,
        measurements: item.customMeasurements || null,
        fabric_yards: item.yardage || null,
        product_styles: item.productStyles || null,
        tailoring_details: item.tailoringDetails || null,
      }));

      await tx.insert(orderItems).values(itemsToInsert);
    });

    revalidateTag("orders");
    revalidateTag("products");
    revalidateTag("fabrics");

    return { success: true, orderId, message: "Order placed successfully!" };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: error.message || "Failed to process the order. Please try again." };
  }
}

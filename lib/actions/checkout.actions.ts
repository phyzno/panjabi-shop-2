"use server";

import { txDb } from "@/lib/db"; // <-- এখানে db এর বদলে txDb ইমপোর্ট করা হলো
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
    productId?: string | number;
    productName: string;
    productType: string;
    quantity: number;
    unitPrice: number;
    stitchingCharge?: number | null;
    totalPrice: number;
    sizeMode?: string | null;
    sizeValue?: string | null;
    fabricId?: string | null;
    fabricName?: string | null;
    yardage?: number | null;
    customMeasurements?: Record<string, string | number> | null;
    collarType?: string | null;
  }>;
}

export async function createOrder(payload: CheckoutPayload) {
  try {
    // 1. Calculate Grand Total
    const subTotal = payload.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const grandTotal = subTotal + (payload.deliveryCharge || 0) - (payload.discount || 0);

    // 2. Generate Unique Order ID
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${datePart}-${randomPart}`;

    // 3. Database Transaction using txDb (WebSocket Pool)
    await txDb.transaction(async (tx) => {
      
      // Step A: স্টক ভ্যালিডেশন এবং ডিডাকশন
      for (const item of payload.items) {
        
        // রেডিমেড প্রোডাক্টের ক্ষেত্রে
        if (item.productType === "readymade" && item.productId && item.sizeValue) {
          const productRecord = await tx.select().from(products).where(eq(products.id, Number(item.productId))).limit(1);
          
          if (productRecord.length === 0) throw new Error(`Product ${item.productName} not found.`);
          
          const currentStockObj = (productRecord[0].stock as Record<string, number>) || {};
          const currentSizeStock = currentStockObj[item.sizeValue] || 0;

          if (currentSizeStock < item.quantity) {
            throw new Error(`Only ${currentSizeStock} left for ${item.productName} (Size: ${item.sizeValue}).`);
          }

          // স্টক কমানো হচ্ছে
          const updatedStock = { ...currentStockObj, [item.sizeValue]: currentSizeStock - item.quantity };
          await tx.update(products).set({ stock: updatedStock }).where(eq(products.id, Number(item.productId)));
        }

        // কাস্টম টেইলরিং বা ফ্যাব্রিক অনলি এর ক্ষেত্রে
        if ((item.productType === "custom_fabric_only" || item.productType === "custom_tailored") && item.fabricId && item.yardage) {
          const fabricRecord = await tx.select().from(fabrics).where(eq(fabrics.id, Number(item.fabricId))).limit(1);
          
          if (fabricRecord.length === 0) throw new Error(`Fabric ${item.fabricName} not found.`);
          
          const requiredYards = Number(item.yardage) * item.quantity;
          const currentYards = fabricRecord[0].yards || 0;

          if (currentYards < requiredYards) {
            throw new Error(`Insufficient stock for ${item.fabricName}. Only ${currentYards} yards available.`);
          }

          // ইয়ার্ড কমানো হচ্ছে
          const newYards = currentYards - requiredYards;
          await tx.update(fabrics).set({ yards: newYards }).where(eq(fabrics.id, Number(item.fabricId)));
        }
      }

      // Step B: Order Insert
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

      // Step C: Order Items Insert
      const itemsToInsert = payload.items.map((item) => ({
        order_id: orderId,
        name: item.productName,
        product_type: item.productType || "readymade",
        quantity: item.quantity || 1,
        unit_price: item.unitPrice || 0,
        stitching_charge: item.stitchingCharge || 0,
        fabric_id: item.fabricId ? String(item.fabricId) : null,
        fabric_name: item.fabricName || null,
        total_price: item.totalPrice || 0,
        size_mode: item.sizeMode || null,
        size_value: item.sizeValue || null,
        measurements: item.customMeasurements || null,
        fabric_yards: item.yardage || null,
        collar_type: item.collarType || null,
      }));

      await tx.insert(orderItems).values(itemsToInsert);
    });

    // ক্যাশ ক্লিয়ার করা হচ্ছে যাতে ফ্রন্টএন্ডে সাথে সাথে আপডেট দেখা যায়
    revalidateTag("orders");
    revalidateTag("products");
    revalidateTag("fabrics");

    return { success: true, orderId, message: "Order placed successfully!" };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    // ট্রানজেকশনের থ্রো করা স্পেসিফিক এরর মেসেজটি ফ্রন্টএন্ডে পাঠানো হচ্ছে
    return { success: false, error: error.message || "Failed to process the order. Please try again." };
  }
}
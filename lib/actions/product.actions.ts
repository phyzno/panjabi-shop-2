"use server";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { revalidateTag, revalidatePath } from "next/cache";
import { deleteImageFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

export type ProductStock = Record<string, number>;

function normalizeProductStock(sizes: string[], stock?: ProductStock) {
  const currentStock = stock || {};

  return sizes.reduce<ProductStock>((acc, size) => {
    acc[size] = Number(currentStock[size] ?? 0);
    return acc;
  }, {});
}

export const getCachedFeaturedProducts = unstable_cache(
  async () => {
    try {
      const data = await db
        .select({
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
          description: products.description,
          categoryName: categories.name,
          sizes: products.sizes, // <-- যুক্ত করা হলো
          stock: products.stock, // <-- যুক্ত করা হলো
        })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(eq(products.is_featured, true));

      return { success: true, data };
    } catch (error) {
      console.error("Fetch Featured Products Error:", error);
      return { success: false, data: [] };
    }
  },
  ['featured-products-cache'], 
  { tags: ['products', 'categories'] } 
);

// ১. নতুন প্রোডাক্ট যোগ করা
export async function addProduct(data: {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  sizes: string[];
  stock?: ProductStock;
  images: string[];
  is_featured?: boolean;
}) {
  try {
    await db.insert(products).values({
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
      sizes: data.sizes,
      stock: normalizeProductStock(data.sizes, data.stock),
      images: data.images,
      is_featured: data.is_featured || false,
    });

    // Tier 2 Cache Clear
    revalidateTag('products');

    return { success: true, message: "Product added successfully!" };
  } catch (error) {
    console.error("Add Product Error:", error);
    return { success: false, error: "Failed to add product." };
  }
}

// ২. প্রোডাক্ট আপডেট করা
export async function updateProduct(
  id: number,
  data: {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    sizes: string[];
    stock?: ProductStock;
    images: string[];
    is_featured?: boolean;
  }
) {
  try {
    await db.update(products).set({
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
      sizes: data.sizes,
      stock: normalizeProductStock(data.sizes, data.stock),
      images: data.images,
      is_featured: data.is_featured || false,
      updated_at: new Date(),
    }).where(eq(products.id, id));

    revalidateTag('products');
    revalidateTag(`product-${id}`);

    return { success: true, message: "Product updated successfully!" };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error: "Failed to update product." };
  }
}

// ৩. প্রোডাক্ট ডিলিট করা
export async function deleteProduct(id: number, imageUrls: string[]) {
  try {
    for (const url of imageUrls) {
      if (url) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }
    }

    await db.delete(products).where(eq(products.id, id));

    revalidateTag('products');
    return { success: true, message: "Product and related images deleted!" };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

// ৪. প্রোডাক্ট ফেচ করা
export async function getProducts(categoryId?: number) {
  try {
    const data = categoryId
      ? await db.select().from(products).where(eq(products.category_id, categoryId))
      : await db.select().from(products);

    return { success: true, data };
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return { success: false, error: "Failed to fetch products." };
  }
}

// ৫. সিঙ্গেল প্রোডাক্ট ফেচ করা
export async function getProductById(id: number) {
  try {
    const data = await db.select().from(products).where(eq(products.id, id));
    return { success: true, data: data[0] }; 
  } catch (error) {
    console.error("Fetch Product By ID Error:", error);
    return { success: false, error: "Failed to fetch product details." };
  }
}

// ৬. প্রোডাক্ট স্টক আপডেট করা (সাইজ অনুযায়ী)
export async function updateProductStock(id: number, stockObj: ProductStock) {
  try {
    await db.update(products).set({ stock: stockObj, updated_at: new Date() }).where(eq(products.id, id));
    
    // Tier 2 & 3 Cache Clear
    revalidateTag('products');
    revalidateTag(`product-${id}`);
    revalidatePath(`/shop/${id}`);
    revalidatePath('/shop');
    
    return { success: true, message: "Product stock updated!" };
  } catch (error) {
    console.error("Update Product Stock Error:", error);
    return { success: false, error: "Failed to update stock." };
  }
}

// ৭. প্রোডাক্ট ফিচার্ড স্ট্যাটাস টগল করা
export async function toggleProductFeatured(id: number, is_featured: boolean) {
  try {
    await db.update(products).set({ is_featured, updated_at: new Date() }).where(eq(products.id, id));
    revalidateTag('products');
    revalidateTag(`product-${id}`);
    return { success: true };
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    return { success: false, error: "Failed to update featured status." };
  }
}

// সব ক্যাটাগরি ফেচ করার জন্য (Tier 2 Caching)
export async function getCachedCategories() {
  return await unstable_cache(
    async () => {
      try {
        const data = await db.select().from(categories);
        return { success: true, data };
      } catch (error) {
        console.error("Fetch Categories Error:", error);
        return { success: false, data: [] };
      }
    },
    ['all-categories-cache'],
    { tags: ['categories'] } // Tier 2 Tag
  )();
}

// সব প্রোডাক্ট ফেচ করার জন্য (Tier 2 Caching)
export async function getCachedAllProducts() {
  return await unstable_cache(
    async () => {
      try {
        const data = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            images: products.images,
            description: products.description,
            categoryName: categories.name,
            sizes: products.sizes, // <-- যুক্ত করা হলো
            stock: products.stock, // <-- যুক্ত করা হলো
          })
          .from(products)
          .leftJoin(categories, eq(products.category_id, categories.id));

        return { success: true, data };
      } catch (error) {
        console.error("Fetch All Products Error:", error);
        return { success: false, data: [] };
      }
    },
    ['all-products-cache'], 
    { tags: ['products', 'categories'] }
  )();
}

// নির্দিষ্ট আইডি অনুযায়ী প্রোডাক্ট ফেচ করার জন্য (Tier 3 Caching)
export async function getCachedProductById(id: number) {
  return await unstable_cache(
    async () => {
      try {
        const data = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            images: products.images,
            description: products.description,
            categoryName: categories.name,
            sizes: products.sizes,
            stock: products.stock,
          })
          .from(products)
          .leftJoin(categories, eq(products.category_id, categories.id))
          .where(eq(products.id, id));

        return { success: true, data: data[0] };
      } catch (error) {
        console.error("Fetch Product By ID Error:", error);
        return { success: false, data: null };
      }
    },
    [`product-${id}-cache`], 
    { tags: [`product-${id}`, 'products', 'categories'] }
  )();
}
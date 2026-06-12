"use server";

import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { revalidateTag, revalidatePath } from "next/cache";
import { deleteCloudinaryUrl } from "@/lib/cloudinary";

function extractVideoUrl(input: string | null): string | null {
  if (!input) return null;
  const trimmedInput = input.trim();
  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/i;
  const match = trimmedInput.match(iframeRegex);
  if (match && match[1]) return match[1];
  return trimmedInput;
}

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
          discount_percentage: products.discount_percentage, // যুক্ত করা হয়েছে
          images: products.images,
          video_url: products.video_url,
          description: products.description,
          categoryName: categories.name,
          sizes: products.sizes,
          stock: products.stock,
          group_id: products.group_id,
          color_name: products.color_name,
          color_hex: products.color_hex,
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

export async function addProduct(data: {
  id: string;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  discount_percentage?: number;
  sizes: string[];
  stock?: ProductStock;
  images: string[];
  video_url?: string | null;
  is_featured?: boolean;
  group_id?: string;
  color_name?: string;
  color_hex?: string;
}) {
  const cleanVideoUrl = extractVideoUrl(data.video_url ?? null);
  try {
    await db.insert(products).values({
      id: data.id,
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      sizes: data.sizes,
      stock: normalizeProductStock(data.sizes, data.stock),
      images: data.images,
      video_url: cleanVideoUrl,
      is_featured: data.is_featured || false,
      group_id: data.group_id || null,
      color_name: data.color_name || null,
      color_hex: data.color_hex || null,
    });

    revalidateTag('products');

    return { success: true, message: "Product added successfully!" };
  } catch (error) {
    console.error("Add Product Error:", error);
    return { success: false, error: "Failed to add product." };
  }
}

export async function updateProduct(
  id: string,
  data: {
    category_id: number;
    name: string;
    description?: string;
    price: number;
    discount_percentage?: number;
    sizes: string[];
    stock?: ProductStock;
    images: string[];
    video_url?: string | null;
    is_featured?: boolean;
    group_id?: string;
    color_name?: string;
    color_hex?: string;
  }
) {
  const cleanVideoUrl = extractVideoUrl(data.video_url ?? null);
  try {
    await db.update(products).set({
      category_id: data.category_id,
      name: data.name,
      description: data.description,
      price: data.price,
      discount_percentage: data.discount_percentage || 0,
      sizes: data.sizes,
      stock: normalizeProductStock(data.sizes, data.stock),
      images: data.images,
      video_url: cleanVideoUrl,
      is_featured: data.is_featured || false,
      group_id: data.group_id !== undefined ? data.group_id : null,
      color_name: data.color_name !== undefined ? data.color_name : null,
      color_hex: data.color_hex !== undefined ? data.color_hex : null,
      updated_at: new Date(),
    }).where(eq(products.id, id));

    revalidateTag('products');
    revalidateTag(`product-${id}`);
    revalidateTag(`variants-${data.group_id}`);

    return { success: true, message: "Product updated successfully!" };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, error: "Failed to update product." };
  }
}

export async function deleteProduct(id: string, imageUrls: string[] = []) {
  try {
    const productData = await db
      .select({
        group_id: products.group_id,
        images: products.images,
        video_url: products.video_url,
      })
      .from(products)
      .where(eq(products.id, id));
    const currentProduct = productData[0];
    const currentGroupId = currentProduct?.group_id;

    if (!currentProduct) {
      return { success: false, error: "Product not found." };
    }

    const dbImageUrls = Array.isArray(currentProduct.images) ? currentProduct.images : [];
    const mediaUrls = Array.from(new Set([
      ...dbImageUrls,
      ...imageUrls,
      currentProduct.video_url,
    ].filter(Boolean) as string[]));

    for (const url of mediaUrls) {
      await deleteCloudinaryUrl(url);
    }

    await db.delete(products).where(eq(products.id, id));

    revalidateTag('products');
    if (currentGroupId) {
      revalidateTag(`variants-${currentGroupId}`);
    }
    
    return { success: true, message: "Product and related images deleted!" };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

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

export async function getProductById(id: string) {
  try {
    const data = await db.select().from(products).where(eq(products.id, id));
    return { success: true, data: data[0] }; 
  } catch (error) {
    console.error("Fetch Product By ID Error:", error);
    return { success: false, error: "Failed to fetch product details." };
  }
}

export async function updateProductStock(id: string, stockObj: ProductStock) {
  try {
    await db.update(products).set({ stock: stockObj, updated_at: new Date() }).where(eq(products.id, id));
    
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

export async function toggleProductFeatured(id: string, is_featured: boolean) {
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
    { tags: ['categories'] }
  )();
}

export async function getCachedAllProducts() {
  return await unstable_cache(
    async () => {
      try {
        const data = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            discount_percentage: products.discount_percentage, // যুক্ত করা হয়েছে
            images: products.images,
            video_url: products.video_url,
            description: products.description,
            categoryName: categories.name,
            categoryId: products.category_id,
            sizes: products.sizes,
            stock: products.stock,
            group_id: products.group_id,
            color_name: products.color_name,
            color_hex: products.color_hex,
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

export async function getCachedProductById(id: string) {
  return await unstable_cache(
    async () => {
      try {
        const data = await db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            discount_percentage: products.discount_percentage,
            images: products.images,
            video_url: products.video_url,
            description: products.description,
            categoryName: categories.name,
            sizes: products.sizes,
            stock: products.stock,
            group_id: products.group_id,
            color_name: products.color_name,
            color_hex: products.color_hex,
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

export async function checkProductIdExists(id: string) {
  try {
    const existingProduct = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
    return { success: true, exists: existingProduct.length > 0 };
  } catch (error) {
    console.error("Check Product ID Error:", error);
    return { success: false, error: "Failed to check ID availability." };
  }
}

export async function updateProductDiscount(id: string, discountPercentage: number) {
  try {
    await db.update(products)
      .set({ 
        discount_percentage: discountPercentage, 
        updated_at: new Date() 
      })
      .where(eq(products.id, id));
    
    revalidateTag('products');
    revalidateTag(`product-${id}`);
    revalidatePath(`/shop/${id}`);
    revalidatePath('/shop');
    
    return { success: true, message: "Product discount updated successfully!" };
  } catch (error) {
    console.error("Update Product Discount Error:", error);
    return { success: false, error: "Failed to update discount." };
  }
}

export async function getProductVariants(groupId: string, currentProductId: string) {
  if (!groupId) return { success: true, data: [] };

  try {
    const groupProducts = await unstable_cache(
      async () => {
        return await db
          .select({
            id: products.id,
            color_name: products.color_name,
            color_hex: products.color_hex,
            images: products.images,
            video_url: products.video_url,
          })
          .from(products)
          .where(eq(products.group_id, groupId));
      },
      [`product-group-${groupId}-cache`],
      { tags: [`variants-${groupId}`, 'products'] }
    )();

    const siblingVariants = groupProducts
      .filter((product) => product.id !== currentProductId)
      .map((product) => {
        const imagesArray = Array.isArray(product.images) ? product.images : [];
        return {
          id: product.id,
          color_name: product.color_name,
          color_hex: product.color_hex,
          video_url: product.video_url,
          image: imagesArray[0] || null, 
        };
      });

    return { success: true, data: siblingVariants };
  } catch (error) {
    console.error("Fetch Product Variants Error:", error);
    return { success: false, data: [] };
  }
}

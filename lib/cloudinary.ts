import { v2 as cloudinary } from 'cloudinary';

// Cloudinary কনফিগারেশন (.env.local থেকে ডেটা নিচ্ছে)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Serverless অপ্টিমাইজড ইমেজ আপলোড ফাংশন
 * @param fileBuffer - ইমেজের বাফার ডেটা
 * @param folderName - Cloudinary-তে কোন ফোল্ডারে সেভ হবে (যেমন: 'products' বা 'fabrics')
 */
export async function uploadImageToCloudinary(fileBuffer: Buffer, folderName: string) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `panjabi-shop/${folderName}`,
        // স্বয়ংক্রিয়ভাবে ইমেজ অপ্টিমাইজ করে সবচেয়ে ফাস্ট ফরম্যাট (যেমন WebP/AVIF) জেনারেট করবে
        format: 'auto', 
        quality: 'auto' 
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/**
 * ইমেজ ডিলিট করার ফাংশন (ডাটাবেস স্পেস ক্লিন রাখার জন্য)
 * @param publicId - Cloudinary ইমেজের ইউনিক আইডি (URL থেকে বের করে নিতে হয়)
 */
export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * URL থেকে Public ID বের করার হেল্পার ফাংশন
 * Cloudinary URL থেকে ডিলিট করার জন্য এই আইডিটি প্রয়োজন হয়।
 */
export function getPublicIdFromUrl(url: string) {
  const splits = url.split('/');
  // ফোল্ডার স্ট্রাকচারসহ আইডি বের করা (যেমন: panjabi-shop/products/abc1234)
  const idWithExtension = splits.slice(splits.length - 3).join('/');
  return idWithExtension.split('.')[0];
}
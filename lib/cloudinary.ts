import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Serverless
 * @param fileBuffer
 * @param folderName
 */
export async function uploadImageToCloudinary(fileBuffer: Buffer, folderName: string) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `panjabi-shop/${folderName}`,
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
 * @param publicId
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

export function getPublicIdFromUrl(url: string) {
  const splits = url.split('/');
  const idWithExtension = splits.slice(splits.length - 3).join('/');
  return idWithExtension.split('.')[0];
}
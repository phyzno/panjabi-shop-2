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

export async function deleteCloudinaryResource(publicId: string, resourceType: "image" | "video" = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error("Error deleting Cloudinary resource:", error);
    throw new Error("Failed to delete Cloudinary resource");
  }
}

export function getPublicIdFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes("cloudinary.com")) return null;

    const parts = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    const publicIdParts = parts.slice(uploadIndex + 1);
    if (/^v\d+$/.test(publicIdParts[0] || "")) {
      publicIdParts.shift();
    }

    return publicIdParts.join("/").replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

export function getCloudinaryResourceType(url: string): "image" | "video" {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts.includes("video") ? "video" : "image";
  } catch {
    return "image";
  }
}

export async function deleteCloudinaryUrl(url: string) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return null;

  return deleteCloudinaryResource(publicId, getCloudinaryResourceType(url));
}

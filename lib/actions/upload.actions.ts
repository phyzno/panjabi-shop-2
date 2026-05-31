"use server";

import { v2 as cloudinary } from "cloudinary";
import { deleteImageFromCloudinary, getPublicIdFromUrl, uploadImageToCloudinary } from "@/lib/cloudinary";

export async function uploadImages(base64Files: string[], folderName: string) {
  try {
    const urls: string[] = [];
    
    for (const file of base64Files) {
      const result = await cloudinary.uploader.upload(file, {
        folder: folderName,
        resource_type: "auto",
      });
      
      urls.push(result.secure_url);
    }
    
    return { success: true, urls };
  } catch (error) {
    console.error("Image Upload Error:", error);
    return { success: false, error: "Failed to upload images" };
  }
}

export async function deleteUploadedImages(urls: string[]) {
  try {
    for (const url of urls) {
      if (url) {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) await deleteImageFromCloudinary(publicId);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to rollback images:", error);
    return { success: false };
  }
}

export async function uploadFileViaFormData(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const folderName = formData.get("folderName") as string;
    
    if (!file) throw new Error("No file found in FormData");
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);  
    const mimeType = file.type || "image/jpeg";
    const fileUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(fileUri, {
      folder: folderName,
      resource_type: "auto",
    });
    
    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Upload File Error:", error);
    return { success: false, error: "Failed to upload file" };
  }
}
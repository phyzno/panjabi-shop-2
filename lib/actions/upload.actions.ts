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

// upload.actions.ts এর একেবারে নিচে এটি যোগ করুন:

export async function uploadFileViaFormData(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const folderName = formData.get("folderName") as string;
    
    if (!file) throw new Error("No file found in FormData");
    
    // ১. File থেকে মেমরি Buffer তৈরি
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // ২. সার্ভার-সাইডে এক্সটেনশন সহ পূর্ণাঙ্গ Data URI (Base64) রিবিল্ড করা হচ্ছে
    const mimeType = file.type || "image/jpeg";
    const fileUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
    
    // ৩. Cloudinary-তে সরাসরি Data URI আপলোড (Buffer এরর বাইপাস)
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
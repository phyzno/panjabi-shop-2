"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addFabric, updateFabric } from "@/lib/actions/fabric.actions";
import { Loader2 } from "lucide-react";
import TextureUploader from "./TextureUploader";
import { uploadImages, deleteUploadedImages, uploadFileViaFormData } from "@/lib/actions/upload.actions";

// Base64 স্ট্রিংকে আসল File অবজেক্টে কনভার্ট করার হেল্পার
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export default function FabricForm({
  initialData,
  isEditMode = false,
  availableColors = [],
  availablePatterns = []
}: {
  initialData?: any,
  isEditMode?: boolean,
  availableColors?: string[],
  availablePatterns?: string[]
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fabric States
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors || []);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialData?.patterns || []);
  const [textureUrl, setTextureUrl] = useState<string>(initialData?.texture_url || "");
  const [rawUrl, setRawUrl] = useState<string>(initialData?.raw_image_url || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ১. ইভেন্ট (e) মেমোরি থেকে হারিয়ে যাওয়ার আগেই ফর্ম ডেটা এক্সট্রাক্ট করে নিতে হবে
    const formData = new FormData(e.currentTarget);

    if (!textureUrl || !rawUrl) {
      alert("Please upload and optimize a fabric texture image!");
      return;
    }
    setLoading(true);

    let uploadedUrls: string[] = []; // রোলব্যাকের (Garbage Collection) জন্য

    try {
      let finalTextureUrl = textureUrl;
      let finalRawUrl = rawUrl;

      // ২. ক্লাউডিনারিতে আপলোড (FormData ব্যবহার করে)
      if (textureUrl.startsWith("data:image")) {
        const fd = new FormData();
        fd.append("file", base64ToFile(textureUrl, "texture.jpg"));
        fd.append("folderName", "fabrics/seamless");
        
        const textureRes = await uploadFileViaFormData(fd);
        if (textureRes.success && textureRes.url) {
          finalTextureUrl = textureRes.url;
          uploadedUrls.push(finalTextureUrl);
        } else {
          throw new Error("Texture upload failed");
        }
      }

      if (rawUrl.startsWith("data:image")) {
        const fd = new FormData();
        fd.append("file", base64ToFile(rawUrl, "raw.jpg"));
        fd.append("folderName", "fabrics/raw");
        
        const rawRes = await uploadFileViaFormData(fd);
        if (rawRes.success && rawRes.url) {
          finalRawUrl = rawRes.url;
          uploadedUrls.push(finalRawUrl);
        } else {
          throw new Error("Raw image upload failed");
        }
      }

      // ৩. ডাটাগুলো FormData-তে অ্যাপেন্ড করা (Next.js সিরিয়ালাইজার বাগ বাইপাস করার জন্য)
      const submissionData = new FormData();
      submissionData.append("name", formData.get("name") as string);
      submissionData.append("description", formData.get("description") as string);
      submissionData.append("price", formData.get("price") as string);
      submissionData.append("texture_url", finalTextureUrl);
      submissionData.append("raw_image_url", finalRawUrl);
      
      // অ্যারেগুলোকে নিরাপদ সিরিয়ালাইজেশনের জন্য JSON String বানিয়ে পাঠানো হচ্ছে
      submissionData.append("colors", JSON.stringify(selectedColors));
      submissionData.append("patterns", JSON.stringify(selectedPatterns));

      // ৪. ডাটাবেসে সেভ বা আপডেট করা (সরাসরি FormData পাস করা হচ্ছে)
      let res;
      if (isEditMode && initialData?.id) {
        res = await updateFabric(initialData.id, submissionData);
      } else {
        res = await addFabric(submissionData);
      }

      if (res?.success) {
        router.push("/admin/fabrics");
        router.refresh();
      } else {
        // ডাটাবেস ফেইল করলে আপলোড হওয়া ছবি মুছে ফেলা (রোলব্যাক)
        if (uploadedUrls.length > 0) await deleteUploadedImages(uploadedUrls);
        alert(res?.error || "Error saving fabric");
      }
    } catch (error) {
      console.error(error);
      // নেটওয়ার্ক বা ক্যাশ এররের ক্ষেত্রেও রোলব্যাক
      if (uploadedUrls.length > 0) await deleteUploadedImages(uploadedUrls);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item: string, type: 'color' | 'pattern') => {
    if (type === 'color') {
      setSelectedColors(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedPatterns(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-8">

      {/* Name & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Fabric Name</label>
          <input type="text" name="name" defaultValue={initialData?.name} required placeholder="e.g. Premium Egyptian Cotton" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-sans text-sm" />
        </div>
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Base Price (৳)</label>
          <input type="number" name="price" defaultValue={initialData?.price} required placeholder="e.g. 1500" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-heading font-bold text-primary mb-2">Description / Fabric Details</label>
        <textarea name="description" defaultValue={initialData?.description} rows={3} placeholder="Describe the fabric feel, thread count, etc." className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm resize-none" />
      </div>

      {/* Colors & Patterns Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
        {/* Colors */}
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-3">Available Colors</label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                type="button"
                key={color}
                onClick={() => toggleSelection(color, 'color')}
                className={`px-3 py-1.5 border rounded-md text-xs transition-colors cursor-pointer ${selectedColors.includes(color)
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary'
                  }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-3">Fabric Patterns</label>
          <div className="flex flex-wrap gap-2">
            {availablePatterns.map(pattern => (
              <button
                type="button"
                key={pattern}
                onClick={() => toggleSelection(pattern, 'pattern')}
                className={`px-3 py-1.5 border rounded-md text-xs transition-colors cursor-pointer ${selectedPatterns.includes(pattern)
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:border-accent'
                  }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Texture Builder Integration */}
      <div className="pt-4 border-t border-border">
        <TextureUploader
          currentTextureUrl={textureUrl}
          currentRawUrl={rawUrl}
          onTextureReady={(raw, processed) => {
            setRawUrl(raw);
            setTextureUrl(processed);
          }}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-border flex justify-end">
        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-md font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 cursor-pointer">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : (isEditMode ? 'Update Fabric' : 'Save Fabric')}
        </button>
      </div>

    </form>
  );
}
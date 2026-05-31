"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImages, deleteUploadedImages } from "@/lib/actions/upload.actions";
import { addProduct, updateProduct } from "@/lib/actions/product.actions";
import { Loader2, UploadCloud, X, Star } from "lucide-react";
import Image from "next/image";

const compressImageNative = (file: File, maxWidth = 1200, quality = 0.75): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
    };
    reader.onerror = () => resolve(file);
  });
};
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function ProductForm({
  categories,
  initialData,
  isEditMode = false
}: {
  categories: any[],
  initialData?: any,
  isEditMode?: boolean
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];
  const NUMBERED_SIZES = ["38", "40", "42", "44", "46", "48"];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let uploadedUrls: string[] = [];

    try {
      const formData = new FormData(e.currentTarget);
      const categoryId = Number(formData.get("category_id"));
      
      if (imageFiles.length > 0) {
        const compressedFiles = await Promise.all(imageFiles.map(file => compressImageNative(file)));
        const base64Files = await Promise.all(compressedFiles.map(file => fileToBase64(file)));
        
        const uploadRes = await uploadImages(base64Files, "products");
        if (uploadRes.success && uploadRes.urls) {
          uploadedUrls = uploadRes.urls;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const allUrls = imagePreviews.map(preview => {
        if (preview.startsWith('blob:')) {
          return uploadedUrls.shift() || ""; 
        }
        return preview; 
      });

      if (coverIndex !== 0 && allUrls.length > coverIndex) {
        const cover = allUrls.splice(coverIndex, 1)[0];
        allUrls.unshift(cover);
      }

      const productData = {
        category_id: categoryId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        images: allUrls,
        sizes: selectedSizes, 
        stock: initialData?.stock || {}, 
        is_featured: initialData?.is_featured || false,
      };

      let res;
      if (isEditMode && initialData?.id) {
        res = await updateProduct(initialData.id, productData);
      } else {
        res = await addProduct(productData);
      }

      if (res?.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        if (uploadedUrls.length > 0) {
          await deleteUploadedImages(uploadedUrls);
        }
        alert(res?.error || "Error saving product");
      }
    } catch (error) {
      console.error(error);
      if (uploadedUrls.length > 0) {
        await deleteUploadedImages(uploadedUrls);
      }
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previewsArray]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));

    if (coverIndex === index) setCoverIndex(0);
    else if (coverIndex > index) setCoverIndex(prev => prev - 1);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Product Name</label>
          <input type="text" name="name" defaultValue={initialData?.name} required placeholder="e.g. Royal Olive Panjabi" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-sans text-sm" />
        </div>
        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Category</label>
          <select name="category_id" defaultValue={initialData?.category_id} required className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm cursor-pointer">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-heading font-bold text-primary mb-2">Price (৳)</label>
        <input type="number" name="price" defaultValue={initialData?.price} required placeholder="e.g. 2500" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
      </div>

      <div>
        <label className="block text-sm font-heading font-bold text-primary mb-2">Description</label>
        <textarea name="description" defaultValue={initialData?.description} rows={4} placeholder="Premium quality fabric details..." className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm resize-none" />
      </div>

      <div>
        <label className="block text-sm font-heading font-bold text-primary mb-3">Available Sizes</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-secondary/20 p-4 md:p-5 border border-border rounded-lg">
          <div>
            <span className="block text-xs font-sans text-muted-foreground mb-3 uppercase tracking-wider">Standard Sizes</span>
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3.5 py-1.5 border rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedSizes.includes(size) 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-sans text-muted-foreground mb-3 uppercase tracking-wider">Numbered Sizes</span>
            <div className="flex flex-wrap gap-2">
              {NUMBERED_SIZES.map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-3.5 py-1.5 border rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    selectedSizes.includes(size) 
                      ? 'bg-accent text-white border-accent shadow-sm' 
                      : 'bg-background text-muted-foreground border-border hover:border-accent/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-heading font-bold text-primary">Product Images</label>
          <span className="text-xs text-muted-foreground font-sans">Click on the star to set as Cover Image</span>
        </div>

        <div className="flex flex-wrap gap-4">
          {imagePreviews.map((src, index) => (
            <div
              key={index}
              className={`relative w-28 h-32 rounded-md overflow-hidden bg-secondary transition-all ${coverIndex === index ? 'border-2 border-primary shadow-md ring-2 ring-primary/20' : 'border border-border'
                }`}
            >
              <Image src={src} alt="Preview" fill className="object-cover" />

              <button
                type="button"
                onClick={() => setCoverIndex(index)}
                className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer ${coverIndex === index ? 'bg-primary text-white' : 'bg-black/40 text-white/70 hover:bg-black/60'
                  }`}
                title="Mark as Cover"
              >
                <Star size={14} className={coverIndex === index ? 'fill-current' : ''} />
              </button>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-1.5 hover:bg-red-600 backdrop-blur-sm cursor-pointer"
              >
                <X size={14} />
              </button>

              {coverIndex === index && (
                <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[10px] text-center py-1 uppercase tracking-wider backdrop-blur-sm">
                  Cover
                </div>
              )}
            </div>
          ))}

          <label className="w-28 h-32 border-2 border-dashed border-border hover:border-primary rounded-md flex flex-col items-center justify-center cursor-pointer bg-secondary/30 transition-colors text-muted-foreground hover:text-primary">
            <UploadCloud size={24} className="mb-2" />
            <span className="text-[11px] uppercase tracking-wider text-center">Add<br />Image</span>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-md font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 cursor-pointer">
          {loading ? <><Loader2 size={18} className="animate-spin" /> {isEditMode ? 'Updating...' : 'Saving...'}</> : (isEditMode ? 'Update Product' : 'Save Product')}
        </button>
      </div>
    </form>
  );
}
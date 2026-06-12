"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkFabricIdExists, addFabric, updateFabric } from "@/lib/actions/fabric.actions";
import { uploadImages, deleteUploadedImages, uploadFileViaFormData } from "@/lib/actions/upload.actions";
import { Loader2, UploadCloud, X, Star, Pipette, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import TextureUploader from "./TextureUploader";

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

const ALLOWED_PRODUCTS_OPTIONS = ["Panjabi", "Jubba", "Shirt", "Pant", "Pajama"];

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
  
  // --- ID Checking States ---
  const [fabricId, setFabricId] = useState(initialData?.id || "");
  const [idStatus, setIdStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // --- Basic State ---
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.colors || []);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialData?.patterns || []);
  const [selectedAllowedProducts, setSelectedAllowedProducts] = useState<string[]>(initialData?.allowed_products || []);
  const [textureUrl, setTextureUrl] = useState<string>(initialData?.texture_url || "");
  const [rawUrl, setRawUrl] = useState<string>(initialData?.raw_image_url || "");

  // --- Preview Images State ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.preview_images || []);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // --- Multi-Color States ---
  const [isMultiColor, setIsMultiColor] = useState<boolean>(!!initialData?.group_id);
  const [groupId, setGroupId] = useState<string>(initialData?.group_id || "");
  const [colorName, setColorName] = useState<string>(initialData?.color_name || "");
  const [colorHex, setColorHex] = useState<string>(initialData?.color_hex || "#ffffff");

  // --- Color Picker Modal States ---
  const [pickerImageSrc, setPickerImageSrc] = useState<string | null>(null);
  const [tempHex, setTempHex] = useState<string>("#ffffff");
  const [magnifier, setMagnifier] = useState<{ x: number, y: number, color: string, show: boolean, rectWidth: number }>({ x: 0, y: 0, color: '#ffffff', show: false, rectWidth: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Color Picker Logic ---
  useEffect(() => {
    if (pickerImageSrc) setIsInteracting(false);
  }, [pickerImageSrc]);

  useEffect(() => {
    if (pickerImageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.7;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
      };
      img.src = pickerImageSrc;
    }
  }, [pickerImageSrc]);

  const handleCanvasInteraction = (clientX: number, clientY: number, action: 'hover' | 'drag' | 'lock') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      setMagnifier(prev => ({ ...prev, show: false }));
      return;
    }

    const radius = 2; 
    const size = radius * 2 + 1;
    const startX = Math.max(0, x - radius);
    const startY = Math.max(0, y - radius);
    
    const pixelData = ctx?.getImageData(startX, startY, size, size).data;
    let hex = "#ffffff";

    if (pixelData) {
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < pixelData.length; i += 4) {
        if (pixelData[i + 3] === 0) continue; 
        r += pixelData[i];
        g += pixelData[i + 1];
        b += pixelData[i + 2];
        count++;
      }
      
      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
      } else {
        r = 255; g = 255; b = 255;
      }

      hex = "#" + [r, g, b].map(i => {
        const hexPart = i.toString(16);
        return hexPart.length === 1 ? "0" + hexPart : hexPart;
      }).join("");

      if (action === 'lock' || action === 'drag') {
        setTempHex(hex);
      }
      
      const magX = clientX - rect.left;
      const magY = clientY - rect.top;

      setMagnifier({
        x: magX,
        y: magY,
        color: hex,
        show: action === 'hover' || action === 'drag',
        rectWidth: rect.width
      });
    }
  };

  // --- Check ID Availability ---
  const handleCheckId = async () => {
    if (!fabricId.trim() || isEditMode) return;
    setIdStatus('checking');
    const res = await checkFabricIdExists(fabricId);
    if (res.success) {
      setIdStatus(res.exists ? 'taken' : 'available');
    } else {
      setIdStatus('idle');
    }
  };

  // --- Image Handlers ---
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

  const toggleSelection = (item: string, type: 'color' | 'pattern' | 'product') => {
    if (type === 'color') {
      setSelectedColors(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else if (type === 'pattern') {
      setSelectedPatterns(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedAllowedProducts(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!textureUrl || !rawUrl) {
      alert("Please upload and optimize a fabric texture image!");
      return;
    }

    if (!isEditMode && idStatus === 'taken') {
      alert("This Fabric ID is already taken. Please choose another one.");
      return;
    }

    setLoading(true);
    let uploadedUrls: string[] = [];

    try {
      const formData = new FormData(e.currentTarget);

      // 1. Handle Preview Images Upload
      let uploadedPreviewUrls: string[] = [];
      if (imageFiles.length > 0) {
        const compressedFiles = await Promise.all(imageFiles.map(file => compressImageNative(file)));
        const base64Files = await Promise.all(compressedFiles.map(file => fileToBase64(file)));

        const uploadRes = await uploadImages(base64Files, "fabrics/previews");
        if (uploadRes.success && uploadRes.urls) {
          uploadedPreviewUrls = uploadRes.urls;
          uploadedUrls.push(...uploadedPreviewUrls);
        } else {
          throw new Error("Preview Image upload failed");
        }
      }

      // Merge old images with newly uploaded ones
      const allPreviewUrls = imagePreviews.map(preview => {
        if (preview.startsWith('blob:')) {
          return uploadedPreviewUrls.shift() || "";
        }
        return preview;
      });

      // Adjust cover image to index 0
      if (coverIndex !== 0 && allPreviewUrls.length > coverIndex) {
        const cover = allPreviewUrls.splice(coverIndex, 1)[0];
        allPreviewUrls.unshift(cover);
      }

      // 2. Handle Texture & Raw Image Upload
      let finalTextureUrl = textureUrl;
      let finalRawUrl = rawUrl;

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

      if (rawUrl.startsWith("data:image") || rawUrl.startsWith("blob:")) {
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

      // 3. Compile Submission Data Object
      const payload = {
        id: fabricId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        discount_percentage: Number(formData.get("discount_percentage")) || 0,
        texture_url: finalTextureUrl,
        raw_image_url: finalRawUrl,
        video_url: formData.get("video_url") as string,
        colors: selectedColors,
        patterns: selectedPatterns,
        preview_images: allPreviewUrls,
        allowed_products: selectedAllowedProducts,
        group_id: isMultiColor ? groupId : null,
        color_name: isMultiColor ? colorName : null,
        color_hex: isMultiColor ? colorHex : null,
      };

      // 4. Submit to Database
      let res;
      if (isEditMode && initialData?.id) {
        res = await updateFabric(initialData.id, payload);
      } else {
        res = await addFabric(payload);
      }

      if (res?.success) {
        router.push("/admin/fabrics");
        router.refresh();
      } else {
        if (uploadedUrls.length > 0) await deleteUploadedImages(uploadedUrls);
        alert(res?.error || "Error saving fabric");
      }
    } catch (error) {
      console.error(error);
      if (uploadedUrls.length > 0) await deleteUploadedImages(uploadedUrls);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-8">

        {/* --- Basic Information & ID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Fabric Name</label>
            <input type="text" name="name" defaultValue={initialData?.name} required placeholder="e.g. Premium Egyptian Cotton" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-sans text-sm" />
          </div>
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Fabric ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                  value={fabricId}
                  onChange={(e) => {
                    setFabricId(e.target.value);
                    setIdStatus('idle');
                  }}
                disabled={isEditMode}
                required
                placeholder="e.g. FAB-001" 
                className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm disabled:opacity-60" 
              />
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleCheckId}
                  disabled={!fabricId || idStatus === 'checking'}
                  className="px-4 py-2 bg-secondary border border-border text-primary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
                >
                  {idStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : 'Check'}
                </button>
              )}
            </div>
            {!isEditMode && idStatus === 'available' && <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-sans"><CheckCircle2 size={14} /> ID is available!</p>}
            {!isEditMode && idStatus === 'taken' && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-sans"><AlertCircle size={14} /> ID already exists!</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Base Price (৳)</label>
            <input type="number" name="price" defaultValue={initialData?.price} required placeholder="e.g. 1500" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
          </div>
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Discount Percentage (%) <span className="text-muted-foreground font-normal text-xs">(Optional)</span></label>
            <input type="number" name="discount_percentage" defaultValue={initialData?.discount_percentage || 0} min="0" max="100" placeholder="e.g. 10" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-heading font-bold text-primary mb-2">Description / Fabric Details</label>
            <textarea name="description" defaultValue={initialData?.description} rows={3} placeholder="Describe the fabric feel, thread count, etc." className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-heading font-bold text-primary mb-2">Video URL <span className="text-muted-foreground font-normal text-xs">(YouTube / Facebook / iFrame)</span></label>
            <input type="text" name="video_url" defaultValue={initialData?.video_url} placeholder='e.g. https://youtu.be/... or <iframe src="..."></iframe>' className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
            <p className="text-[10px] text-muted-foreground mt-1">You can directly paste YouTube/Facebook video URLs or Embed HTML codes here.</p>
          </div>
        </div>

        {/* --- Classifications --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
          <div className="md:col-span-3">
            <label className="block text-sm font-heading font-bold text-primary mb-3">Allowed Products</label>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_PRODUCTS_OPTIONS.map(product => (
                <button
                  type="button"
                  key={product}
                  onClick={() => toggleSelection(product, 'product')}
                  className={`px-4 py-2 border rounded-md text-xs font-medium transition-colors cursor-pointer ${selectedAllowedProducts.includes(product)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary'
                    }`}
                >
                  {product}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select which products can be made using this fabric.</p>
          </div>

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

          <div className="md:col-span-2">
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

        {/* --- Multi-Color Configuration Section --- */}
        <div className="bg-secondary/20 border border-border p-5 rounded-lg space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMultiColor}
              onChange={(e) => setIsMultiColor(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <span className="text-sm font-heading font-bold text-primary">Is this a Multi-Color Variant Fabric?</span>
          </label>

          {isMultiColor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border/50">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Group ID</label>
                <input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="e.g. FAB-STYLE-01"
                  required={isMultiColor}
                  className="w-full border border-border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none font-sans text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Variant Color Name</label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g. Navy Blue"
                  required={isMultiColor}
                  className="w-full border border-border bg-background rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none font-sans text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Color Hex</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-9 h-9 rounded-md border border-border shadow-sm shrink-0 p-0 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#000000"
                    required={isMultiColor}
                    className="w-full border border-border bg-secondary/50 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary font-mono text-sm text-foreground uppercase"
                    maxLength={7}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Pick from images below or adjust manually.</p>
              </div>
            </div>
          )}
        </div>

        {/* --- Fabric Previews (Multiple Images) --- */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-heading font-bold text-primary">Preview Images</label>
            <span className="text-xs text-muted-foreground font-sans">Click on the star to set as Cover Image</span>
          </div>

          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((src, index) => (
              <div
                key={index}
                className={`group relative w-28 h-32 rounded-md overflow-hidden bg-secondary transition-all ${coverIndex === index ? 'border-2 border-primary shadow-md ring-2 ring-primary/20' : 'border border-border'
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

                {isMultiColor && (
                  <button
                    type="button"
                    onClick={() => setPickerImageSrc(src)}
                    className={`absolute right-2 bg-blue-500/90 text-white rounded-full p-1.5 hover:bg-blue-600 backdrop-blur-sm cursor-pointer transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${
                      coverIndex === index ? 'bottom-8' : 'bottom-2'
                    }`}
                    title="Pick Color"
                  >
                    <Pipette size={14} />
                  </button>
                )}

                {coverIndex === index && (
                  <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[10px] text-center py-1 uppercase tracking-wider backdrop-blur-sm z-10">
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

        {/* --- Fabric Texture Uploader (Seamless) --- */}
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

        <div className="pt-6 border-t border-border flex justify-end">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-md font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 cursor-pointer">
            {loading ? <><Loader2 size={18} className="animate-spin" /> {isEditMode ? 'Updating...' : 'Saving...'}</> : (isEditMode ? 'Update Fabric' : 'Save Fabric')}
          </button>
        </div>

      </form>

      {/* --- Image Color Picker Modal --- */}
      {pickerImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-background rounded-lg shadow-xl border border-border p-5 max-w-4xl w-full flex flex-col items-center relative">

            <button
              type="button"
              onClick={() => {
                setPickerImageSrc(null);
                setMagnifier(prev => ({ ...prev, show: false }));
              }}
              className="absolute top-4 right-4 bg-secondary/80 text-primary hover:bg-secondary rounded-full p-2 cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4 w-full">
              <h3 className="text-lg font-heading font-bold text-primary flex items-center justify-center gap-2">
                <Pipette size={20} /> Pick Variant Color
              </h3>
              <p className="text-sm text-muted-foreground font-sans">Hover/Drag on the image to preview, Click to lock.</p>
            </div>

            <div className="relative border-2 border-border border-dashed rounded-md bg-black/10 w-full max-w-[90vw] max-h-[60vh] flex items-center justify-center overflow-hidden">
              {!isInteracting && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none sm:hidden z-10">
                  <div className="bg-background/60 backdrop-blur-md border border-border text-primary px-5 py-2 rounded-full font-sans text-sm shadow-lg animate-pulse">
                    Touch & Drag to Pick
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="cursor-crosshair max-w-full max-h-[60vh] object-contain touch-none"
                style={{ touchAction: 'none' }}
                onMouseEnter={() => setIsInteracting(true)}
                onMouseLeave={() => {
                  setMagnifier(prev => ({ ...prev, show: false }));
                  setIsInteracting(false);
                }}
                onMouseMove={(e) => {
                  setIsInteracting(true);
                  handleCanvasInteraction(e.clientX, e.clientY, 'hover');
                }}
                onClick={(e) => handleCanvasInteraction(e.clientX, e.clientY, 'lock')}
                onTouchStart={(e) => {
                  setIsInteracting(true);
                  handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY, 'drag');
                }}
                onTouchMove={(e) => handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY, 'drag')}
                onTouchEnd={() => setMagnifier(prev => ({ ...prev, show: false }))}
              />
              
              {magnifier.show && (
                <div 
                  className="absolute pointer-events-none w-14 h-14 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(0,0,0,0.6)] flex items-center justify-center z-50 transition-none"
                  style={{ 
                    left: Math.max(10, Math.min(magnifier.x - 28, magnifier.rectWidth ? magnifier.rectWidth - 66 : 1000)), 
                    top: magnifier.y - 85 < 10 ? magnifier.y + 40 : magnifier.y - 85,
                    backgroundColor: magnifier.color 
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full"></div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full justify-between bg-secondary/30 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="color"
                  value={tempHex}
                  onChange={(e) => setTempHex(e.target.value)}
                  className="w-12 h-12 rounded-md border-2 border-border shadow-inner shrink-0 p-0 bg-transparent cursor-pointer"
                />
                <div className="flex-1">
                  <span className="block text-xs text-muted-foreground uppercase tracking-wider mb-1">Selected Color</span>
                  <input
                    type="text"
                    value={tempHex}
                    onChange={(e) => setTempHex(e.target.value)}
                    className="w-full sm:w-32 font-mono text-primary bg-background px-2 py-1 rounded border border-border text-sm outline-none focus:ring-1 focus:ring-primary uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                <button 
                  type="button" 
                  onClick={() => {
                    setPickerImageSrc(null);
                    setMagnifier(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-md border border-border text-primary font-sans text-sm hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setColorHex(tempHex);
                    setPickerImageSrc(null);
                    setMagnifier(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-md bg-primary text-white font-sans text-sm hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Color
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

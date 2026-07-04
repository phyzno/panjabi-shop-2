"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadImages, deleteUploadedImages } from "@/lib/actions/upload.actions";
import { addProduct, updateProduct, checkProductIdExists } from "@/lib/actions/product.actions";
import { Loader2, UploadCloud, X, Star, CheckCircle2, AlertCircle, Pipette, Plus, RotateCcw } from "lucide-react";
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

  // --- Multi-Color States ---
  const [isMultiColor, setIsMultiColor] = useState<boolean>(!!initialData?.group_id);
  const [groupId, setGroupId] = useState<string>(initialData?.group_id || "");
  const [colorName, setColorName] = useState<string>(initialData?.color_name || "");
  const [colorHex, setColorHex] = useState<string>(initialData?.color_hex || "#ffffff");

  // --- Price Variation States ---
  const [hasPriceVariation, setHasPriceVariation] = useState<boolean>(initialData?.has_price_variation || false);
  const [sizePrices, setSizePrices] = useState<Record<string, number>>(initialData?.size_prices || {});

  // --- Color Picker Modal States ---
  const [pickerImageSrc, setPickerImageSrc] = useState<string | null>(null);
  const [tempHex, setTempHex] = useState<string>("#ffffff");
  const [magnifier, setMagnifier] = useState<{ x: number, y: number, color: string, show: boolean, rectWidth: number }>({ x: 0, y: 0, color: '#ffffff', show: false, rectWidth: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Additional Details Default Template ---
  const defaultDetails = [
    { title: 'Fabric & Material', content: 'Premium woven fabric with refined tailoring. Each piece is selected to complement the silhouette while keeping comfort in focus.' },
    { title: 'Sizing & Fit', content: 'Fits true to size with a balanced drape. Use the size selector below or visit our measurement guide for a custom fit.' },
    { title: 'Care Instructions', content: 'Dry clean only. Keep it in a breathable garment bag and avoid direct ironing on detailing.' }
  ];

  const [rating, setRating] = useState<number>(initialData?.rating ?? 4.8);
  const [reviewCount, setReviewCount] = useState<number>(initialData?.review_count ?? 24);
  const [hasSizeGuide, setHasSizeGuide] = useState<boolean>(initialData?.has_size_guide ?? true);
  const [sizeGuideTemplate, setSizeGuideTemplate] = useState<string>(initialData?.size_guide_template || "panjabi");
  const [additionalDetails, setAdditionalDetails] = useState<{title: string, content: string}[]>(
    initialData?.additional_details?.length ? initialData.additional_details : defaultDetails
  );

  const addDetail = () => setAdditionalDetails([...additionalDetails, { title: "", content: "" }]);
  const updateDetail = (index: number, key: 'title' | 'content', value: string) => {
    const newDetails = [...additionalDetails];
    newDetails[index][key] = value;
    setAdditionalDetails(newDetails);
  };
  const removeDetail = (index: number) => setAdditionalDetails(additionalDetails.filter((_, i) => i !== index));
  const resetDetails = () => setAdditionalDetails(defaultDetails);

  useEffect(() => {
    if (pickerImageSrc) setIsInteracting(false);
  }, [pickerImageSrc]);

  // --- Size Configurations ---
  const SIZE_GROUPS = {
    apparel: {
      label: "Apparel (Panjabi, Shirts)",
      groups: [
        { title: "Standard Sizes", presets: ["S", "M", "L", "XL", "XXL"] },
        { title: "Numbered Sizes (Chest/Length)", presets: ["36", "38", "40", "42", "44", "46", "48"] }
      ]
    },
    jubba: {
      label: "Jubba / Thobe",
      groups: [
        { title: "Standard Sizes", presets: ["S", "M", "L", "XL", "XXL"] },
        { title: "Length Sizes", presets: ["52", "54", "56", "58", "60", "62"] }
      ]
    },
    pants: {
      label: "Trousers & Pants",
      groups: [
        { title: "Waist Sizes", presets: ["28", "30", "32", "34", "36", "38", "40", "42"] }
      ]
    },
    shoes: {
      label: "Footwear (Shoes, Sandals)",
      groups: [
        { title: "EU Sizes", presets: ["39", "40", "41", "42", "43", "44", "45", "46"] }
      ]
    },
    volume: {
      label: "Volume (Perfume, Liquid)",
      groups: [
        { title: "Milliliters (ml)", presets: ["30ml", "50ml", "100ml", "150ml", "200ml"] }
      ]
    },
    free_size: {
      label: "Accessories (Watch, Sunglass)",
      groups: [
        { title: "Single Size", presets: ["Standard", "Regular", "Free Size"] }
      ]
    },
    custom_only: {
      label: "Custom Size Only",
      groups: []
    }
  };

  type SizeGroupKey = keyof typeof SIZE_GROUPS;

  const [activeSizeMode, setActiveSizeMode] = useState<SizeGroupKey>("apparel");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialData?.sizes || []);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes(prev => [...prev, trimmed]);
    }
    setCustomSizeInput("");
  };

  const [productId, setProductId] = useState(initialData?.id || "");
  const [idStatus, setIdStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const renderCategoryOptions = (cats: any[], depth = 0) => {
    return cats.flatMap((cat) => {
      const prefix = depth > 0 ? "\u00A0\u00A0\u00A0".repeat(depth) + "└─ " : "";
      const options = [
        <option key={cat.id} value={cat.id} className={depth === 0 ? "text-primary bg-secondary/30" : "text-foreground"}>
          {prefix}{cat.name}
        </option>
      ];
      if (cat.children && cat.children.length > 0) {
        options.push(...renderCategoryOptions(cat.children, depth + 1));
      }
      return options;
    });
  };

  const handleCheckId = async () => {
    if (!productId.trim() || isEditMode) return;
    setIdStatus('checking');
    const res = await checkProductIdExists(productId);
    if (res.success) {
      setIdStatus(res.exists ? 'taken' : 'available');
    } else {
      setIdStatus('idle');
    }
  };

  // --- Canvas Color Picker Logic ---
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

    // Average color over a 5x5 pixel area
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

      // No auto close on 'lock' - user must click "Confirm"
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

      if (!isEditMode && idStatus === 'taken') {
        alert("This Product ID is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      const basePrice = hasPriceVariation && selectedSizes.length > 0
      ? Math.min(...selectedSizes.map(size => sizePrices[size] || 0))
      : Number(formData.get("price"));

      const productData = {
        id: productId,
        category_id: categoryId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: basePrice,
        discount_percentage: Number(formData.get("discount_percentage")) || 0,
        has_price_variation: hasPriceVariation,
        size_prices: hasPriceVariation ? sizePrices : {},
        rating: rating,
        review_count: reviewCount,
        has_size_guide: hasSizeGuide,
        size_guide_template: sizeGuideTemplate,
        additional_details: additionalDetails,
        images: allUrls,
        video_url: formData.get("video_url") as string,
        sizes: selectedSizes,
        stock: initialData?.stock || {},
        is_featured: initialData?.is_featured || false,
        group_id: isMultiColor ? groupId : null,
        color_name: isMultiColor ? colorName : null,
        color_hex: isMultiColor ? colorHex : null,
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
    <>
      <form onSubmit={handleFormSubmit} className="bg-background border border-border rounded-lg p-6 md:p-8 shadow-sm space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Product Name</label>
            <input type="text" name="name" defaultValue={initialData?.name} required placeholder="e.g. Royal Olive Panjabi" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-sans text-sm" />
          </div>
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Category</label>
            <select name="category_id" defaultValue={initialData?.category_id} required className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm cursor-pointer">
              <option value="">Select a category</option>
              {renderCategoryOptions(categories)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Product ID / SKU</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setIdStatus('idle');
              }}
              disabled={isEditMode}
              required
              placeholder="e.g. PNJ-001"
              className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm disabled:opacity-60"
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={handleCheckId}
                disabled={!productId || idStatus === 'checking'}
                className="px-4 py-2 bg-secondary border border-border text-primary rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
              >
                {idStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : 'Check'}
              </button>
            )}
          </div>
          {!isEditMode && idStatus === 'available' && <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-sans"><CheckCircle2 size={14} /> ID is available!</p>}
          {!isEditMode && idStatus === 'taken' && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-sans"><AlertCircle size={14} /> ID already exists!</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-heading font-bold text-primary">Regular Price (৳)</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasPriceVariation} 
                  onChange={(e) => setHasPriceVariation(e.target.checked)} 
                  className="w-4 h-4 accent-primary cursor-pointer" 
                />
                <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                  Varies on Size
                </span>
              </label>
            </div>
            
            {hasPriceVariation ? (
              <div className="w-full border border-dashed border-primary/30 bg-primary/5 rounded-md px-4 py-3 text-sm font-sans text-primary/70 text-center flex items-center justify-center h-[46px]">
                Pricing is adjusted below while selecting sizes.
              </div>
            ) : (
              <input 
                type="number" 
                name="price" 
                defaultValue={initialData?.price} 
                required={!hasPriceVariation} 
                placeholder="e.g. 2500" 
                className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" 
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">
              Discount Percentage (%) <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </label>
            <input type="number" name="discount_percentage" defaultValue={initialData?.discount_percentage || 0} min="0" max="100" placeholder="e.g. 10" className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
          </div>
        </div>

        {/* --- Rating, Reviews & Size Guide Settings --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-secondary/10 border border-border p-5 rounded-lg">
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Fake Rating</label>
            <input type="number" step="0.1" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full border border-border bg-background rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary text-sm font-sans" />
          </div>
          <div>
            <label className="block text-sm font-heading font-bold text-primary mb-2">Fake Review Count</label>
            <input type="number" min="0" value={reviewCount} onChange={(e) => setReviewCount(Number(e.target.value))} className="w-full border border-border bg-background rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary text-sm font-sans" />
          </div>
          <div className="flex flex-col">
            <label className="flex items-center gap-3 cursor-pointer mt-4">
              <input type="checkbox" checked={hasSizeGuide} onChange={(e) => setHasSizeGuide(e.target.checked)} className="w-5 h-5 accent-primary cursor-pointer" />
              <span className="text-sm font-heading font-bold text-primary">Enable Size Guide Modal?</span>
            </label>
            
            {hasSizeGuide && (
              <div className="mt-3 animate-in fade-in">
                 <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Select Size Guide Template</label>
                 <select 
                   value={sizeGuideTemplate} 
                   onChange={(e) => setSizeGuideTemplate(e.target.value)}
                   className="w-full border border-border bg-background rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary text-sm font-sans cursor-pointer"
                 >
                   <option value="panjabi">Panjabi</option>
                   <option value="shirt">Shirt</option>
                   <option value="jubba">Jubba</option>
                   <option value="pant">Pant</option>
                   <option value="pajama">Pajama</option>
                   <option value="shoes">Shoes</option>
                 </select>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-heading font-bold text-primary mb-2">Description</label>
          <textarea name="description" defaultValue={initialData?.description} rows={4} placeholder="Premium quality fabric details..." className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm resize-none" />
        </div>

        {/* --- Additional Details Builder --- */}
        <div className="bg-secondary/10 border border-border p-5 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-heading font-bold text-primary">Additional Details (Accordion Blocks)</h3>
              <p className="text-xs text-muted-foreground mt-1">Add fabric info, care instructions, fragrance notes, etc.</p>
            </div>
            <button type="button" onClick={resetDetails} className="px-3 py-1.5 bg-background border border-border rounded text-xs font-sans font-medium text-primary hover:bg-secondary flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
              <RotateCcw size={14} /> Reset to Default
            </button>
          </div>

          <div className="space-y-4">
            {additionalDetails.map((detail, index) => (
              <div key={index} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-lg relative group">
                <button type="button" onClick={() => removeDetail(index)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 bg-secondary/50 hover:bg-red-50 rounded-full p-1.5 cursor-pointer transition-colors">
                  <X size={14} />
                </button>
                <input 
                  type="text" 
                  placeholder="Title (e.g. Care Instructions)" 
                  value={detail.title} 
                  onChange={(e) => updateDetail(index, 'title', e.target.value)} 
                  className="w-full sm:w-1/2 border border-border bg-secondary/30 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm font-heading font-semibold" 
                />
                <textarea 
                  placeholder="Description content..." 
                  value={detail.content} 
                  onChange={(e) => updateDetail(index, 'content', e.target.value)} 
                  rows={2} 
                  className="w-full border border-border bg-secondary/30 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm font-sans resize-none" 
                />
              </div>
            ))}
          </div>

          <button type="button" onClick={addDetail} className="w-full py-3 bg-background border border-dashed border-primary/40 text-primary rounded-lg text-sm font-sans font-medium hover:bg-primary/5 hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-2">
            <Plus size={16} /> Add New Detail Block
          </button>
        </div>

        <div className="md:col-span-2 mt-6">
          <label className="block text-sm font-heading font-bold text-primary mb-2">Video URL <span className="text-muted-foreground font-normal text-xs">(YouTube / Facebook / iFrame)</span></label>
          <input type="text" name="video_url" defaultValue={initialData?.video_url} placeholder='e.g. https://youtu.be/... or <iframe src="..."></iframe>' className="w-full border border-border bg-secondary/50 rounded-md px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-sans text-sm" />
          <p className="text-[10px] text-muted-foreground mt-1">You can directly paste YouTube/Facebook video URLs or Embed HTML codes here.</p>
        </div>

        {/* --- Dynamic Sizing Section --- */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
            <label className="block text-sm font-heading font-bold text-primary">Available Sizes</label>

            <select
              value={activeSizeMode}
              onChange={(e) => setActiveSizeMode(e.target.value as SizeGroupKey)}
              className="w-full sm:w-auto border border-border bg-secondary/50 rounded-md px-3 py-1.5 text-xs font-sans text-primary outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {Object.entries(SIZE_GROUPS).map(([key, data]) => (
                <option key={key} value={key}>{data.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-secondary/20 p-4 md:p-5 border border-border rounded-lg space-y-6">

            {SIZE_GROUPS[activeSizeMode].groups.length > 0 && (
              <div className={`grid grid-cols-1 ${SIZE_GROUPS[activeSizeMode].groups.length > 1 ? 'sm:grid-cols-2' : ''} gap-6`}>
                {SIZE_GROUPS[activeSizeMode].groups.map((group, idx) => (
                  <div key={idx}>
                    <span className="block text-xs font-sans text-muted-foreground mb-3 uppercase tracking-wider">{group.title}</span>
                    <div className="flex flex-wrap gap-2">
                      {group.presets.map(size => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3.5 py-1.5 border rounded-md text-xs font-medium transition-colors cursor-pointer ${selectedSizes.includes(size)
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSizeMode === 'custom_only' && (
              <div className="pt-4 border-t border-border/50">
                <span className="block text-xs font-sans text-muted-foreground mb-3 uppercase tracking-wider">Custom Size / Active Selection</span>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                      placeholder="e.g. 250g, 3XL"
                      className="w-full sm:w-32 border border-border bg-background rounded-md px-3 py-1.5 outline-none font-sans text-xs focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="bg-black border border-border text-white px-3 py-1.5 rounded-md text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {selectedSizes.map(size => (
                      <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[11px] rounded">
                        {size}
                        <button type="button" onClick={() => toggleSize(size)} className="text-red-500 cursor-pointer text-xl ml-1">&times;</button>
                      </span>
                    ))}
                    {selectedSizes.length === 0 && <span className="text-[11px] text-muted-foreground italic py-1">No sizes selected</span>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* --- Dynamic Size Pricing Section --- */}
        {hasPriceVariation && selectedSizes.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-sm font-heading font-bold text-primary">Set Prices for Selected Sizes</h3>
              <p className="text-xs text-muted-foreground mt-1">Enter the specific price for each size variant.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedSizes.map((size) => (
                <div key={size} className="space-y-1.5 bg-background p-3 rounded-md border border-border shadow-sm">
                  <label className="block text-xs font-heading font-bold text-primary uppercase tracking-wider">
                    {size}
                  </label>
                  <input
                    type="number"
                    value={sizePrices[size] || ""}
                    onChange={(e) => setSizePrices(prev => ({ ...prev, [size]: Number(e.target.value) }))}
                    placeholder="Price (৳)"
                    required={hasPriceVariation}
                    className="w-full border-b border-border bg-transparent px-1 py-1.5 outline-none focus:border-primary text-sm font-sans"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Multi-Color Configuration Section --- */}
        <div className="bg-secondary/20 border border-border p-5 rounded-lg space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMultiColor}
              onChange={(e) => setIsMultiColor(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <span className="text-sm font-heading font-bold text-primary">Is this a Multi-Color Variant?</span>
          </label>

          {isMultiColor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border/50">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Group ID</label>
                <input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="e.g. PNJ-STYLE-01"
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
                <p className="text-[10px] text-muted-foreground mt-1">Pick from images below or click the box to adjust manually.</p>
              </div>
            </div>
          )}
        </div>

        {/* --- Images Section --- */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-heading font-bold text-primary">Product Images</label>
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

                {/* Overlap Fix: Cover hole space diye upore uthbe */}
                {isMultiColor && (
                  <button
                    type="button"
                    onClick={() => setPickerImageSrc(src)}
                    className={`absolute right-2 bg-blue-500/90 text-white rounded-full p-1.5 hover:bg-blue-600 backdrop-blur-sm cursor-pointer transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${coverIndex === index ? 'bottom-8' : 'bottom-2'
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

        <div className="pt-6 border-t border-border flex justify-end">
          <button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary text-white px-10 py-3 rounded-md font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 cursor-pointer">
            {loading ? <><Loader2 size={18} className="animate-spin" /> {isEditMode ? 'Updating...' : 'Saving...'}</> : (isEditMode ? 'Update Product' : 'Save Product')}
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

              {/* Mobile "Touch & Drag to Pick" Badge */}
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

              {/* Smart Magnifier Element */}
              {magnifier.show && (
                <div
                  className="absolute pointer-events-none w-14 h-14 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(0,0,0,0.6)] flex items-center justify-center z-50 transition-none"
                  style={{
                    left: Math.max(10, Math.min(magnifier.x - 28, magnifier.rectWidth ? magnifier.rectWidth - 66 : 1000)),
                    top: magnifier.y - 85 < 10 ? magnifier.y + 40 : magnifier.y - 85, // Smart positioning: Drop below if too close to top
                    backgroundColor: magnifier.color
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full"></div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full justify-between bg-secondary/30 p-3 rounded-lg border border-border">

              {/* Inside Modal Palette Support */}
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
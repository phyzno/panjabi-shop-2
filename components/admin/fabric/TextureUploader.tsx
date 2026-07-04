"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Wand2, X, Repeat, UploadCloud } from "lucide-react";
import { PanjabiCanvas } from "@/components/customizer/PanjabiCanvas";

interface TextureUploaderProps {
  currentTextureUrl?: string;
  currentRawUrl?: string;
  onTextureReady: (rawBase64OrUrl: string, textureBase64OrUrl: string) => void;
}

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

export default function TextureUploader({ currentTextureUrl, currentRawUrl, onTextureReady }: TextureUploaderProps) {
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(currentRawUrl || null);
  const [activeTexture, setActiveTexture] = useState<string | null>(currentTextureUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"original" | "mode2" | "mode3">("original");
  const [passes, setPasses] = useState<number>(1);
  const [cachedTextures, setCachedTextures] = useState<Record<string, string>>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setRawFile(file);
    setRawImageUrl(objectUrl);
    setActiveTexture(objectUrl);
    setCachedTextures({ original: objectUrl });
    setShowModal(true);

    if (inputRef.current) inputRef.current.value = "";
  };

  const handleProcessMode = async (mode: "mode2" | "mode3", currentPasses: number) => {
    const cacheKey = `${mode}-${currentPasses}x`;
    if (cachedTextures[cacheKey]) {
      setSelectedMode(mode);
      setPasses(currentPasses);
      return;
    }

    if (!rawFile && !rawImageUrl) {
      alert("Please upload a file first.");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();

      if (rawFile) {
        const compressed = await compressImageNative(rawFile);
        formData.append("file", compressed);
      } else if (rawImageUrl) {
        const res = await fetch(rawImageUrl);
        const blob = await res.blob();
        formData.append("file", blob, "existing-raw.jpg");
      }

      formData.append("mode", mode);
      formData.append("iterations", currentPasses.toString());

      const res = await fetch("/api/admin/process-texture", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();

      setCachedTextures(prev => ({ ...prev, [cacheKey]: data.resultBase64 }));
      setSelectedMode(mode);
      setPasses(currentPasses);
    } catch (err) {
      alert("Error generating texture. Check connection.");
      setSelectedMode("original");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveTexture = async () => {
    const cacheKey = selectedMode === "original" ? "original" : `${selectedMode}-${passes}x`;
    const finalTexture = cachedTextures[cacheKey] || cachedTextures.original || rawImageUrl;

    let finalRawBase64 = rawImageUrl;
    if (rawFile) {
      finalRawBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(rawFile);
      });
    }

    setActiveTexture(finalTexture!);
    onTextureReady(finalRawBase64!, finalTexture!);
    setShowModal(false);
  };

  const currentPreviewKey = selectedMode === "original" ? "original" : `${selectedMode}-${passes}x`;
  const previewToRender = cachedTextures[currentPreviewKey] || rawImageUrl;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-heading font-bold text-primary mb-2">Fabric Texture & Raw Data</label>

      <div className="flex gap-4">
        <div
          onClick={() => inputRef.current?.click()}
          className={`relative w-32 h-32 border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors flex items-center justify-center shrink-0 ${activeTexture ? 'border-primary shadow-sm bg-secondary/50' : 'border-border bg-secondary/30 hover:border-primary'
            }`}
        >
          {activeTexture ? (
            <>
              <Image src={activeTexture} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <span className="text-white text-[10px] uppercase tracking-wider">Change Image</span>
              </div>
            </>
          ) : (
            <div className="text-center p-4 flex flex-col items-center">
              <UploadCloud size={24} className="text-muted-foreground mb-2" />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Select File</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {rawImageUrl && (
          <div className="flex flex-col justify-center">
            <button
              type="button"
              onClick={() => {
                if (!cachedTextures.original) setCachedTextures(prev => ({ ...prev, original: rawImageUrl }));
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-3 text-xs rounded-md hover:bg-accent/20 transition-colors cursor-pointer"
            >
              <Wand2 size={16} /> Open Canvas Engine
            </button>
            <p className="text-[10px] text-muted-foreground mt-2 max-w-[150px]">Preview the texture live on a 3D mapped Panjabi model.</p>
          </div>
        )}
      </div>

      {showModal && previewToRender && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-border">

            <div className="md:w-3/5 h-[450px] md:h-[650px] bg-secondary/50 relative overflow-hidden flex items-center justify-center p-4">

              <PanjabiCanvas
                color="#ffffff"
                fabricType="custom"
                fabricImageUrl={previewToRender}
                colorIntensity={0.05}
                hideControls={true}
                isProcessingExternal={processing}
              />

              <div className="absolute top-4 left-4 bg-background/80 text-primary border border-border text-xs px-3 py-1.5 rounded-md backdrop-blur-md flex items-center gap-2 uppercase tracking-wider shadow-sm z-50">
                Live Garment Preview
                {selectedMode !== 'original' && <span className="bg-accent text-white px-1.5 py-0.5 rounded text-[10px]">{passes}x</span>}
              </div>
            </div>

            <div className="md:w-2/5 p-6 md:p-8 flex flex-col h-[450px] md:h-[650px] overflow-y-auto bg-background">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-primary flex items-center gap-2"><Wand2 size={20} /> Texture Engine</h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <button type="button" onClick={() => setSelectedMode("original")} className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedMode === "original" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <h4 className="font-sans text-md text-foreground">Raw (Original)</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Keeps the uploaded image untouched.</p>
                </button>
                <button type="button" onClick={() => handleProcessMode("mode2", passes)} className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedMode === "mode2" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <h4 className="font-sans text-md text-foreground">Mode 2 (Scattered Blend)</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Best for busy woven prints or uneven lighting.</p>
                </button>
                <button type="button" onClick={() => handleProcessMode("mode3", passes)} className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedMode === "mode3" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <h4 className="font-sans text-md text-foreground">Mode 3 (Smooth Blend)</h4>
                  <p className="text-[11px] text-muted-foreground mt-1">Softer all-side edge blend. Best for florals.</p>
                </button>
              </div>

              {selectedMode !== "original" && (
                <div className="mt-6 p-5 bg-secondary/30 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat size={16} className="text-muted-foreground" />
                    <h4 className="text-sm text-foreground uppercase tracking-widest">Processing Intensity</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((num) => (
                      <button key={num} type="button" onClick={() => handleProcessMode(selectedMode, num)} className={`py-2 text-xs rounded-md transition-all cursor-pointer ${passes === num ? "bg-primary text-white shadow-md" : "bg-background text-muted-foreground border border-border hover:border-primary"}`}>
                        {num}x Pass
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-border shrink-0">
                <button type="button" onClick={handleSaveTexture} disabled={processing} className="w-full bg-primary text-white font-sans text-sm py-4 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer">
                  Apply & Attach to Form
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
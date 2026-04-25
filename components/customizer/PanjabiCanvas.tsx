"use client";

import React, { useEffect, useRef, useState } from 'react';
import { renderPanjabiTexture, TextureConfig } from '@/lib/canvas/textureEngine';
import { Loader2 } from 'lucide-react';

interface PanjabiCanvasProps {
  color: string;
  fabricType: string;
  fabricOpacity?: number;
  colorIntensity?: number;
  collarStyle?: string;
  onRenderComplete?: (dataUrl: string) => void;
}

export function PanjabiCanvas({
  color,
  fabricType,
  fabricOpacity = 0.85,
  colorIntensity = 0.9,
  collarStyle,
  onRenderComplete,
}: PanjabiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      
      const config: TextureConfig = {
        color,
        fabricType,
        fabricOpacity,
        colorIntensity,
        collarStyle,
      };

      try {
        await renderPanjabiTexture(canvasRef.current, config);
        if (mounted && onRenderComplete) {
          onRenderComplete(canvasRef.current.toDataURL());
        }
      } catch (err) {
        console.error('Failed to render canvas', err);
      } finally {
        if (mounted) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      mounted = false;
    };
  }, [color, fabricType, fabricOpacity, colorIntensity, collarStyle, onRenderComplete]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `panjabi-custom-${fabricType}-${color}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const blob = await new Promise<Blob | null>(res => canvasRef.current?.toBlob(res));
        if (blob) {
          const file = new File([blob], 'panjabi.png', { type: 'image/png' });
          await navigator.share({
            title: 'My Custom Panjabi',
            text: 'Check out the Panjabi I customized!',
            files: [file],
          });
        }
      } catch (err) {
        console.error('Error sharing', err);
      }
    }
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto bg-[#F5F0EA] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden group">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm border border-gray-100">
        Front View
      </div>
      <div className="absolute top-4 right-4 z-10 bg-gray-100/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-400 shadow-sm border border-gray-200 cursor-not-allowed">
        3D View — Coming Soon
      </div>

      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-[1.02] ${
          isRendering ? 'opacity-40 blur-sm' : 'opacity-100 blur-0'
        }`}
      />

      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-gray-500 bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl">
        <span className="flex items-center gap-1">
          🔒 Preview only — actual fabric may vary slightly
        </span>
        <div className="flex gap-2">
          <button 
            onClick={handleDownload}
            className="hover:text-gray-900 transition-colors"
            title="Download Preview"
          >
            Download
          </button>
          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button 
              onClick={handleShare}
              className="hover:text-gray-900 transition-colors"
              title="Share"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

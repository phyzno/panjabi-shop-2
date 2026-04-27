export interface TextureConfig {
  color: string;           // hex color e.g. "#1B3A6B"
  fabricType: string;      // "plain" | "check" | "stripe" | "linen" | "silk" | "dots" | "embroidery"
  collarType: 'band' | 'vneck' | 'round' | 'mandarin';
  fabricOpacity?: number;   // 0.0 to 1.0, default 0.35
  colorIntensity?: number;  // 0.0 to 1.0, default 0.92
}

import { generateFabricPattern } from './fabricPatterns';

export async function renderPanjabiTexture(
  canvas: HTMLCanvasElement,
  config: TextureConfig,
  imageCache: Record<string, HTMLImageElement> = {}
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const W = 600;
  const H = 600;
  canvas.width = W;
  canvas.height = H;
  
  ctx.clearRect(0, 0, W, H);
  
  // STEP 1 — Pick the right base image for collar type
  const collarImageMap = {
    band:     '/assets/punjabi/collar-band.png',
    vneck:    '/assets/punjabi/collar-vneck.png',
    round:    '/assets/punjabi/collar-round.png',
    mandarin: '/assets/punjabi/collar-mandarin.png',
  };
  const imageSrc = collarImageMap[config.collarType] ?? collarImageMap.band;
  
  // STEP 2 — Load (from cache if possible)
  let baseImg = imageCache[imageSrc];
  if (!baseImg) {
    baseImg = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = imageSrc;
    });
    imageCache[imageSrc] = baseImg;
  }
  
  // STEP 3 — Draw white base panjabi
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.drawImage(baseImg, 0, 0, W, H);
  
  // STEP 4 — Apply COLOR using multiply
  // White fabric → takes the color perfectly
  // Existing shadows/folds stay naturally dark
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = config.colorIntensity ?? 0.92;
  ctx.fillStyle = config.color;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  
  // STEP 5 — Apply FABRIC TEXTURE using multiply
  const pattern = generateFabricPattern(
    ctx, config.fabricType, config.color
  );
  if (pattern) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = config.fabricOpacity ?? 0.35;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  
  // STEP 6 — Restore shadow detail from base
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.25;
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalAlpha = 1;
  
  // STEP 7 — Restore transparency (cut to garment shape)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  
  // Done. No collar overlay needed — 
  // collar shape is already in the base image.
}

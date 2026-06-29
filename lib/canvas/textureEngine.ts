import { generateFabricPattern } from './fabricPatterns';
import { resolveProductImageSrc } from '@/lib/productImages';

export interface TextureConfig {
  color: string;
  fabricType: string;
  fabricImageUrl?: string;
  productOverlayUrl?: string;
  fabricOpacity?: number;
  colorIntensity?: number;
}

export async function renderPanjabiTexture(
  canvas: HTMLCanvasElement,
  config: TextureConfig,
  imageCache: Record<string, HTMLImageElement> = {}
): Promise<void> {
  const W = 600;
  const H = 600;

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = W;
  offscreenCanvas.height = H;
  const ctx = offscreenCanvas.getContext('2d');

  if (!ctx) return;

  canvas.width = W;
  canvas.height = H;

  // সেফটির জন্য একটি ফলব্যাক ইমেজ দেওয়া হলো
  const imageSrc = config.productOverlayUrl || '/Canvas/Panjabi/Regular-Classic Panjabi/Band Collar/Hidden Placket/Chest Pocket/02 - Band Collar + Hidden Placket + Chest Pocket-Photoroom.png';

  const rawUrl = config.fabricImageUrl;
  const isLocalOrData = rawUrl?.startsWith('data:') || rawUrl?.startsWith('blob:');

  const normalizedFabricImageUrl = rawUrl && rawUrl.trim()
    ? (isLocalOrData ? rawUrl : resolveProductImageSrc(rawUrl))
    : undefined;

  const effectiveColor = normalizedFabricImageUrl ? '#FFFFFF' : (config.color || '#FFFFFF');

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

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.drawImage(baseImg, 0, 0, W, H);

  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = config.colorIntensity ?? 0.92;
  ctx.fillStyle = effectiveColor;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  let pattern: CanvasPattern | null = null;

  if (normalizedFabricImageUrl) {
    let patternImg = imageCache[normalizedFabricImageUrl];
    if (!patternImg) {
      patternImg = await new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = normalizedFabricImageUrl;
      });
      imageCache[normalizedFabricImageUrl] = patternImg;
    }

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 200;
    pCanvas.height = 200;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.drawImage(patternImg, 0, 0, 200, 200);
      pattern = ctx.createPattern(pCanvas, 'repeat');
    }
  } else {
    pattern = generateFabricPattern(ctx, config.fabricType, config.color) || null;
  }

  if (pattern) {
    const appliedOpacity = normalizedFabricImageUrl
      ? 0.80
      : (config.fabricOpacity ?? 0.35);

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = appliedOpacity;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.35;
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  const mainCtx = canvas.getContext('2d');
  if (mainCtx) {
    mainCtx.clearRect(0, 0, W, H);
    mainCtx.drawImage(offscreenCanvas, 0, 0);
  }
}
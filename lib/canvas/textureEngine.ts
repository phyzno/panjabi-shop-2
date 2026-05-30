import { generateFabricPattern } from './fabricPatterns';
import { resolveProductImageSrc } from '@/lib/productImages';

export interface TextureConfig {
  color: string;
  fabricType: string;
  fabricImageUrl?: string;
  collarType: 'band' | 'vneck' | 'round' | 'mandarin';
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
  
  // ১. মূল ক্যানভাসের বদলে একটি অফস্ক্রিন ক্যানভাস তৈরি করুন
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = W;
  offscreenCanvas.height = H;
  const ctx = offscreenCanvas.getContext('2d');
  
  if (!ctx) return;
  
  // ক্যানভাসের ডাইমেনশন মূল ক্যানভাসেও সেট করে রাখুন
  canvas.width = W;
  canvas.height = H;
  
  const collarImageMap = {
    band:     '/assets/punjabi/collar-band.png',
    vneck:    '/assets/punjabi/collar-vneck.png',
    round:    '/assets/punjabi/collar-round.png',
    mandarin: '/assets/punjabi/collar-mandarin.png',
  };
  const imageSrc = collarImageMap[config.collarType] ?? collarImageMap.band;
  
  // চেক করছি ইমেজটি কি লোকাল (blob/data) নাকি রিমোট (Cloudinary)
  const rawUrl = config.fabricImageUrl;
  const isLocalOrData = rawUrl?.startsWith('data:') || rawUrl?.startsWith('blob:');
  
  // লোকাল হলে সরাসরি rawUrl, রিমোট হলে resolveProductImageSrc দিয়ে প্রসেস করব
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
  
  // ১. সাদা বেস পাঞ্জাবি ড্র করা
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.drawImage(baseImg, 0, 0, W, H);
  
  // ২. কালার অ্যাপ্লাই করা (Multiply মোডে)
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = config.colorIntensity ?? 0.92;
  ctx.fillStyle = effectiveColor;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  
  // ৩. ফেব্রিক টেক্সচার বা প্যাটার্ন অ্যাপ্লাই করা
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
    
    // Seamless ছবিটিকে ২০০x২০০ সাইজে রিসাইজ করে রিপিট করা হচ্ছে (যাতে সুতোর সাইজ রিয়েলিস্টিক লাগে)
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
      ? 0.60
      : (config.fabricOpacity ?? 0.35);

    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = appliedOpacity;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  
  // ৪. অরিজিনাল শ্যাডো এবং ভাঁজগুলো ফিরিয়ে আনা
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.35; 
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalAlpha = 1;
  
  // ৫. পাঞ্জাবির শেপ অনুযায়ী মাস্কিং করা (শেপের বাইরের রং মুছে ফেলা)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(baseImg, 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';

  // --- নতুন যুক্ত করা কোড (একদম শেষে) ---
  // ৬. মেমরিতে তৈরি হওয়া নিখুঁত ফ্রেমটি এবার মূল ক্যানভাসে বসিয়ে দিন
  const mainCtx = canvas.getContext('2d');
  if (mainCtx) {
    // আগের যেকোনো অসম্পূর্ণ বা ওভারল্যাপ হওয়া ড্রয়িং ক্লিয়ার করে দিন
    mainCtx.clearRect(0, 0, W, H);
    mainCtx.drawImage(offscreenCanvas, 0, 0);
  }
}
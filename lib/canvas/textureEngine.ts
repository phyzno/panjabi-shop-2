export interface TextureConfig {
  color: string;           // hex color e.g. "#1B3A6B"
  fabricType: string;      // "plain" | "check" | "stripe" | "linen" | "silk" | "dots" | "embroidery"
  fabricOpacity: number;   // 0.0 to 1.0, default 0.85
  colorIntensity: number;  // 0.0 to 1.0, default 0.9
  collarStyle?: string;    // "Band Collar" | "V-Neck" | "Round Neck" | "Mandarin"
}

import { generateFabricPattern } from './fabricPatterns';

export async function renderPanjabiTexture(
  canvas: HTMLCanvasElement,
  config: TextureConfig
): Promise<void> {
  // STEP 1 — Load the base image
  const img = new Image();
  img.src = '/assets/customizable-punjabi.png';
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });

  // STEP 2 — Setup canvas
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, 600, 600);

  // STEP 3 — Draw the white panjabi base
  ctx.drawImage(img, 0, 0, 600, 600);
  
  // STEP 4 — Apply COLOR using multiply blend
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = config.colorIntensity;
  ctx.fillStyle = config.color;
  ctx.fillRect(0, 0, 600, 600);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // STEP 5 — Apply FABRIC TEXTURE using multiply
  const pattern = generateFabricPattern(ctx, config.fabricType, config.color);
  if (pattern) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = config.fabricOpacity * 0.4;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 600, 600);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // STEP 6 — Redraw PNG on top to restore details (buttons, embroidery, collar edge, shadows)
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.4;
  ctx.drawImage(img, 0, 0, 600, 600);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // STEP 7 — Restore transparency outside garment
  ctx.globalCompositeOperation = 'destination-in';
  ctx
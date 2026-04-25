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
  ctx.drawImage(img, 0, 0, 600, 600);
  ctx.globalCompositeOperation = 'source-over';

  // STEP 8 — Draw simulated collar style
  if (config.collarStyle && config.collarStyle !== 'Band Collar') {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    
    // Calculate a slightly darker tone for shadows and lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    
    // Approximate neck region coordinates (x: 250 to 350, y: 100 to 180)
    // Adjust these based on the actual PNG alignment
    const centerX = 300;
    const neckTop = 95;
    
    ctx.beginPath();
    
    if (config.collarStyle === 'V-Neck') {
      // Draw a deep V shape
      ctx.moveTo(centerX - 35, neckTop);
      ctx.lineTo(centerX, neckTop + 80);
      ctx.lineTo(centerX + 35, neckTop);
      // Fill it with a lighter color to look like skin/undershirt, or just draw the border
      ctx.fillStyle = '#E8E0D5';
      ctx.fill();
      ctx.stroke();
    } else if (config.collarStyle === 'Round Neck') {
      // Draw a scooped round neck
      ctx.arc(centerX, neckTop, 40, 0, Math.PI, false);
      ctx.fillStyle = '#E8E0D5';
      ctx.fill();
      ctx.stroke();
    } else if (config.collarStyle === 'Mandarin') {
      // Draw a short standing collar
      ctx.moveTo(centerX - 35, neckTop);
      ctx.quadraticCurveTo(centerX, neckTop + 20, centerX + 35, neckTop);
      ctx.lineTo(centerX + 35, neckTop - 15);
      ctx.quadraticCurveTo(centerX, neckTop + 5, centerX - 35, neckTop - 15);
      ctx.closePath();
      ctx.fillStyle = config.color; // Same as fabric
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

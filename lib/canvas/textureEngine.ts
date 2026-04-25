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
    
    // Approximate neck region coordinates (Adjusted for high neckline)
    const centerX = 300;
    const neckTop = 45; 
    
    if (config.collarStyle === 'V-Neck') {
      // Draw a more realistic V-neck with shadow
      ctx.beginPath();
      ctx.moveTo(centerX - 55, neckTop);
      ctx.lineTo(centerX, neckTop + 90);
      ctx.lineTo(centerX + 55, neckTop);
      
      // Skin/Inner tone with a subtle gradient
      const neckGrad = ctx.createLinearGradient(centerX, neckTop, centerX, neckTop + 65);
      neckGrad.addColorStop(0, '#D4B895'); // Darker top
      neckGrad.addColorStop(1, '#F5E0C3'); // Lighter bottom
      ctx.fillStyle = neckGrad;
      ctx.fill();
      
      // Border and shadow
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      
      // Inner shadow for depth
      ctx.beginPath();
      ctx.moveTo(centerX - 42, neckTop);
      ctx.lineTo(centerX, neckTop + 15);
      ctx.lineTo(centerX + 42, neckTop);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fill();
    } else if (config.collarStyle === 'Round Neck') {
      // Scooped round neck with depth
      ctx.beginPath();
      ctx.arc(centerX, neckTop - 10, 55, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.lineTo(centerX - 55, neckTop - 10);
      
      const neckGrad = ctx.createLinearGradient(centerX, neckTop, centerX, neckTop + 55);
      neckGrad.addColorStop(0, '#D4B895');
      neckGrad.addColorStop(1, '#F5E0C3');
      ctx.fillStyle = neckGrad;
      ctx.fill();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
    } else if (config.collarStyle === 'Mandarin') {
      // Mandarin/Chinese collar stands up
      ctx.beginPath();
      ctx.moveTo(centerX - 55, neckTop + 15);
      ctx.quadraticCurveTo(centerX, neckTop + 45, centerX + 55, neckTop + 15);
      ctx.lineTo(centerX + 55, neckTop - 25);
      ctx.quadraticCurveTo(centerX, neckTop - 5, centerX - 55, neckTop - 25);
      ctx.closePath();
      
      // Use a gradient of the fabric color to simulate lighting
      const collarGrad = ctx.createLinearGradient(centerX - 55, neckTop, centerX + 55, neckTop);
      collarGrad.addColorStop(0, darkenColor(config.color, 20));
      collarGrad.addColorStop(0.5, config.color);
      collarGrad.addColorStop(1, darkenColor(config.color, 20));
      
      ctx.fillStyle = collarGrad;
      ctx.fill();
      
      // Add a highlight line on top
      ctx.strokeStyle = lightenColor(config.color, 40);
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.restore();
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function lightenColor(hex: string, amt: number): string {
  let usePound = false;
  if (hex[0] == "#") {
    hex = hex.slice(1);
    usePound = true;
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

export function darkenColor(hex: string, amt: number): string {
  return lightenColor(hex, -amt);
}

export function generateFabricPattern(
  ctx: CanvasRenderingContext2D,
  type: string,
  baseColor: string
): CanvasPattern | null {
  const offscreen = document.createElement('canvas');
  const octx = offscreen.getContext('2d');
  if (!octx) return null;

  switch (type) {
    case 'plain': {
      // 4x4, subtle grid weave
      offscreen.width = 4;
      offscreen.height = 4;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 4, 4);
      // Subtle vertical lines
      octx.strokeStyle = 'rgba(0,0,0,0.05)';
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(1, 0); octx.lineTo(1, 4);
      octx.moveTo(3, 0); octx.lineTo(3, 4);
      octx.stroke();
      // Subtle horizontal lines
      octx.beginPath();
      octx.moveTo(0, 1); octx.lineTo(4, 1);
      octx.moveTo(0, 3); octx.lineTo(4, 3);
      octx.stroke();
      break;
    }
    case 'linen': {
      // 6x6, cross-hatch diagonal
      offscreen.width = 6;
      offscreen.height = 6;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 6, 6);
      // 45° lines
      octx.strokeStyle = 'rgba(0,0,0,0.07)';
      octx.lineWidth = 1;
      for (let i = -6; i < 12; i += 2) {
        octx.beginPath();
        octx.moveTo(i, 0);
        octx.lineTo(i + 6, 6);
        octx.stroke();
      }
      // 135° lines
      octx.strokeStyle = 'rgba(0,0,0,0.07)';
      for (let i = -6; i < 12; i += 2) {
        octx.beginPath();
        octx.moveTo(i + 6, 0);
        octx.lineTo(i, 6);
        octx.stroke();
      }
      break;
    }
    case 'silk': {
      // 20x20, diagonal gradient sheen
      offscreen.width = 20;
      offscreen.height = 20;
      const grad = octx.createLinearGradient(0, 0, 20, 20);
      grad.addColorStop(0, lightenColor(baseColor, 25));
      grad.addColorStop(0.4, baseColor);
      grad.addColorStop(0.7, darkenColor(baseColor, 15));
      grad.addColorStop(1, baseColor);
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 20, 20);
      break;
    }
    case 'check': {
      // 16x16, plaid check
      offscreen.width = 16;
      offscreen.height = 16;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 16, 16);
      // White squares
      octx.fillStyle = 'rgba(255,255,255,0.20)';
      octx.fillRect(0, 0, 8, 8);
      octx.fillRect(8, 8, 8, 8);
      // Thin cross lines
      octx.strokeStyle = 'rgba(255,255,255,0.15)';
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(8, 0); octx.lineTo(8, 16);
      octx.moveTo(0, 8); octx.lineTo(16, 8);
      octx.stroke();
      break;
    }
    case 'stripe': {
      // 10x10, vertical stripe
      offscreen.width = 10;
      offscreen.height = 10;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 10, 10);
      // Left half lighter
      octx.fillStyle = lightenColor(baseColor, 15);
      octx.fillRect(0, 0, 5, 10);
      // 1px dark line at edge
      octx.strokeStyle = 'rgba(0,0,0,0.15)';
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(5, 0); octx.lineTo(5, 10);
      octx.stroke();
      break;
    }
    case 'embroidery': {
      // 20x20, diamond + dots + cross
      offscreen.width = 20;
      offscreen.height = 20;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 20, 20);
      // Diamond outline
      octx.strokeStyle = 'rgba(255,255,255,0.25)';
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(10, 2);
      octx.lineTo(18, 10);
      octx.lineTo(10, 18);
      octx.lineTo(2, 10);
      octx.closePath();
      octx.stroke();
      // Corner dots
      octx.fillStyle = 'rgba(255,255,255,0.20)';
      [ [3,3], [17,3], [3,17], [17,17] ].forEach(([x,y]) => {
        octx.beginPath();
        octx.arc(x, y, 1.2, 0, Math.PI*2);
        octx.fill();
      });
      // Center cross
      octx.strokeStyle = 'rgba(255,255,255,0.15)';
      octx.beginPath();
      octx.moveTo(10, 6); octx.lineTo(10, 14);
      octx.moveTo(6, 10); octx.lineTo(14, 10);
      octx.stroke();
      break;
    }
    default: {
      offscreen.width = 1;
      offscreen.height = 1;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 1, 1);
      break;
    }
  }

  return ctx.createPattern(offscreen, 'repeat');
}

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
      offscreen.width = 4;
      offscreen.height = 4;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 4, 4);
      octx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      octx.fillRect(0, 0, 2, 2);
      octx.fillRect(2, 2, 2, 2);
      break;
    }
    case 'check': {
      offscreen.width = 20;
      offscreen.height = 20;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 20, 20);
      octx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      octx.fillRect(0, 0, 10, 10);
      octx.fillRect(10, 10, 10, 10);
      octx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      octx.fillRect(0, 9.5, 20, 1);
      octx.fillRect(9.5, 0, 1, 20);
      break;
    }
    case 'stripe': {
      offscreen.width = 12;
      offscreen.height = 12;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 12, 12);
      octx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      octx.fillRect(0, 0, 6, 12);
      octx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      octx.fillRect(5.5, 0, 1, 12);
      break;
    }
    case 'linen': {
      offscreen.width = 6;
      offscreen.height = 6;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 6, 6);
      for (let i = 0; i < 3; i++) {
        octx.fillStyle = `rgba(0, 0, 0, ${0.06 + Math.random() * 0.04})`;
        octx.fillRect(Math.random() * 6, 0, 1, 6);
        octx.fillStyle = `rgba(255, 255, 255, ${0.06 + Math.random() * 0.04})`;
        octx.fillRect(0, Math.random() * 6, 6, 1);
      }
      break;
    }
    case 'silk': {
      offscreen.width = 16;
      offscreen.height = 16;
      const grad = octx.createLinearGradient(0, 0, 16, 16);
      grad.addColorStop(0, baseColor);
      grad.addColorStop(0.5, lightenColor(baseColor, 30));
      grad.addColorStop(0.8, baseColor);
      grad.addColorStop(1, darkenColor(baseColor, 20));
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 16, 16);
      break;
    }
    case 'dots': {
      offscreen.width = 14;
      offscreen.height = 14;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 14, 14);
      octx.beginPath();
      octx.arc(7, 7, 2.5, 0, Math.PI * 2);
      octx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      octx.fill();
      break;
    }
    case 'embroidery': {
      offscreen.width = 24;
      offscreen.height = 24;
      octx.fillStyle = baseColor;
      octx.fillRect(0, 0, 24, 24);
      octx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      octx.lineWidth = 1;
      octx.beginPath();
      octx.moveTo(12, 0);
      octx.lineTo(24, 12);
      octx.lineTo(12, 24);
      octx.lineTo(0, 12);
      octx.closePath();
      octx.stroke();
      octx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      octx.beginPath();
      octx.arc(0, 0, 1, 0, Math.PI * 2);
      octx.arc(24, 0, 1, 0, Math.PI * 2);
      octx.arc(0, 24, 1, 0, Math.PI * 2);
      octx.arc(24, 24, 1, 0, Math.PI * 2);
      octx.fill();
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

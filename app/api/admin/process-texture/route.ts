import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

type TextureMode = 'mode2' | 'mode3';

interface ModeConfig {
  horizontalBand: number;
  verticalBand: number;
  irregularDepth: boolean;
  blurSigma: number;
  mixStrength: number;
  lightingSigma: number;
  lightingStrength: number;
}

function clampBandSize(size: number, ratio: number) {
  return Math.max(8, Math.min(Math.floor(size / 2) - 1, Math.round(size * ratio)));
}

function smoothstep01(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function getIrregularBand(baseBand: number, index: number, limit: number) {
  const waveA = Math.sin(index * 0.13) * 0.14;
  const waveB = Math.sin(index * 0.041 + 1.7) * 0.08;
  const depth = Math.round(baseBand * (1 + waveA + waveB));

  return Math.max(8, Math.min(limit, depth));
}

function getModeConfig(mode: TextureMode, width: number, height: number): ModeConfig {
  const minDimension = Math.min(width, height);

  if (mode === 'mode3') {
    return {
      horizontalBand: clampBandSize(width, 0.08),
      verticalBand: clampBandSize(height, 0.08),
      irregularDepth: false,
      blurSigma: 0.6,
      mixStrength: 0.5,
      lightingSigma: 0,
      lightingStrength: 0,
    };
  }

  return {
    horizontalBand: clampBandSize(width, 0.08),
    verticalBand: clampBandSize(height, 0.08),
    irregularDepth: true,
    blurSigma: 0,
    mixStrength: 0.5,
    lightingSigma: Math.max(30, Math.min(300, minDimension * 0.35)),
    lightingStrength: 0.8,
  };
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

async function normalizeLighting(
  source: Buffer,
  width: number,
  height: number,
  channels: number,
  sigma: number,
  strength: number
) {
  if (sigma <= 0 || strength <= 0) {
    return Buffer.from(source);
  }

  const blurMap = await sharp(source, {
    raw: { width, height, channels: channels as 1 | 2 | 3 | 4 },
  })
    .removeAlpha()
    .greyscale()
    .blur(sigma)
    .raw()
    .toBuffer();

  let meanLuma = 0;

  for (const value of blurMap) {
    meanLuma += value;
  }

  meanLuma /= blurMap.length;

  const output = Buffer.from(source);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * channels;
      const blurIndex = y * width + x;
      const gain = Math.pow(meanLuma / Math.max(1, blurMap[blurIndex]), strength);

      for (let channel = 0; channel < 3; channel++) {
        output[pixelIndex + channel] = clampChannel(source[pixelIndex + channel] * gain);
      }
    }
  }

  return output;
}

function blendOppositeHorizontalEdges(
  source: Buffer,
  width: number,
  height: number,
  config: ModeConfig
) {
  const output = Buffer.from(source);
  const maxBand = Math.max(8, Math.floor(width / 2) - 1);

  for (let y = 0; y < height; y++) {
    const band = config.irregularDepth
      ? getIrregularBand(config.horizontalBand, y, maxBand)
      : config.horizontalBand;

    for (let x = 0; x < band; x++) {
      const mix = config.mixStrength * smoothstep01(1 - x / Math.max(1, band - 1));
      const rightX = width - 1 - x;
      const leftIndex = (y * width + x) * 4;
      const rightIndex = (y * width + rightX) * 4;

      for (let channel = 0; channel < 4; channel++) {
        const leftValue = source[leftIndex + channel];
        const rightValue = source[rightIndex + channel];

        output[leftIndex + channel] = clampChannel(leftValue * (1 - mix) + rightValue * mix);
        output[rightIndex + channel] = clampChannel(rightValue * (1 - mix) + leftValue * mix);
      }
    }
  }

  return output;
}

function blendOppositeVerticalEdges(
  source: Buffer,
  width: number,
  height: number,
  config: ModeConfig
) {
  const output = Buffer.from(source);
  const maxBand = Math.max(8, Math.floor(height / 2) - 1);

  for (let x = 0; x < width; x++) {
    const band = config.irregularDepth
      ? getIrregularBand(config.verticalBand, x, maxBand)
      : config.verticalBand;

    for (let y = 0; y < band; y++) {
      const mix = config.mixStrength * smoothstep01(1 - y / Math.max(1, band - 1));
      const bottomY = height - 1 - y;
      const topIndex = (y * width + x) * 4;
      const bottomIndex = (bottomY * width + x) * 4;

      for (let channel = 0; channel < 4; channel++) {
        const topValue = source[topIndex + channel];
        const bottomValue = source[bottomIndex + channel];

        output[topIndex + channel] = clampChannel(topValue * (1 - mix) + bottomValue * mix);
        output[bottomIndex + channel] = clampChannel(bottomValue * (1 - mix) + topValue * mix);
      }
    }
  }

  return output;
}

// ... (আপনার আগের সব sharp ম্যাথ লজিক: clampBandSize, getModeConfig ইত্যাদি হুবহু থাকবে) ...

async function createSeamlessTexture(inputBuffer: Buffer, mode: TextureMode) {
  // অপ্টিমাইজেশন: ইমেজ অনেক বড় হলে মেমরি লিক ঠেকাতে প্রথমেই রিসাইজ করে নেওয়া হচ্ছে (Max 1024x1024)
  const normalized = await sharp(inputBuffer)
    .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
    .rotate()
    .ensureAlpha()
    .png()
    .toBuffer();
    
  const { data, info } = await sharp(normalized).raw().toBuffer({ resolveWithObject: true });

  const config = getModeConfig(mode, info.width, info.height);
  const lightingBalanced = await normalizeLighting(data, info.width, info.height, info.channels, config.lightingSigma, config.lightingStrength);
  const horizontalBlend = blendOppositeHorizontalEdges(lightingBalanced, info.width, info.height, config);
  const verticalBlend = blendOppositeVerticalEdges(horizontalBlend, info.width, info.height, config);

  let pipeline = sharp(verticalBlend, {
    raw: { width: info.width, height: info.height, channels: info.channels as 1 | 2 | 3 | 4 },
  });

  if (config.blurSigma > 0) {
    pipeline = pipeline.blur(config.blurSigma);
  }

  // লসলেস WebP তে কনভার্ট করা হচ্ছে যেন কোয়ালিটি সেরা থাকে কিন্তু সাইজ কমে যায়
  return pipeline.flatten({ background: '#ffffff' }).webp({ quality: 90, lossless: false }).toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as string;
    const iterations = parseInt((formData.get('iterations') as string) || '1');

    if (!file || !mode) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    let currentBuffer: any = Buffer.from(arrayBuffer);

    // 🚀 BLAZING FAST OPTIMIZATION: লুপ চালানোর আগেই ছবি ছোট করে নেওয়া
    currentBuffer = await sharp(currentBuffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Multi-pass Magic
    for (let i = 0; i < iterations; i++) {
      currentBuffer = (await createSeamlessTexture(currentBuffer, mode as TextureMode)) as any;
    }

    const outputBase64 = `data:image/webp;base64,${currentBuffer.toString('base64')}`;

    return NextResponse.json({ resultBase64: outputBase64 });
  } catch (error) {
    console.error('Texture Processing Error:', error);
    return NextResponse.json({ error: 'Failed to process texture' }, { status: 500 });
  }
}
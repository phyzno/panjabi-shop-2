import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'fabrics/raw';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File থেকে Buffer এ কনভার্ট (সরাসরি স্ট্রিম, কোনো Base64 লিক নেই)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    // সরাসরি Cloudinary-তে আপলোড
    const uploadResult: any = await uploadImageToCloudinary(buffer, folder);

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error('Cloudinary upload failed');
    }

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
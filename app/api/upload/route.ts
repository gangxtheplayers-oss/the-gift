import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const dataUploadsDir = path.join(process.cwd(), 'data', 'uploads');

    await fs.mkdir(publicUploadsDir, { recursive: true });
    await fs.mkdir(dataUploadsDir, { recursive: true });

    const contentType = request.headers.get('content-type') || '';

    // Case 1: JSON payload with base64 data URL
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, filename: suggestedName } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return NextResponse.json({ error: 'Missing image dataUrl' }, { status: 400 });
      }

      const commaIdx = dataUrl.indexOf(',');
      if (commaIdx === -1) {
        return NextResponse.json({ error: 'Invalid data URL format' }, { status: 400 });
      }

      const metaHeader = dataUrl.slice(0, commaIdx).toLowerCase();
      const base64Data = dataUrl.slice(commaIdx + 1);
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'jpg';
      if (metaHeader.includes('png')) ext = 'png';
      else if (metaHeader.includes('webp')) ext = 'webp';
      else if (metaHeader.includes('gif')) ext = 'gif';

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safePrefix = suggestedName
        ? path.basename(suggestedName, path.extname(suggestedName)).replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30)
        : 'pic';
      const filename = `${safePrefix}_${timestamp}_${randomSuffix}.${ext}`;

      // Write to both public/uploads and data/uploads for durability across rebuilds
      await Promise.all([
        fs.writeFile(path.join(publicUploadsDir, filename), buffer),
        fs.writeFile(path.join(dataUploadsDir, filename), buffer),
      ]);

      const publicUrl = `/api/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl, filename });
    }

    // Case 2: Multipart form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || 'image.jpg';
      let ext = path.extname(originalName).replace('.', '').toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      if (!ext) {
        const type = (file.type || '').toLowerCase();
        if (type.includes('png')) ext = 'png';
        else if (type.includes('webp')) ext = 'webp';
        else if (type.includes('gif')) ext = 'gif';
        else ext = 'jpg';
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const safeBase = path.basename(originalName, path.extname(originalName))
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .substring(0, 30);

      const filename = `${safeBase}_${timestamp}_${randomSuffix}.${ext}`;

      await Promise.all([
        fs.writeFile(path.join(publicUploadsDir, filename), buffer),
        fs.writeFile(path.join(dataUploadsDir, filename), buffer),
      ]);

      const publicUrl = `/api/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl, filename });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: 'Server failed to save image' }, { status: 500 });
  }
}

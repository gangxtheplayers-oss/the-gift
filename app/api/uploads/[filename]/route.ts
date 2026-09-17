import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(filename);

    const publicPath = path.join(process.cwd(), 'public', 'uploads', safeName);
    const dataPath = path.join(process.cwd(), 'data', 'uploads', safeName);

    let fileBuffer: Buffer | null = null;

    try {
      fileBuffer = await fs.readFile(publicPath);
    } catch {
      try {
        fileBuffer = await fs.readFile(dataPath);
      } catch {
        // Not found
      }
    }

    if (!fileBuffer) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Determine mime type
    const ext = path.extname(safeName).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

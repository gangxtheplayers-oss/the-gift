/**
 * Image processing utilities for high-resolution screenshots and photos.
 * Preserves exact aspect ratio and dimensions while compressing data size
 * so users can drag & drop heavy PNGs without breaking browser storage.
 */

/**
 * Checks whether a File is an acceptable image (PNG, JPG, JPEG, WEBP, GIF, BMP, HEIC).
 * Robust to missing MIME types on some operating systems.
 */
export function isImageFile(file: File): boolean {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|bmp|heic|avif)$/i.test(file.name || '');
}

export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve) => {
    // If it's not a standard image file or window is undefined
    if (typeof window === 'undefined' || !file) {
      resolve('');
      return;
    }

    const processImg = (src: string, isObjectUrl = false) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const cleanup = () => {
        if (isObjectUrl) {
          try {
            URL.revokeObjectURL(src);
          } catch {
            // ignore
          }
        }
      };

      img.onerror = () => {
        cleanup();
        // Fallback: read directly as Data URL
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => resolve(fallbackReader.result as string || '');
        fallbackReader.onerror = () => resolve('');
        fallbackReader.readAsDataURL(file);
      };

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 600;

          // Scale down if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            const fallbackReader = new FileReader();
            fallbackReader.onload = () => resolve(fallbackReader.result as string || '');
            fallbackReader.readAsDataURL(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Try WebP first for ultra-lightweight size, fallback to JPEG
          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            if (webpData.startsWith('data:image/webp')) {
              cleanup();
              resolve(webpData);
              return;
            }
          } catch {
            // WebP not supported
          }

          const jpegData = canvas.toDataURL('image/jpeg', quality);
          cleanup();
          resolve(jpegData);
        } catch (e) {
          console.warn('Canvas optimization error, falling back to data URL:', e);
          cleanup();
          const fallbackReader = new FileReader();
          fallbackReader.onload = () => resolve(fallbackReader.result as string || '');
          fallbackReader.readAsDataURL(file);
        }
      };

      img.src = src;
    };

    // Try object URL first (fastest, uses zero extra memory)
    try {
      const objUrl = URL.createObjectURL(file);
      processImg(objUrl, true);
    } catch {
      // If createObjectURL fails, use FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        processImg(e.target?.result as string, false);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Compresses/resizes a large image file into a lightweight File object
 * suitable for instant, failure-free upload over HTTP.
 */
export async function optimizeImageToFile(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file) {
      resolve(file);
      return;
    }

    const processImg = (src: string, isObjectUrl = false) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const cleanup = () => {
        if (isObjectUrl) {
          try {
            URL.revokeObjectURL(src);
          } catch {
            // ignore
          }
        }
      };

      img.onerror = () => {
        cleanup();
        resolve(file);
      };

      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 600;

          // If image is already lightweight (<800KB) and within max dimensions, keep it
          if (width <= maxDimension && height <= maxDimension && file.size < 800 * 1024) {
            cleanup();
            resolve(file);
            return;
          }

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            resolve(file);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = (file.type && file.type.includes('png')) || /\.png$/i.test(file.name || '');
          const outputMime = isPng ? 'image/png' : 'image/jpeg';
          const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, isPng ? '.png' : '.jpg') : `image.${isPng ? 'png' : 'jpg'}`;

          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                const optimizedFile = new File([blob], cleanName, {
                  type: outputMime,
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            outputMime,
            quality
          );
        } catch {
          cleanup();
          resolve(file);
        }
      };

      img.src = src;
    };

    try {
      const objUrl = URL.createObjectURL(file);
      processImg(objUrl, true);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        processImg(e.target?.result as string, false);
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Derives a clean, readable caption from a screenshot filename
 * e.g., "Fortnite_Clutch_Top1_2026.png" -> "Fortnite Clutch Top1"
 */
export function formatFilenameToCaption(filename: string): string {
  if (!filename) return 'Our Special Moment';
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = nameWithoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If filename is generic like "Screenshot 2026-09-13", format nicely
  if (!cleaned || cleaned.length < 2) return 'Game Screenshot';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

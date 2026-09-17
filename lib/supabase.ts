import { createClient } from '@supabase/supabase-js';

// User's Supabase credentials
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://wwwhblpthmuqhwlidyoi.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3d2hibHB0aG11cWh3bGlkeW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MzQzOTcsImV4cCI6MjEwNTAxMDM5N30.GQNj6Cm8Il4pF55sos7e5fHps9LZ3VPCDOXc9FjIWDk';

// Create a single supabase client for client and server usage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Checks connection status to Supabase.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    // Attempt a lightweight ping to Supabase auth or storage
    const { error } = await supabase.storage.listBuckets();
    if (error && error.message && !error.message.includes('not found')) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown connection error';
    return { connected: false, message: msg };
  }
}

/**
 * Attempts to upload an image to Supabase Storage bucket 'gift-photos' or 'uploads'.
 * If the bucket doesn't exist yet or is restricted, returns null so the app falls back seamlessly.
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucketName = 'gift-photos'
): Promise<string | null> {
  try {
    const ext = file.name ? file.name.split('.').pop() : 'jpg';
    const filePath = `memories/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      // Bucket might not exist or lacks public insert policy
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch {
    return null;
  }
}

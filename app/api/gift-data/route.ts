import { NextRequest, NextResponse } from 'next/server';
import { GiftData } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Single shared row holding the whole gift payload (this is a 2-person app,
// so one record is all we need). Persisting through Supabase instead of the
// local filesystem is required on Vercel: serverless functions get a fresh,
// read-only filesystem per invocation, so anything written with fs.writeFile
// disappears immediately and is never visible to the next request.
const RECORD_ID = 'main';

export async function GET() {
  try {
    const { data: row, error } = await supabase
      .from('gift_data')
      .select('payload')
      .eq('id', RECORD_ID)
      .maybeSingle();

    if (error) {
      console.error('Error fetching gift data from Supabase:', error);
      return NextResponse.json({ success: true, data: null, source: 'default' });
    }

    if (!row) {
      return NextResponse.json({ success: true, data: null, source: 'default' });
    }

    return NextResponse.json({ success: true, data: row.payload, source: 'server' });
  } catch (error) {
    console.error('Error fetching gift data:', error);
    return NextResponse.json({ success: false, error: 'Failed to read server data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const giftData: GiftData = body.data || body;

    if (!giftData || typeof giftData !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid gift data' }, { status: 400 });
    }

    giftData.updatedAt = Date.now();

    const { error } = await supabase
      .from('gift_data')
      .upsert({ id: RECORD_ID, payload: giftData, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Error saving gift data to Supabase:', error);
      return NextResponse.json({ error: 'Failed to persist gift data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      savedAt: giftData.updatedAt,
      data: giftData,
    });
  } catch (error) {
    console.error('Error saving gift data:', error);
    return NextResponse.json({ error: 'Failed to persist gift data' }, { status: 500 });
  }
}

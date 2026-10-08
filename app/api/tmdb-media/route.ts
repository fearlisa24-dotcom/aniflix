import { NextRequest, NextResponse } from 'next/server';
import { getAnimeTMDBMedia } from '@/lib/tmdb';

const mediaCache = new Map<string, { poster: string | null; backdrop: string | null } | null>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ poster: null, backdrop: null });
  }

  const key = title.trim().toLowerCase();
  if (mediaCache.has(key)) {
    const cached = mediaCache.get(key);
    return NextResponse.json(cached || { poster: null, backdrop: null });
  }

  const result = await getAnimeTMDBMedia(title);
  const payload = result || { poster: null, backdrop: null };
  mediaCache.set(key, payload);
  return NextResponse.json(payload);
}

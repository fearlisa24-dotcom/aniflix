import { NextRequest, NextResponse } from 'next/server';
import { searchAnime, getTrending } from '@/lib/anilist';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    // Return trending suggestions if empty
    const trending = await getTrending(1, 8);
    return NextResponse.json({ results: trending });
  }

  const results = await searchAnime(q.trim(), 15);
  return NextResponse.json({ results });
}

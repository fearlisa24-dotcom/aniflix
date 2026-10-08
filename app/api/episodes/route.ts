import { NextRequest, NextResponse } from 'next/server';
import { getEpisodesForAnimeTMDB, getSeasonListForAnimeTMDB } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const mode = searchParams.get('mode'); // 'seasons' to get season list
  const count = parseInt(searchParams.get('count') || '24', 10);
  const rangeStart = parseInt(searchParams.get('rangeStart') || '1', 10);
  const rangeEnd = parseInt(searchParams.get('rangeEnd') || String(rangeStart + 23), 10);

  if (!title) {
    return NextResponse.json({ totalCount: 24, episodes: [], seasons: [] }, { status: 400 });
  }

  if (mode === 'seasons') {
    const result = await getSeasonListForAnimeTMDB(title, count);
    return NextResponse.json(result);
  }

  const result = await getEpisodesForAnimeTMDB(title, count, rangeStart, rangeEnd);
  return NextResponse.json(result);
}

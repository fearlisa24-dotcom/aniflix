import { NextRequest, NextResponse } from 'next/server';
import { searchAnime, getAnimeById } from '@/lib/anilist';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const query = searchParams.get('q');

  try {
    if (id) {
      const anime = await getAnimeById(Number(id));
      return NextResponse.json(anime);
    }

    if (query) {
      const results = await searchAnime(query);
      return NextResponse.json(results);
    }

    return NextResponse.json(
      { error: 'Provide ?id= or ?q= parameter' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

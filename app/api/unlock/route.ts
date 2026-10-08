import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (token) {
    // Set unlock cookie and redirect
    const slug = searchParams.get('slug') || '';
    const response = NextResponse.redirect(
      new URL(`/watch/${slug}/${searchParams.get('ep') || '1'}`, request.url)
    );

    response.cookies.set('aniflix_key', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: UNLOCK_DURATION_MS / 1000,
      path: '/',
    });

    response.cookies.set('aniflix-unlock', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: UNLOCK_DURATION_MS / 1000,
      path: '/',
    });

    return response;
  }

  // Check unlock status
  const cookieStore = cookies();
  const aniflixKey = cookieStore.get('aniflix_key');
  const unlockCookie = cookieStore.get('aniflix-unlock');

  return NextResponse.json({ unlocked: Boolean(aniflixKey?.value || unlockCookie?.value) });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token: string;
      slug?: string;
      episodeNumber?: number;
    };

    if (!body.token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // In production, validate the token with Work.ink API
    // For now, accept any token
    const response = NextResponse.json({ success: true, unlocked: true });

    response.cookies.set('aniflix_key', body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: UNLOCK_DURATION_MS / 1000,
      path: '/',
    });

    response.cookies.set('aniflix-unlock', body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: UNLOCK_DURATION_MS / 1000,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

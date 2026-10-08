import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/';
  const response = NextResponse.redirect(new URL(redirectTarget, request.url));

  response.cookies.delete('aniflix_key');
  response.cookies.delete('aniflix-unlock');

  return response;
}

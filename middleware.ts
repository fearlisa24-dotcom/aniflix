import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export const config = { matcher: ["/watch/:path*"] };

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("aniflix_key")?.value;
  if (!token) return NextResponse.redirect(new URL("/unlock-required", req.url));

  const session = await verifySession(token);
  if (!session) return NextResponse.redirect(new URL("/unlock-required", req.url));

  return NextResponse.next();
}

import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("aniflix_key")?.value;
  if (!token) return NextResponse.json({ valid: false });

  const session = await verifySession(token);
  if (!session) return NextResponse.json({ valid: false });

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return NextResponse.json({ valid: true, expiresAt: payload.exp * 1000 });
  } catch {
    return NextResponse.json({ valid: false });
  }
}

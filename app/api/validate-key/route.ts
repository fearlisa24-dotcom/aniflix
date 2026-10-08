import { NextRequest, NextResponse } from "next/server";
import { validatePandaKey } from "@/lib/pandauth";
import { signSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { status: "rate_limited", message: "Too many attempts. Try again in 10 minutes." },
      { status: 429 }
    );
  }

  let body: { key?: string; hwid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "invalid", message: "Bad request." }, { status: 400 });
  }

  const { key, hwid } = body;
  const serviceId = process.env.PANDA_SERVICE_ID;

  if (!key || !hwid || !serviceId) {
    return NextResponse.json(
      { status: "invalid", message: "Missing key or device ID." },
      { status: 400 }
    );
  }

  const result = await validatePandaKey(serviceId, key.trim(), hwid);

  if (!result.success) {
    logger.warn("Validation failed", { ip, reason: result.message });
    return NextResponse.json(
      { status: "invalid", message: "That key is invalid, expired, or doesn't match this device." },
      { status: 400 }
    );
  }

  const token = await signSession({ key: key.trim(), hwid });
  const ttlHours = parseInt(process.env.UNLOCK_TTL_HOURS ?? "24", 10);
  const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;

  const res = NextResponse.json({ status: "success", expiresAt });
  res.cookies.set("aniflix_key", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ttlHours * 60 * 60,
    path: "/",
  });

  logger.info("Key validated", { ip, expiresAt });
  return res;
}

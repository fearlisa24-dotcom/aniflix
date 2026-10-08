import { SignJWT, jwtVerify } from "jose";

const SECRET_STRING =
  process.env.UNLOCK_SECRET ||
  "aniflix_secure_jwt_secret_32_bytes_long_key_2026_pusl_v4";
const secret = new TextEncoder().encode(SECRET_STRING);

export interface SessionPayload {
  key: string;
  hwid: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const ttlHours = parseInt(process.env.UNLOCK_TTL_HOURS ?? "24", 10);
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlHours}h`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.key !== "string" || typeof payload.hwid !== "string") return null;
    return { key: payload.key, hwid: payload.hwid };
  } catch {
    return null;
  }
}

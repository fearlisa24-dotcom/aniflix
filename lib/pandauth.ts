const PANDA_BASE = "https://pandauth.com";

export interface PandaValidationResponse {
  success: boolean;
  isPremium: boolean;
  message?: string;
  raw?: unknown;
}

export async function validatePandaKey(
  serviceId: string,
  key: string,
  hwid: string
): Promise<PandaValidationResponse> {
  const apiKey =
    process.env.PANDA_API_KEY ||
    "0fe73e45-2799-4073-8d84-5660bb6e0a8b";
  const sid = serviceId || process.env.PANDA_SERVICE_ID || "aniflixx";

  const url = `${PANDA_BASE}/v2_validation`;

  // Panda Auth endpoint expects POST with JSON body
  let res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; Aniflix/1.0)",
      Accept: "application/json",
    },
    body: JSON.stringify({
      service: sid,
      serviceId: sid,
      key,
      hwid,
    }),
    cache: "no-store",
  });

  // Fallback to pandadevelopment.net if pandauth.com has network issues
  if (!res.ok && res.status !== 400 && res.status !== 401) {
    try {
      res = await fetch("https://pandadevelopment.net/v2_validation", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; Aniflix/1.0)",
          Accept: "application/json",
        },
        body: JSON.stringify({
          service: sid,
          serviceId: sid,
          key,
          hwid,
        }),
        cache: "no-store",
      });
    } catch {
      // ignore
    }
  }

  if (!res.ok) {
    return { success: false, isPremium: false, message: `Panda HTTP ${res.status}` };
  }

  const data = (await res.json()) as Record<string, unknown>;

  const isSuccess =
    data.Status === "Authenticate" ||
    data.Status === "Authenticated" ||
    data.Status === "Success" ||
    Boolean(data.success ?? data.V2_Authentication ?? data.valid ?? false);

  const isPremium = Boolean(
    data.Is_Premium ?? data.isPremium ?? data.Premium_Mode ?? data.premium ?? false
  );

  const message =
    typeof data.Note === "string"
      ? data.Note
      : typeof data.message === "string"
      ? data.message
      : undefined;

  return {
    success: isSuccess,
    isPremium,
    message,
    raw: data,
  };
}

export function getPandaGetKeyUrl(hwid?: string): string {
  const base =
    process.env.NEXT_PUBLIC_PANDA_GETKEY ||
    "https://ads.pandauth.com/getkey/aniflixx";
  if (!hwid) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}hwid=${encodeURIComponent(hwid)}`;
}

import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, number>({
  max: 5000,
  ttl: 10 * 60 * 1000, // 10 minutes
});

export function checkRateLimit(ip: string, max: number = 10): boolean {
  if (ip === "::1" || ip === "127.0.0.1" || ip === "unknown" || ip === "localhost") return true;
  const count = (cache.get(ip) ?? 0) + 1;
  cache.set(ip, count);
  return count <= max;
}

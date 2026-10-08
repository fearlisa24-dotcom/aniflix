'use client';

const memoryCache = new Map<string, { poster: string | null; backdrop: string | null }>();

export function getCachedTMDBMedia(title: string): { poster: string | null; backdrop: string | null } | null {
  if (!title) return null;
  const key = title.trim().toLowerCase();
  if (memoryCache.has(key)) return memoryCache.get(key) || null;

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`tmdb_media_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function fetchTMDBMedia(title: string): Promise<{ poster: string | null; backdrop: string | null }> {
  const fallback = { poster: null, backdrop: null };
  if (!title) return fallback;
  const key = title.trim().toLowerCase();
  const cached = getCachedTMDBMedia(title);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/tmdb-media?title=${encodeURIComponent(title)}`);
    if (res.ok) {
      const data = await res.json();
      const safeData = data && typeof data === 'object' ? data : fallback;
      memoryCache.set(key, safeData);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`tmdb_media_${key}`, JSON.stringify(safeData));
        } catch {
          // ignore
        }
      }
      return safeData;
    }
  } catch {
    // fallback
  }

  return fallback;
}

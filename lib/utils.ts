import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function formatEpisodeCount(count: number | null): string {
  if (!count) return 'Ongoing';
  return `${count} Episodes`;
}

export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item) as { data: T; expiry: number };
    if (parsed.expiry && Date.now() > parsed.expiry) {
      window.localStorage.removeItem(key);
      return fallback;
    }
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function setLocalStorage<T>(key: string, data: T, ttlMs: number = 3600000): void {
  if (typeof window === 'undefined') return;
  try {
    const item = { data, expiry: Date.now() + ttlMs };
    window.localStorage.setItem(key, JSON.stringify(item));
  } catch {
    // localStorage full or unavailable
  }
}

export function getProgress(): Record<string, { ep: number; time: number; title: string; cover: string; banner: string; updatedAt: number }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('aniflix-progress');
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, { ep: number; time: number; title: string; cover: string; banner: string; updatedAt: number }>;
  } catch {
    return {};
  }
}

export function saveProgress(slug: string, ep: number, time: number, title: string, cover: string, banner: string): void {
  if (typeof window === 'undefined') return;
  const all = getProgress();
  all[slug] = { ep, time, title, cover, banner, updatedAt: Date.now() };
  window.localStorage.setItem('aniflix-progress', JSON.stringify(all));
}

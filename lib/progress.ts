export interface Progress {
  episode: number;
  time: number;
  duration: number;
  updatedAt: number;
}

export interface EpisodeWatchRecord {
  time: number;
  duration: number;
  completed: boolean;
  updatedAt: number;
}

export type EpisodeWatchStatus = 'unwatched' | 'current' | 'unfinished' | 'completed';

const KEY = "aniflix_progress";
const EPISODES_KEY = "aniflix_episodes_progress";

export function saveProgress(anilistId: number, episode: number, time: number, duration: number): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  all[anilistId] = { episode, time, duration, updatedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(all));

  // Also save per-episode progress
  saveEpisodeProgress(anilistId, episode, time, duration);
}

export function getProgress(anilistId: number): Progress | null {
  if (typeof window === "undefined") return null;
  const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
  return all[anilistId] ?? null;
}

export function getAllProgress(): Record<number, Progress> {
  if (typeof window === "undefined") return {};
  return JSON.parse(localStorage.getItem(KEY) ?? "{}");
}

/**
 * Save progress for an individual episode
 */
export function saveEpisodeProgress(
  animeId: number | string,
  episode: number,
  time: number,
  duration: number
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(EPISODES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const key = String(animeId);
    if (!all[key]) all[key] = {};

    const isCompleted = duration > 0 ? time >= duration * 0.88 : time >= 1200;

    all[key][episode] = {
      time,
      duration: duration || 1440,
      completed: isCompleted,
      updatedAt: Date.now(),
    };

    localStorage.setItem(EPISODES_KEY, JSON.stringify(all));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Get progress map for all episodes of an anime
 */
export function getAnimeAllEpisodesProgress(
  animeId: number | string
): Record<number, EpisodeWatchRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EPISODES_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw);
    return all[String(animeId)] || {};
  } catch {
    return {};
  }
}

/**
 * Get status of an episode:
 * - 'current' (Green): currently watching / active on player
 * - 'completed' (Orange): finished watching (>88% or marked completed)
 * - 'unfinished' (Blue): started watching (>15s but not completed)
 * - 'unwatched' (Grey): not watched yet
 */
export function getEpisodeStatus(
  animeId: number | string,
  episode: number,
  currentPlayingEp?: number
): EpisodeWatchStatus {
  if (currentPlayingEp !== undefined && currentPlayingEp === episode) {
    return 'current';
  }

  if (typeof window === "undefined") return 'unwatched';

  try {
    const records = getAnimeAllEpisodesProgress(animeId);
    const record = records[episode];
    if (!record) return 'unwatched';

    if (record.completed || (record.duration > 0 && record.time >= record.duration * 0.88)) {
      return 'completed';
    }

    if (record.time > 15) {
      return 'unfinished';
    }

    return 'unwatched';
  } catch {
    return 'unwatched';
  }
}

/**
 * Format seconds to MM:SS or HH:MM:SS (e.g. 465 -> "07:45")
 */
export function formatSeconds(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

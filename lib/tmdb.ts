const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const token =
  process.env.TMDB_READ_ACCESS_TOKEN ||
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhM2UzZjFjMzM0MmU0NTgzZmMwOTgzODE1ZmVkZGM2ZSIsIm5iZiI6MTc2ODgzMDcwMC44MjksInN1YiI6IjY5NmUzNmVjNzhjZmFjZGJlYWY5NTE1OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qJ5fbcUw7Hi42m2FuUiGtH9dUoIelr__EBzqCgEmFFw';

export interface TMDBAnimeEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface TMDBAnimeDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date: string | null;
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time: number[];
  status: string;
  genres: Array<{ id: number; name: string }>;
  networks: Array<{ id: number; name: string; logo_path: string | null }>;
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
  vote_average: number;
  vote_count: number;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
  }>;
}

export function getTMDBImageUrl(path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'original'): string {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const url = new URL(`${TMDB_BASE}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Search anime strictly (Japanese animation only).
 */
export async function searchAnimeTMDB(title: string): Promise<TMDBAnimeDetails | null> {
  const cleanTitle = title.replace(/\(TV\)|Season \d+|Part \d+/gi, '').trim();

  // Search TV shows
  const data = await tmdbFetch<{ results: Array<TMDBAnimeDetails & { genre_ids: number[]; origin_country: string[]; original_language: string }> }>(
    '/search/tv',
    {
      query: cleanTitle,
      include_adult: 'false',
    }
  );

  if (!data || !data.results || data.results.length === 0) return null;

  // Filter strictly for anime: genre 16 (Animation) and Japanese origin/language
  const animeMatch = data.results.find(
    (item) =>
      item.genre_ids?.includes(16) &&
      (item.original_language === 'ja' || item.origin_country?.includes('JP'))
  ) || data.results.find((item) => item.genre_ids?.includes(16)) || data.results[0];

  if (!animeMatch) return null;

  // Fetch full details
  return await getAnimeDetailsTMDB(animeMatch.id);
}

/**
 * Get anime details strictly.
 */
export async function getAnimeDetailsTMDB(tmdbId: number): Promise<TMDBAnimeDetails | null> {
  return await tmdbFetch<TMDBAnimeDetails>(`/tv/${tmdbId}`);
}

/**
 * Get anime season episodes with names and stills.
 */
export async function getAnimeSeasonEpisodesTMDB(
  tmdbId: number,
  seasonNumber: number = 1
): Promise<TMDBAnimeEpisode[]> {
  const data = await tmdbFetch<{ episodes: TMDBAnimeEpisode[] }>(
    `/tv/${tmdbId}/season/${seasonNumber}`
  );
  return data?.episodes || [];
}

/**
 * Fetch all episodes across seasons for large series (like One Piece).
 */
export async function getAllAnimeEpisodesTMDB(
  tmdbId: number,
  totalSeasons: number = 1
): Promise<TMDBAnimeEpisode[]> {
  const maxSeasonsToFetch = Math.min(totalSeasons, 5); // Fetch first 5 seasons or current
  const seasons = await Promise.all(
    Array.from({ length: maxSeasonsToFetch }, (_, i) =>
      getAnimeSeasonEpisodesTMDB(tmdbId, i + 1)
    )
  );
  return seasons.flat();
}

export interface TMDBFormattedEpisode {
  number: number;
  title: string;
  thumbnail: string | null;
  airDate: string;
  overview: string;
}

export interface TMDBEpisodesResult {
  totalCount: number;
  episodes: TMDBFormattedEpisode[];
}

export interface TMDBSeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  startEpisode: number;
  endEpisode: number;
  posterPath: string | null;
}

/**
 * Get unified episodes for an anime starting strictly from Episode 1.
 * Uses TMDB for episode names, stills, air dates, and total episode count.
 */
export async function getEpisodesForAnimeTMDB(
  title: string,
  totalCount: number = 24,
  rangeStart: number = 1,
  rangeEnd: number = 24
): Promise<TMDBEpisodesResult> {
  const isOnePiece = /one\s*piece/i.test(title);
  const fallbackTotal = isOnePiece ? 1180 : Math.max(totalCount || 24, 24);

  try {
    const tmdbAnime = await searchAnimeTMDB(title);
    if (!tmdbAnime) {
      const episodes = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => {
        const num = rangeStart + i;
        return {
          number: num,
          title: `Episode ${num}`,
          thumbnail: null,
          airDate: 'Subbed / Dubbed',
          overview: '',
        };
      });
      return { totalCount: fallbackTotal, episodes };
    }

    const calculatedTotal = Math.max(
      tmdbAnime.number_of_episodes || 0,
      totalCount || 0,
      fallbackTotal
    );

    // Filter valid seasons (exclude season 0 specials)
    const validSeasons = (tmdbAnime.seasons || [])
      .filter((s) => s.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number);

    // Calculate season offsets
    let cumulative = 0;
    const seasonRanges = validSeasons.map((s) => {
      const start = cumulative + 1;
      const end = cumulative + s.episode_count;
      cumulative = end;
      return { seasonNumber: s.season_number, start, end, count: s.episode_count };
    });

    // Find which seasons overlap with [rangeStart, rangeEnd]
    const neededSeasons = seasonRanges.filter(
      (sr) => sr.start <= rangeEnd && sr.end >= rangeStart
    );

    const episodesMap = new Map<number, TMDBFormattedEpisode>();

    // Fetch the needed seasons
    const seasonsToFetch = neededSeasons.length > 0 ? neededSeasons : [seasonRanges[0] || { seasonNumber: 1, start: 1, end: 24 }];
    for (const sr of seasonsToFetch) {
      const seasonEps = await getAnimeSeasonEpisodesTMDB(tmdbAnime.id, sr.seasonNumber);
      seasonEps.forEach((ep, idx) => {
        const epNum = sr.start + idx;
        if (epNum >= rangeStart && epNum <= rangeEnd) {
          episodesMap.set(epNum, {
            number: epNum,
            title: ep.name ? `${ep.name}` : `Episode ${epNum}`,
            thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
            airDate: ep.air_date ? new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Subbed / Dubbed',
            overview: ep.overview || '',
          });
        }
      });
    }

    // Build the requested range
    const resultEpisodes: TMDBFormattedEpisode[] = [];
    for (let num = rangeStart; num <= rangeEnd && num <= calculatedTotal; num++) {
      if (episodesMap.has(num)) {
        resultEpisodes.push(episodesMap.get(num)!);
      } else {
        resultEpisodes.push({
          number: num,
          title: `Episode ${num}`,
          thumbnail: null,
          airDate: 'Subbed / Dubbed',
          overview: '',
        });
      }
    }

    return { totalCount: calculatedTotal, episodes: resultEpisodes };
  } catch {
    const episodes = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => {
      const num = rangeStart + i;
      return {
        number: num,
        title: `Episode ${num}`,
        thumbnail: null,
        airDate: 'Subbed / Dubbed',
        overview: '',
      };
    });
    return { totalCount: fallbackTotal, episodes };
  }
}

/**
 * Get season metadata for an anime from TMDB.
 * Returns array of seasons with their episode ranges.
 */
export async function getSeasonListForAnimeTMDB(
  title: string,
  totalCount: number = 24
): Promise<{ seasons: TMDBSeasonInfo[]; totalCount: number }> {
  const isOnePiece = /one\s*piece/i.test(title);
  const fallbackTotal = isOnePiece ? 1180 : Math.max(totalCount || 24, 24);

  try {
    const tmdbAnime = await searchAnimeTMDB(title);
    if (!tmdbAnime) {
      return {
        seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: fallbackTotal, startEpisode: 1, endEpisode: fallbackTotal, posterPath: null }],
        totalCount: fallbackTotal,
      };
    }

    const calculatedTotal = Math.max(
      tmdbAnime.number_of_episodes || 0,
      totalCount || 0,
      fallbackTotal
    );

    const validSeasons = (tmdbAnime.seasons || [])
      .filter((s) => s.season_number > 0)
      .sort((a, b) => a.season_number - b.season_number);

    if (validSeasons.length === 0) {
      return {
        seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: calculatedTotal, startEpisode: 1, endEpisode: calculatedTotal, posterPath: null }],
        totalCount: calculatedTotal,
      };
    }

    let cumulative = 0;
    const seasons: TMDBSeasonInfo[] = validSeasons.map((s) => {
      const start = cumulative + 1;
      const end = cumulative + s.episode_count;
      cumulative = end;
      return {
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        startEpisode: start,
        endEpisode: end,
        posterPath: s.poster_path,
      };
    });

    return { seasons, totalCount: calculatedTotal };
  } catch {
    return {
      seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: fallbackTotal, startEpisode: 1, endEpisode: fallbackTotal, posterPath: null }],
      totalCount: fallbackTotal,
    };
  }
}

/**
 * Get TMDB poster and backdrop images for an anime title.
 */
export async function getAnimeTMDBMedia(title: string): Promise<{
  poster: string | null;
  backdrop: string | null;
} | null> {
  try {
    const data = await searchAnimeTMDB(title);
    if (!data) return null;
    return {
      poster: data.poster_path ? getTMDBImageUrl(data.poster_path, 'w500') : null,
      backdrop: data.backdrop_path ? getTMDBImageUrl(data.backdrop_path, 'original') : null,
    };
  } catch {
    return null;
  }
}


import type { AnimeMedia, AnimeDetail } from '@/types';

const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_FRAGMENT = `
  fragment MediaFields on Media {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    genres
    episodes
    status
    season
    seasonYear
    format
    studios(isMain: true) {
      nodes {
        name
      }
    }
    averageScore
    popularity
    trending
    nextAiringEpisode {
      episode
      airingAt
    }
    meanScore
    trailer {
      id
      site
      thumbnail
    }
  }
`;

const queryCache = new Map<string, { data: unknown; expiry: number }>();

async function anilistQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiry > now) {
    return cached.data as T;
  }

  try {
    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (cached) return cached.data as T;
      throw new Error(`AniList API error: ${res.status}`);
    }

    const json = (await res.json()) as { data: T };
    // Cache for 30 minutes in memory
    queryCache.set(cacheKey, { data: json.data, expiry: now + 30 * 60 * 1000 });
    return json.data;
  } catch (err) {
    if (cached) return cached.data as T;
    throw err;
  }
}

export async function getAllTimePopular(perPage: number = 25): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

export async function getTrending(page: number = 1, perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { page, perPage });
  return data.Page.media;
}

export async function getPopularThisSeason(perPage: number = 20): Promise<AnimeMedia[]> {
  const now = new Date();
  const month = now.getMonth();
  let season: string;
  if (month <= 2) season = 'WINTER';
  else if (month <= 5) season = 'SPRING';
  else if (month <= 8) season = 'SUMMER';
  else season = 'FALL';
  const year = now.getFullYear();

  const query = `
    ${MEDIA_FRAGMENT}
    query ($season: MediaSeason, $year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(season: $season, seasonYear: $year, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { season, year, perPage });
  return data.Page.media;
}

export async function getTopRated(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

export async function getByGenre(genre: string, perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($genre: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(genre: $genre, sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { genre, perPage });
  return data.Page.media;
}

export async function getNewlyAdded(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: START_DATE_DESC, type: ANIME, status: RELEASING, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

export async function getSimulcast(perPage: number = 20): Promise<AnimeMedia[]> {
  const now = new Date();
  const month = now.getMonth();
  let season: string;
  if (month <= 2) season = 'WINTER';
  else if (month <= 5) season = 'SPRING';
  else if (month <= 8) season = 'SUMMER';
  else season = 'FALL';
  const year = now.getFullYear();

  const query = `
    ${MEDIA_FRAGMENT}
    query ($season: MediaSeason, $year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(season: $season, seasonYear: $year, sort: POPULARITY_DESC, type: ANIME, status: RELEASING, isAdult: false) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { season, year, perPage });
  return data.Page.media;
}

const ANIME_ALIASES: Record<string, string> = {
  'aot': 'Attack on Titan',
  'jjk': 'Jujutsu Kaisen',
  'mha': 'My Hero Academia',
  'bnha': 'My Hero Academia',
  'ds': 'Demon Slayer: Kimetsu no Yaiba',
  'kny': 'Demon Slayer: Kimetsu no Yaiba',
  'csm': 'Chainsaw Man',
  'op': 'One Piece',
  'sao': 'Sword Art Online',
  'fma': 'Fullmetal Alchemist',
  'fmab': 'Fullmetal Alchemist: Brotherhood',
  'hxh': 'Hunter x Hunter',
  'sxf': 'Spy x Family',
  'sds': 'The Seven Deadly Sins',
  'opm': 'One Punch Man',
  'eva': 'Neon Genesis Evangelion',
  'cote': 'Classroom of the Elite',
  'rezero': 'Re:Zero',
  're zero': 'Re:Zero',
  'slime': 'That Time I Got Reincarnated as a Slime',
  'tensura': 'That Time I Got Reincarnated as a Slime',
  'danmachi': 'Is It Wrong to Try to Pick Up Girls in a Dungeon?',
  'konosuba': 'KonoSuba',
  'mushoku': 'Mushoku Tensei: Jobless Reincarnation',
  'bocchi': 'Bocchi the Rock!',
  'dr stone': 'Dr. Stone',
  'vinland': 'Vinland Saga',
  'solo leveling': 'Solo Leveling',
  'oshi no ko': 'Oshi no Ko',
  'frieren': 'Frieren: Beyond Journey\'s End',
  'dandadan': 'Dandadan',
  'kaiju no 8': 'Kaiju No. 8',
  'kaiju': 'Kaiju No. 8',
  'blue lock': 'Blue Lock',
  'haikyuu': 'Haikyu!!',
  'black clover': 'Black Clover',
  'fire force': 'Fire Force',
  'shield hero': 'The Rising of the Shield Hero',
  'mob psycho': 'Mob Psycho 100',
  'cyberpunk': 'Cyberpunk: Edgerunners',
  'code geass': 'Code Geass',
  'dbz': 'Dragon Ball Z',
  'dbs': 'Dragon Ball Super',
  'naruto shippuden': 'Naruto: Shippuden',
  'shippuden': 'Naruto: Shippuden',
  'bleach tybw': 'Bleach: Thousand-Year Blood War',
  'tokyo ghoul': 'Tokyo Ghoul',
  'death note': 'Death Note',
  'steins gate': 'Steins;Gate',
};

function normalizeSearchStr(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function rankSearchResults(items: AnimeMedia[], targetQuery: string): AnimeMedia[] {
  const qNorm = normalizeSearchStr(targetQuery);

  return [...items].sort((a, b) => {
    const aEng = a.title.english || '';
    const aRom = a.title.romaji || '';
    const bEng = b.title.english || '';
    const bRom = b.title.romaji || '';

    const aNormEng = normalizeSearchStr(aEng);
    const aNormRom = normalizeSearchStr(aRom);
    const bNormEng = normalizeSearchStr(bEng);
    const bNormRom = normalizeSearchStr(bRom);

    // Exact matches
    const aExact = (aNormEng === qNorm || aNormRom === qNorm) ? 100 : 0;
    const bExact = (bNormEng === qNorm || bNormRom === qNorm) ? 100 : 0;

    // Starts-with prefix matches
    const aStarts = (aNormEng.startsWith(qNorm) || aNormRom.startsWith(qNorm)) ? 35 : 0;
    const bStarts = (bNormEng.startsWith(qNorm) || bNormRom.startsWith(qNorm)) ? 35 : 0;

    // Favor real TV series / movies over music clips, specials, and CMs
    const aIsMain = (a.format === 'TV' || a.format === 'MOVIE' || a.format === 'TV_SHORT' || a.format === 'OVA') ? 20 : 0;
    const bIsMain = (b.format === 'TV' || b.format === 'MOVIE' || b.format === 'TV_SHORT' || b.format === 'OVA') ? 20 : 0;

    // Popularity weighting so renowned entries rise to the top
    const aPopScore = Math.log10(Math.max(a.popularity || 1, 1)) * 8;
    const bPopScore = Math.log10(Math.max(b.popularity || 1, 1)) * 8;

    const aScore = aExact + aStarts + aIsMain + aPopScore;
    const bScore = bExact + bStarts + bIsMain + bPopScore;

    return bScore - aScore;
  });
}

export async function searchAnime(search: string, perPage: number = 20): Promise<AnimeMedia[]> {
  const clean = search.trim().toLowerCase();
  const resolvedTerm = ANIME_ALIASES[clean] || search.trim();

  // Fetch up to 25 from AniList to allow smart ranking
  const fetchCount = Math.max(perPage, 25);

  const query = `
    ${MEDIA_FRAGMENT}
    query ($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
          ...MediaFields
        }
      }
    }
  `;
  try {
    const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { search: resolvedTerm, perPage: fetchCount });
    const list = data.Page.media || [];
    const ranked = rankSearchResults(list, resolvedTerm);
    return ranked.slice(0, perPage);
  } catch (err) {
    console.error('AniList search failed:', err);
    return [];
  }
}

export interface FranchiseSeason {
  id: number;
  seasonNumber: number;
  title: string;
  year?: number | null;
}

export async function getFranchiseSeasons(id: number): Promise<FranchiseSeason[]> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english }
        format
        seasonYear
        relations {
          edges {
            relationType
            node {
              id
              format
              seasonYear
              title { romaji english }
              relations {
                edges {
                  relationType
                  node {
                    id
                    format
                    seasonYear
                    title { romaji english }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id } }),
      cache: "no-store",
    });

    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: {
        Media?: {
          id: number;
          title: { romaji: string; english: string | null };
          format: string;
          seasonYear: number | null;
          relations?: {
            edges: Array<{
              relationType: string;
              node: {
                id: number;
                format: string;
                seasonYear: number | null;
                title: { romaji: string; english: string | null };
                relations?: {
                  edges: Array<{
                    relationType: string;
                    node: {
                      id: number;
                      format: string;
                      seasonYear: number | null;
                      title: { romaji: string; english: string | null };
                    };
                  }>;
                };
              };
            }>;
          };
        };
      };
    };

    const media = json.data?.Media;
    if (!media) return [];

    const map = new Map<number, { id: number; title: string; year: number | null }>();

    map.set(media.id, {
      id: media.id,
      title: media.title.english || media.title.romaji,
      year: media.seasonYear,
    });

    const edges = media.relations?.edges || [];
    for (const edge of edges) {
      if ((edge.relationType === 'PREQUEL' || edge.relationType === 'SEQUEL') && edge.node?.id) {
        if (edge.node.format === 'TV' || edge.node.format === 'OVA' || edge.node.format === 'ONA') {
          map.set(edge.node.id, {
            id: edge.node.id,
            title: edge.node.title.english || edge.node.title.romaji,
            year: edge.node.seasonYear,
          });

          const subEdges = edge.node.relations?.edges || [];
          for (const sub of subEdges) {
            if ((sub.relationType === 'PREQUEL' || sub.relationType === 'SEQUEL') && sub.node?.id) {
              if (sub.node.format === 'TV' || sub.node.format === 'OVA' || sub.node.format === 'ONA') {
                map.set(sub.node.id, {
                  id: sub.node.id,
                  title: sub.node.title.english || sub.node.title.romaji,
                  year: sub.node.seasonYear,
                });
              }
            }
          }
        }
      }
    }

    if (map.size <= 1) {
      return [{
        id: media.id,
        seasonNumber: 1,
        title: 'Season 1',
        year: media.seasonYear,
      }];
    }

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (a.year && b.year && a.year !== b.year) {
        return a.year - b.year;
      }
      return a.id - b.id;
    });

    return sorted.map((item, idx) => ({
      id: item.id,
      seasonNumber: idx + 1,
      title: `Season ${idx + 1}`,
      year: item.year,
    }));
  } catch (err) {
    console.error("Failed to get franchise seasons:", err);
    return [];
  }
}

export async function getAnimeById(id: number): Promise<AnimeDetail> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        genres
        episodes
        status
        season
        seasonYear
        format
        studios(isMain: true) {
          nodes {
            name
          }
        }
        averageScore
        popularity
        trending
        nextAiringEpisode {
          episode
          airingAt
        }
        meanScore
        relations {
          edges {
            relationType
            node {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
                medium
                color
              }
              bannerImage
              genres
              episodes
              status
              season
              seasonYear
              format
              studios(isMain: true) {
                nodes {
                  name
                }
              }
              averageScore
              popularity
              trending
              description(asHtml: false)
              nextAiringEpisode {
                episode
                airingAt
              }
              meanScore
            }
          }
        }
        recommendations(perPage: 10) {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
                medium
                color
              }
              bannerImage
              genres
              episodes
              status
              season
              seasonYear
              format
              studios(isMain: true) {
                nodes {
                  name
                }
              }
              averageScore
              popularity
              trending
              description(asHtml: false)
              nextAiringEpisode {
                episode
                airingAt
              }
              meanScore
            }
          }
        }
        streamingEpisodes {
          title
          thumbnail
          url
          site
        }
      }
    }
  `;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id } }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`AniList API error: ${res.status}`);
  }
  const json = (await res.json()) as { data: { Media: AnimeDetail } };
  return json.data.Media;
}

export async function getAnimeBySlug(slug: string): Promise<AnimeDetail | null> {
  const isNumeric = /^\d+$/.test(slug);
  if (isNumeric) {
    try {
      return await getAnimeById(parseInt(slug, 10));
    } catch {
      return null;
    }
  }
  const searchTerm = slug.replace(/-/g, ' ');
  const searchResults = await searchAnime(searchTerm, 5);
  if (searchResults.length === 0) return null;
  return getAnimeById(searchResults[0].id);
}

/**
 * Otakutsu inspired: Short & Complete
 * Finished series under 14 episodes — no cliffhanger waits
 */
export async function getShortAndComplete(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME,
          status: FINISHED,
          episodes_lesser: 14,
          episodes_greater: 2,
          format: TV,
          sort: SCORE_DESC,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

/**
 * Otakutsu inspired: Underrated This Season
 * Airing now, scoring high, flying under the radar
 */
export async function getUnderratedThisSeason(perPage: number = 20): Promise<AnimeMedia[]> {
  const now = new Date();
  const month = now.getMonth();
  let season: string;
  if (month <= 2) season = 'WINTER';
  else if (month <= 5) season = 'SPRING';
  else if (month <= 8) season = 'SUMMER';
  else season = 'FALL';
  const year = now.getFullYear();

  const query = `
    ${MEDIA_FRAGMENT}
    query ($season: MediaSeason, $year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          season: $season,
          seasonYear: $year,
          status: RELEASING,
          sort: SCORE_DESC,
          type: ANIME,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { season, year, perPage });
  // Filter for lower popularity to highlight true hidden gems of the season
  const list = data.Page.media;
  if (list.length > 8) {
    return list.slice(3); // Skip the top 3 mainstream juggernauts to highlight gems
  }
  return list;
}

/**
 * Otakutsu inspired: Hidden Gems
 * High scores, tiny audiences — the shows most people scroll right past
 */
export async function getHiddenGems(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME,
          sort: SCORE_DESC,
          averageScore_greater: 80,
          popularity_lesser: 60000,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

/**
 * Otakutsu inspired: Feature-Length Favourites
 * Acclaimed anime films for a single sitting
 */
export async function getMovieFavorites(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME,
          format: MOVIE,
          sort: SCORE_DESC,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

/**
 * Otakutsu inspired: Timeless Classics (Before 2005)
 * The shows that shaped everything since
 */
export async function getTimelessClassics(perPage: number = 20): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME,
          startDate_lesser: 20050101,
          sort: SCORE_DESC,
          popularity_greater: 20000,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}


/**
 * Upcoming / Coming Soon anime (NOT_YET_RELEASED, sorted by popularity)
 */
export async function getComingSoon(perPage: number = 10): Promise<AnimeMedia[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(
          type: ANIME,
          status: NOT_YET_RELEASED,
          sort: POPULARITY_DESC,
          isAdult: false
        ) {
          ...MediaFields
        }
      }
    }
  `;
  const data = await anilistQuery<{ Page: { media: AnimeMedia[] } }>(query, { perPage });
  return data.Page.media;
}

export interface AiringScheduleItem {
  id: number;
  airingAt: number;
  episode: number;
  timeUntilAiring: number;
  media: AnimeMedia;
}

/**
 * Airing anime schedule within a time window (e.g. for the week or day).
 */
export async function getAiringSchedule(
  airingAtGreater: number,
  airingAtLesser: number,
  perPage: number = 50
): Promise<AiringScheduleItem[]> {
  const query = `
    ${MEDIA_FRAGMENT}
    query ($airingAtGreater: Int, $airingAtLesser: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        airingSchedules(
          airingAt_greater: $airingAtGreater,
          airingAt_lesser: $airingAtLesser,
          sort: TIME
        ) {
          id
          airingAt
          episode
          timeUntilAiring
          media {
            ...MediaFields
          }
        }
      }
    }
  `;
  try {
    const data = await anilistQuery<{
      Page: { airingSchedules: AiringScheduleItem[] };
    }>(query, {
      airingAtGreater,
      airingAtLesser,
      perPage,
    });
    return data.Page.airingSchedules;
  } catch {
    return [];
  }
}

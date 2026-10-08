export interface AnimeMedia {
  id: number;
  idMal?: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  genres: string[];
  episodes: number | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
  format: string | null;
  studios: {
    nodes: Array<{ name: string }>;
  };
  averageScore: number | null;
  popularity: number | null;
  trending: number | null;
  nextAiringEpisode: {
    episode: number;
    airingAt: number;
  } | null;
  meanScore: number | null;
  trailer?: {
    id: string;
    site: string;
    thumbnail?: string;
  } | null;
}

export interface AnimeDetail extends AnimeMedia {
  relations: {
    edges: Array<{
      relationType: string;
      node: AnimeMedia;
    }>;
  };
  recommendations: {
    nodes: Array<{
      mediaRecommendation: AnimeMedia;
    }>;
  };
  streamingEpisodes: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
}

export interface Episode {
  number: number;
  title: string;
  thumbnail: string;
  duration: string;
  airDate: string;
  isFiller: boolean;
}

export interface VideoSource {
  url: string;
  quality: string;
  type: 'hls' | 'mp4' | 'embed';
  label: string;
}

export interface UserProgress {
  slug: string;
  animeId: number;
  episodeNumber: number;
  timestamp: number;
  totalDuration: number;
  title: string;
  thumbnail: string;
  coverImage: string;
  updatedAt: number;
}

export interface HeroSlide {
  anime: AnimeMedia;
  tagline: string;
}

export interface ContentRowData {
  title: string;
  items: AnimeMedia[];
  type: 'poster' | 'wide' | 'genre';
}

export interface UnlockSession {
  token: string;
  expiresAt: number;
  slug: string;
}

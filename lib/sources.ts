export type Language = 'sub' | 'dub';

export type ServerId = 'edge';

export interface ServerOption {
  id: ServerId;
  name: string;
  badge?: string;
  description: string;
  recommended?: boolean;
}

export const SERVERS: ServerOption[] = [
  {
    id: 'edge',
    name: 'MegaPlay',
    badge: 'Direct',
    description: 'MegaPlay buzz · High performance stream',
    recommended: true,
  },
];

/**
 * Resolves embed URL for MegaPlay buzz.
 */
export function getServerEmbed(
  server: ServerId = 'edge',
  anilistId: number,
  episode: number,
  language: Language,
  malId?: number,
  startTime?: number
): string {
  const startSec = startTime && startTime > 5 ? Math.floor(startTime) : 0;
  return `https://megaplay.buzz/stream/ani/${anilistId}/${episode}/${language}${
    startSec ? `?start=${startSec}#t=${startSec}` : ''
  }`;
}

/**
 * MegaPlay embed helper.
 */
export function getMegaPlayEmbed(
  anilistId: number,
  episode: number,
  language: Language
): string {
  return getServerEmbed('edge', anilistId, episode, language);
}

export interface EmbedSource {
  url: string;
  language: Language;
  provider: ServerId | 'megaplay';
}

export function getAvailableSources(
  anilistId: number,
  episode: number
): EmbedSource[] {
  return [
    { url: getServerEmbed('edge', anilistId, episode, 'sub'), language: 'sub', provider: 'edge' },
    { url: getServerEmbed('edge', anilistId, episode, 'dub'), language: 'dub', provider: 'edge' },
  ];
}

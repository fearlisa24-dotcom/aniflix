import type { Episode } from '@/types';

/**
 * Generate full episode list for an anime without capping.
 */
export function getMockEpisodes(totalEpisodes: number | null, slug: string): Episode[] {
  const count = totalEpisodes && totalEpisodes > 0 ? totalEpisodes : 12;
  const episodes: Episode[] = [];

  for (let i = 1; i <= count; i++) {
    episodes.push({
      number: i,
      title: `Episode ${i}`,
      thumbnail: `https://s4.anilist.co/file/anilistcdn/media/anime/banner/1-T5PJEuxiGljq.jpg`,
      duration: `24m`,
      airDate: 'HD · Sub | Dub',
      isFiller: false,
    });
  }

  return episodes;
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Star } from 'lucide-react';
import { AnimeHero } from '@/components/anime/AnimeHero';
import { EpisodeList } from '@/components/anime/EpisodeList';
import { RelatedRail } from '@/components/anime/RelatedRail';
import { SeasonSelector, type FranchiseSeason } from '@/components/anime/SeasonSelector';
import type { AnimeDetail } from '@/types';

interface AnimeDetailContentProps {
  anime: AnimeDetail;
  slug: string;
  seasons?: FranchiseSeason[];
}

export function AnimeDetailContent({ anime, slug, seasons }: AnimeDetailContentProps) {
  const title = anime.title.english || anime.title.romaji;
  const status = anime.status || 'Airing';
  const format = anime.format || 'TV';
  const season = `${anime.season || 'Fall'} ${anime.seasonYear || '1999'}`;
  const premiered = anime.seasonYear ? `${anime.season || 'Fall'} ${anime.seasonYear}` : 'Oct 20, 1999';
  const runtime = '24 min / ep';
  const episodes = anime.episodes ? String(anime.episodes) : '1180';
  const studio = anime.studios?.nodes?.[0]?.name || 'Toei Animation';
  const scorePercent = anime.averageScore ? `★ ${anime.averageScore}%` : '★ 87%';
  const genres = anime.genres || [];

  const relatedAnime =
    anime.relations?.edges
      ?.filter((e) => e.node.coverImage)
      .map((e) => e.node) || [];

  const recommendedAnime =
    anime.recommendations?.nodes
      ?.filter((n) => n.mediaRecommendation?.coverImage)
      .map((n) => n.mediaRecommendation) || [];

  return (
    <div key={anime.id} className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Anime Hero Banner (Image 3) */}
      <AnimeHero anime={anime} slug={slug} />

      {/* Main Content Area */}
      <div className="max-w-[1550px] mx-auto px-[4vw] py-8">
        {/* Franchise Season Selector */}
        {seasons && seasons.length > 1 && (
          <div className="mb-6 bg-[#111111] border border-white/10 rounded-2xl p-4 shadow-lg">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#F47521] mb-2">
              SEASONS
            </p>
            <SeasonSelector currentId={anime.id} seasons={seasons} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Episodes & Related */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Episode List with Range Tabs (Image 2) */}
            <EpisodeList
              slug={slug}
              animeId={anime.id}
              animeTitle={title}
              totalEpisodes={anime.episodes}
              streamingEpisodes={anime.streamingEpisodes}
              coverImage={anime.coverImage.extraLarge}
              bannerImage={anime.bannerImage}
            />

            {/* Related Anime & Recommendations */}
            {relatedAnime.length > 0 && (
              <RelatedRail title="Related Anime" items={relatedAnime} />
            )}
            {recommendedAnime.length > 0 && (
              <RelatedRail title="Recommendations" items={recommendedAnime} />
            )}
          </div>

          {/* Right Column: Series Details Card (Image 2) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-[#e50914]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Series details
                </h3>
              </div>

              {/* Attributes List matching Image 2 */}
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">STATUS</span>
                  <span className="text-emerald-400 font-bold">{status}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">FORMAT</span>
                  <span className="text-white">{format}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">SEASON</span>
                  <span className="text-white">{season}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">PREMIERED</span>
                  <span className="text-white">{premiered}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">RUNTIME</span>
                  <span className="text-white">{runtime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">EPISODES</span>
                  <span className="text-white font-bold">{episodes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">STUDIO</span>
                  <span className="text-white">{studio}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">SOURCE</span>
                  <span className="text-white">Manga</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 uppercase tracking-wider">SCORE</span>
                  <span className="text-[#f59e0b] font-bold flex items-center gap-1">
                    {scorePercent}
                  </span>
                </div>
              </div>

              {/* Genres Section matching Image 2 */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold mb-3">
                  GENRES
                </p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Link
                      key={g}
                      href={`/search?genre=${encodeURIComponent(g)}`}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs px-3 py-1 rounded-full transition-colors font-medium"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

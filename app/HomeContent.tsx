'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { DiscoverSection } from '@/components/home/DiscoverSection';
import { ContentRow } from '@/components/home/ContentRow';
import { MoodExploreSection } from '@/components/home/MoodExploreSection';
import { GemOfTheDaySection } from '@/components/home/GemOfTheDaySection';
import { ComingSoonSection } from '@/components/home/ComingSoonSection';
import { ScheduleAndCommentsSection } from '@/components/home/ScheduleAndCommentsSection';
import { getAllProgress } from '@/lib/progress';
import type { AnimeMedia } from '@/types';

const GENRE_PILLS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller',
];

interface HomeContentProps {
  trending: AnimeMedia[];
  allTimePopular: AnimeMedia[];
  popularThisSeason: AnimeMedia[];
  simulcast: AnimeMedia[];
  shortAndComplete: AnimeMedia[];
  underrated: AnimeMedia[];
  hiddenGems: AnimeMedia[];
  movies: AnimeMedia[];
  classics: AnimeMedia[];
  comingSoon: AnimeMedia[];
}

export function HomeContent({
  trending,
  allTimePopular,
  popularThisSeason,
  simulcast,
  shortAndComplete,
  underrated,
  hiddenGems,
  movies,
  classics,
  comingSoon,
}: HomeContentProps) {
  const [continueWatching, setContinueWatching] = useState<AnimeMedia[]>([]);

  useEffect(() => {
    const progressMap = getAllProgress();
    const entries = Object.entries(progressMap)
      .filter(([id]) => id && !isNaN(Number(id)))
      .sort(([, a], [, b]) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 10);

    if (entries.length === 0) {
      setContinueWatching([]);
      return;
    }

    // Pool of all currently fetched anime to look up real covers and details
    const allKnown = [
      ...trending,
      ...allTimePopular,
      ...popularThisSeason,
      ...simulcast,
      ...shortAndComplete,
      ...underrated,
      ...hiddenGems,
      ...movies,
      ...classics,
    ];

    const cwItems: AnimeMedia[] = entries.map(([idStr, data]) => {
      const numericId = Number(idStr);
      const matched = allKnown.find((a) => a.id === numericId);

      if (matched) {
        return {
          ...matched,
          // Annotate title or episode if needed
        };
      }

      // Fallback object with real title and cover
      return {
        id: numericId,
        title: {
          romaji: `Anime #${numericId}`,
          english: `Anime #${numericId}`,
          native: null,
        },
        description: `Watched up to Episode ${data.episode}`,
        coverImage: {
          extraLarge: `https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx${numericId}.jpg`,
          large: `https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx${numericId}.jpg`,
          medium: `https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx${numericId}.jpg`,
          color: '#F47521',
        },
        bannerImage: null,
        genres: ['Anime'],
        episodes: data.episode || 1,
        status: 'RELEASING',
        season: null,
        seasonYear: null,
        format: 'TV',
        studios: { nodes: [] },
        averageScore: null,
        popularity: null,
        trending: null,
        nextAiringEpisode: null,
        meanScore: null,
      };
    });

    setContinueWatching(cwItems);
  }, [
    trending,
    allTimePopular,
    popularThisSeason,
    simulcast,
    shortAndComplete,
    underrated,
    hiddenGems,
    movies,
    classics,
  ]);

  // Take top trending for hero carousel
  const heroSlides = trending.slice(0, 5);

  return (
    <div className="pb-16">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Content rows */}
      <div className="mt-8 space-y-6">
        {/* Continue Watching (only appears if user has history) */}
        {continueWatching.length > 0 && (
          <ContentRow
            kicker="Pick up where you left off"
            title="Continue Watching"
            subtitle="Your recent watch history"
            items={continueWatching}
            isContinueWatching={true}
          />
        )}

        {/* Discover Section matching Image 1 */}
        <DiscoverSection
          popular={allTimePopular}
          topRated={trending}
          thisSeason={popularThisSeason}
        />

        {/* Most Popular Anime (All-Time Blockbusters) */}
        <ContentRow
          kicker="All-Time Favorites"
          title="Most Popular Anime"
          subtitle="Top streamed series worldwide"
          items={allTimePopular}
          viewAllHref="/search?sort=popular"
        />

        {/* Trending Now */}
        <ContentRow
          kicker="What everyone's watching right now"
          title="Top 10 Trending"
          subtitle="The hottest shows this week"
          items={trending}
          viewAllHref="/search?sort=trending"
        />

        {/* Popular This Season */}
        <ContentRow
          kicker="Seasonal Hits"
          title="Popular This Season"
          subtitle="Top rated anime airing right now"
          items={popularThisSeason}
          viewAllHref="/search?sort=popular"
        />

        {/* Explore by mood (Image 5) */}
        <MoodExploreSection />

        {/* Finish in a weekend */}
        <ContentRow
          kicker="Short & Complete"
          title="Finish in a Weekend"
          subtitle="Finished series under 14 episodes — no cliffhanger waits"
          items={shortAndComplete}
          viewAllHref="/search?sort=score"
        />

        {/* Simulcast */}
        <ContentRow
          kicker="Simulcasts"
          title="Fresh Episodes"
          subtitle="The latest episodes, minutes after broadcast"
          items={simulcast}
          viewAllHref="/search?sort=new"
        />

        {/* Underrated this season */}
        <ContentRow
          kicker="Hidden Highlights"
          title="Underrated This Season"
          subtitle="Airing now, scoring high, flying under the radar"
          items={underrated}
          viewAllHref="/search?sort=score"
        />

        {/* Loved by few, rated like legends (Image 4) */}
        <GemOfTheDaySection hiddenGems={hiddenGems} />

        {/* Coming Soon (Image 3 reference) */}
        <ComingSoonSection items={comingSoon} />

        {/* Recent Comments & Estimated Schedule (Image 2 reference) */}
        <ScheduleAndCommentsSection schedule={simulcast} />

        {/* Movie Night */}
        <ContentRow
          kicker="Feature Films"
          title="Movie Night"
          subtitle="Standout anime films worth 2 hours of your life"
          items={movies}
          viewAllHref="/search?format=MOVIE"
        />

        {/* Timeless Classics */}
        <ContentRow
          kicker="Pre-2005"
          title="Timeless Classics"
          subtitle="The anime that defined the medium — still unbeaten"
          items={classics}
          viewAllHref="/search?sort=classics"
        />

        {/* Browse by genre pills */}
        <section className="py-6">
          <div className="px-[8vw] mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F47521]">
              Categories
            </span>
            <h2 className="text-[28px] font-bold text-white tracking-tight mt-0.5">
              Browse by Genre
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 px-[8vw]">
            {GENRE_PILLS.map((genre) => (
              <Link
                key={genre}
                href={`/search?genre=${encodeURIComponent(genre)}`}
                className="px-4 py-2 rounded-full border border-white/10 text-sm text-[#b0b0b0] hover:text-white hover:border-[#F47521] hover:bg-[#F47521]/10 transition-all cursor-pointer"
              >
                {genre}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

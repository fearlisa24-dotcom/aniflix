'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Bookmark, ChevronRight, ChevronDown, Star } from 'lucide-react';
import type { AnimeMedia } from '@/types';
import { slugify } from '@/lib/utils';
import { getCachedTMDBMedia, fetchTMDBMedia } from '@/lib/tmdb-client';

interface DiscoverSectionProps {
  popular: AnimeMedia[];
  topRated: AnimeMedia[];
  thisSeason: AnimeMedia[];
}

export function DiscoverSection({
  popular,
  topRated,
  thisSeason,
}: DiscoverSectionProps) {
  const [activeTab, setActiveTab] = useState<'popular' | 'topRated' | 'thisSeason'>('popular');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentList =
    activeTab === 'popular'
      ? popular
      : activeTab === 'topRated'
      ? topRated
      : thisSeason;

  const hasItems = Boolean(currentList && currentList.length > 0);
  const featured = hasItems ? (currentList[selectedIndex] || currentList[0]) : null;
  const sideItems = hasItems ? currentList.slice(0, 4) : [];

  const featuredTitle = featured ? (featured.title.english || featured.title.romaji) : '';
  const featuredSlug = featuredTitle ? slugify(featuredTitle) : '';
  const featuredScore = featured?.averageScore ? `${featured.averageScore}%` : '85%';
  const featuredYear = featured?.seasonYear || '2024';
  const featuredStatus = featured?.status ? featured.status.toLowerCase() : 'finished';
  const featuredFormat = featured?.format || 'TV';
  const featuredDescription = featured?.description
    ? featured.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'An epic anime journey begins here.';

  const [tmdbFeatured, setTmdbFeatured] = useState<string | null>(() => {
    return featuredTitle ? (getCachedTMDBMedia(featuredTitle)?.backdrop || getCachedTMDBMedia(featuredTitle)?.poster || null) : null;
  });

  React.useEffect(() => {
    let cancelled = false;
    async function loadFeaturedMedia() {
      if (!featuredTitle) return;
      const media = await fetchTMDBMedia(featuredTitle);
      if (!cancelled && (media?.backdrop || media?.poster)) {
        setTmdbFeatured(media.backdrop || media.poster);
      }
    }
    loadFeaturedMedia();
    return () => { cancelled = true; };
  }, [featuredTitle]);

  if (!hasItems || !featured) return null;

  return (
    <section className="py-8 px-[4vw] max-w-[1550px] mx-auto">
      {/* Header matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-4 w-1 bg-[#e50914] rounded-full" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Discover
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Explore more from the catalogue
          </p>
        </div>

        {/* Tab Pills matching Image 1 */}
        <div className="flex items-center gap-2 bg-[#141414] border border-white/10 p-1 rounded-full self-start sm:self-auto">
          {(
            [
              { id: 'popular', label: 'Most Popular' },
              { id: 'topRated', label: 'Top Rated' },
              { id: 'thisSeason', label: 'This Season' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIndex(0);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid: Left Huge Hero | Right 4 Side Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero Card */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-white/10 bg-[#141414] min-h-[420px] p-6 sm:p-10 flex flex-col justify-end shadow-2xl group">
          <Image
            src={tmdbFeatured || featured.bannerImage || featured.coverImage.extraLarge || featured.coverImage.large}
            alt={featuredTitle}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs font-semibold text-zinc-300">
              <span className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 uppercase">
                {featuredFormat}
              </span>
              <span>{featuredYear} - {featuredStatus}</span>
              <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
                {featuredScore}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              {featuredTitle}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed mb-6">
              {featuredDescription}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href={`/watch/${featured.id}/1`}
                prefetch={true}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Now
              </Link>
              <button
                type="button"
                className="w-10 h-10 rounded-full border border-white/20 bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                title="Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side 4 Items */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {sideItems.map((item, idx) => {
            const itemTitle = item.title.english || item.title.romaji;
            const itemScore = item.averageScore ? `${item.averageScore}%` : '84%';
            const itemYear = item.seasonYear || '2023';
            const itemEps = item.episodes ? `${item.episodes} eps` : 'Ongoing';
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className={`relative flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'bg-white/10 border-white/30 shadow-lg'
                    : 'bg-[#141414] border-white/5 hover:border-white/15 hover:bg-[#1a1a1a]'
                }`}
              >
                {/* Background image preview on hover */}
                {item.bannerImage && (
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-cover bg-center pointer-events-none"
                    style={{ backgroundImage: `url(${item.bannerImage})` }}
                  />
                )}

                {/* Poster thumb */}
                <div className="relative w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-black border border-white/10">
                  <Image
                    src={getCachedTMDBMedia(itemTitle)?.poster || item.coverImage.large || item.coverImage.medium}
                    alt={itemTitle}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 z-10">
                  <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                    {itemTitle}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {item.format || 'TV'} · {itemYear} · {itemEps}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 font-bold text-[#f59e0b]">
                      <Star className="w-3 h-3 fill-[#f59e0b]" />
                      {itemScore}
                    </span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-300">
                      {item.status ? item.status.toLowerCase() : 'finished'}
                    </span>
                    {item.genres[0] && (
                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-zinc-400">
                        {item.genres[0]}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 z-10" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

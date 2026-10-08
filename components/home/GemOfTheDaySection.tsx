'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Sparkles, Gem, Users } from 'lucide-react';
import type { AnimeMedia } from '@/types';
import { slugify } from '@/lib/utils';

interface GemOfTheDaySectionProps {
  hiddenGems: AnimeMedia[];
}

export function GemOfTheDaySection({ hiddenGems }: GemOfTheDaySectionProps) {
  if (!hiddenGems || hiddenGems.length === 0) return null;

  const spotlight = hiddenGems[0];
  const gridItems = hiddenGems.slice(1, 9);

  const spotlightTitle = spotlight.title.english || spotlight.title.romaji;
  const spotlightSlug = slugify(spotlightTitle);
  const spotlightScore = spotlight.averageScore ? (spotlight.averageScore / 10).toFixed(1) : '8.8';
  const spotlightFans = spotlight.popularity ? `${Math.round(spotlight.popularity / 1000)}k fans` : '22k fans';
  const spotlightYear = spotlight.seasonYear || '1980';
  const spotlightEps = spotlight.episodes ? `${spotlight.episodes} eps` : '47 eps';
  const spotlightFormat = spotlight.format || 'TV';
  const spotlightDescription = spotlight.description
    ? spotlight.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'A legendary masterwork treasured by those who discovered it.';

  return (
    <section className="py-8 px-[4vw] max-w-[1550px] mx-auto">
      {/* Header matching Image 4 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Loved by few, rated like legends
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            High scores, tiny audiences — the shows most people scroll right past
          </p>
        </div>

        <Link
          href="/search?sort=score"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 px-3.5 py-1.5 rounded-full hover:bg-white/5 transition-all"
        >
          <span>See all</span>
          <span className="text-sm">↗</span>
        </Link>
      </div>

      {/* Grid: Left Spotlight (5 cols) | Right 8 Cards (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Gem of the Day Spotlight Card */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 bg-[#161616] p-6 sm:p-8 flex flex-col justify-end min-h-[380px] shadow-2xl group">
          {/* Background image */}
          <Image
            src={spotlight.bannerImage || spotlight.coverImage.extraLarge || spotlight.coverImage.large}
            alt={spotlightTitle}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

          {/* Spotlight Content */}
          <div className="relative z-10">
            {/* Gem Badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 backdrop-blur-md">
              <Gem className="w-3.5 h-3.5" />
              <span>GEM OF THE DAY</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              {spotlightTitle}
            </h3>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 font-semibold mb-3">
              <span className="text-[#f59e0b] font-bold">★ {spotlightScore}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                only {spotlightFans}
              </span>
              <span>·</span>
              <span>{spotlightFormat} · {spotlightYear} · {spotlightEps}</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed mb-6 max-w-md">
              {spotlightDescription}
            </p>

            {/* Discover It Button */}
            <Link
              href={`/anime/${spotlightSlug}?id=${spotlight.id}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-lg shadow-white/10"
            >
              <Play className="w-4 h-4 fill-current" />
              Discover it
            </Link>
          </div>
        </div>

        {/* Right: 2x4 Grid of Gem Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {gridItems.map((item) => {
            const itemTitle = item.title.english || item.title.romaji;
            const itemSlug = slugify(itemTitle);
            const itemScore = item.averageScore ? (item.averageScore / 10).toFixed(1) : '8.6';
            const itemFans = item.popularity ? `${Math.round(item.popularity / 1000)}k fans` : '15k fans';
            const itemYear = item.seasonYear || '2024';
            const itemFormat = item.format || 'TV';

            return (
              <Link
                key={item.id}
                href={`/anime/${itemSlug}?id=${item.id}`}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#161616] flex flex-col justify-end p-2.5 aspect-[2/3] hover:border-white/30 transition-all duration-300"
              >
                <Image
                  src={item.coverImage.large || item.coverImage.medium}
                  alt={itemTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges on top */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                  <span className="bg-black/85 backdrop-blur-md text-[#f59e0b] text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10">
                    ★ {itemScore}
                  </span>
                  <span className="bg-black/75 backdrop-blur-md text-zinc-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-white/10">
                    {itemFans}
                  </span>
                </div>

                {/* Bottom Title Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="relative z-10">
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {itemTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {itemFormat} · {itemYear}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

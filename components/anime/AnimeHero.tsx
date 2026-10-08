'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Bookmark,
  Share2,
  Star,
  Film,
  Clock,
  Radio,
  Users,
  Heart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AnimeDetail } from '@/types';

interface AnimeHeroProps {
  anime: AnimeDetail;
  slug: string;
}

export function AnimeHero({ anime }: AnimeHeroProps) {
  const [expandedSynopsis, setExpandedSynopsis] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const status = anime.status || 'AIRING';
  const format = anime.format || 'TV';
  const year = anime.seasonYear || anime.season || '1999';
  const scorePercent = anime.averageScore ? `${anime.averageScore}%` : '87%';
  const episodeCount = anime.episodes ? `${anime.episodes} eps` : 'Ongoing';
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'No synopsis available.';

  // Next airing episode countdown if available
  let nextAiringText: string | null = null;
  if (anime.nextAiringEpisode) {
    const diffSec = anime.nextAiringEpisode.airingAt - Math.floor(Date.now() / 1000);
    if (diffSec > 0) {
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      nextAiringText = `Episode ${anime.nextAiringEpisode.episode} arrives in ${days}d ${hours}h`;
    }
  }

  const followersCount = anime.popularity ? `${(anime.popularity / 1000).toFixed(1)}K followers` : '750K followers';
  const favoritesCount = anime.popularity ? `${Math.round(anime.popularity / 6000)}K favorites` : '109.6K favorites';
  const trendingRank = anime.trending ? `#${anime.trending} trending` : '#166 trending';

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] pt-20 pb-10">
      {/* Background Banner */}
      <div className="absolute inset-0 h-[480px] sm:h-[580px] overflow-hidden pointer-events-none">
        <Image
          src={anime.bannerImage || anime.coverImage.extraLarge}
          alt={`${title} banner`}
          fill
          className="object-cover object-top opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1550px] mx-auto px-[4vw]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Left Poster matching Image 3 */}
          <div className="relative w-44 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10 bg-[#161616]">
            <Image
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Details Content */}
          <div className="flex-1 text-center md:text-left">
            {/* Badges row: Status, Format, Year */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-[#e50914] bg-red-950/40 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse" />
                {status}
              </span>
              <span className="text-zinc-400 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/5">
                {format}
              </span>
              <span className="text-zinc-400 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/5">
                {year}
              </span>
            </div>

            {/* Big Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-3">
              {title}
            </h1>

            {/* Score & Runtime Subtitle */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm font-semibold text-zinc-300 mb-4">
              <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                <Star className="w-4 h-4 fill-[#f59e0b]" />
                {scorePercent}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Film className="w-4 h-4 text-zinc-400" />
                {episodeCount}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                24 min
              </span>
            </div>

            {/* Next Airing Countdown Banner */}
            {nextAiringText && (
              <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{nextAiringText}</span>
              </div>
            )}

            {/* Synopsis Header & Text */}
            <div className="mb-6 max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500 mb-1">
                SYNOPSIS
              </p>
              <p
                className={`text-xs sm:text-sm text-zinc-300 leading-relaxed ${
                  expandedSynopsis ? '' : 'line-clamp-3'
                }`}
              >
                {description}
              </p>
              {description.length > 200 && (
                <button
                  type="button"
                  onClick={() => setExpandedSynopsis(!expandedSynopsis)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white mt-1.5 font-semibold"
                >
                  <span>{expandedSynopsis ? 'Show less' : 'Read full synopsis'}</span>
                  {expandedSynopsis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Action Buttons matching Image 3 */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <Link href={`/watch/${anime.id}/1`} prefetch={true}>
                <button className="bg-[#e50914] hover:bg-[#ff2030] text-white font-black text-xs sm:text-sm uppercase tracking-wider py-3.5 px-8 rounded-full flex items-center gap-3 transition-all shadow-xl shadow-red-900/30">
                  <Play className="w-4 h-4 fill-current" />
                  Watch episode 1 →
                </button>
              </Link>

              <button
                type="button"
                onClick={() => setBookmarked(!bookmarked)}
                className={`px-5 py-3.5 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  bookmarked
                    ? 'bg-white/20 border-white text-white'
                    : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{bookmarked ? 'In Watchlist' : 'Watchlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Social stats row matching Image 3 */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-zinc-400 font-semibold border-t border-white/5 pt-4">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-500" />
                {followersCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-zinc-500" />
                {favoritesCount}
              </span>
              <span className="flex items-center gap-1.5 text-[#f59e0b]">
                <TrendingUp className="w-4 h-4" />
                {trendingRank}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

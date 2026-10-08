'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Check, Star, Film, Volume2, VolumeX, X } from 'lucide-react';
import type { AnimeMedia } from '@/types';

interface HoverPreviewCardProps {
  anime: AnimeMedia;
  onClose: () => void;
  positionStyle?: React.CSSProperties;
}

export function HoverPreviewCard({ anime, onClose, positionStyle }: HoverPreviewCardProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const scorePercent = anime.averageScore ? `${anime.averageScore}%` : anime.meanScore ? `${anime.meanScore}%` : null;
  const episodeCount = anime.episodes ? `${anime.episodes} episodes` : 'Ongoing';
  const formatTag = anime.format || 'TV';
  const statusTag = anime.status || 'RELEASING';
  const genres = anime.genres.slice(0, 3);
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'No description available.';

  // Trailer source if available
  const hasYoutubeTrailer = anime.trailer?.site === 'youtube' && anime.trailer.id;
  const trailerUrl = hasYoutubeTrailer
    ? `https://www.youtube-nocookie.com/embed/${anime.trailer?.id}?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=${anime.trailer?.id}&modestbranding=1&playsinline=1&rel=0`
    : null;

  return (
    <div
      style={positionStyle}
      className="absolute z-50 w-[330px] sm:w-[360px] bg-[#141414] border border-white/15 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white flex items-center justify-center transition-colors"
        aria-label="Close preview"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Top Media Section (Video / Trailer) */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        {trailerUrl ? (
          <iframe
            src={trailerUrl}
            title={`${title} preview`}
            className="w-full h-full pointer-events-none scale-105"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Video audio toggle if YouTube trailer */}
        {hasYoutubeTrailer && (
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Details Body */}
      <div className="p-4 pt-2">
        <h3 className="text-base font-bold text-white leading-tight line-clamp-1 mb-2">
          {title}
        </h3>

        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className="bg-white/10 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase">
            {formatTag}
          </span>
          <span className="bg-white/10 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase">
            {statusTag}
          </span>
          {genres.map((g) => (
            <span
              key={g}
              className="bg-white/5 text-zinc-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/5 uppercase"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Score & Episodes */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
          {scorePercent && (
            <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
              {scorePercent}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-zinc-500" />
            {episodeCount}
          </span>
        </div>

        {/* Synopsis */}
        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* CTAs matching Image 3 (Red Watch now + Plus button) */}
        <div className="flex items-center gap-2">
          <Link
            href={`/watch/${anime.id}/1`}
            prefetch={true}
            className="flex-1 bg-[#e50914] hover:bg-[#ff2030] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-red-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch now
          </Link>
          <button
            type="button"
            onClick={() => setBookmarked(!bookmarked)}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
              bookmarked
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/10 border-white/15 text-zinc-300 hover:text-white hover:bg-white/15'
            }`}
            title="Add to Watchlist"
          >
            {bookmarked ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

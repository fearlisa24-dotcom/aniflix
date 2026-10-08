'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, List, X, Clock } from 'lucide-react';
import { formatSeconds, Progress } from '@/lib/progress';
import { getCachedTMDBMedia } from '@/lib/tmdb-client';
import { slugify } from '@/lib/utils';
import type { AnimeMedia } from '@/types';

interface ContinueWatchingModalProps {
  anime: AnimeMedia;
  progress: Progress;
  onClose: () => void;
}

export function ContinueWatchingModal({
  anime,
  progress,
  onClose,
}: ContinueWatchingModalProps) {
  const title = anime.title.english || anime.title.romaji;
  const slug = slugify(title);
  const timeFormatted = formatSeconds(progress.time || 0);
  const durationFormatted = formatSeconds(progress.duration || 1440);
  const percent = progress.duration > 0 ? Math.min(100, Math.round((progress.time / progress.duration) * 100)) : 0;
  const resumeUrl = `/watch/${anime.id}/${progress.episode || 1}?t=${Math.floor(progress.time || 0)}`;
  const detailUrl = `/anime/${slug}?id=${anime.id}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Banner / Poster Preview */}
        <div className="flex gap-4 items-center pb-5 border-b border-white/10">
          <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-black shadow-md border border-white/5">
            <Image
              src={getCachedTMDBMedia(title)?.poster || anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F47521]">
              CONTINUE WATCHING
            </span>
            <h3 className="text-lg font-bold text-white line-clamp-1 mt-0.5">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F47521]" />
              <span>Stopped at <strong className="text-white">{timeFormatted}</strong> / {durationFormatted}</span>
            </p>

            {/* Mini Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#F47521] h-full rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>Episode {progress.episode || 1}</span>
              <span>{percent}% completed</span>
            </div>
          </div>
        </div>

        {/* 2 Options */}
        <div className="pt-5 space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Choose what you would like to do:
          </p>

          {/* Option 2: Continue Watching where you left off (resuming at 07:45) */}
          <Link
            href={resumeUrl}
            className="flex items-center gap-4 w-full p-4 rounded-xl bg-[#F47521] hover:bg-[#ff8736] text-black font-bold transition-all shadow-lg shadow-orange-950/40 group cursor-pointer"
            onClick={onClose}
          >
            <div className="w-10 h-10 rounded-full bg-black/15 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 fill-current text-black ml-0.5" strokeWidth={0} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-black uppercase tracking-wide leading-tight">
                Continue Watching
              </p>
              <p className="text-xs text-black/80 font-medium mt-0.5">
                Resume Episode {progress.episode || 1} from {timeFormatted}
              </p>
            </div>
          </Link>

          {/* Option 1: Go to Episode List */}
          <Link
            href={detailUrl}
            className="flex items-center gap-4 w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all group cursor-pointer"
            onClick={onClose}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-zinc-300 group-hover:text-white">
              <List className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white leading-tight">
                Go to Episode List
              </p>
              <p className="text-xs text-zinc-400 font-normal mt-0.5">
                View all seasons, episodes, and anime details
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

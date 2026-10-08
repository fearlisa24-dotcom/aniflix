'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { formatSeconds, getProgress } from '@/lib/progress';
import { getCachedTMDBMedia, fetchTMDBMedia } from '@/lib/tmdb-client';
import { ContinueWatchingModal } from './ContinueWatchingModal';
import type { AnimeMedia } from '@/types';

interface ContinueWatchingCardProps {
  anime: AnimeMedia;
}

export function ContinueWatchingCard({ anime }: ContinueWatchingCardProps) {
  const [showModal, setShowModal] = useState(false);
  const title = anime.title.english || anime.title.romaji;

  const [tmdbPoster, setTmdbPoster] = useState<string | null>(() => {
    return getCachedTMDBMedia(title)?.poster || null;
  });

  React.useEffect(() => {
    let cancelled = false;
    async function loadTMDBImage() {
      if (!title) return;
      const media = await fetchTMDBMedia(title);
      if (!cancelled && media?.poster) {
        setTmdbPoster(media.poster);
      }
    }
    if (!tmdbPoster && title) {
      loadTMDBImage();
    }
    return () => { cancelled = true; };
  }, [title, tmdbPoster]);

  const progress = getProgress(anime.id) || {
    episode: anime.episodes || 1,
    time: 0,
    duration: 1440,
    updatedAt: Date.now(),
  };

  const percent = progress.duration > 0
    ? Math.min(100, Math.round((progress.time / progress.duration) * 100))
    : 0;

  const timeFormatted = formatSeconds(progress.time || 0);

  return (
    <>
      <div className="relative snap-start shrink-0 select-none">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="block group text-left cursor-pointer"
        >
          <motion.div
            className="relative aspect-[2/3] w-[130px] sm:w-[155px] md:w-[170px] lg:w-[185px] rounded-card overflow-hidden group cursor-pointer border border-white/5 hover:border-[#F47521]/60 bg-[#141414] transition-colors"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Image
              src={tmdbPoster || anime.coverImage.extraLarge || anime.coverImage.large}
              alt={`${title} poster`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 130px, (max-width: 768px) 155px, (max-width: 1024px) 170px, 185px"
            />

            {/* Shine sweep */}
            <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Top Badge: EP {ep} */}
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-[#F47521] text-black text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                EP {progress.episode || 1}
              </span>
            </div>

            {/* Top Right: Time badge */}
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-black/85 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow-sm">
                {timeFormatted}
              </span>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-10">
              <div
                className="h-full bg-[#F47521]"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Play hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 z-10 text-center">
              <div className="w-11 h-11 rounded-full bg-[#F47521] flex items-center justify-center shadow-lg text-black mb-2">
                <Play className="w-5 h-5 fill-current ml-0.5" strokeWidth={0} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#F47521]">
                Click for Options
              </p>
            </div>
          </motion.div>

          {/* Title below card */}
          <div className="mt-2 w-[130px] sm:w-[155px] md:w-[170px] lg:w-[185px]">
            <h4 className="text-xs font-bold text-white truncate group-hover:text-[#F47521] transition-colors">
              {title}
            </h4>
            <p className="text-[11px] text-zinc-500">
              Ep {progress.episode || 1} · {timeFormatted}
            </p>
          </div>
        </button>
      </div>

      {showModal && (
        <ContinueWatchingModal
          anime={anime}
          progress={progress}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

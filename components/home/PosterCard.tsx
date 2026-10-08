'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { slugify, formatEpisodeCount } from '@/lib/utils';
import { getCachedTMDBMedia, fetchTMDBMedia } from '@/lib/tmdb-client';
import { HoverPreviewCard } from './HoverPreviewCard';
import type { AnimeMedia } from '@/types';

interface PosterCardProps {
  anime: AnimeMedia;
  priority?: boolean;
}

export function PosterCard({ anime, priority = false }: PosterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTimerProgress, setPreviewTimerProgress] = useState(0);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const title = anime.title.english || anime.title.romaji;
  const slug = slugify(title);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const episodeText = anime.format === 'MOVIE' ? 'MOVIE' : anime.episodes ? `EP ${anime.episodes}` : 'EP 1';

  // TMDB poster image
  const [tmdbPoster, setTmdbPoster] = useState<string | null>(() => {
    return getCachedTMDBMedia(title)?.poster || null;
  });

  useEffect(() => {
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

  // Handle 5-second hover trigger (mouse hover, not hold/click)
  const handleMouseEnter = () => {
    setIsHovered(true);
    setPreviewTimerProgress(0);

    const startTime = Date.now();
    const duration = 5000;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setPreviewTimerProgress(pct);
    }, 100);

    hoverTimerRef.current = setTimeout(() => {
      setShowPreview(true);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, duration);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPreviewTimerProgress(0);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative snap-start shrink-0 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/anime/${slug}?id=${anime.id}`}
        prefetch={true}
        className="block group"
      >
        <motion.div
          className="relative aspect-[2/3] w-[130px] sm:w-[155px] md:w-[170px] lg:w-[185px] rounded-card overflow-hidden group cursor-pointer border border-white/5 bg-[#141414]"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Image
            src={tmdbPoster || anime.coverImage.extraLarge || anime.coverImage.large}
            alt={`${title} poster`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 130px, (max-width: 768px) 155px, (max-width: 1024px) 170px, 185px"
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AVQAB/9k="
          />

          {/* Shine sweep on hover */}
          <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Top Badges (★ Score on left & Red EP badge on right) */}
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
            {score ? (
              <span className="bg-black/80 backdrop-blur-md text-[#f59e0b] text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10 shadow-sm">
                ★ {score}
              </span>
            ) : <span />}

            {episodeText && (
              <span className="bg-[#e50914] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                {episodeText}
              </span>
            )}
          </div>

          {/* 5-second countdown indicator when hovering */}
          {isHovered && !showPreview && previewTimerProgress > 0 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
              <div
                className="h-full bg-[#e50914] transition-all duration-100 ease-linear"
                style={{ width: `${previewTimerProgress}%` }}
              />
            </div>
          )}

          {/* Card hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 z-10">
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
              {title}
            </h3>
            <p className="text-xs text-[#b0b0b0] mb-2 line-clamp-1">
              {anime.genres.slice(0, 2).join(' • ') || formatEpisodeCount(anime.episodes)}
            </p>

            <div className="flex items-center justify-end pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                title="Preview"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Expanded Hover Preview Card */}
      <AnimatePresence>
        {showPreview && (
          <div
            className="absolute top-0 left-0 z-50"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
          >
            <HoverPreviewCard
              anime={anime}
              onClose={() => setShowPreview(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

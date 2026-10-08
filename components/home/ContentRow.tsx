'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { PosterCard } from './PosterCard';
import { ContinueWatchingCard } from './ContinueWatchingCard';
import type { AnimeMedia } from '@/types';

interface ContentRowProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  items: AnimeMedia[];
  isContinueWatching?: boolean;
}

export function ContentRow({
  kicker,
  title,
  subtitle,
  viewAllHref,
  items,
  isContinueWatching,
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (items.length === 0) return null;

  return (
    <section
      className="relative py-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header section with Otakutsu style kicker & subtitle */}
      <div className="flex items-end justify-between mb-3 px-[8vw]">
        <div>
          {kicker && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F47521] mb-1">
              {kicker}
            </p>
          )}
          <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs sm:text-sm text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition-colors pb-1"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && isHovered && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x px-[8vw] touch-pan-x overscroll-x-contain"
        >
          {items.map((anime, i) => {
            if (isContinueWatching || title === 'Continue Watching') {
              return <ContinueWatchingCard key={anime.id} anime={anime} />;
            }
            return <PosterCard key={anime.id} anime={anime} priority={i < 4} />;
          })}
        </div>

        {/* Right arrow */}
        {canScrollRight && isHovered && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </section>
  );
}

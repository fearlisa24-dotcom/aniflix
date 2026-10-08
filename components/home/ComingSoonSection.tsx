'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { AnimeMedia } from '@/types';

interface ComingSoonSectionProps {
  items: AnimeMedia[];
}

export function ComingSoonSection({ items }: ComingSoonSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    <section className="relative py-5">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-[8vw]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-5 w-1 bg-[#e50914] rounded-full" />
            <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
              Coming Soon
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 pl-3">
            Upcoming releases to watch out for
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x px-[8vw] touch-pan-x overscroll-x-contain pb-2"
      >
        {items.map((anime) => {
          const title = anime.title.english || anime.title.romaji;
          const slug = slugify(title);
          const description = anime.description
            ? anime.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
            : 'No description available.';
          const formatTag = anime.format || 'TV';
          const yearTag = anime.seasonYear || '—';
          const genres = anime.genres.slice(0, 3);

          return (
            <Link
              key={anime.id}
              href={`/anime/${slug}?id=${anime.id}`}
              className="group snap-start shrink-0 w-[300px] sm:w-[340px] bg-[#141414] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
            >
              {/* Top: Poster + Info row */}
              <div className="flex gap-3 p-4 pb-3">
                {/* Poster thumbnail */}
                <div className="relative shrink-0 w-[80px] h-[110px] rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src={anime.coverImage.large || anime.coverImage.extraLarge}
                    alt={title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-center py-0.5">
                    <span className="text-[9px] font-bold text-zinc-300 line-clamp-1 px-1">
                      {title}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#e50914]">
                    UPCOMING RELEASE
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 mt-1">
                    {title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {formatTag} · {yearTag}
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mt-2">
                    {description}
                  </p>
                </div>
              </div>

              {/* Genre tags at bottom */}
              <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="bg-white/5 text-zinc-400 text-[10px] font-semibold px-2.5 py-1 rounded border border-white/5"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

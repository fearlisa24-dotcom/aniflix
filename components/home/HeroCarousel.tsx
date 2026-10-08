'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Play,
  Info,
  Gift,
  Flame,
  Gem,
  Compass,
  Tv,
  Film,
  Sparkles,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';
import { getCachedTMDBMedia, fetchTMDBMedia } from '@/lib/tmdb-client';
import type { AnimeMedia } from '@/types';

interface HeroCarouselProps {
  slides: AnimeMedia[];
}

const CATEGORY_PILLS = [
  { id: 'surprise', label: 'Surprise me', icon: Gift, isSpecial: true },
  { id: 'new', label: 'New episodes', icon: Tv, href: '/search?sort=new' },
  { id: 'top10', label: 'Top 10', icon: Flame, href: '/search?sort=trending' },
  { id: 'gems', label: 'Hidden gems', icon: Gem, href: '/search?sort=score' },
  { id: 'moods', label: 'Moods', icon: Compass, href: '#moods' },
  { id: 'weekend', label: 'Weekend binge', icon: Sparkles, href: '/search?format=TV' },
  { id: 'movies', label: 'Movie night', icon: Film, href: '/search?format=MOVIE' },
  { id: 'classics', label: 'Classics', icon: Sparkles, href: '/search?sort=classics' },
  { id: 'beyond', label: 'Beyond Japan', icon: Globe, href: '/search' },
];

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(goNext, 8000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, goNext, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const title = slide.title.english || slide.title.romaji;
  const slug = slugify(title);
  const genres = slide.genres.slice(0, 3).join(' · ');
  const score = slide.averageScore ? (slide.averageScore / 10).toFixed(1) : '8.9';
  const episodes = slide.episodes ? `${slide.episodes} episodes` : 'TV Series';
  const seasonText = slide.seasonYear ? `${slide.season || 'Summer'} ${slide.seasonYear}` : '2026';
  const description = slide.description
    ? slide.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'An exciting anime series awaits you.';

  const [tmdbMedia, setTmdbMedia] = useState<{ backdrop: string | null; poster: string | null } | null>(() => {
    return getCachedTMDBMedia(title);
  });

  useEffect(() => {
    let cancelled = false;
    async function loadTMDBHero() {
      if (!title) return;
      const media = await fetchTMDBMedia(title);
      if (!cancelled && (media?.backdrop || media?.poster)) {
        setTmdbMedia(media);
      }
    }
    loadTMDBHero();
    return () => { cancelled = true; };
  }, [title]);

  const heroImage = tmdbMedia?.backdrop || tmdbMedia?.poster || slide.bannerImage || slide.coverImage.extraLarge;

  const handleSurpriseMe = () => {
    const randomSlide = slides[Math.floor(Math.random() * slides.length)];
    if (randomSlide) {
      router.push(`/watch/${randomSlide.id}/1`);
    }
  };

  return (
    <div className="relative w-full">
      <section
        className="relative w-full h-[65vh] md:h-[82vh] overflow-hidden noise-overlay"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Featured anime carousel"
      >
        {/* Background image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImage}
              alt={`${title} banner`}
              fill
              className="object-cover object-right sm:object-center"
              priority={current === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradients matching Image 5 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-[2]" />

        {/* Content */}
        <div className="relative z-[3] flex items-center h-full px-[4vw] sm:px-[6vw]">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Genres kicker matching Image 5 */}
                <p className="text-xs uppercase font-extrabold tracking-widest text-zinc-400 mb-2">
                  {genres}
                </p>

                {/* Big Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 leading-[1.1]">
                  {title}
                </h1>

                {/* Metadata row */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-semibold mb-4">
                  <span className="text-[#f59e0b] font-bold">★ {score}</span>
                  <span>·</span>
                  <span>TV Series</span>
                  <span>·</span>
                  <span>{episodes}</span>
                  <span>·</span>
                  <span>{seasonText}</span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3 mb-6 max-w-xl">
                  {description}
                </p>

                {/* CTAs matching Image 5 (Watch Now + Details + Bookmark) */}
                <div className="flex items-center gap-3">
                  <Link href={`/watch/${slide.id}/1`} prefetch={true}>
                    <Button
                      size="lg"
                      className="bg-white hover:bg-zinc-200 text-black font-bold uppercase text-xs tracking-wider rounded-full px-7 py-3 transition-colors flex items-center gap-2 shadow-xl shadow-white/10"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={`/anime/${slug}?id=${slide.id}`} prefetch={true}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border border-white/20 bg-black/40 hover:bg-white/10 text-white font-bold uppercase text-xs tracking-wider rounded-full px-6 py-3 transition-colors flex items-center gap-2"
                    >
                      <Info className="w-4 h-4" />
                      Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-11 h-11 rounded-full border border-white/20 bg-black/40 hover:bg-white/10 text-white"
                    aria-label={`Bookmark ${title}`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel controls matching Image 5 (02 / 05, dots, < > buttons) */}
        <div className="absolute right-[4vw] sm:right-[6vw] bottom-16 sm:bottom-20 z-10 flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-zinc-400">
            {String(current + 1).padStart(2, '0')} / {String(Math.min(slides.length, 5)).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-1.5">
            {slides.slice(0, 5).map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-white'
                    : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={goPrev}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Category Pills Bar matching Image 5 */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/5 py-3 px-[4vw] overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max mx-auto max-w-[1550px]">
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;

            if (pill.isSpecial) {
              return (
                <button
                  key={pill.id}
                  onClick={handleSurpriseMe}
                  className="flex items-center gap-2 bg-[#e50914] hover:bg-[#ff2030] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-md shadow-red-900/30"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pill.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={pill.id}
                href={pill.href || '/'}
                className="flex items-center gap-2 bg-[#161616] hover:bg-[#222222] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-medium px-3.5 py-2 rounded-full transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-zinc-400" />
                <span>{pill.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

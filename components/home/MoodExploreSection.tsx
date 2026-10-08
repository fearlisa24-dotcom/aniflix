'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MoodCard {
  title: string;
  tagline: string;
  genre: string;
  bgImage: string;
}

const MOODS: MoodCard[] = [
  {
    title: 'Adrenaline',
    tagline: 'Fights, heists & high stakes',
    genre: 'Action',
    bgImage: 'https://image.tmdb.org/t/p/w780/wg0GsFpeHAFPbbcfsntTQBggWCo.jpg', // Attack on Titan
  },
  {
    title: 'Mind-Benders',
    tagline: "Twists you won't see coming",
    genre: 'Psychological',
    bgImage: 'https://image.tmdb.org/t/p/w780/z8IPicmEKXUO4I2UDdMEqw7RqOE.jpg', // Death Note
  },
  {
    title: 'Feel-Good',
    tagline: 'Laughs and low stakes',
    genre: 'Comedy',
    bgImage: 'https://image.tmdb.org/t/p/w780/lysUnU6V0VfcthDbviuVlIqgHOR.jpg', // Spy x Family
  },
  {
    title: 'Heartstrings',
    tagline: 'Romance & tearjerkers',
    genre: 'Romance',
    bgImage: 'https://image.tmdb.org/t/p/w780/x6jWDL4H9TaBLGEvyej0qKiirBU.jpg', // Your Lie in April
  },
  {
    title: 'Otherworldly',
    tagline: 'Magic, myths & new worlds',
    genre: 'Fantasy',
    bgImage: 'https://image.tmdb.org/t/p/w780/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg', // Frieren
  },
  {
    title: 'Deep Space',
    tagline: 'Sci-fi & cyber futures',
    genre: 'Sci-Fi',
    bgImage: 'https://image.tmdb.org/t/p/w780/A4PHx94G7mvM3b8vsDJ5HEaQ6uv.jpg', // Cowboy Bebop
  },
  {
    title: 'Cozy & Calm',
    tagline: 'Iyashikei to unwind with',
    genre: 'Slice of Life',
    bgImage: 'https://image.tmdb.org/t/p/w780/cm3lmKnEAYLs2eJmn4AcFIu18X4.jpg', // Laid-Back Camp
  },
  {
    title: 'Isekai',
    tagline: 'Reborn in another world',
    genre: 'Fantasy',
    bgImage: 'https://image.tmdb.org/t/p/w780/j9fRIimor0AMFJR9kjZubXcABzZ.jpg', // Mushoku Tensei
  },
  {
    title: 'Spine-Chillers',
    tagline: 'Horror & thrillers',
    genre: 'Horror',
    bgImage: 'https://image.tmdb.org/t/p/w780/jnwRlthXIgJB75Mt9GEl93Dczki.jpg', // Tokyo Ghoul
  },
  {
    title: 'Game Day',
    tagline: 'Sports & the will to win',
    genre: 'Sports',
    bgImage: 'https://image.tmdb.org/t/p/w780/zr1MDQCPVB5uJEHxiO6Tukn4OjH.jpg', // Haikyuu
  },
  {
    title: 'Giant Robots',
    tagline: 'Mecha, old and new',
    genre: 'Mecha',
    bgImage: 'https://image.tmdb.org/t/p/w780/5hS2OIuZSKGkR8R5l3bY5zh04Ce.jpg', // Code Geass
  },
  {
    title: 'Supernatural',
    tagline: 'Spirits, curses & powers',
    genre: 'Supernatural',
    bgImage: 'https://image.tmdb.org/t/p/w780/j2GvamiUMRpPjmNQSSht0Q7Z7e9.jpg', // Jujutsu Kaisen
  },
];

export function MoodExploreSection() {
  return (
    <section className="py-8 px-[8vw] max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-0.5 w-6 bg-[#e50914]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#e50914]">
              EXPLORE BY MOOD
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            What are you in the mood for?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Jump into the catalogue by feeling, not just by title
          </p>
        </div>

        <Link
          href="/search"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 px-3.5 py-1.5 rounded-full hover:bg-white/5 transition-all"
        >
          <span>See all</span>
          <span className="text-sm">↗</span>
        </Link>
      </div>

      {/* Grid of Mood Cards (2 rows of 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {MOODS.map((m) => (
          <Link
            key={m.title}
            href={`/search?genre=${encodeURIComponent(m.genre)}`}
            className="group relative h-28 sm:h-32 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 shadow-lg bg-zinc-900"
          >
            {/* Background Image using Next.js Image with verified TMDB backdrop */}
            <Image
              src={m.bgImage}
              alt={m.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 group-hover:via-black/50 transition-colors z-10" />

            {/* Content text */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end z-20">
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#e50914] transition-colors leading-tight">
                {m.title}
              </h3>
              <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5 leading-snug">
                {m.tagline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

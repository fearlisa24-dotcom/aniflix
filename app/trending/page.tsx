import React from 'react';
import type { Metadata } from 'next';
import { getTrending } from '@/lib/anilist';
import { PosterCard } from '@/components/home/PosterCard';

export const metadata: Metadata = {
  title: 'Trending Anime — Aniflix',
  description: 'Top trending anime series, movies, and simulcasts streaming right now on Aniflix.',
};

export default async function TrendingPage() {
  const trendingItems = await getTrending(1, 36);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-20 px-4 sm:px-[6vw]">
      <div className="max-w-[1700px] mx-auto">
        {/* Header matching Image 4 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-1 bg-[#e50914] rounded-full" />
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trending Now
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 pl-3">
            The most watched, talked about, and high-energy anime right now.
          </p>
        </div>

        {/* Grid of anime cards matching Image 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {trendingItems.map((anime, idx) => (
            <div key={anime.id} className="flex justify-center">
              <PosterCard anime={anime} priority={idx < 6} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

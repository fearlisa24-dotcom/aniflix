'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { FranchiseSeason } from '@/lib/anilist';

export type { FranchiseSeason };

interface SeasonSelectorProps {
  currentId: number;
  seasons: FranchiseSeason[];
}

export function SeasonSelector({ currentId, seasons }: SeasonSelectorProps) {
  const router = useRouter();

  if (!seasons || seasons.length <= 1) return null;

  function handleClick(seasonId: number) {
    if (seasonId === currentId) return;
    router.push(`/anime/${seasonId}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
      {seasons.map((season) => {
        const isSelected = season.id === currentId;
        return (
          <button
            key={season.id}
            type="button"
            onClick={() => handleClick(season.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              isSelected
                ? 'bg-[#F47521] border-[#F47521] text-black shadow-md font-black'
                : 'bg-[#141414] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {season.title || `Season ${season.seasonNumber}`}
          </button>
        );
      })}
    </div>
  );
}

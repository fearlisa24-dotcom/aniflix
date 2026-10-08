'use client';

import React from 'react';
import { PosterCard } from '@/components/home/PosterCard';
import type { AnimeMedia } from '@/types';

interface RelatedRailProps {
  title: string;
  items: AnimeMedia[];
}

export function RelatedRail({ title, items }: RelatedRailProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {items.map((anime) => (
          <PosterCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
}

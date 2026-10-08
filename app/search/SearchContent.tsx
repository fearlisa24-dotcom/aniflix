'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Check, Sparkles } from 'lucide-react';
import { PosterCard } from '@/components/home/PosterCard';
import { RefineFiltersModal, type FilterState } from '@/components/search/RefineFiltersModal';
import type { AnimeMedia } from '@/types';

interface SearchContentProps {
  results: AnimeMedia[];
  title: string;
}

export function SearchContent({ results }: SearchContentProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [upToDateOnly, setUpToDateOnly] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    format: 'All formats',
    year: 'Any year',
    sortBy: 'Popularity',
    genres: [],
    season: 'Any season',
    status: 'Any status',
    country: 'Any country',
    source: 'Any source',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Client-side multi-signal filtering
  const filtered = useMemo(() => {
    let list = results;

    // Search query within current loaded
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.english?.toLowerCase().includes(q) ||
          a.title.romaji?.toLowerCase().includes(q)
      );
    }

    // Format
    if (filters.format !== 'All formats') {
      list = list.filter((a) => a.format === filters.format);
    }

    // Year
    if (filters.year !== 'Any year') {
      const yr = parseInt(filters.year, 10);
      list = list.filter((a) => a.seasonYear === yr);
    }

    // Season
    if (filters.season !== 'Any season') {
      list = list.filter((a) => a.season === filters.season.toUpperCase());
    }

    // Status
    if (filters.status !== 'Any status') {
      const sMap: Record<string, string> = {
        'Releasing': 'RELEASING',
        'Finished': 'FINISHED',
        'Not yet released': 'NOT_YET_RELEASED',
        'Cancelled': 'CANCELLED',
      };
      const expected = sMap[filters.status];
      if (expected) {
        list = list.filter((a) => a.status === expected);
      }
    }

    // Genres (all selected genres must match)
    if (filters.genres.length > 0) {
      list = list.filter((a) =>
        filters.genres.every((g) => a.genres?.includes(g))
      );
    }

    // Sort
    if (filters.sortBy === 'Score') {
      list = [...list].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    } else if (filters.sortBy === 'Trending') {
      list = [...list].sort((a, b) => (b.trending || 0) - (a.trending || 0));
    } else if (filters.sortBy === 'Newest') {
      list = [...list].sort((a, b) => (b.seasonYear || 0) - (a.seasonYear || 0));
    }

    return list;
  }, [results, searchInput, filters]);

  // Count active filter signals
  let activeFilterCount = filters.genres.length;
  if (filters.format !== 'All formats') activeFilterCount++;
  if (filters.year !== 'Any year') activeFilterCount++;
  if (filters.sortBy !== 'Popularity') activeFilterCount++;
  if (filters.season !== 'Any season') activeFilterCount++;
  if (filters.status !== 'Any status') activeFilterCount++;
  if (filters.country !== 'Any country') activeFilterCount++;
  if (filters.source !== 'Any source') activeFilterCount++;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-[6vw] max-w-[1700px] mx-auto min-h-screen">
      {/* Title & Subtitle matching Image 2 */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-[#e50914]" />
          <span>DISCOVER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
          Find your next anime
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Search the catalogue or narrow it down by genre, season, format, and more.
        </p>
      </div>

      {/* Search Bar matching Image 2 */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Big Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by anime title..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#161616] border border-white/10 hover:border-white/20 text-xs font-bold text-white px-5 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#e50914] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Up to date toggle */}
            <button
              type="button"
              onClick={() => setUpToDateOnly(!upToDateOnly)}
              className={`flex items-center gap-2 border px-4 py-3.5 rounded-xl text-xs font-bold transition-colors ${
                upToDateOnly
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-[#141414] border-white/10 text-zinc-500 hover:text-white'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${upToDateOnly ? 'text-emerald-400' : 'opacity-0'}`} />
              <span>Up to date</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Filters Row matching Image 2 */}
      <div className="flex flex-wrap items-center gap-2 mb-8 text-xs">
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase mr-1">
          QUICK
        </span>

        {/* Format Filter */}
        <select
          value={filters.format}
          onChange={(e) => setFilters({ ...filters, format: e.target.value })}
          className="bg-[#141414] border border-white/10 text-zinc-300 font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer"
        >
          <option value="All formats">All formats</option>
          <option value="TV">TV</option>
          <option value="MOVIE">Movie</option>
          <option value="OVA">OVA</option>
          <option value="SPECIAL">Special</option>
        </select>

        {/* Year Filter */}
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="bg-[#141414] border border-white/10 text-zinc-300 font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer"
        >
          <option value="Any year">Any year</option>
          <option value="2027">2027</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2020">2020</option>
          <option value="2015">2015</option>
        </select>

        {/* Sort Filter */}
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="bg-[#141414] border border-white/10 text-zinc-300 font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer"
        >
          <option value="Popularity">Popularity</option>
          <option value="Score">Score</option>
          <option value="Trending">Trending</option>
          <option value="Newest">Newest</option>
        </select>
      </div>

      {/* Counter & Instruction Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 pb-3 border-b border-white/5">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#e50914] block mb-0.5">
            {filtered.length} ANIME LOADED
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Explore the catalogue
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sorted by {filters.sortBy.toLowerCase()}
          </p>
        </div>

        <p className="text-xs text-zinc-500 italic">
          Pause on a card for a quick preview.
        </p>
      </div>

      {/* Grid of PosterCards */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-[#141414] rounded-2xl border border-white/5 mt-4">
          <p className="text-base text-zinc-300 font-semibold">No anime found matching your filters.</p>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your genre, format, or year criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mt-6">
          {filtered.map((anime) => (
            <div key={anime.id} className="flex justify-center">
              <PosterCard anime={anime} />
            </div>
          ))}
        </div>
      )}

      {/* Refine Filters Modal (matching Image 3) */}
      <RefineFiltersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() =>
          setFilters({
            format: 'All formats',
            year: 'Any year',
            sortBy: 'Popularity',
            genres: [],
            season: 'Any season',
            status: 'Any status',
            country: 'Any country',
            source: 'Any source',
          })
        }
      />
    </div>
  );
}

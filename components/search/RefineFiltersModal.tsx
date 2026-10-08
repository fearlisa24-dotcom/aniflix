'use client';

import React, { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface FilterState {
  format: string;
  year: string;
  sortBy: string;
  genres: string[];
  season: string;
  status: string;
  country: string;
  source: string;
}

interface RefineFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onReset: () => void;
}

const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi',
  'Fantasy', 'Hentai', 'Horror', 'Mahou Shoujo', 'Mecha',
  'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

const FORMATS = ['All formats', 'TV', 'TV Short', 'Movie', 'Special', 'OVA', 'ONA'];
const YEARS = ['Any year', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2015', '2010', '2000'];
const SORTS = ['Popularity', 'Score', 'Trending', 'Newest'];
const SEASONS = ['Any season', 'Winter', 'Spring', 'Summer', 'Fall'];
const STATUSES = ['Any status', 'Releasing', 'Finished', 'Not yet released', 'Cancelled'];
const COUNTRIES = ['Any country', 'Japan', 'China', 'South Korea'];
const SOURCES = ['Any source', 'Manga', 'Light Novel', 'Original', 'Visual Novel', 'Video Game'];

export function RefineFiltersModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: RefineFiltersModalProps) {
  const [draft, setDraft] = useState<FilterState>(filters);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setDraft((prev) => {
      const exists = prev.genres.includes(genre);
      const newGenres = exists
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres: newGenres };
    });
  };

  // Count active selections
  let count = draft.genres.length;
  if (draft.format !== 'All formats') count++;
  if (draft.year !== 'Any year') count++;
  if (draft.sortBy !== 'Popularity') count++;
  if (draft.season !== 'Any season') count++;
  if (draft.status !== 'Any status') count++;
  if (draft.country !== 'Any country') count++;
  if (draft.source !== 'Any source') count++;

  const handleReset = () => {
    const fresh: FilterState = {
      format: 'All formats',
      year: 'Any year',
      sortBy: 'Popularity',
      genres: [],
      season: 'Any season',
      status: 'Any status',
      country: 'Any country',
      source: 'Any source',
    };
    setDraft(fresh);
    onReset();
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog (matching Image 3) */}
      <div className="relative w-full max-w-[650px] bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Refine results
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 text-[#e50914] text-[11px] font-bold">
                {count} selected
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Choose a few signals that matter, then apply them together.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-hide text-xs">
          {/* Section 1: POPULAR FILTERS */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">
              POPULAR FILTERS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Format */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Format</label>
                <select
                  value={draft.format}
                  onChange={(e) => setDraft({ ...draft, format: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-3 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Year</label>
                <select
                  value={draft.year}
                  onChange={(e) => setDraft({ ...draft, year: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-3 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Sort by</label>
                <select
                  value={draft.sortBy}
                  onChange={(e) => setDraft({ ...draft, sortBy: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-3 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {SORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: GENRES - choose any */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">
              GENRES <span className="text-zinc-600 font-normal">· choose any</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((g) => {
                const isSelected = draft.genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#e50914]/20 border-[#e50914] text-white shadow-sm shadow-red-900/40'
                        : 'bg-[#181818] border-white/10 text-zinc-400 hover:text-white hover:border-white/25 hover:bg-white/5'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: MORE DETAILS */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-3">
              MORE DETAILS
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Season */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Season</label>
                <select
                  value={draft.season}
                  onChange={(e) => setDraft({ ...draft, season: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-2.5 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Status</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-2.5 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Country</label>
                <select
                  value={draft.country}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-2.5 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1 text-[11px]">Source</label>
                <select
                  value={draft.source}
                  onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 rounded-xl px-2.5 py-2.5 text-zinc-200 font-semibold focus:outline-none focus:border-[#e50914] cursor-pointer"
                >
                  {SOURCES.map((so) => (
                    <option key={so} value={so}>{so}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer matching Image 3 */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/10 bg-[#151515]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors p-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#e50914] hover:bg-[#ff2030] shadow-md shadow-red-900/30 transition-all"
            >
              Apply filters ({count})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Search, ArrowUpDown, ChevronDown } from 'lucide-react';
import { getAnimeAllEpisodesProgress, EpisodeWatchStatus } from '@/lib/progress';
import type { Episode } from '@/types';

interface SeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  startEpisode: number;
  endEpisode: number;
  posterPath: string | null;
}

interface EpisodeListProps {
  slug: string;
  animeId?: number;
  animeTitle?: string;
  totalEpisodes: number | null;
  streamingEpisodes: Array<{
    title: string;
    thumbnail: string;
    url: string;
    site: string;
  }>;
  coverImage: string;
  bannerImage?: string | null;
}

const PAGE_SIZE = 24;

export function EpisodeList({
  slug,
  animeId,
  animeTitle,
  totalEpisodes,
  streamingEpisodes,
  coverImage,
  bannerImage,
}: EpisodeListProps) {
  const isOnePiece = /one\s*piece/i.test(animeTitle || slug);
  const initialTotal = isOnePiece ? 1180 : (totalEpisodes && totalEpisodes > 0 ? totalEpisodes : 24);

  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(0);
  const [activeRange, setActiveRange] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'episodes' | 'characters' | 'staff'>('episodes');
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const [tmdbEpisodes, setTmdbEpisodes] = useState<
    Array<{ number: number; title: string; thumbnail: string | null; airDate: string }>
  >([]);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);

  // Watch history tracking for dots and highlight
  const [watchProgressMap, setWatchProgressMap] = useState<Record<number, { time: number; duration: number; completed: boolean }>>({});
  const [activeLang, setActiveLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aniflix_lang') || 'sub';
    }
    return 'sub';
  });

  const resolvedTitle = animeTitle || slug.replace(/-/g, ' ');
  const lookupKey = animeId ? String(animeId) : slug;

  // Load local progress map for dots and orange highlight
  useEffect(() => {
    const records = getAnimeAllEpisodesProgress(lookupKey);
    setWatchProgressMap(records);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniflix_lang');
      if (saved) setActiveLang(saved);
    }
  }, [lookupKey]);

  // Fetch season list
  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      setIsLoadingSeasons(true);
      try {
        const res = await fetch(
          `/api/episodes?title=${encodeURIComponent(resolvedTitle)}&count=${totalCount}&mode=seasons`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.seasons && data.seasons.length > 0) {
            setSeasons(data.seasons);
            if (data.totalCount && data.totalCount > totalCount) {
              setTotalCount(data.totalCount);
            }
          }
        }
      } catch {
        // fallback
      } finally {
        if (!cancelled) setIsLoadingSeasons(false);
      }
    }
    loadSeasons();
    return () => { cancelled = true; };
  }, [resolvedTitle, totalCount]);

  const currentSeason = seasons[activeSeason] || null;
  const seasonEpCount = currentSeason?.episodeCount || totalCount;
  const seasonStart = currentSeason?.startEpisode || 1;
  const seasonEnd = currentSeason?.endEpisode || totalCount;

  // Sub-ranges if season has more than 24 episodes
  const numSubRanges = Math.ceil(seasonEpCount / PAGE_SIZE);

  // Fetch episodes for current active range within active season
  useEffect(() => {
    let cancelled = false;
    async function loadTMDBRange() {
      setIsLoadingRange(true);
      const rangeStart = seasonStart + activeRange * PAGE_SIZE;
      const rangeEnd = Math.min(seasonStart + (activeRange + 1) * PAGE_SIZE - 1, seasonEnd);

      try {
        const res = await fetch(
          `/api/episodes?title=${encodeURIComponent(resolvedTitle)}&rangeStart=${rangeStart}&rangeEnd=${rangeEnd}&count=${totalCount}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            if (data.totalCount && data.totalCount > totalCount) {
              setTotalCount(data.totalCount);
            }
            if (data.episodes) {
              setTmdbEpisodes(data.episodes);
            }
          }
        }
      } catch {
        // fallback
      } finally {
        if (!cancelled) setIsLoadingRange(false);
      }
    }

    if (seasons.length > 0 || !isLoadingSeasons) {
      loadTMDBRange();
    }
    return () => { cancelled = true; };
  }, [resolvedTitle, activeSeason, activeRange, totalCount, seasons, seasonStart, seasonEnd, isLoadingSeasons]);

  // Reset range when switching seasons
  useEffect(() => {
    setActiveRange(0);
  }, [activeSeason]);

  // Compute status for an episode
  const getEpStatus = (num: number): EpisodeWatchStatus => {
    const record = watchProgressMap[num];
    if (!record) return 'unwatched';
    if (record.completed || (record.duration > 0 && record.time >= record.duration * 0.88)) {
      return 'completed';
    }
    if (record.time > 15) {
      return 'unfinished';
    }
    return 'unwatched';
  };

  // Build displayed episodes
  const displayedEpisodes = useMemo(() => {
    const rangeStart = seasonStart + activeRange * PAGE_SIZE;
    const rangeEnd = Math.min(seasonStart + (activeRange + 1) * PAGE_SIZE - 1, seasonEnd);
    const fallbackBanner = bannerImage || coverImage;

    const list: Array<Episode & { status: EpisodeWatchStatus }> = [];
    for (let num = rangeStart; num <= rangeEnd; num++) {
      const tmdbEp = tmdbEpisodes.find((e) => e.number === num);
      const streaming = streamingEpisodes?.[num - 1];

      let epTitle = `Episode ${num}`;
      if (tmdbEp?.title && tmdbEp.title !== `Episode ${num}`) {
        epTitle = tmdbEp.title;
      } else if (streaming?.title) {
        epTitle = streaming.title;
      }

      const status = getEpStatus(num);

      list.push({
        number: num,
        title: epTitle,
        thumbnail: tmdbEp?.thumbnail || streaming?.thumbnail || fallbackBanner,
        duration: '24m',
        airDate: tmdbEp?.airDate || 'HD · Sub | Dub',
        isFiller: false,
        status,
      });
    }

    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = list.filter(
        (ep) =>
          ep.number.toString() === q ||
          ep.title.toLowerCase().includes(q)
      );
    }

    return sortAsc ? filtered : [...filtered].reverse();
  }, [activeSeason, activeRange, seasonStart, seasonEnd, totalCount, tmdbEpisodes, streamingEpisodes, bannerImage, coverImage, searchQuery, sortAsc, watchProgressMap]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#F47521] mb-1">
          WATCH & EXPLORE
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Episodes and people
        </h2>
      </div>

      {/* Subtabs: Episodes | Characters | Staff */}
      <div className="flex items-center gap-6 border-b border-white/10 mb-6">
        <button
          type="button"
          onClick={() => setActiveSubTab('episodes')}
          className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeSubTab === 'episodes' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>Episodes</span>
          <span className="text-xs text-zinc-400 font-semibold">{totalCount}</span>
          {activeSubTab === 'episodes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47521]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('characters')}
          className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeSubTab === 'characters' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>Characters</span>
          <span className="text-xs text-zinc-500">0</span>
          {activeSubTab === 'characters' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47521]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('staff')}
          className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeSubTab === 'staff' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>Staff</span>
          <span className="text-xs text-zinc-500">0</span>
          {activeSubTab === 'staff' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F47521]" />
          )}
        </button>
      </div>

      {activeSubTab === 'episodes' ? (
        <>
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {totalCount} available episodes
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {currentSeason ? `${currentSeason.name} — ${currentSeason.episodeCount} episodes` : 'Pick up anywhere in the season.'}
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Episode or title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F47521]"
                />
              </div>

              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1.5 bg-[#141414] border border-white/10 hover:border-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                <span>{sortAsc ? 'Oldest' : 'Newest'}</span>
              </button>
            </div>
          </div>

          {/* Season Selector Dropdown */}
          {seasons.length > 1 && (
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
                className="flex items-center gap-2.5 bg-[#141414] border border-white/10 hover:border-[#F47521]/60 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all cursor-pointer w-full sm:w-auto shadow-md"
              >
                <span className="bg-[#F47521]/15 text-[#F47521] text-[11px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-[#F47521]/30">
                  S{currentSeason?.seasonNumber || 1}
                </span>
                <span className="truncate max-w-[280px] sm:max-w-md">{currentSeason?.name || 'Season 1'}</span>
                <span className="text-xs text-zinc-500 ml-auto sm:ml-2">({currentSeason?.episodeCount || 0} eps)</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${seasonDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {seasonDropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 sm:right-auto sm:min-w-[420px] bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[380px] overflow-y-auto scrollbar-hide py-1 backdrop-blur-xl">
                  {seasons.map((season, idx) => (
                    <button
                      key={season.seasonNumber}
                      type="button"
                      onClick={() => {
                        setActiveSeason(idx);
                        setSeasonDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 cursor-pointer ${
                        activeSeason === idx ? 'bg-[#F47521]/10 border-l-3 border-l-[#F47521]' : 'border-l-3 border-l-transparent'
                      }`}
                    >
                      <span className={`text-[11px] font-black uppercase tracking-wider w-8 ${
                        activeSeason === idx ? 'text-[#F47521]' : 'text-zinc-500'
                      }`}>S{season.seasonNumber}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          activeSeason === idx ? 'text-white' : 'text-zinc-300'
                        }`}>{season.name}</p>
                        <p className="text-[11px] text-zinc-500">Episodes {season.startEpisode}–{season.endEpisode}</p>
                      </div>
                      <span className="text-xs text-zinc-500 shrink-0">{season.episodeCount} eps</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Range Tabs (within a season, if season has > 24 episodes) */}
          {numSubRanges > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-5 border-b border-white/5">
              {Array.from({ length: numSubRanges }).map((_, idx) => {
                const start = seasonStart + idx * PAGE_SIZE;
                const end = Math.min(seasonStart + (idx + 1) * PAGE_SIZE - 1, seasonEnd);
                const isSelected = activeRange === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveRange(idx)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F47521]/20 border-[#F47521] text-[#F47521] shadow-md shadow-orange-950/40'
                        : 'bg-[#141414] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {start}–{end}
                  </button>
                );
              })}
            </div>
          )}

          {/* Status Indicator Legend */}
          <div className="flex items-center gap-4 text-[11px] text-zinc-400 mb-4 px-1 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-500 ring-1 ring-zinc-400" /> Unwatched
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse" /> Watching
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 ring-1 ring-blue-400 shadow-sm shadow-blue-500/50" /> Unfinished
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F47521] ring-1 ring-[#F47521] shadow-sm shadow-[#F47521]/50" /> Watched (Highlighted)
            </span>
          </div>

          {/* Episode Grid */}
          {isLoadingRange && tmdbEpisodes.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden bg-[#141414] border border-white/5 animate-pulse">
                  <div className="aspect-video bg-zinc-800" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-zinc-800 rounded w-3/4" />
                    <div className="h-2 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedEpisodes.length === 0 ? (
            <div className="p-8 text-center bg-[#141414] rounded-xl border border-white/5">
              <p className="text-zinc-400 text-sm">
                No episodes found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedEpisodes.map((ep) => {
                const isFullyWatched = ep.status === 'completed';
                const isUnfinished = ep.status === 'unfinished';
                const isCurrent = ep.status === 'current';

                // Orange highlight when episode is fully watched
                const isHighlighted = isFullyWatched || isCurrent;

                return (
                  <Link
                    key={ep.number}
                    href={`/watch/${animeId ?? slug}/${ep.number}${activeLang === 'dub' ? '?lang=dub' : ''}`}
                    prefetch={true}
                    className={`group block rounded-xl overflow-hidden transition-all duration-200 border cursor-pointer ${
                      isHighlighted
                        ? 'bg-[#181410] border-[#F47521]/70 shadow-md shadow-[#F47521]/10 hover:border-[#F47521]'
                        : 'bg-[#141414] hover:bg-[#1c1c1c] border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-black">
                      <Image
                        src={ep.thumbnail}
                        alt={`Episode ${ep.number}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#F47521] flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 text-black fill-current ml-0.5" strokeWidth={0} />
                        </div>
                      </div>

                      {/* EP badge top left */}
                      <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-white border border-white/10 uppercase">
                        EP {ep.number}
                      </div>

                      {/* Status Dot Top Right */}
                      <div className="absolute top-2 right-2 z-10 flex items-center">
                        {isCurrent && (
                          <span
                            className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-black shadow-md shadow-emerald-500/50 animate-pulse"
                            title="Currently Watching"
                          />
                        )}
                        {isFullyWatched && (
                          <span
                            className="w-3 h-3 rounded-full bg-[#F47521] ring-2 ring-black shadow-md shadow-[#F47521]/50"
                            title="Watched (Completed)"
                          />
                        )}
                        {isUnfinished && (
                          <span
                            className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-black shadow-md shadow-blue-500/50"
                            title="Watched (Unfinished)"
                          />
                        )}
                        {!isCurrent && !isFullyWatched && !isUnfinished && (
                          <span
                            className="w-2.5 h-2.5 rounded-full bg-zinc-500 ring-2 ring-black opacity-75"
                            title="Unwatched"
                          />
                        )}
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="p-3">
                      <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 transition-colors leading-snug ${
                        isHighlighted ? 'text-orange-100 group-hover:text-[#F47521]' : 'text-white group-hover:text-[#F47521]'
                      }`}>
                        {ep.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-zinc-500">
                          {ep.airDate}
                        </p>
                        {isFullyWatched && (
                          <span className="text-[10px] font-bold text-[#F47521] uppercase tracking-wider">
                            Watched
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-[#141414] rounded-2xl border border-white/5 text-zinc-500 text-sm">
          No {activeSubTab} information available for this series.
        </div>
      )}
    </div>
  );
}

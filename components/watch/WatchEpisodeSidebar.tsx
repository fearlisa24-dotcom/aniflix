'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowUpDown, Play, ChevronDown } from 'lucide-react';
import { getAnimeAllEpisodesProgress, EpisodeWatchStatus } from '@/lib/progress';
import type { AnimeDetail } from '@/types';

interface SeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  startEpisode: number;
  endEpisode: number;
  posterPath: string | null;
}

interface WatchEpisodeSidebarProps {
  anilistId: number;
  currentEpisode: number;
  totalEpisodes: number;
  anime?: AnimeDetail | null;
  coverImage?: string;
}

const PAGE_SIZE = 24;

export function WatchEpisodeSidebar({
  anilistId,
  currentEpisode,
  totalEpisodes,
  anime,
  coverImage,
}: WatchEpisodeSidebarProps) {
  const isOnePiece = anilistId === 21 || /one\s*piece/i.test(anime?.title?.english || anime?.title?.romaji || '');
  const initialTotal = isOnePiece ? 1180 : (totalEpisodes && totalEpisodes > 0 ? totalEpisodes : 24);

  const [totalCount, setTotalCount] = useState<number>(initialTotal);
  const [seasons, setSeasons] = useState<SeasonInfo[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(0);
  const [activeRange, setActiveRange] = useState<number>(0);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [tmdbEpisodes, setTmdbEpisodes] = useState<
    Array<{ number: number; title: string; thumbnail: string | null; airDate: string }>
  >([]);

  // Watch history tracking
  const [watchProgressMap, setWatchProgressMap] = useState<Record<number, { time: number; duration: number; completed: boolean }>>({});
  const [activeLang, setActiveLang] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aniflix_lang') || 'sub';
    }
    return 'sub';
  });

  const animeTitle = anime?.title?.english || anime?.title?.romaji || '';

  // Load progress map and active language
  useEffect(() => {
    const records = getAnimeAllEpisodesProgress(anilistId);
    setWatchProgressMap(records);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aniflix_lang');
      if (saved) setActiveLang(saved);
    }
  }, [anilistId]);

  // Fetch season list
  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      if (!animeTitle) return;
      try {
        const res = await fetch(
          `/api/episodes?title=${encodeURIComponent(animeTitle)}&count=${totalCount}&mode=seasons`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.seasons && data.seasons.length > 0) {
            setSeasons(data.seasons);
            if (data.totalCount && data.totalCount > totalCount) {
              setTotalCount(data.totalCount);
            }
            // Auto-select season containing currentEpisode
            const seasonIdx = data.seasons.findIndex(
              (s: SeasonInfo) => currentEpisode >= s.startEpisode && currentEpisode <= s.endEpisode
            );
            if (seasonIdx >= 0) {
              setActiveSeason(seasonIdx);
              const season = data.seasons[seasonIdx];
              const epWithinSeason = currentEpisode - season.startEpisode;
              setActiveRange(Math.floor(epWithinSeason / PAGE_SIZE));
            }
          }
        }
      } catch {
        // fallback
      }
    }
    loadSeasons();
    return () => { cancelled = true; };
  }, [animeTitle, totalCount, currentEpisode]);

  const currentSeason = seasons[activeSeason] || null;
  const seasonStart = currentSeason?.startEpisode || 1;
  const seasonEnd = currentSeason?.endEpisode || totalCount;
  const seasonEpCount = currentSeason?.episodeCount || totalCount;
  const numSubRanges = Math.ceil(seasonEpCount / PAGE_SIZE);

  // Fetch episodes for active range
  useEffect(() => {
    let cancelled = false;
    async function loadEpisodes() {
      if (!animeTitle) return;
      const rangeStart = seasonStart + activeRange * PAGE_SIZE;
      const rangeEnd = Math.min(seasonStart + (activeRange + 1) * PAGE_SIZE - 1, seasonEnd);

      try {
        const res = await fetch(
          `/api/episodes?title=${encodeURIComponent(animeTitle)}&rangeStart=${rangeStart}&rangeEnd=${rangeEnd}&count=${totalCount}`
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
      }
    }
    if (seasons.length > 0) {
      loadEpisodes();
    }
    return () => { cancelled = true; };
  }, [animeTitle, activeSeason, activeRange, totalCount, seasons, seasonStart, seasonEnd]);

  // Compute status for an episode
  const getEpStatus = (num: number): EpisodeWatchStatus => {
    if (num === currentEpisode) return 'current';
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

  // Generate episode items
  const episodes = useMemo(() => {
    const list: Array<{ number: number; title: string; thumbnail: string; airDate?: string; status: EpisodeWatchStatus }> = [];
    const banner = anime?.bannerImage || anime?.coverImage?.large || coverImage || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498.jpg';

    const rangeStart = seasonStart + activeRange * PAGE_SIZE;
    const rangeEnd = Math.min(seasonStart + (activeRange + 1) * PAGE_SIZE - 1, seasonEnd);

    for (let num = rangeStart; num <= rangeEnd; num++) {
      const tmdbEp = tmdbEpisodes.find((e) => e.number === num);
      const streaming = anime?.streamingEpisodes?.[num - 1];

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
        thumbnail: tmdbEp?.thumbnail || streaming?.thumbnail || banner,
        airDate: tmdbEp?.airDate || 'Subbed / Dubbed',
        status,
      });
    }

    let filtered = list;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (ep) =>
          ep.number.toString() === q ||
          ep.title.toLowerCase().includes(q)
      );
    }

    return sortAsc ? filtered : [...filtered].reverse();
  }, [activeSeason, activeRange, seasonStart, seasonEnd, tmdbEpisodes, anime, coverImage, searchQuery, sortAsc, currentEpisode, watchProgressMap]);

  return (
    <div className="w-full bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col h-[650px] lg:h-[750px] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>Episodes</span>
          <span className="text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full font-semibold">
            {totalCount}
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
          title={`Sort ${sortAsc ? 'Descending' : 'Ascending'}`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{sortAsc ? '1-9' : '9-1'}</span>
        </button>
      </div>

      {/* Season Selector */}
      {seasons.length > 1 && (
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 hover:border-[#F47521]/60 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all cursor-pointer w-full shadow-sm"
          >
            <span className="text-[#F47521] text-[10px] font-black uppercase tracking-wider bg-[#F47521]/15 px-1.5 py-0.5 rounded border border-[#F47521]/30">
              S{currentSeason?.seasonNumber || 1}
            </span>
            <span className="truncate flex-1 text-left">{currentSeason?.name || 'Season 1'}</span>
            <span className="text-[10px] text-zinc-500">{currentSeason?.episodeCount || 0} eps</span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${seasonDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {seasonDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[300px] overflow-y-auto scrollbar-hide py-1 backdrop-blur-xl">
              {seasons.map((season, idx) => (
                <button
                  key={season.seasonNumber}
                  type="button"
                  onClick={() => {
                    setActiveSeason(idx);
                    setSeasonDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5 cursor-pointer ${
                    activeSeason === idx ? 'bg-[#F47521]/10 border-l-2 border-l-[#F47521]' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider w-6 ${
                    activeSeason === idx ? 'text-[#F47521]' : 'text-zinc-500'
                  }`}>S{season.seasonNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      activeSeason === idx ? 'text-white' : 'text-zinc-300'
                    }`}>{season.name}</p>
                    <p className="text-[10px] text-zinc-500">Ep {season.startEpisode}–{season.endEpisode}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0">{season.episodeCount}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Range Pills */}
      {numSubRanges > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-3 border-b border-white/5">
          {Array.from({ length: numSubRanges }).map((_, idx) => {
            const start = seasonStart + idx * PAGE_SIZE;
            const end = Math.min(seasonStart + (idx + 1) * PAGE_SIZE - 1, seasonEnd);
            const isSelected = activeRange === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveRange(idx)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-[#F47521] border-[#F47521] text-black shadow-sm font-black'
                    : 'bg-[#181818] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {start}–{end}
              </button>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search episode or title..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#F47521]/60"
        />
      </div>

      {/* Episode List Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
        {episodes.map((ep) => {
          const isPlaying = ep.number === currentEpisode;
          const isFullyWatched = ep.status === 'completed';
          const isUnfinished = ep.status === 'unfinished';
          const isCurrent = isPlaying || ep.status === 'current';

          // Highlighted in orange if fully watched or playing
          const isHighlighted = isFullyWatched || isPlaying;

          return (
            <Link
              key={ep.number}
              href={`/watch/${anilistId}/${ep.number}${activeLang === 'dub' ? '?lang=dub' : ''}`}
              prefetch={true}
              className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${
                isHighlighted
                  ? 'bg-[#181410] border-[#F47521]/60 shadow-sm shadow-[#F47521]/15 text-white'
                  : 'bg-[#161616] border-white/5 hover:border-white/15 hover:bg-[#1e1e1e] text-zinc-300'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-black">
                <Image
                  src={ep.thumbnail}
                  alt={`Episode ${ep.number}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black/85 px-1 py-0.5 rounded text-[10px] font-bold text-white">
                  Ep {ep.number}
                </div>

                {/* Status Dot Top Right on Thumbnail */}
                <div className="absolute top-1 right-1 z-10">
                  {isCurrent && (
                    <span
                      className="block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-black shadow-sm shadow-emerald-500/50 animate-pulse"
                      title="Currently Watching"
                    />
                  )}
                  {isFullyWatched && !isCurrent && (
                    <span
                      className="block w-2.5 h-2.5 rounded-full bg-[#F47521] ring-1 ring-black shadow-sm shadow-[#F47521]/50"
                      title="Fully Watched"
                    />
                  )}
                  {isUnfinished && !isCurrent && (
                    <span
                      className="block w-2.5 h-2.5 rounded-full bg-blue-500 ring-1 ring-black shadow-sm shadow-blue-500/50"
                      title="Unfinished"
                    />
                  )}
                  {!isCurrent && !isFullyWatched && !isUnfinished && (
                    <span
                      className="block w-2 h-2 rounded-full bg-zinc-500 ring-1 ring-black opacity-75"
                      title="Unwatched"
                    />
                  )}
                </div>

                {isPlaying && (
                  <div className="absolute inset-0 bg-[#F47521]/30 flex items-center justify-center">
                    <Play className="w-5 h-5 text-black fill-current animate-pulse" />
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                {isPlaying && (
                  <p className="text-[10px] font-black text-[#F47521] uppercase tracking-wider mb-0.5">
                    NOW PLAYING
                  </p>
                )}
                {!isPlaying && isFullyWatched && (
                  <p className="text-[10px] font-bold text-[#F47521] uppercase tracking-wider mb-0.5">
                    WATCHED
                  </p>
                )}
                <h3 className={`text-xs font-semibold line-clamp-2 leading-tight ${
                  isHighlighted ? 'text-orange-100' : 'text-zinc-200'
                }`}>
                  {ep.title}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {ep.airDate}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

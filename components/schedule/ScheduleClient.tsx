'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Play,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { AiringScheduleItem } from '@/lib/anilist';

interface ScheduleClientProps {
  initialSchedules: AiringScheduleItem[];
}

export function ScheduleClient({ initialSchedules }: ScheduleClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 7 Days of the week starting from Sunday or Monday
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const todayDayIndex = today.getDay();

  // Build the 7 days array
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + (i - 1)); // yesterday, today, and next 5 days
      return {
        dateObj: d,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        month: monthNames[d.getMonth()],
        dateStr: d.toISOString().split('T')[0],
        isToday: d.toDateString() === today.toDateString(),
        dayOfWeek: d.getDay(),
      };
    });
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // Filter schedules by selected date
  const filteredByDay = useMemo(() => {
    return initialSchedules.filter((item) => {
      const itemDate = new Date(item.airingAt * 1000).toISOString().split('T')[0];
      return itemDate === selectedDateStr;
    });
  }, [initialSchedules, selectedDateStr]);

  // Apply search query
  const displayedSchedules = useMemo(() => {
    if (!searchQuery.trim()) return filteredByDay;
    const q = searchQuery.toLowerCase().trim();
    return filteredByDay.filter(
      (item) =>
        item.media.title.english?.toLowerCase().includes(q) ||
        item.media.title.romaji?.toLowerCase().includes(q) ||
        item.media.genres?.some((g) => g.toLowerCase().includes(q))
    );
  }, [filteredByDay, searchQuery]);

  return (
    <div className="pt-24 pb-20 px-4 sm:px-[6vw] max-w-[1700px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#e50914]" />
            <span>BROADCAST SCHEDULE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Estimated Schedule
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time broadcast tracking powered by TMDB & AniList. Times displayed in your local timezone.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter scheduled anime..."
            className="w-full bg-[#141414] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e50914]"
          />
        </div>
      </div>

      {/* Week Day Tabs (Horizontal Scrollable) */}
      <div className="flex gap-2 pb-4 mb-6 overflow-x-auto scrollbar-hide border-b border-white/10">
        {weekDays.map((day) => {
          const isSelected = selectedDateStr === day.dateStr;
          // Count anime for this day
          const dayCount = initialSchedules.filter((item) => {
            const itemDate = new Date(item.airingAt * 1000).toISOString().split('T')[0];
            return itemDate === day.dateStr;
          }).length;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-2xl transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#e50914] border-[#e50914] text-white shadow-lg shadow-red-900/40 scale-105'
                  : 'bg-[#141414] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wider">
                  {day.dayName}
                </span>
                {day.isToday && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                      isSelected ? 'bg-white text-black' : 'bg-[#e50914] text-white'
                    }`}
                  >
                    TODAY
                  </span>
                )}
              </div>
              <span className="text-sm font-bold">
                {day.month} {day.dayNum}
              </span>
              <span
                className={`text-[10px] mt-1 font-semibold ${
                  isSelected ? 'text-white/80' : 'text-zinc-500'
                }`}
              >
                {dayCount} Shows
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Feed */}
      {displayedSchedules.length === 0 ? (
        <div className="text-center py-20 bg-[#121212] border border-white/5 rounded-2xl">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            No broadcast found for this day
          </h3>
          <p className="text-xs text-zinc-500">
            {searchQuery ? `No shows matching "${searchQuery}"` : 'Check another day of the week above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedSchedules.map((item) => {
            const anime = item.media;
            const title = anime.title.english || anime.title.romaji;
            const slug = slugify(title);
            const date = new Date(item.airingAt * 1000);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isAired = item.timeUntilAiring <= 0;
            const hoursLeft = Math.ceil(item.timeUntilAiring / 3600);

            return (
              <div
                key={item.id}
                className="group relative bg-[#141414] hover:bg-[#181818] border border-white/10 hover:border-white/25 rounded-2xl p-4 transition-all duration-200 flex gap-4"
              >
                {/* Poster Thumbnail */}
                <Link
                  href={`/anime/${slug}?id=${anime.id}`}
                  className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-black border border-white/10"
                >
                  <Image
                    src={anime.coverImage.large || anime.coverImage.extraLarge}
                    alt={title}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Episode badge */}
                  <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-black text-white border border-white/10 uppercase">
                    EP {item.episode}
                  </div>
                </Link>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Time & Countdown Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-[#e50914]" />
                        {timeString}
                      </span>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isAired
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30'
                        }`}
                      >
                        {isAired ? 'Aired' : `In ${hoursLeft}h`}
                      </span>
                    </div>

                    {/* Anime Title */}
                    <Link
                      href={`/anime/${slug}?id=${anime.id}`}
                      className="block group-hover:text-[#e50914] transition-colors"
                    >
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                        {title}
                      </h3>
                    </Link>

                    {/* Format & Genres */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                        {anime.format || 'TV'}
                      </span>
                      {anime.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="text-[10px] font-semibold text-zinc-500 bg-white/5 px-2 py-0.5 rounded"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <Link
                      href={`/watch/${anime.id}/${item.episode}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e50914] hover:text-red-400 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isAired ? 'Watch Now' : `Watch Ep ${item.episode}`}</span>
                    </Link>

                    <Link
                      href={`/anime/${slug}?id=${anime.id}`}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Series Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

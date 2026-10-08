'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, MessageCircle } from 'lucide-react';
import type { AnimeMedia } from '@/types';

/* ─── Mock comments (static placeholder data) ─── */
const MOCK_COMMENTS = [
  {
    user: 'AshenKappa248',
    avatar: 'A',
    show: 'Code Geass: Lelouch of the Rebellion',
    episode: 'EP 3',
    timeAgo: '10h ago',
    text: '3:59 Dropping Biblical level quotes in every scene',
  },
  {
    user: 'AshenKappa248',
    avatar: 'A',
    show: 'Code Geass: Lelouch of the Rebellion',
    episode: 'EP 2',
    timeAgo: '13h ago',
    text: '9:20 All this is just a game to my goat',
  },
  {
    user: 'AshenKappa248',
    avatar: 'A',
    show: 'Code Geass: Lelouch of the Rebellion',
    episode: 'EP 1',
    timeAgo: '13h ago',
    text: 'Rewatching peak 🔥',
  },
  {
    user: 'silent_tora14',
    avatar: 'S',
    show: 'Re:ZERO -Starting Life in Another World-',
    episode: 'EP 4',
    timeAgo: '1d ago',
    text: 'damn he has to do everything from the start again.',
  },
  {
    user: 'silent_tora14',
    avatar: 'S',
    show: 'Re:ZERO -Starting Life in Another World-',
    episode: 'EP 2',
    timeAgo: '2d ago',
    text: 'oh so he really was holding her back. she made it here faster lol.',
  },
];

interface ScheduleEntry {
  time: string;
  title: string;
  episode: string;
}

interface ScheduleAndCommentsSectionProps {
  schedule?: AnimeMedia[];
}

export function ScheduleAndCommentsSection({ schedule = [] }: ScheduleAndCommentsSectionProps) {
  // Build day tabs for current week
  const days = useMemo(() => {
    const result: { label: string; date: string; dayNum: number }[] = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      result.push({
        label: dayNames[d.getDay()],
        date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
        dayNum: d.getDay(),
      });
    }
    return result;
  }, []);

  const [activeDay, setActiveDay] = useState(0);

  // Build mock schedule entries from anime data with airing info
  const scheduleEntries: ScheduleEntry[] = useMemo(() => {
    const airingAnime = schedule.filter((a) => a.nextAiringEpisode);
    if (airingAnime.length === 0) {
      // Fallback mock data
      return [
        { time: '03:00', title: 'Renegade Immortal', episode: 'Ep 161' },
        { time: '03:00', title: 'Yuusanchi! from Yuuhachi', episode: 'Ep 1' },
        { time: '13:30', title: 'Hello, I am a Witch and my Crush Wants me to Make a Love Potion!', episode: 'Ep 1' },
        { time: '15:00', title: 'PSYREN', episode: 'Ep 1' },
        { time: '18:00', title: 'Mahou Shoujo Ikusei Keikaku: restart', episode: 'Ep 1' },
      ];
    }

    return airingAnime.slice(0, 5).map((a) => {
      const airingDate = new Date((a.nextAiringEpisode?.airingAt || 0) * 1000);
      const hours = airingDate.getHours().toString().padStart(2, '0');
      const mins = airingDate.getMinutes().toString().padStart(2, '0');
      return {
        time: `${hours}:${mins}`,
        title: a.title.english || a.title.romaji,
        episode: `Ep ${a.nextAiringEpisode?.episode || '?'}`,
      };
    });
  }, [schedule]);

  return (
    <section className="py-5 px-[8vw]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Left: Recent Comments ─── */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-5 max-h-[420px] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-5 w-1 bg-[#e50914] rounded-full" />
            <MessageCircle className="w-4 h-4 text-zinc-400" />
            <h3 className="text-lg font-bold text-white">Recent Comments</h3>
          </div>

          <div className="space-y-4">
            {MOCK_COMMENTS.map((c, i) => (
              <div key={i} className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center justify-center uppercase">
                  {c.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-white">{c.user}</span>
                    <span className="text-[11px] text-zinc-500">{c.timeAgo}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {c.show} · <span className="text-[#e50914] font-semibold">{c.episode}</span>
                  </p>
                  <p className="text-[13px] text-zinc-300 mt-1 leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Estimated Schedule ─── */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-5 max-h-[420px] overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 bg-[#e50914] rounded-full" />
              <Clock className="w-4 h-4 text-zinc-400" />
              <h3 className="text-lg font-bold text-white">Estimated Schedule</h3>
            </div>
            <Link
              href="/schedule"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Day tabs */}
          <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-hide">
            {days.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-full text-center transition-colors ${
                  activeDay === i
                    ? 'bg-[#e50914] text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                <span className="text-[11px] font-bold leading-none">{d.label}</span>
                <span className="text-[10px] mt-0.5 leading-none">{d.date}</span>
              </button>
            ))}
          </div>

          {/* Schedule entries */}
          <div className="space-y-3">
            {scheduleEntries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-[13px] font-mono text-zinc-500 w-12">
                    <Clock className="inline w-3 h-3 mr-1 -mt-0.5" />
                    {entry.time}
                  </span>
                  <span className="text-[13px] text-zinc-200 truncate">
                    {entry.title}
                  </span>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-[#e50914] ml-3">
                  {entry.episode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

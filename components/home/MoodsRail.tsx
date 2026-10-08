'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  Brain,
  Smile,
  Heart,
  Sparkles,
  Rocket,
  Coffee,
  Globe2,
  Skull,
  Trophy,
  Bot,
  Ghost,
} from 'lucide-react';

const MOODS = [
  {
    title: 'Adrenaline',
    desc: 'Fights, heists & high stakes',
    href: '/search?genre=Action&sort=score',
    icon: Flame,
    color: 'from-orange-500/20 to-red-500/10 border-orange-500/20 text-orange-400',
  },
  {
    title: 'Mind-Benders',
    desc: "Twists you won't see coming",
    href: '/search?genre=Mystery&sort=score',
    icon: Brain,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/20 text-purple-400',
  },
  {
    title: 'Feel-Good',
    desc: 'Laughs and low stakes',
    href: '/search?genre=Comedy&sort=score',
    icon: Smile,
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20 text-amber-400',
  },
  {
    title: 'Heartstrings',
    desc: 'Romance & tearjerkers',
    href: '/search?genre=Romance&sort=score',
    icon: Heart,
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400',
  },
  {
    title: 'Otherworldly',
    desc: 'Magic, myths & new worlds',
    href: '/search?genre=Fantasy&sort=score',
    icon: Sparkles,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
  },
  {
    title: 'Deep Space',
    desc: 'Sci-fi & cyber futures',
    href: '/search?genre=Sci-Fi&sort=score',
    icon: Rocket,
    color: 'from-blue-500/20 to-sky-500/10 border-blue-500/20 text-blue-400',
  },
  {
    title: 'Cozy & Calm',
    desc: 'Iyashikei to unwind with',
    href: '/search?genre=Slice of Life&sort=score',
    icon: Coffee,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
  },
  {
    title: 'Isekai',
    desc: 'Reborn in another world',
    href: '/search?genre=Fantasy&sort=popular',
    icon: Globe2,
    color: 'from-violet-500/20 to-fuchsia-500/10 border-violet-500/20 text-violet-400',
  },
  {
    title: 'Spine-Chillers',
    desc: 'Horror & thrillers',
    href: '/search?genre=Horror&sort=score',
    icon: Skull,
    color: 'from-red-500/20 to-rose-500/10 border-red-500/20 text-red-400',
  },
  {
    title: 'Game Day',
    desc: 'Sports & the will to win',
    href: '/search?genre=Sports&sort=score',
    icon: Trophy,
    color: 'from-yellow-500/20 to-orange-500/10 border-yellow-500/20 text-yellow-400',
  },
  {
    title: 'Giant Robots',
    desc: 'Mecha, old and new',
    href: '/search?genre=Sci-Fi&sort=score',
    icon: Bot,
    color: 'from-slate-500/20 to-zinc-500/10 border-slate-500/20 text-slate-300',
  },
  {
    title: 'Supernatural',
    desc: 'Spirits, curses & powers',
    href: '/search?genre=Supernatural&sort=score',
    icon: Ghost,
    color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/20 text-teal-400',
  },
];

export function MoodsRail() {
  return (
    <section className="py-6 px-[8vw]">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#F47521] mb-1">
          Explore by mood
        </p>
        <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
          What are you in the mood for?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Jump into the catalogue by feeling, not just by title
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          return (
            <Link
              key={mood.title}
              href={mood.href}
              className={`group relative p-3.5 rounded-xl border bg-gradient-to-br transition-all duration-200 hover:scale-[1.03] hover:border-white/20 hover:shadow-lg ${mood.color}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-semibold text-white group-hover:text-[#F47521] transition-colors line-clamp-1">
                  {mood.title}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                {mood.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

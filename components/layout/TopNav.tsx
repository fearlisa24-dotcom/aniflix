'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  LayoutGrid,
  Flame,
  Calendar,
  X,
} from 'lucide-react';
import { SidebarDrawer } from './SidebarDrawer';
import { QuickSearchModal } from '@/components/search/QuickSearchModal';

export function BrandLogo({ className = '', scale = 1 }: { className?: string; scale?: number } = {}) {
  const width = Math.round(115 * scale);
  const height = Math.round(28 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 132 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Aniflix home"
    >
      <path d="M4 28L16 4L28 28H22L16 14L10 28H4Z" fill="#F47521" />
      <path d="M12 20L16 12L20 20H12Z" fill="#0a0a0a" />
      <path d="M14 18L18 16L14 14V18Z" fill="#F47521" />
      <text
        x="32"
        y="28"
        fill="#F47521"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="31"
        letterSpacing="-0.04em"
      >
        NIFLIX
      </text>
    </svg>
  );
}

export const AniflixLogo = BrandLogo;

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);

  // Global Ctrl+K and '/' shortcut to open QuickSearchModal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in a form or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setQuickSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isBrowse = pathname === '/search' || pathname === '/browse';
  const isTrending = pathname === '/trending';
  const isSchedule = pathname === '/schedule';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-3 sm:px-6 flex items-center justify-between">
        {/* Left Side: 3-bar hamburger + Logo + Nav Pills (Images 1 & 2) */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* 3-Bar Hamburger Menu */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Logo */}
          <Link href="/">
            <BrandLogo />
          </Link>

          {/* Navigation Pills matching Image 1 */}
          <nav className="hidden md:flex items-center gap-2 ml-2">
            {/* Browse Pill */}
            <Link
              href="/search"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isBrowse
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isBrowse ? 'text-[#e50914]' : 'text-zinc-400'}`} />
              <span>Browse</span>
            </Link>

            {/* Trending Pill */}
            <Link
              href="/trending"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isTrending
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isTrending ? 'text-[#e50914]' : 'text-zinc-400'}`} />
              <span>Trending</span>
            </Link>

            {/* Schedule Pill */}
            <Link
              href="/schedule"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isSchedule
                  ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${isSchedule ? 'text-[#e50914]' : 'text-zinc-400'}`} />
              <span>Schedule</span>
            </Link>
          </nav>
        </div>

        {/* Right Side: Search Input with Ctrl K + User Profile */}
        <div className="flex items-center gap-3">
          {/* Search box trigger matching Image 2 */}
          <button
            type="button"
            onClick={() => setQuickSearchOpen(true)}
            className="relative hidden sm:flex items-center w-48 md:w-64 h-9 bg-zinc-900/80 border border-white/10 hover:border-white/25 rounded-full pl-9 pr-14 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer text-left"
          >
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            <span className="truncate">Search anime...</span>
            {/* Ctrl K badge */}
            <span className="absolute right-3 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-white/5 pointer-events-none">
              CtrlK
            </span>
          </button>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setQuickSearchOpen(true)}
            className="sm:hidden p-2 text-zinc-300 hover:text-white"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer */}
      <SidebarDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Quick Search Modal (Image 2) */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
      />
    </>
  );
}

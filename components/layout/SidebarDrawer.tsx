'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  Compass,
  Calendar,
  Shuffle,
  Download,
  Settings,
  Key,
  X,
} from 'lucide-react';
import { BrandLogo } from './TopNav';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ isOpen, onClose }: SidebarDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse Anime', href: '/search', icon: LayoutGrid },
    { label: 'Discover', href: '/search?sort=popular', icon: Compass },
    { label: 'Schedule', href: '/schedule', icon: Calendar },
  ];

  const handleRandom = async () => {
    onClose();
    // Redirect to a popular anime or search
    const randomIds = [16498, 21, 101922, 113415, 140960, 108465, 20605, 1535];
    const picked = randomIds[Math.floor(Math.random() * randomIds.length)];
    router.push(`/anime/${picked}?id=${picked}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer content (Image 5 style) */}
      <div className="relative w-[280px] sm:w-[320px] bg-[#0d0d0d] border-r border-white/10 h-full flex flex-col justify-between p-5 z-10 shadow-2xl animate-in slide-in-from-left duration-250">
        <div>
          {/* Header with Red Japanese Badge & Aniflix wordmark + Close Button */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 group"
            >
              <BrandLogo scale={1.05} />
            </Link>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F47521]/15 text-[#F47521] border border-[#F47521]/25 shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-[#F47521]' : 'text-zinc-400'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Random Anime action */}
            <button
              type="button"
              onClick={handleRandom}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left"
            >
              <Shuffle className="w-5 h-5 text-zinc-400" />
              <span>Random</span>
            </button>

            {/* Install App */}
            <button
              type="button"
              onClick={() => {
                alert('Aniflix web app is ready! Bookmark or Add to Home Screen.');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left"
            >
              <Download className="w-5 h-5 text-zinc-400" />
              <span>Install App</span>
            </button>

            {/* Settings */}
            <Link
              href="/search"
              onClick={onClose}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings className="w-5 h-5 text-zinc-400" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Bottom: Community Links (TikTok & Discord) + Sign In */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://www.tiktok.com/@aniflix3"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[#F47521]/30 hover:border-[#F47521] text-white text-xs font-bold transition-all shadow-sm group"
            >
              <svg
                className="w-4 h-4 text-[#F47521] fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.89-4.49V8.67a8.21 8.21 0 0 0 4.88 1.58V6.8a4.85 4.85 0 0 1-1-.11z" />
              </svg>
              <span>TikTok</span>
            </a>

            <a
              href="https://discord.gg/cfz3HUQeG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 hover:border-[#5865F2] text-white text-xs font-bold transition-all shadow-sm group"
            >
              <svg
                className="w-4 h-4 text-[#5865F2] fill-current group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Discord</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              const splashBtn = document.querySelector('[data-open-unlock]');
              if (splashBtn) (splashBtn as HTMLElement).click();
              else router.push('/unlock-required');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#F47521] hover:bg-[#ff8a3d] text-black font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all cursor-pointer uppercase"
          >
            <Key className="w-4 h-4" />
            <span>Enter Key / Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { slugify } from '@/lib/utils';
import type { AnimeMedia } from '@/types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeMedia[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setResults(data.results || []);
            setSelectedIndex(0);
          }
        }
      } catch {
        // fail silent
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if ((e.ctrlKey || e.metaKey) && query.trim()) {
          // Open all results in /search
          onClose();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        } else if (results.length > 0 && results[selectedIndex]) {
          const picked = results[selectedIndex];
          const title = picked.title.english || picked.title.romaji;
          const slug = slugify(title);
          onClose();
          router.push(`/anime/${slug}?id=${picked.id}`);
        } else if (query.trim()) {
          onClose();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, query, router, onClose]);

  if (!isOpen) return null;

  const handleSelectAnime = (anime: AnimeMedia) => {
    const title = anime.title.english || anime.title.romaji;
    const slug = slugify(title);
    onClose();
    router.push(`/anime/${slug}?id=${anime.id}`);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog matching Image 2 */}
      <div
        className="relative w-full max-w-[620px] bg-[#141414] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime title, character, or studio..."
            className="w-full bg-transparent text-base text-white placeholder-zinc-500 focus:outline-none"
          />

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-400">
              Esc
            </span>
          </div>
        </div>

        {/* Results Area */}
        <div className="max-h-[440px] overflow-y-auto p-2 scrollbar-hide">
          <div className="px-3 pt-2 pb-1.5">
            <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
              {query ? 'ANIME' : 'TRENDING SUGGESTIONS'}
            </span>
          </div>

          {isLoading && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Searching anime catalogue...
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No anime found matching &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((anime, idx) => {
                const title = anime.title.english || anime.title.romaji;
                const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
                const year = anime.seasonYear || '';
                const format = anime.format || 'TV';
                const eps = anime.episodes ? `${anime.episodes} eps` : '';
                const isSelected = selectedIndex === idx;

                const metaParts = [
                  format,
                  year ? String(year) : null,
                  eps || null,
                ].filter(Boolean).join(' · ');

                return (
                  <div
                    key={anime.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleSelectAnime(anime)}
                    className={`group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Poster Thumbnail */}
                      <div className="relative w-10 h-13 rounded-lg overflow-hidden shrink-0 bg-black border border-white/10">
                        <Image
                          src={anime.coverImage.medium || anime.coverImage.large}
                          alt={title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate leading-snug">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                          {score && (
                            <span className="flex items-center gap-0.5 text-[#f59e0b] font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              {score}
                            </span>
                          )}
                          <span>{metaParts}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow on selected item matching Image 2 */}
                    <div className="shrink-0 pl-3">
                      <ArrowRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-zinc-200 translate-x-0.5' : 'text-zinc-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with keyboard shortcuts matching Image 2 */}
        <div className="px-4 py-3 bg-[#0f0f0f] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-300">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-300">↓</kbd>
              <span>navigate</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-300">↵</kbd>
              <span>open</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-300">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-300">↵</kbd>
              <span>all results</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px]">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-white/5 font-mono text-zinc-300">/</kbd>
            <span>or</span>
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-white/5 font-mono text-zinc-300">CtrlK</kbd>
            <span>to search anywhere</span>
          </div>
        </div>
      </div>
    </div>
  );
}

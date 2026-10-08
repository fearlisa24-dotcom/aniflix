'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight, Send } from 'lucide-react';
import type { AnimeDetail } from '@/types';
import { PosterCard } from '@/components/home/PosterCard';

interface WatchDetailsSectionProps {
  anime: AnimeDetail;
  episodeNumber: number;
}

interface Comment {
  id: string;
  author: string;
  initials: string;
  color: string;
  timeAgo: string;
  text: string;
  likes: number;
  dislikes: number;
}

export function WatchDetailsSection({
  anime,
  episodeNumber,
}: WatchDetailsSectionProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'related'>('comments');
  const [sortOrder, setSortOrder] = useState<'best' | 'newest' | 'oldest'>('newest');
  const [commentText, setCommentText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);

  const initialComments: Comment[] = [
    {
      id: '1',
      author: 'AstralUsagi',
      initials: 'A',
      color: 'bg-rose-900',
      timeAgo: '11mo ago',
      text: 'One piece is real',
      likes: 2,
      dislikes: 0,
    },
    {
      id: '2',
      author: 'tsuki56',
      initials: 'T',
      color: 'bg-red-800',
      timeAgo: '11mo ago',
      text: 'Am I First here? Umm.... Onepiece is real.',
      likes: 4,
      dislikes: 0,
    },
  ];

  const [comments, setComments] = useState<Comment[]>(initialComments);

  // Load any local comments for this anime/episode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`comments_${anime.id}_${episodeNumber}`);
      if (saved) {
        setComments(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [anime.id, episodeNumber]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      initials: 'Y',
      color: 'bg-[#e50914]',
      timeAgo: 'Just now',
      text: isSpoiler ? `[Spoiler] ${commentText.trim()}` : commentText.trim(),
      likes: 0,
      dislikes: 0,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setCommentText('');
    setIsSpoiler(false);

    try {
      localStorage.setItem(`comments_${anime.id}_${episodeNumber}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const animeTitle = anime.title.english || anime.title.romaji;
  const streamingEp = anime.streamingEpisodes?.[episodeNumber - 1];
  const episodeTitle = streamingEp?.title || `${animeTitle} Episode ${episodeNumber}`;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const studio = anime.studios?.nodes?.[0]?.name || 'Animation Studio';
  const format = anime.format || 'TV';
  const genres = anime.genres || [];
  const description = anime.description
    ? anime.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : 'No synopsis available.';

  const recommendations = anime.recommendations?.nodes
    ?.filter((n) => n.mediaRecommendation?.coverImage)
    .map((n) => n.mediaRecommendation) || [];

  return (
    <div className="w-full mt-8 bg-[#0a0a0a] text-white">
      {/* Anime Overview Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row items-start gap-5 pb-8 border-b border-white/10">
        {/* Poster */}
        <div className="relative w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10 bg-[#161616]">
          <Image
            src={anime.coverImage.extraLarge || anime.coverImage.large}
            alt={animeTitle}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug mb-1.5">
            {episodeTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 mb-3">
            <span className="font-bold text-white text-sm">
              {animeTitle}
            </span>
            {score && (
              <span className="flex items-center gap-1 font-bold text-[#f59e0b]">
                <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
                {score}
              </span>
            )}
            <span>·</span>
            <span>{format}</span>
            <span>·</span>
            <span>{studio}</span>
          </div>

          {/* Genre tags */}
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {genres.map((g) => (
              <Link
                key={g}
                href={`/search?genre=${encodeURIComponent(g)}`}
                className="bg-white/10 hover:bg-white/20 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full transition-colors font-medium border border-white/5"
              >
                {g}
              </Link>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-4">
            {description}
          </p>
        </div>
      </div>

      {/* Tabs matching Image 2 (Comments | More Like This) */}
      <div className="flex items-center gap-6 mt-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'comments'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Comments
          {activeTab === 'comments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('related')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'related'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          More Like This
          {activeTab === 'related' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e50914]" />
          )}
        </button>
      </div>

      {/* Tab 1: Comments */}
      {activeTab === 'comments' && (
        <div className="mt-6 max-w-4xl">
          {/* Header & Sort */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">
              {comments.length} Comments
            </span>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Sort by:</span>
              {(['best', 'newest', 'oldest'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortOrder(s)}
                  className={`capitalize px-2.5 py-1 rounded transition-colors font-semibold ${
                    sortOrder === s
                      ? 'bg-[#e50914] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Form matching Image 2 */}
          <form onSubmit={handlePostComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm shrink-0">
                ?
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment..."
                  rows={2}
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#e50914]/50 resize-none"
                />

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSpoiler}
                      onChange={(e) => setIsSpoiler(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-[#e50914] focus:ring-0"
                    />
                    Spoiler
                  </label>

                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="bg-[#e50914] hover:bg-[#ff2030] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-lg transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comment Threads */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 text-sm">
                <div className={`w-8 h-8 rounded-full ${c.color} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                  {c.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-200 text-xs">{c.author}</span>
                    <span className="text-[11px] text-zinc-500">{c.timeAgo}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-2">
                    {c.text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{c.dislikes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: More Like This */}
      {activeTab === 'related' && (
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.slice(0, 12).map((rec) => (
              <PosterCard key={rec.id} anime={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

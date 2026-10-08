import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { MegaPlayPlayer } from "@/components/player/MegaPlayPlayer";
import { WatchEpisodeSidebar } from "@/components/watch/WatchEpisodeSidebar";
import { WatchDetailsSection } from "@/components/watch/WatchDetailsSection";
import { getAnimeById, getAnimeBySlug } from "@/lib/anilist";
import type { AnimeDetail } from "@/types";

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { id: string; ep: string };
  searchParams?: { t?: string; lang?: string };
}) {
  const isNumeric = /^\d+$/.test(params.id);
  const episode = parseInt(params.ep, 10) || 1;
  const initialTime = searchParams?.t ? parseFloat(searchParams.t) : undefined;
  const initialLanguage = (searchParams?.lang === "dub" ? "dub" : "sub") as "sub" | "dub";

  let anilistId: number = isNumeric ? parseInt(params.id, 10) : 0;
  let anime: AnimeDetail | null = null;
  let animeName = `Anime #${params.id}`;
  let episodeTitle = `Episode ${episode}`;
  let totalEpisodes = 24;

  try {
    anime = isNumeric
      ? await getAnimeById(anilistId)
      : await getAnimeBySlug(params.id);

    if (anime) {
      anilistId = anime.id;
      animeName = anime.title.english || anime.title.romaji;
      if (anime.episodes) totalEpisodes = anime.episodes;

      // Check if One Piece or long series
      if (/one\s*piece/i.test(animeName)) {
        totalEpisodes = Math.max(totalEpisodes, 1180);
      }

      // Fast non-blocking episode title determination
      const streaming = anime.streamingEpisodes?.[episode - 1];
      episodeTitle = streaming?.title || `Episode ${episode}`;
    }
  } catch {
    // fallback
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-18 sm:pt-20 px-3 sm:px-[4vw] pb-16">
      <div className="max-w-[1550px] mx-auto">
        {/* Top Breadcrumb matching Image 1 */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 mb-4 overflow-hidden text-ellipsis whitespace-nowrap">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <Link
            href={anime ? `/anime/${anime.id}` : "/"}
            className="hover:text-white transition-colors font-semibold truncate max-w-[200px] sm:max-w-none"
          >
            {animeName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-zinc-200 truncate">
            {episodeTitle}
          </span>
        </nav>

        {/* 2-Column Layout: Left Video & Details | Right Episodes Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Player */}
            <MegaPlayPlayer
              anilistId={anilistId}
              episode={episode}
              title={`${animeName} — ${episodeTitle}`}
              totalEpisodes={totalEpisodes}
              initialTime={initialTime}
              initialLanguage={initialLanguage}
              malId={anime?.idMal || undefined}
            />

            {/* Anime Info & Comments Section (Image 2) */}
            {anime && (
              <WatchDetailsSection
                anime={anime}
                episodeNumber={episode}
              />
            )}
          </div>

          {/* Right Sidebar Column (Image 1) */}
          <div className="lg:col-span-4 sticky top-20">
            <WatchEpisodeSidebar
              anilistId={anilistId}
              currentEpisode={episode}
              totalEpisodes={totalEpisodes}
              anime={anime}
              coverImage={anime?.coverImage?.large}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

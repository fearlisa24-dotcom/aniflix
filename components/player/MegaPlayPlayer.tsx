"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getServerEmbed, Language } from "@/lib/sources";
import { saveProgress } from "@/lib/progress";

interface Props {
  anilistId: number;
  episode: number;
  title: string;
  totalEpisodes?: number;
  initialLanguage?: Language;
  malId?: number;
  initialTime?: number;
  prevHref?: string | null;
  nextHref?: string | null;
}

export function MegaPlayPlayer({
  anilistId,
  episode,
  title,
  totalEpisodes,
  initialLanguage = "sub",
  malId,
  initialTime,
  prevHref,
  nextHref,
}: Props) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("aniflix_lang") as Language | null;
      if (savedLang === "sub" || savedLang === "dub") return savedLang;
    }
    return initialLanguage;
  });

  const [isHovered, setIsHovered] = useState(false);

  // Top-level navigation shield — prevents ads from redirecting the current Aniflix tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prevents rogue scripts in embeds from navigating away
      e.preventDefault();
      return (e.returnValue = "");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Popup focus trap — if an ad tries to open on iframe click, immediately pull focus back
  useEffect(() => {
    const handleBlur = () => {
      if (isHovered) {
        setTimeout(() => {
          window.focus();
        }, 150);
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [isHovered]);

  const [resumeTime, setResumeTime] = useState<number>(() => {
    if (initialTime && initialTime > 0) return initialTime;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("aniflix_episodes_progress");
        if (raw) {
          const all = JSON.parse(raw);
          const epProgress = all[String(anilistId)]?.[episode];
          if (epProgress?.time && epProgress.time > 10 && !epProgress.completed) {
            return epProgress.time;
          }
        }
      } catch {
        // ignore
      }
    }
    return 0;
  });

  const handleLangToggle = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("aniflix_lang", newLang);
    }
  };

  useEffect(() => {
    // Keep lang synced in storage
    localStorage.setItem("aniflix_lang", lang);
    // Mark as currently watching
    saveProgress(anilistId, episode, initialTime || 1, 1440);
  }, [anilistId, episode, initialTime, lang]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      let data = event.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data?.event === "time" && data?.time && data?.duration) {
        saveProgress(anilistId, episode, data.time, data.duration);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [anilistId, episode]);

  const embedUrl = getServerEmbed('edge', anilistId, episode, lang, malId, resumeTime);

  const canGoPrev = Boolean(prevHref) || episode > 1;
  const canGoNext = Boolean(nextHref) || (totalEpisodes ? episode < totalEpisodes : true);

  const resolvedPrev = prevHref
    ? `${prevHref.replace(/\?lang=[^&]*/, '')}?lang=${lang}`
    : `/watch/${anilistId}/${episode - 1}?lang=${lang}`;

  const resolvedNext = nextHref
    ? `${nextHref.replace(/\?lang=[^&]*/, '')}?lang=${lang}`
    : `/watch/${anilistId}/${episode + 1}?lang=${lang}`;

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      {/* Controls Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Language selector */}
        <div className="flex gap-2">
          {(["sub", "dub"] as const).map((l) => (
            <button
              key={l}
              onClick={() => handleLangToggle(l)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                lang === l
                  ? "bg-[#F47521] text-black"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {l === "sub" ? "Sub" : "Dub"}
            </button>
          ))}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex gap-2">
          <Link
            href={canGoPrev ? resolvedPrev : "#"}
            prefetch={true}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold border-2 transition-colors ${
              canGoPrev
                ? "border-[#F47521]/40 text-[#F47521] hover:bg-[#F47521]/10"
                : "border-white/10 text-zinc-700 cursor-not-allowed pointer-events-none"
            }`}
          >
            ‹ Prev
          </Link>
          <Link
            href={canGoNext ? resolvedNext : "#"}
            prefetch={true}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold border-2 transition-colors ${
              canGoNext
                ? "border-[#F47521]/40 text-[#F47521] hover:bg-[#F47521]/10"
                : "border-white/10 text-zinc-700 cursor-not-allowed pointer-events-none"
            }`}
          >
            Next ›
          </Link>
        </div>
      </div>

      {/* Video Embed */}
      <div
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-white/5 shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <iframe
          key={`megaplay-${anilistId}-${episode}-${lang}`}
          src={embedUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

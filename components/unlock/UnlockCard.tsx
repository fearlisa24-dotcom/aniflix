"use client";

import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { getPandaGetKeyUrl } from "@/lib/pandauth";

interface Props {
  variant: "splash" | "gate";
  onClose?: () => void;
}

export function UnlockCard({ variant, onClose }: Props) {
  const [hwid, setHwid] = useState("");
  const [key, setKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [status, setStatus] = useState<"idle" | "validating" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function init() {
      const cached = localStorage.getItem("aniflix_hwid");
      if (cached) { setHwid(cached); return; }
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      localStorage.setItem("aniflix_hwid", result.visitorId);
      setHwid(result.visitorId);
    }
    init();
  }, []);

  useEffect(() => {
    if (variant !== "splash") return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onClose]);

  async function submitKey() {
    if (!key.trim() || !hwid) return;
    setStatus("validating");
    setErrorMsg("");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), hwid }),
      });
      const data = await res.json();
      if (data.status === "success") {
        if (typeof window !== "undefined" && window.location.pathname === "/unlock-required") {
          const ref = document.referrer;
          if (ref && ref.includes(window.location.host) && !ref.includes("/unlock-required")) {
            window.location.href = ref;
          } else {
            window.location.href = "/";
          }
        } else {
          window.location.reload();
        }
      } else {
        setStatus("error");
        setErrorMsg(data.message ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  }

  const card = (
    <div
      className="relative bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-[520px] mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      {variant === "splash" && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      )}

      <div className="flex items-center gap-2 mb-6">
        <span className="text-[#F47521] text-2xl font-black">A</span>
        <span className="text-white text-xl font-extrabold tracking-tight">NIFLIX</span>
      </div>

      <h2 className="text-white text-xl sm:text-2xl font-semibold tracking-tight mb-2">
        {variant === "splash" ? "Unlock unlimited anime" : "Unlock this episode"}
      </h2>
      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
        Get your access key to start watching. Each key lasts 24 hours.
      </p>

      <ul className="space-y-3 mb-6">
        {[
          "Every show, every episode — sub and dub",
          "No ads, no interruptions",
          "One key lasts 24 hours. No account needed.",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="text-[#F47521] mt-0.5">✓</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          if (!hwid) return;
          window.open(getPandaGetKeyUrl(hwid), "_blank", "noopener,noreferrer");
        }}
        disabled={!hwid}
        className="w-full bg-[#F47521] hover:bg-[#ff8a3d] disabled:opacity-50 text-black font-bold uppercase tracking-wide rounded-lg py-3.5 px-6 transition-colors text-sm"
      >
        Get Your Key Now
      </button>

      <p className="text-zinc-500 text-[13px] mt-3 text-center">
        You'll complete a quick step to generate your key. Takes about 30 seconds.
      </p>

      <div className="mt-5 text-center">
        <button
          onClick={() => setShowKeyInput((v) => !v)}
          className="text-zinc-400 hover:text-white text-sm underline underline-offset-4 transition-colors"
        >
          Already have a key? Enter it here
        </button>
      </div>

      {showKeyInput && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your key"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#F47521]/50"
          />
          <button
            onClick={submitKey}
            disabled={status === "validating" || !key.trim()}
            className="w-full bg-white/10 hover:bg-white/15 disabled:opacity-50 text-white font-semibold rounded-lg py-3 transition-colors text-sm"
          >
            {status === "validating" ? "Validating..." : "Unlock"}
          </button>
          {status === "error" && (
            <p className="text-red-400 text-[13px] text-center">{errorMsg}</p>
          )}
        </div>
      )}

      {/* Social Links at the bottom: TikTok (orange) & Discord */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center mb-3">
          Join our community & updates
        </p>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://www.tiktok.com/@aniflix3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg bg-black/40 hover:bg-black/70 border border-[#F47521]/40 hover:border-[#F47521] text-white text-xs font-bold transition-all shadow-sm group"
          >
            <svg
              className="w-4 h-4 text-[#F47521] fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.89-4.49V8.67a8.21 8.21 0 0 0 4.88 1.58V6.8a4.85 4.85 0 0 1-1-.11z" />
            </svg>
            <span className="text-zinc-200 group-hover:text-white">TikTok</span>
          </a>

          <a
            href="https://discord.gg/cfz3HUQeG"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 hover:border-[#5865F2] text-white text-xs font-bold transition-all shadow-sm group"
          >
            <svg
              className="w-4 h-4 text-[#5865F2] fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="text-zinc-200 group-hover:text-white">Discord</span>
          </a>
        </div>
      </div>
    </div>
  );

  if (variant === "splash") {
    return (
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {card}
      </div>
    );
  }

  return card;
}

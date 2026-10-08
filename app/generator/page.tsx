'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AniflixLogo } from '@/components/layout/TopNav';
import { KeyRound, Copy, Check, Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function KeyGeneratorPage() {
  const router = useRouter();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const generateNewKey = () => {
    // Generate a formatted 24h key
    const randPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `ANIFLIX-${randPart1}-${randPart2}-24H`;
    setGeneratedKey(key);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleActivate = async () => {
    if (!generatedKey) return;
    setIsActivating(true);

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: generatedKey }),
      });

      if (res.ok) {
        setTimeout(() => {
          router.push('/');
        }, 600);
      }
    } catch {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0a0a] noise-overlay pt-20 pb-16">
      <div className="w-full max-w-[560px] rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <AniflixLogo scale={1.2} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F47521]/10 border border-[#F47521]/20 text-[#F47521] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Access Key Generator</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
          Generate 24-Hour Access Key
        </h1>

        <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto">
          Need a test key or access token? Click below to generate an instant 24-hour pass for Aniflix.
        </p>

        {/* Generator Box */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#F47521]" />
              Generated Access Key
            </span>
            {generatedKey && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Valid for 24 Hours
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg p-3">
            <input
              type="text"
              readOnly
              value={generatedKey || 'Click "Generate Key" below...'}
              className="bg-transparent border-none text-sm sm:text-base font-mono font-medium text-white tracking-wider flex-1 focus:outline-none select-all"
            />
            {generatedKey && (
              <button
                onClick={handleCopy}
                className="p-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Copy Key"
                aria-label="Copy key"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {!generatedKey ? (
            <button
              onClick={generateNewKey}
              className="w-full bg-[#F47521] hover:bg-[#ff8a3d] text-black font-bold uppercase tracking-wide rounded-lg py-3.5 px-6 transition-colors duration-150 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-[#F47521]/15"
            >
              <KeyRound className="w-4 h-4" strokeWidth={2.2} />
              <span>Generate Key Now</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={generateNewKey}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm py-3 px-4 rounded-lg transition-colors"
              >
                Generate Another
              </button>

              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="w-full bg-[#F47521] hover:bg-[#ff8a3d] text-black font-bold uppercase tracking-wide rounded-lg py-3 px-4 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>{isActivating ? 'Activating...' : 'Activate & Watch'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="border-t border-white/5 pt-6 mt-8 text-left space-y-3">
          <h3 className="text-xs uppercase font-semibold text-zinc-400">
            Work.ink Integration Note
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            In production, users get their key by completing a link on <strong className="text-zinc-300">Work.ink</strong>.
            You can configure your custom link in <code className="text-[#F47521] bg-black/40 px-1.5 py-0.5 rounded text-[11px]">.env.local</code> via <code className="text-zinc-300 text-[11px]">NEXT_PUBLIC_WORKINK_LINK</code>.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#F47521]" />
            <span>Keys automatically unlock all anime and episodes for 24 hours.</span>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors underline-offset-4 hover:underline">
            &larr; Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UnlockCard } from '@/components/unlock/UnlockCard';
import { AniflixLogo } from '@/components/layout/TopNav';
import { CheckCircle2, Loader2 } from 'lucide-react';

function UnlockCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || searchParams.get('key');
  const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>(
    token ? 'validating' : 'idle'
  );
  const [message, setMessage] = useState('Validating your access key...');

  useEffect(() => {
    if (!token) return;

    const redirectUrl = searchParams.get('redirect') || '/';
    const hwid =
      (typeof window !== 'undefined' ? localStorage.getItem('aniflix_hwid') : null) ||
      'af_device_id';

    const processToken = async () => {
      try {
        const res = await fetch('/api/validate-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: token.trim(), hwid }),
        });

        const data = await res.json();

        if (data.status === 'success') {
          setStatus('success');
          setMessage('Key validated! You have 24 hours of unlimited access.');
          setTimeout(() => {
            router.push(redirectUrl);
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Could not validate this key. Please try again.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error while validating key.');
      }
    };

    processToken();
  }, [token, searchParams, router]);

  // If no token in URL, render the full UnlockCard so user can get their key
  if (!token) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <UnlockCard variant="gate" />
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black/95 noise-overlay">
      <div className="w-[90%] max-w-[460px] rounded-2xl border border-white/10 bg-zinc-950/90 backdrop-blur-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <AniflixLogo scale={1.2} />
        </div>

        {status === 'validating' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[#F47521] animate-spin" />
            <h2 className="text-xl font-semibold text-white">Validating Key</h2>
            <p className="text-sm text-zinc-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-[#F47521]" />
            <h2 className="text-xl font-semibold text-white">Access Granted!</h2>
            <p className="text-sm text-zinc-400">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-red-400">Validation Issue</h2>
            <p className="text-sm text-zinc-400">{message}</p>
            <button
              onClick={() => router.push('/unlock-required')}
              className="mt-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Back to Unlock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnlockCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-white/20 border-t-[#F47521] rounded-full animate-spin" />
        </div>
      }
    >
      <UnlockCallbackContent />
    </Suspense>
  );
}

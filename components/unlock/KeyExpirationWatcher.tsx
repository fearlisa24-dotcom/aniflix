'use client';

import React, { useEffect, useState, useRef } from 'react';
import { UnlockCard } from './UnlockCard';

export function KeyExpirationWatcher() {
  const [showPrompt, setShowPrompt] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/key-status');
      if (!res.ok) return;
      const data = await res.json();

      if (!data.valid) {
        // When you don't have a valid key, show the notification every 20 seconds
        setShowPrompt(true);
      } else {
        // Has valid key, close prompt if open
        setShowPrompt(false);

        // Schedule auto-notification when expiresAt arrives
        if (data.expiresAt) {
          const msLeft = data.expiresAt - Date.now();
          if (timerRef.current) clearTimeout(timerRef.current);
          if (msLeft > 0) {
            timerRef.current = setTimeout(() => {
              setShowPrompt(true);
            }, msLeft);
          } else {
            setShowPrompt(true);
          }
        }
      }
    } catch {
      // ignore network glitch
    }
  };

  useEffect(() => {
    checkStatus();

    // Check periodically every 20 seconds when user doesn't have a key
    const interval = setInterval(checkStatus, 20000);

    // Recheck whenever tab becomes visible / focused
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkStatus);

    // Listen to custom event to manually trigger unlock modal from anywhere
    const handleOpenUnlock = () => {
      setShowPrompt(true);
    };
    window.addEventListener('aniflix:open-unlock', handleOpenUnlock);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkStatus);
      window.removeEventListener('aniflix:open-unlock', handleOpenUnlock);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <UnlockCard
      variant="splash"
      onClose={() => setShowPrompt(false)}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { UnlockCard } from "./UnlockCard";

export function HomeSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("aniflix_splash_seen")) return;

    async function check() {
      try {
        const res = await fetch("/api/key-status");
        const data = await res.json();
        if (!data.valid) {
          setTimeout(() => setShow(true), 1500);
        }
      } catch {
        // fail silent
      }
    }
    check();
  }, []);

  if (!show) return null;

  return (
    <UnlockCard
      variant="splash"
      onClose={() => {
        sessionStorage.setItem("aniflix_splash_seen", "1");
        setShow(false);
      }}
    />
  );
}

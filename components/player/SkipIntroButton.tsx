'use client';

import React from 'react';
import { SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkipIntroButtonProps {
  onClick: () => void;
}

export function SkipIntroButton({ onClick }: SkipIntroButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute bottom-20 right-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-semibold text-sm rounded-sm hover:bg-accent/90 transition-colors shadow-lg"
    >
      Skip Intro
      <SkipForward className="w-4 h-4" />
    </motion.button>
  );
}

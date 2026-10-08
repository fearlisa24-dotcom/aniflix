'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SourceFallbackProps {
  onRetry: () => void;
  onReport: () => void;
}

export function SourceFallback({ onRetry, onReport }: SourceFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full aspect-video bg-[#0a0a0a] rounded-lg border border-white/10">
      <AlertTriangle className="w-12 h-12 text-accent mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">No Working Source Found</h3>
      <p className="text-sm text-[#b0b0b0] mb-6 text-center max-w-md">
        We tried all available sources but none are working right now.
        This episode may be temporarily unavailable.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button onClick={onReport} className="gap-2">
          Report Broken
        </Button>
      </div>
    </div>
  );
}

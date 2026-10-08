'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Subtitles,
  PictureInPicture2,
  SkipForward,
} from 'lucide-react';
import { SkipIntroButton } from './SkipIntroButton';
import type { VideoSource } from '@/types';

interface VideoPlayerProps {
  sources: VideoSource[];
  onTimeUpdate?: (time: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (sourceIndex: number) => void;
  currentSourceIndex: number;
  title: string;
}

export function VideoPlayer({
  sources,
  onTimeUpdate,
  onEnded,
  onError,
  currentSourceIndex,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const source = sources[currentSourceIndex];

  // Load source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    const loadTimeout = setTimeout(() => {
      if (onError) onError(currentSourceIndex);
    }, 8000);

    if (source.type === 'hls' && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      hlsRef.current = hls;
      hls.loadSource(source.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        clearTimeout(loadTimeout);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          clearTimeout(loadTimeout);
          if (onError) onError(currentSourceIndex);
        }
      });
    } else if (source.type === 'hls' && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source.url;
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(loadTimeout);
        video.play().catch(() => {});
      }, { once: true });
    } else {
      video.src = source.url;
      video.addEventListener('loadedmetadata', () => {
        clearTimeout(loadTimeout);
        video.play().catch(() => {});
      }, { once: true });
    }

    return () => {
      clearTimeout(loadTimeout);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [source, currentSourceIndex, onError]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      const t = video.currentTime;
      const d = video.duration || 0;
      setCurrentTime(t);
      setDuration(d);
      setShowSkipIntro(t >= 0 && t <= 90);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (onTimeUpdate) onTimeUpdate(t, d);
    };
    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    const handleError = () => {
      if (onError) onError(currentSourceIndex);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onEnded, onError, currentSourceIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case 'arrowleft':
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowright':
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'j':
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'l':
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          break;
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'c':
          // Toggle captions placeholder
          break;
        default:
          if (/^[0-9]$/.test(e.key)) {
            video.currentTime = (video.duration || 0) * (parseInt(e.key) / 10);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * (video.duration || 0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const skipIntro = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 90;
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={source?.type === 'embed' ? undefined : togglePlay}
    >
      {source?.type === 'embed' ? (
        <iframe
          src={source.url}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title={title}
        />
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          playsInline
          aria-label={`Playing: ${title}`}
        />
      )}

      {/* Skip Intro */}
      {source?.type !== 'embed' && showSkipIntro && isPlaying && (
        <SkipIntroButton onClick={skipIntro} />
      )}

      {/* Controls overlay */}
      {source?.type !== 'embed' && (
        <div
          className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Progress bar */}
        <div className="relative z-10 px-4 mb-1">
          <div
            className="relative h-1 group/seek cursor-pointer hover:h-2 transition-all rounded-full"
            onClick={handleSeek}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            <div
              className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
              style={{ width: `${bufferedProgress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-accent rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>
        </div>

        {/* Control buttons */}
        <div className="relative z-10 flex items-center gap-2 px-4 pb-3">
          <button
            onClick={togglePlay}
            className="p-1.5 text-white hover:text-accent transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button
              onClick={toggleMute}
              className="p-1.5 text-white hover:text-accent transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-0 group-hover/vol:w-20 transition-all origin-left accent-accent"
              aria-label="Volume"
            />
          </div>

          {/* Time */}
          <span className="text-xs text-white/80 ml-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Right controls */}
          <button
            onClick={() => {}}
            className="p-1.5 text-white hover:text-accent transition-colors"
            aria-label="Subtitles"
          >
            <Subtitles className="w-5 h-5" />
          </button>

          <button
            onClick={() => {}}
            className="p-1.5 text-white hover:text-accent transition-colors"
            aria-label="Quality settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={togglePiP}
            className="p-1.5 text-white hover:text-accent transition-colors"
            aria-label="Picture in picture"
          >
            <PictureInPicture2 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-white hover:text-accent transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

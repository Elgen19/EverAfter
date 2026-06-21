"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  autoplay?: boolean;
  musicType?: "synth" | "url";
  musicUrl?: string;
}

export default function AudioPlayer({ autoplay = false, musicType = "synth", musicUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const isTryingToPlayRef = useRef(false);

  const startAudio = () => {
    if (isPlayingRef.current || isTryingToPlayRef.current) return;

    // Use custom uploaded soundtrack if available, otherwise fall back to the system default soundtrack
    const finalUrl = (musicType === "url" && musicUrl) ? musicUrl : "/cant_help_falling_in_love.mp3";

    if (!audioRef.current) {
      audioRef.current = new Audio(finalUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    isTryingToPlayRef.current = true;
    audioRef.current.play().then(() => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      isTryingToPlayRef.current = false;
    }).catch(err => {
      console.error("Audio play failed:", err);
      isTryingToPlayRef.current = false;
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Try to play if autoplay is true
  useEffect(() => {
    if (autoplay) {
      // Try playing immediately on mount
      startAudio();

      // Fallback: play on first user interaction if blocked
      const handleUserInteraction = () => {
        startAudio();
        window.removeEventListener("click", handleUserInteraction);
      };
      window.addEventListener("click", handleUserInteraction);
      return () => {
        window.removeEventListener("click", handleUserInteraction);
      };
    }
  }, [autoplay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <button
      onClick={togglePlayback}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 100,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(20, 15, 30, 0.6)",
        backdropFilter: "blur(8px)",
        color: isPlaying ? "#ff4b72" : "#a59fb1",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isPlaying 
          ? "0 0 15px rgba(255, 75, 114, 0.3)" 
          : "0 4px 12px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      title={isPlaying ? "Mute Background Music" : "Play Background Music"}
    >
      {isPlaying ? (
        // Speaker playing icon (SVG)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      ) : (
        // Speaker muted icon (SVG)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="22" y1="9" x2="16" y2="15"></line>
          <line x1="16" y1="9" x2="22" y2="15"></line>
        </svg>
      )}
    </button>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  autoplay?: boolean;
  musicType?: "synth" | "url";
  musicUrl?: string;
  preview?: boolean;
  isForcePaused?: boolean;
  onTogglePlayback?: (isPlaying: boolean) => void;
  visible?: boolean;
  floatingPosition?: {
    bottom?: string;
    right?: string;
    left?: string;
    top?: string;
  };
}

// Helper to extract YouTube video ID
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper to extract Spotify Track ID
const getSpotifyTrackId = (url: string) => {
  const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

export default function AudioPlayer({
  autoplay = false,
  musicType = "synth",
  musicUrl,
  preview = false,
  isForcePaused = false,
  onTogglePlayback,
  visible = true,
  floatingPosition
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isPlayingRef = useRef(false);
  const isTryingToPlayRef = useRef(false);
  const wasPlayingBeforeForcePauseRef = useRef(false);

  const youtubeId = (musicType === "url" && musicUrl) ? getYouTubeId(musicUrl) : null;
  const spotifyTrackId = (musicType === "url" && musicUrl) ? getSpotifyTrackId(musicUrl) : null;
  const isEmbed = !!(youtubeId || spotifyTrackId);

  const startAudio = () => {
    if (isPlayingRef.current || isTryingToPlayRef.current) return;

    if (youtubeId) {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: "" }),
          "*"
        );
        isPlayingRef.current = true;
        setIsPlaying(true);
        if (onTogglePlayback) onTogglePlayback(true);
      }
      return;
    }

    if (spotifyTrackId) {
      // Spotify embeds do not support programmatic autoplay/play triggers via API
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (onTogglePlayback) onTogglePlayback(true);
      return;
    }

    // Direct MP3 URL/Synth mode
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
      if (onTogglePlayback) onTogglePlayback(true);
    }).catch(err => {
      console.error("Audio play failed:", err);
      isTryingToPlayRef.current = false;
    });
  };

  const stopAudio = () => {
    if (youtubeId) {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
          "*"
        );
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (onTogglePlayback) onTogglePlayback(false);
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
      startAudio();

      const handleUserInteraction = () => {
        startAudio();
        window.removeEventListener("click", handleUserInteraction);
      };
      window.addEventListener("click", handleUserInteraction);
      return () => {
        window.removeEventListener("click", handleUserInteraction);
      };
    }
  }, [autoplay, youtubeId, spotifyTrackId]);

  // Handle force pause from parent component
  useEffect(() => {
    if (isForcePaused) {
      if (isPlayingRef.current) {
        wasPlayingBeforeForcePauseRef.current = true;
        stopAudio();
      }
    } else {
      if (wasPlayingBeforeForcePauseRef.current) {
        startAudio();
        wasPlayingBeforeForcePauseRef.current = false;
      }
    }
  }, [isForcePaused]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const posStyles = {
    position: (preview ? "absolute" : "fixed") as any,
    bottom: floatingPosition?.bottom || (preview ? "16px" : "24px"),
    right: floatingPosition?.right || (preview ? "16px" : "24px"),
    left: floatingPosition?.left || undefined,
    top: floatingPosition?.top || undefined,
    zIndex: 1000
  };

  return (
    <>
      {/* Hidden YouTube Iframe Player */}
      {youtubeId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=${autoplay ? 1 : 0}&loop=1&playlist=${youtubeId}&mute=0&controls=0&showinfo=0`}
          style={{
            position: "fixed",
            width: "1px",
            height: "1px",
            opacity: 0.01,
            pointerEvents: "none",
            bottom: "0",
            right: "0",
            zIndex: -100
          }}
          allow="autoplay"
        />
      )}

      {/* Floating Spotify Embed Widget */}
      {spotifyTrackId && (
        <div 
          className="glass" 
          style={{
            ...posStyles,
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px",
            background: "rgba(20, 15, 30, 0.75)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: visible ? "block" : "none",
            animation: "fade-in-btn 0.5s ease"
          }}
        >
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyTrackId}`}
            width="280"
            height="80"
            frameBorder="0"
            allow="encrypted-media"
            style={{ borderRadius: "12px", display: "block" }}
          />
        </div>
      )}

      {/* Control Button for YouTube / MP3 / Synth tracks */}
      {!spotifyTrackId && (
        <button
          onClick={togglePlayback}
          style={{
            ...posStyles,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(20, 15, 30, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: isPlaying ? "#ff4b72" : "#a59fb1",
            cursor: "pointer",
            display: visible ? "flex" : "none",
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="22" y1="9" x2="16" y2="15"></line>
              <line x1="16" y1="9" x2="22" y2="15"></line>
            </svg>
          )}
        </button>
      )}
    </>
  );
}

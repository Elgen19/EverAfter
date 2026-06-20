"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioMessageProps {
  audioMessage: {
    enabled: boolean;
    audioUrl?: string;
    customMessage?: string;
  };
  onComplete: () => void;
  theme?: string;
}

type Stage = "statement-enter" | "statement-visible" | "statement-exit" | "player-enter" | "player-ready";

export default function AudioMessage({ audioMessage, onComplete, theme = "scroll" }: AudioMessageProps) {
  const [stage, setStage] = useState<Stage>("statement-enter");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id") || searchParams.get("d") || "default";
      const key = `audio_opened_${id.slice(0, 10)}`;
      if (sessionStorage.getItem(key) === "true") {
        setStage("player-ready");
      }
    }
  }, []);

  // Sequence Timer Control
  useEffect(() => {
    // Stage 1: statement-enter (0s - 1.5s)
    const t1 = setTimeout(() => {
      setStage(prev => prev === "statement-enter" ? "statement-visible" : prev);
    }, 1500);

    // Stage 2: statement-visible (1.5s - 4.5s)
    const t2 = setTimeout(() => {
      setStage(prev => prev === "statement-visible" ? "statement-exit" : prev);
    }, 4500);

    // Stage 3: statement-exit (4.5s - 6.0s)
    const t3 = setTimeout(() => {
      setStage(prev => prev === "statement-exit" ? "player-enter" : prev);
    }, 6000);

    // Stage 4: player-enter (6.0s - 7.5s)
    const t4 = setTimeout(() => {
      setStage(prev => {
        if (prev === "player-enter") {
          if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const id = searchParams.get("id") || searchParams.get("d") || "default";
            const key = `audio_opened_${id.slice(0, 10)}`;
            sessionStorage.setItem(key, "true");
          }
          return "player-ready";
        }
        return prev;
      });
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const skipToPlayer = () => {
    if (stage === "statement-enter" || stage === "statement-visible" || stage === "statement-exit" || stage === "player-enter") {
      setStage("player-ready");
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get("id") || searchParams.get("d") || "default";
        const key = `audio_opened_${id.slice(0, 10)}`;
        sessionStorage.setItem(key, "true");
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasPlayedOnce(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case "royal":
        return {
          border: "rgba(201, 162, 39, 0.6)",
          buttonBg: "#7B1E1E",
          shadow: "rgba(123, 30, 30, 0.4)",
          accent: "#C9A227"
        };
      case "blush":
        return {
          border: "rgba(183, 110, 121, 0.6)",
          buttonBg: "#B76E79",
          shadow: "rgba(183, 110, 121, 0.4)",
          accent: "#E8B4B8"
        };
      case "lavender":
        return {
          border: "rgba(156, 108, 250, 0.5)",
          buttonBg: "var(--accent-purple)",
          shadow: "rgba(156, 108, 250, 0.35)",
          accent: "#c3b1e1"
        };
      case "celestial":
        return {
          border: "rgba(226, 184, 87, 0.4)",
          buttonBg: "var(--accent-rose)",
          shadow: "rgba(255, 75, 114, 0.4)",
          accent: "#e2b857"
        };
      default:
        return {
          border: "rgba(226, 184, 87, 0.5)",
          buttonBg: "var(--accent-rose)",
          shadow: "rgba(255, 75, 114, 0.45)",
          accent: "var(--accent-rose)"
        };
    }
  };

  const colors = getThemeColors();
  const isStatementStage = stage === "statement-enter" || stage === "statement-visible" || stage === "statement-exit";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        minHeight: "360px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <style>{`
        .dramatic-text-enter {
          opacity: 0;
          filter: blur(12px);
          transform: scale(0.92) translateY(10px);
        }
        .dramatic-text-visible {
          opacity: 1;
          filter: blur(0px);
          transform: scale(1) translateY(0px);
          transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1), filter 1.5s cubic-bezier(0.25, 1, 0.5, 1), transform 1.5s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .dramatic-text-exit {
          opacity: 0;
          filter: blur(12px);
          transform: scale(1.05) translateY(-10px);
          transition: opacity 1.5s cubic-bezier(0.25, 1, 0.5, 1), filter 1.5s cubic-bezier(0.25, 1, 0.5, 1), transform 1.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .player-box-enter {
          opacity: 0;
          transform: scale(0.96) translateY(20px);
        }
        .player-box-ready {
          opacity: 1;
          transform: scale(1) translateY(0px);
          transition: opacity 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes ping-wave {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        
        .custom-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.15);
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: transform 0.1s;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
        }

        .custom-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: transform 0.1s;
        }

        .custom-slider::-moz-range-thumb:hover {
          transform: scale(1.25);
        }
      `}</style>

      {/* Act 1: Dramatic Statement Entrance */}
      {isStatementStage && (
        <div
          className={
            stage === "statement-enter" 
              ? "dramatic-text-enter" 
              : stage === "statement-visible" 
                ? "dramatic-text-visible" 
                : "dramatic-text-exit"
          }
          onClick={skipToPlayer}
          style={{
            width: "100%",
            padding: "40px 30px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            background: "rgba(20, 15, 30, 0.75)",
            border: `1.5px solid ${colors.border}`,
            borderRadius: "20px",
            boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 10px ${colors.shadow}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            cursor: "pointer",
            minHeight: "360px",
            boxSizing: "border-box",
            position: "relative"
          }}
          title="Click to skip intro"
        >
          {/* Animated pulsing glow icon */}
          <div 
            style={{ 
              fontSize: "44px", 
              animation: "heartbeat-survey 1.8s infinite ease-in-out",
              filter: `drop-shadow(0 0 8px ${colors.accent})`
            }}
          >
            ✨
          </div>
          
          <p
            style={{
              fontSize: "26px",
              fontStyle: "italic",
              fontFamily: "var(--font-cursive)",
              color: "#fff",
              lineHeight: "1.6",
              margin: 0,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.6)",
              padding: "0 10px"
            }}
          >
            {audioMessage.customMessage ? `"${audioMessage.customMessage}"` : "Listen to a special voice recording left for you..."}
          </p>

          {/* Subtle Skip Hint */}
          <span 
            style={{ 
              position: "absolute", 
              bottom: "16px", 
              right: "20px", 
              fontSize: "11px", 
              color: "rgba(255, 255, 255, 0.45)", 
              letterSpacing: "0.5px", 
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "var(--font-ui), sans-serif",
              fontWeight: 600,
              pointerEvents: "none"
            }}
          >
            Skip Intro ➔
          </span>
        </div>
      )}

      {/* Act 2: Audio Player Entrance */}
      {!isStatementStage && (
        <div
          className={stage === "player-enter" ? "player-box-enter" : "player-box-ready"}
          style={{
            width: "100%",
            padding: "40px 30px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
            background: "rgba(20, 15, 30, 0.85)",
            border: `1.5px solid ${colors.border}`,
            borderRadius: "20px",
            boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#fff",
            minHeight: "360px",
            boxSizing: "border-box"
          }}
        >
          {/* Wave / Pulse Header Icon */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                position: "relative",
                zIndex: 2,
              }}
            >
              🎤
            </div>
            {isPlaying && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: `2px solid ${colors.accent}`,
                    animation: "ping-wave 1.5s infinite ease-out",
                    opacity: 0.8,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: `2px solid ${colors.accent}`,
                    animation: "ping-wave 1.5s infinite ease-out 0.75s",
                    opacity: 0.4,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              </>
            )}
          </div>

          {/* Title and Caption */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: colors.accent,
                fontWeight: "bold",
              }}
            >
              Voice Message
            </span>
            {audioMessage.customMessage ? (
              <p
                style={{
                  fontSize: "22px",
                  fontStyle: "italic",
                  fontFamily: "var(--font-cursive)",
                  color: "#fff",
                  lineHeight: "1.4",
                  margin: "8px 0 0 0",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                }}
              >
                "{audioMessage.customMessage}"
              </p>
            ) : (
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#fff",
                  lineHeight: "1.4",
                  margin: "8px 0 0 0",
                }}
              >
                Listen to the voice recording left for you.
              </p>
            )}
          </div>

          {/* Interactive Player Controls */}
          {audioMessage.audioUrl ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "24px 20px",
                boxSizing: "border-box"
              }}
            >
              {/* Play / Pause button */}
              <button
                onClick={toggleAudio}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: colors.buttonBg,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 6px 16px ${colors.shadow}, inset 0 2px 4px rgba(255, 255, 255, 0.2)`,
                  transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                title={isPlaying ? "Pause voice message" : "Play voice message"}
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "3px" }}>
                    <polygon points="5 3 19 12 5 21" />
                  </svg>
                )}
              </button>

              {/* Slider Seekbar */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="custom-slider"
                  style={{
                    background: `linear-gradient(to right, ${colors.accent} ${
                      duration ? (currentTime / duration) * 100 : 0
                    }%, rgba(255, 255, 255, 0.15) ${
                      duration ? (currentTime / duration) * 100 : 0
                    }%)`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 0)}</span>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={audioMessage.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                style={{ display: "none" }}
              />
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              No audio recording found.
            </div>
          )}

          {/* Wizard step complete control */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
              }
              onComplete();
            }}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: colors.buttonBg,
              backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${colors.shadow}`,
              transition: "transform 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {hasPlayedOnce ? "Continue 💖" : "Skip & Continue 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

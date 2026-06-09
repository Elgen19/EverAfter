"use client";

import React, { useState, useEffect, useRef } from "react";

interface MusicCreatorProps {
  music: boolean;
  setMusic: (val: boolean) => void;
  musicType: "synth" | "url";
  setMusicType: (val: "synth" | "url") => void;
  musicUrl: string;
  setMusicUrl: (val: string) => void;
}

export default function MusicCreator({
  music,
  setMusic,
  musicType,
  setMusicType,
  musicUrl,
  setMusicUrl
}: MusicCreatorProps) {
  // Local audio preview players
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewCtxRef = useRef<AudioContext | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  const stopAllPreviews = () => {
    // Stop HTML Audio
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    // Stop Web Audio Synth
    if (previewCtxRef.current) {
      try {
        previewCtxRef.current.close();
      } catch {}
      previewCtxRef.current = null;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setPlayingPreviewId(null);
  };

  const playUrlPreview = (url: string, id: string) => {
    stopAllPreviews();
    setPlayingPreviewId(id);
    
    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.loop = false; // Just play a preview snippet
    previewAudioRef.current = audio;

    audio.play().then(() => {
      // Auto stop preview after 10 seconds
      previewTimerRef.current = setTimeout(() => {
        stopAllPreviews();
      }, 10000);
    }).catch(err => {
      console.error("Preview play failed:", err);
      stopAllPreviews();
    });
  };

  const playSynthPreview = (id: string) => {
    stopAllPreviews();
    setPlayingPreviewId(id);

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    previewCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.4;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.3;
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFeedback.connect(masterGain);

    const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.5) => {
      if (ctx.state === "closed") return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, start);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      gain.connect(delay);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration + 0.1);
    };

    const now = ctx.currentTime;
    // Cmaj9 chord notes
    const chords = [130.81, 196.00, 246.94, 293.66, 329.63];
    chords.forEach((freq, idx) => {
      playNote(freq, now, 3.5, idx === 0 ? "triangle" : "sine", idx === 0 ? 0.3 : 0.2);
    });

    // Melodic bells
    const bells = [329.63, 392.00, 440.00, 523.25, 659.25];
    bells.forEach((freq, idx) => {
      playNote(freq, now + 0.5 + idx * 0.6, 1.5, "sine", 0.15);
    });

    // Auto stop preview after 4 seconds
    previewTimerRef.current = setTimeout(() => {
      stopAllPreviews();
    }, 4500);
  };

  // Handle preview playing when soundtrack is clicked
  const handleTrackSelect = (track: { id: string; type: string; url: string }) => {
    if (track.id === "custom") {
      setMusicType("url");
      const currentIsPreset = musicUrl === "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" || 
                             musicUrl === "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" || 
                             musicUrl === "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
      if (currentIsPreset || !musicUrl) {
        setMusicUrl("");
      }
      stopAllPreviews();
    } else {
      setMusicType(track.type as "synth" | "url");
      setMusicUrl(track.url);
      
      // Play Preview!
      if (track.type === "synth") {
        playSynthPreview(track.id);
      } else if (track.url) {
        playUrlPreview(track.url, track.id);
      }
    }
  };

  // Stop preview on unmount or if music is toggled off
  useEffect(() => {
    if (!music) {
      stopAllPreviews();
    }
  }, [music]);

  useEffect(() => {
    return () => stopAllPreviews();
  }, []);

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: "12px",
        background: "rgba(255,255,255,0.02)", 
        padding: "16px", 
        borderRadius: "10px",
        border: "1px solid var(--border-card)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "bold" }}>Background Music</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Romantic soundtrack playing for the recipient (Normally Off)</div>
        </div>
        <button
          type="button"
          onClick={() => setMusic(!music)}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: music ? "var(--accent-rose)" : "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div 
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              position: "absolute",
              top: "3px",
              left: music ? "23px" : "3px",
              transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>

      {music && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>Select Soundtrack</label>
            {playingPreviewId && (
              <span style={{ fontSize: "10px", color: "var(--accent-rose)", animation: "pulse 1.5s infinite" }}>
                🔊 Playing Preview...
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              { id: "synth", name: "🔔 Bells Synthesizer (Bells Synth)", type: "synth", url: "" },
              { id: "track1", name: "🌊 Breezy Chillwave (System Track 1)", type: "url", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
              { id: "track2", name: "🎷 Smooth Jazz-Vibe (System Track 2)", type: "url", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
              { id: "track3", name: "💭 Dreamy Ambient (System Track 3)", type: "url", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
              { id: "custom", name: "🔗 Custom Music Link (URL)", type: "url", url: "custom" }
            ].map((track) => {
              const isSelected = track.id === "custom" 
                ? (musicType === "url" && musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" && musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" && musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3")
                : (track.type === "synth" ? musicType === "synth" : (musicType === "url" && musicUrl === track.url));

              const isPlaying = playingPreviewId === track.id;

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleTrackSelect(track)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    textAlign: "left",
                    backgroundColor: isSelected ? "rgba(255, 75, 114, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: "1px solid " + (isPlaying ? "var(--accent-rose)" : (isSelected ? "var(--accent-rose)" : "var(--border-card)")),
                    color: isSelected ? "#fff" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>{track.name}</span>
                  {isPlaying && <span>🎵</span>}
                </button>
              );
            })}
          </div>

          {(musicType === "url" && 
            musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" && 
            musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" && 
            musicUrl !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
          ) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Paste Audio Link (MP3 / WAV / OGG)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://example.com/soundtrack.mp3"
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (musicUrl.trim()) {
                      playUrlPreview(musicUrl, "custom");
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "var(--accent-purple)",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Preview
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

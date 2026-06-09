"use client";

import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  autoplay?: boolean;
  musicType?: "synth" | "url";
  musicUrl?: string;
}

export default function AudioPlayer({ autoplay = false, musicType = "synth", musicUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAudio = () => {
    if (isPlayingRef.current) return;

    if (musicType === "url" && musicUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(musicUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.35;
      }
      audioRef.current.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio URL play failed:", err);
      });
      return;
    }
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    isPlayingRef.current = true;
    setIsPlaying(true);

    // Master Volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Reverb/Delay effect (Simulated via a delay node)
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.5;
    const delayFeedback = ctx.createGain();
    delayFeedback.gain.value = 0.4;
    
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delayFeedback.connect(masterGain);

    // Synth function
    const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.5) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      // Lowpass filter to make it warmer
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, start);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      // also route to delay for spatial width
      gain.connect(delay);

      // Envelope: Slow attack and long release
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration + 0.1);
    };

    // Frequencies mapping
    const notes = {
      C3: 130.81, E3: 164.81, G3: 196.00, B3: 246.94, D4: 293.66,
      A2: 110.00, C4: 261.63, E4: 329.63, G4: 392.00,
      F2: 87.31,  A3: 220.00, C5: 523.25, E5: 659.25,
      G2: 98.00,  D3: 146.83, F3: 174.61, G3_h: 392.00, B4: 493.88
    };

    const chords = [
      // Cmaj9
      [notes.C3, notes.G3, notes.B3, notes.D4, notes.E4],
      // Am9
      [notes.A2, notes.E3, notes.G3, notes.C4, notes.E4],
      // Fmaj9
      [notes.F2, notes.C3, notes.A3, notes.E4, notes.G4],
      // G11 (G7 sus)
      [notes.G2, notes.D3, notes.F3, notes.B3, notes.D4]
    ];

    const pentatonicBells = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

    let step = 0;
    const playLoop = () => {
      if (!isPlayingRef.current || ctx.state === "closed") return;
      
      const now = ctx.currentTime;
      const currentChord = chords[step % chords.length];

      // Play soft backing pads (Triangle for warm bass, Sine for mids)
      currentChord.forEach((freq, idx) => {
        const isBass = idx === 0;
        playNote(
          freq, 
          now, 
          5.0, 
          isBass ? "triangle" : "sine", 
          isBass ? 0.3 : 0.2
        );
      });

      // Spawn random bell melody notes over next 4 seconds
      const melodyCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 melody notes
      for (let i = 0; i < melodyCount; i++) {
        const bellFreq = pentatonicBells[Math.floor(Math.random() * pentatonicBells.length)];
        const bellTime = now + (i * (4 / melodyCount)) + (Math.random() * 0.3);
        playNote(bellFreq, bellTime, 1.8, "sine", 0.15);
      }

      step++;
      
      // Schedule next chord
      timerRef.current = setTimeout(playLoop, 4000);
    };

    playLoop();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
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

  // Try to play if autoplay is true and clicked anywhere
  useEffect(() => {
    if (autoplay) {
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
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
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

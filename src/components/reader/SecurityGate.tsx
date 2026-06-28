"use client";

import React, { useState, useEffect, useRef } from "react";

interface SecurityGateProps {
  securityData: {
    type: "date" | "boolean" | "choice";
    question: string;
    answer: string;
    choices?: string[];
  };
  onSuccess: () => void;
  preview?: boolean;
}

const PadlockSVG = () => (
  <svg 
    width="60" 
    height="75" 
    viewBox="0 0 24 30" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{
      color: "var(--accent-gold)",
      filter: "drop-shadow(0 0 10px rgba(226, 184, 87, 0.5))",
      animation: "float-padlock 4s ease-in-out infinite"
    }}
  >
    {/* Lock Shackle */}
    <path 
      d="M6 10V6a6 6 0 0 1 12 0v4" 
      stroke="url(#shackle-grad)" 
      strokeWidth="2"
      strokeDasharray="40"
      strokeDashoffset="0"
      style={{
        animation: "shackle-pulse 3s ease-in-out infinite"
      }}
    />
    
    {/* Lock Body */}
    <rect 
      x="2" 
      y="10" 
      width="20" 
      height="16" 
      rx="4" 
      fill="url(#body-grad)" 
      stroke="var(--accent-gold)" 
      strokeWidth="1.5"
    />
    
    {/* Keyhole */}
    <circle cx="12" cy="16" r="2.5" fill="#0b0711" stroke="var(--accent-gold)" strokeWidth="1" />
    <path d="M12 18.5 L12 21.5 L10.5 22.5 L13.5 22.5 Z" fill="var(--accent-gold)" />
    
    {/* Gradients */}
    <defs>
      <linearGradient id="shackle-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b38f36" />
        <stop offset="50%" stopColor="#ffd875" />
        <stop offset="100%" stopColor="#b38f36" />
      </linearGradient>
      <linearGradient id="body-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(30, 20, 10, 0.95)" />
        <stop offset="50%" stopColor="rgba(226, 184, 87, 0.15)" />
        <stop offset="100%" stopColor="rgba(10, 7, 18, 0.95)" />
      </linearGradient>
    </defs>
  </svg>
);

const HeartOrnamentSVG = () => (
  <svg 
    width="52" 
    height="48" 
    viewBox="0 0 24 22" 
    fill="none" 
    style={{
      filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.55))",
      animation: "float-padlock 3.5s ease-in-out infinite",
      zIndex: 2,
      position: "relative"
    }}
  >
    <path 
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
      fill="url(#heart-gold-grad)" 
      stroke="#ffd700" 
      strokeWidth="1.5"
    />
    <defs>
      <linearGradient id="heart-gold-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
        <stop offset="50%" stopColor="rgba(255, 215, 0, 0.4)" />
        <stop offset="100%" stopColor="rgba(179, 143, 54, 0.2)" />
      </linearGradient>
    </defs>
  </svg>
);

const MONTHS_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const SharedDefs = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <linearGradient id="gold-metal-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#b38f36" />
        <stop offset="30%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#fff7d0" />
        <stop offset="70%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#b38f36" />
      </linearGradient>
      <radialGradient id="ruby-grad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ff4d6d" />
        <stop offset="40%" stopColor="#c70039" />
        <stop offset="80%" stopColor="#900c3f" />
        <stop offset="100%" stopColor="#581845" />
      </radialGradient>
    </defs>
  </svg>
);

const GoldCornerOrnament = ({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) => {
  let style: React.CSSProperties = { position: "absolute", zIndex: 15 };
  let transform = "";

  if (position === "top-left") {
    style.top = "-4px";
    style.left = "-4px";
  } else if (position === "top-right") {
    style.top = "-4px";
    style.right = "-4px";
    transform = "rotate(90deg)";
  } else if (position === "bottom-right") {
    style.bottom = "-4px";
    style.right = "-4px";
    transform = "rotate(180deg)";
  } else if (position === "bottom-left") {
    style.bottom = "-4px";
    style.left = "-4px";
    transform = "rotate(270deg)";
  }

  return (
    <svg 
      width="44" 
      height="44" 
      viewBox="0 0 44 44" 
      style={{ ...style, transform }}
    >
      <path 
        d="M 0 0 L 44 0 Q 30 14 14 14 Q 14 30 0 44 Z" 
        fill="url(#gold-metal-grad)" 
        stroke="#8a6f27"
        strokeWidth="1"
      />
      <path 
        d="M 6 6 Q 16 12 12 20 Q 20 12 6 6 Z M 6 6 Q 12 16 20 12" 
        fill="none" 
        stroke="#fff" 
        strokeWidth="0.8" 
        opacity="0.4" 
      />
      <circle cx="13" cy="13" r="7" fill="#8a6f27" stroke="#ffd700" strokeWidth="0.8" />
      <circle 
        cx="13" 
        cy="13" 
        r="5" 
        fill="url(#ruby-grad)" 
        filter="drop-shadow(0 0 3px rgba(255, 77, 109, 0.8))"
      />
    </svg>
  );
};

const SelectorCapLeft = () => (
  <svg 
    width="16" 
    height="40" 
    viewBox="0 0 16 40" 
    style={{ 
      position: "absolute", 
      left: "-6px", 
      top: "50%", 
      transform: "translateY(-50%)", 
      zIndex: 12 
    }}
  >
    <path 
      d="M 16 0 C 6 4, 0 12, 0 20 C 0 28, 6 36, 16 40 Z" 
      fill="#8c111e" 
      stroke="url(#gold-metal-grad)" 
      strokeWidth="2" 
    />
    <path 
      d="M 12 6 Q 6 12 6 20 Q 6 28 12 34" 
      fill="none" 
      stroke="#ffd700" 
      strokeWidth="1" 
    />
  </svg>
);

const SelectorCapRight = () => (
  <svg 
    width="16" 
    height="40" 
    viewBox="0 0 16 40" 
    style={{ 
      position: "absolute", 
      right: "-6px", 
      top: "50%", 
      zIndex: 12,
      transform: "translateY(-50%) scaleX(-1)" 
    }}
  >
    <path 
      d="M 16 0 C 6 4, 0 12, 0 20 C 0 28, 6 36, 16 40 Z" 
      fill="#8c111e" 
      stroke="url(#gold-metal-grad)" 
      strokeWidth="2" 
    />
    <path 
      d="M 12 6 Q 6 12 6 20 Q 6 28 12 34" 
      fill="none" 
      stroke="#ffd700" 
      strokeWidth="1" 
    />
  </svg>
);

const DrumColumn = ({
  value,
  options,
  onUp,
  onDown,
  currentIndex,
  width = "70px",
  isMonth = false,
  isYear = false
}: {
  value: number;
  options: string[];
  onUp: () => void;
  onDown: () => void;
  currentIndex: number;
  width?: string;
  isMonth?: boolean;
  isYear?: boolean;
}) => {
  const idxSelected = currentIndex;
  const idxPrev = (currentIndex - 1 + options.length) % options.length;
  const idxPrevPrev = (currentIndex - 2 + options.length) % options.length;
  const idxNext = (currentIndex + 1) % options.length;
  const idxNextNext = (currentIndex + 2) % options.length;

  return (
    <div 
      onWheel={(e) => {
        if (e.deltaY < 0) {
          onUp();
        } else if (e.deltaY > 0) {
          onDown();
        }
      }}
      onTouchStart={(e) => {
        const touchY = e.touches[0].clientY;
        (e.currentTarget as any)._touchStartY = touchY;
      }}
      onTouchEnd={(e) => {
        const startY = (e.currentTarget as any)._touchStartY;
        if (startY !== undefined) {
          const endY = e.changedTouches[0].clientY;
          const diff = startY - endY;
          if (diff > 25) {
            onDown();
          } else if (diff < -25) {
            onUp();
          }
        }
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: "calc(100% - 12px)",
        margin: "6px 0",
        background: "linear-gradient(to right, #330206 0%, #730e18 20%, #a61b29 50%, #730e18 80%, #330206 100%)",
        borderRadius: "8px",
        boxShadow: "inset 0 12px 24px rgba(0,0,0,0.8), inset 0 -12px 24px rgba(0,0,0,0.8)",
        position: "relative",
        cursor: "ns-resize",
        userSelect: "none"
      }}
    >
      {/* Clickable Top Area */}
      <div 
        onClick={onUp}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "40%",
          zIndex: 10
        }}
      />

      {/* Clickable Bottom Area */}
      <div 
        onClick={onDown}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          zIndex: 10
        }}
      />

      {/* 5 Visible Rows */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
        {/* Topmost */}
        <span style={{
          fontSize: "14px",
          fontFamily: "Georgia, serif",
          color: "#ffe8a3",
          opacity: 0.25,
          transform: "rotateX(55deg) scale(0.72) translateY(-4px)",
          transition: "all 0.2s"
        }}>
          {options[idxPrevPrev]}
        </span>

        {/* Top */}
        <span style={{
          fontSize: "17px",
          fontFamily: "Georgia, serif",
          color: "#ffd700",
          opacity: 0.55,
          transform: "rotateX(28deg) scale(0.88) translateY(-2px)",
          transition: "all 0.2s"
        }}>
          {options[idxPrev]}
        </span>

        {/* Center (Selected) */}
        <span style={{
          fontSize: "23px",
          fontFamily: "Georgia, serif",
          fontWeight: "bold",
          color: "#ffffff",
          transform: "scale(1.08)",
          transition: "all 0.2s",
          zIndex: 6,
          textShadow: "0 0 12px rgba(255, 255, 255, 1), 0 0 6px rgba(255, 215, 0, 0.8), 0 1px 1px #000"
        }}>
          {isMonth ? `~${options[idxSelected]}` : (isYear ? `${options[idxSelected]}~` : options[idxSelected])}
        </span>

        {/* Bottom */}
        <span style={{
          fontSize: "17px",
          fontFamily: "Georgia, serif",
          color: "#ffd700",
          opacity: 0.55,
          transform: "rotateX(-28deg) scale(0.88) translateY(2px)",
          transition: "all 0.2s"
        }}>
          {options[idxNext]}
        </span>

        {/* Bottommost */}
        <span style={{
          fontSize: "14px",
          fontFamily: "Georgia, serif",
          color: "#ffe8a3",
          opacity: 0.25,
          transform: "rotateX(-55deg) scale(0.72) translateY(4px)",
          transition: "all 0.2s"
        }}>
          {options[idxNextNext]}
        </span>
      </div>
    </div>
  );
};

export default function SecurityGate({ securityData, onSuccess, preview = false }: SecurityGateProps) {
  const [shaking, setShaking] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [showInputs, setShowInputs] = useState(preview);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // YES/NO swipe states
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);

  // Date dials states
  const [dialMonth, setDialMonth] = useState(6);
  const [dialDay, setDialDay] = useState(8);
  const [dialYear, setDialYear] = useState(2026);
  const isDateType = securityData.type === "date";
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id");
      const d = searchParams.get("d");
      const key = id ? `unlocked_${id}` : (d ? `unlocked_${d.slice(0, 10)}` : "unlocked_temp");
      if (sessionStorage.getItem(key) === "true") {
        onSuccess();
        return;
      }
    }

    if (preview) {
      setShowInputs(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowInputs(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [onSuccess, preview]);

  const checkAnswer = async (answerProvided: string) => {
    let correct = securityData.answer.trim().toLowerCase();
    let provided = answerProvided.trim().toLowerCase();

    // Map True/False to Yes/No
    if (correct === "true") correct = "yes";
    if (correct === "false") correct = "no";
    if (provided === "true") provided = "yes";
    if (provided === "false") provided = "no";

    // Check if the correct answer is a SHA-256 hash (64-char hex string)
    const isSha256 = /^[a-f0-9]{64}$/i.test(correct);

    let match = false;
    if (isSha256) {
      try {
        const msgUint8 = new TextEncoder().encode(provided);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        match = (hashHex === correct);
      } catch (err) {
        console.error("Hashing error during validation:", err);
      }
    } else {
      match = (correct === provided || (correct.length === 1 && provided.startsWith(correct + ")")));
    }

    if (match) {
      setSecurityError("");
      onSuccess();
    } else {
      setSecurityError("A sweet guess, but that's not the key to my heart... Try again, darling! 💖");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setSecurityError("");
      }, 4000);
    }
  };

  const playClickSound = (freq: number) => {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch {}
    }
  };

  return (
    <div 
      className={`${shaking ? "shake-anim" : ""} animate-reveal hide-scrollbar`}
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "20px 0",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "float-up-intro 0.6s ease",
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        background: "transparent",
        border: "none",
        borderRadius: "0",
        boxShadow: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <style>{`
        @keyframes float-padlock {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes shackle-pulse {
          0%, 100% { stroke-width: 1.5px; opacity: 0.85; }
          50% { stroke-width: 2.2px; opacity: 1; filter: drop-shadow(0 0 6px rgba(226, 184, 87, 0.8)); }
        }
      `}</style>
      <style>{`
        @keyframes fadeInSecurityQuestion {
          from { transform: scale(0.98); filter: blur(2px); }
          to { transform: scale(1); filter: blur(0); }
        }
        @keyframes fadeInSecurityInputs {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes questionPulse {
          0%, 100% { text-shadow: 0 2px 15px rgba(255, 215, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.8); }
          50% { text-shadow: 0 2px 25px rgba(255, 215, 0, 0.7), 0 2px 8px rgba(255, 215, 0, 0.35); }
        }
      `}</style>

      <div 
        style={{ 
          opacity: 1,
          fontSize: "46px",
          fontFamily: "var(--font-cursive)",
          fontWeight: "normal",
          color: "#ffd700",
          lineHeight: "1.3",
          margin: "2px 0 0 0",
          zIndex: 2,
          textShadow: "0 2px 15px rgba(255, 215, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.8)",
          animation: "fadeInSecurityQuestion 1.5s ease-in-out 0.2s forwards, questionPulse 4s infinite ease-in-out"
        }}
      >
        {securityData.question}
      </div>

      {/* Ornate Gold Pearl Divider SVG (Responsive stretch matching width of choices) */}
      <div style={{ display: "flex", width: "100%", padding: "0 10px", margin: "14px 0 22px 0", opacity: 0.9, zIndex: 2 }}>
        <div style={{
          flex: 1,
          height: "1.2px",
          background: "linear-gradient(to right, transparent, #b38f36 40%, #ffd700 100%)",
          alignSelf: "center",
          opacity: 0.8
        }} />
        
        <svg width="240" height="30" viewBox="0 0 240 30" fill="none" style={{ flex: "0 0 240px" }}>
          <defs>
            <linearGradient id="gold-scroll-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9a7b2c" />
              <stop offset="30%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#fff5c0" />
              <stop offset="70%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#9a7b2c" />
            </linearGradient>
            <radialGradient id="pearl-bead" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#faf6ee" />
              <stop offset="70%" stopColor="#dcd3be" />
              <stop offset="95%" stopColor="#ab9e84" />
              <stop offset="100%" stopColor="#7a6f58" />
            </radialGradient>
            <filter id="pearl-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.45"/>
            </filter>
          </defs>

          {/* Left scrolls and leaves (extending from center 120 down to 0) */}
          <path d="M 120 15 C 105 5, 80 5, 60 15 C 80 25, 105 25, 120 15 Z" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />
          <path d="M 60 15 C 45 8, 30 8, 15 15 C 30 22, 45 22, 60 15 Z" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />
          <path d="M 15 15 C 5 13, 0 10, 0 15" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />

          {/* Left Leaf details branch */}
          <path d="M 95 10 C 90 6, 82 6, 80 8 C 83 11, 91 11, 95 10 Z" fill="url(#gold-scroll-grad)" />
          <path d="M 75 12 C 70 8, 62 8, 60 10 C 63 13, 71 13, 75 12 Z" fill="url(#gold-scroll-grad)" />
          <path d="M 35 12 C 30 8, 22 8, 20 10 C 23 13, 31 13, 35 12 Z" fill="url(#gold-scroll-grad)" />

          {/* Right scrolls and leaves (extending from center 120 up to 240) */}
          <path d="M 120 15 C 135 5, 160 5, 180 15 C 160 25, 135 25, 120 15 Z" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />
          <path d="M 180 15 C 195 8, 210 8, 225 15 C 210 22, 195 22, 180 15 Z" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />
          <path d="M 225 15 C 235 13, 240 10, 240 15" fill="none" stroke="url(#gold-scroll-grad)" strokeWidth="1.2" />

          {/* Right Leaf details branch */}
          <path d="M 145 10 C 150 6, 158 6, 160 8 C 157 11, 149 11, 145 10 Z" fill="url(#gold-scroll-grad)" />
          <path d="M 165 12 C 170 8, 178 8, 180 10 C 177 13, 169 13, 165 12 Z" fill="url(#gold-scroll-grad)" />
          <path d="M 205 12 C 210 8, 218 8, 220 10 C 217 13, 209 13, 205 12 Z" fill="url(#gold-scroll-grad)" />

          {/* Center Pearl (Single White Bead) */}
          <circle cx="120" cy="15" r="7.5" fill="url(#pearl-bead)" filter="url(#pearl-shadow)" />
        </svg>

        <div style={{
          flex: 1,
          height: "1.2px",
          background: "linear-gradient(to right, #ffd700, #b38f36 60%, transparent)",
          alignSelf: "center",
          opacity: 0.8
        }} />
      </div>

      {showInputs && (
        <div style={{ animation: "fadeInSecurityInputs 1s ease-in-out forwards", width: "100%", marginTop: "10px" }}>
          
          {securityData.type === "boolean" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div 
                className="swipe-track"
                onMouseMove={(e) => {
                  if (!isSwiping) return;
                  const clientX = e.clientX;
                  let offset = clientX - startX;
                  offset = Math.max(-90, Math.min(90, offset));
                  setSwipeOffset(offset);
                }}
                onMouseUp={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  if (swipeOffset >= 75) checkAnswer("yes");
                  else if (swipeOffset <= -75) checkAnswer("no");
                  setSwipeOffset(0);
                }}
                onMouseLeave={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  setSwipeOffset(0);
                }}
                onTouchMove={(e) => {
                  if (!isSwiping) return;
                  const clientX = e.touches[0].clientX;
                  let offset = clientX - startX;
                  offset = Math.max(-90, Math.min(90, offset));
                  setSwipeOffset(offset);
                }}
                onTouchEnd={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  if (swipeOffset >= 75) checkAnswer("yes");
                  else if (swipeOffset <= -75) checkAnswer("no");
                  setSwipeOffset(0);
                }}
              >
                <span className="swipe-label" style={{ opacity: swipeOffset <= -40 ? 1 : 0.4, color: swipeOffset <= -40 ? "var(--accent-rose)" : "inherit" }}>
                  👈 No
                </span>
                
                <div
                  className="swipe-handle"
                  onMouseDown={(e) => {
                    setIsSwiping(true);
                    setStartX(e.clientX - swipeOffset);
                  }}
                  onTouchStart={(e) => {
                    setIsSwiping(true);
                    setStartX(e.touches[0].clientX - swipeOffset);
                  }}
                  style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: isSwiping ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  }}
                >
                  <span style={{ fontSize: "18px", userSelect: "none" }}>❤️</span>
                </div>
                
                <span className="swipe-label" style={{ opacity: swipeOffset >= 40 ? 1 : 0.4, color: swipeOffset >= 40 ? "#2ec4b6" : "inherit" }}>
                  Yes 👉
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                Swipe left for No, right for Yes
              </p>
            </div>
          )}

          {securityData.type === "date" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <SharedDefs />

              {/* Drum Headers */}
              <div style={{ display: "flex", width: "100%", maxWidth: "370px", justifyContent: "space-between", padding: "0 32px", marginBottom: "6px", zIndex: 2 }}>
                <span style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "90px", textAlign: "center", letterSpacing: "1px" }}>Month</span>
                <span style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "90px", textAlign: "center", letterSpacing: "1px" }}>Day</span>
                <span style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "110px", textAlign: "center", letterSpacing: "1px" }}>Year</span>
              </div>

              {/* Combination Lock Drum Slots Wrapper with Heavy Gold Border */}
              <div 
                style={{
                  display: "flex",
                  width: "100%",
                  maxWidth: "370px",
                  height: "190px",
                  background: "linear-gradient(to bottom, #2b080c 0%, #150204 100%)",
                  border: "8px double #ffd700",
                  borderRadius: "24px",
                  boxShadow: "0 20px 45px rgba(0, 0, 0, 0.85), 0 0 0 1px #b38f36, inset 0 0 25px rgba(0, 0, 0, 0.9)",
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  margin: "12px auto",
                  zIndex: 2
                }}
              >
                {/* Gold Corners with Rubies */}
                <GoldCornerOrnament position="top-left" />
                <GoldCornerOrnament position="top-right" />
                <GoldCornerOrnament position="bottom-left" />
                <GoldCornerOrnament position="bottom-right" />

                {/* Horizontal Gold Selector Bar Overlay */}
                <div 
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "2px",
                    right: "2px",
                    height: "44px",
                    transform: "translateY(-50%)",
                    borderTop: "2px solid #ffd700",
                    borderBottom: "2px solid #ffd700",
                    background: "transparent",
                    boxShadow: "0 0 12px rgba(255, 215, 0, 0.7)",
                    pointerEvents: "none",
                    zIndex: 5
                  }}
                >
                  <SelectorCapLeft />
                  <SelectorCapRight />
                </div>

                {/* Month Column */}
                <DrumColumn 
                  value={dialMonth}
                  options={MONTHS_ABBR}
                  onUp={() => { playClickSound(600); setDialMonth((prev) => (prev === 12 ? 1 : prev + 1)); }}
                  onDown={() => { playClickSound(450); setDialMonth((prev) => (prev === 1 ? 12 : prev - 1)); }}
                  currentIndex={dialMonth - 1}
                  width="90px"
                  isMonth={true}
                />

                {/* Divider: Gilded metal bar divider */}
                <div style={{
                  width: "5px",
                  height: "calc(100% - 16px)",
                  margin: "8px 0",
                  background: "linear-gradient(to right, #8a6f27 0%, #ffd700 40%, #fff7d0 60%, #8a6f27 100%)",
                  boxShadow: "1px 0 4px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.4)",
                  zIndex: 4
                }} />

                {/* Day Column */}
                <DrumColumn 
                  value={dialDay}
                  options={Array.from({ length: 31 }, (_, i) => (i + 1).toString())}
                  onUp={() => { playClickSound(600); setDialDay((prev) => (prev === 31 ? 1 : prev + 1)); }}
                  onDown={() => { playClickSound(450); setDialDay((prev) => (prev === 1 ? 31 : prev - 1)); }}
                  currentIndex={dialDay - 1}
                  width="90px"
                />

                {/* Divider: Gilded metal bar divider */}
                <div style={{
                  width: "5px",
                  height: "calc(100% - 16px)",
                  margin: "8px 0",
                  background: "linear-gradient(to right, #8a6f27 0%, #ffd700 40%, #fff7d0 60%, #8a6f27 100%)",
                  boxShadow: "1px 0 4px rgba(0,0,0,0.4), -1px 0 4px rgba(0,0,0,0.4)",
                  zIndex: 4
                }} />

                {/* Year Column */}
                <DrumColumn 
                  value={dialYear}
                  options={Array.from({ length: 41 }, (_, i) => (1995 + i).toString())}
                  onUp={() => { playClickSound(600); setDialYear((prev) => (prev === 2035 ? 1995 : prev + 1)); }}
                  onDown={() => { playClickSound(450); setDialYear((prev) => (prev === 1995 ? 2035 : prev - 1)); }}
                  currentIndex={dialYear - 1995}
                  width="110px"
                  isYear={true}
                />
              </div>

              <button
                onClick={() => {
                  const pad = (n: number) => n.toString().padStart(2, "0");
                  const dateStr = `${dialYear}-${pad(dialMonth)}-${pad(dialDay)}`;
                  checkAnswer(dateStr);
                }}
                style={{
                  padding: "14px 36px",
                  borderRadius: "30px",
                  background: "linear-gradient(135deg, #b38f36 0%, #ffd700 50%, #b38f36 100%)",
                  color: "#3a2305",
                  border: "2px solid #fff5c0",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 8px 25px rgba(212, 175, 55, 0.45)",
                  marginTop: "20px",
                  transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                  zIndex: 2,
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(212, 175, 55, 0.75)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #ffd700 0%, #fff7d0 50%, #ffd700 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(212, 175, 55, 0.45)";
                  e.currentTarget.style.background = "linear-gradient(135deg, #b38f36 0%, #ffd700 50%, #b38f36 100%)";
                }}
              >
                Pull Latch & Unlock 🔑
              </button>
            </div>
          )}

          {securityData.type === "choice" && securityData.choices && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {securityData.choices.map((choice, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => checkAnswer(choice)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.3) 1px, transparent 1px), linear-gradient(135deg, rgba(74, 21, 27, 0.5) 0%, rgba(140, 37, 48, 0.35) 100%)",
                      backgroundSize: "4px 4px, 4px 4px, 100% 100%",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1.5px solid rgba(212, 175, 55, 0.25)",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "18px",
                      transition: "all 0.25s ease",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#ffd700";
                      e.currentTarget.style.background = "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.35) 1px, transparent 1px), linear-gradient(135deg, rgba(140, 37, 48, 0.65) 0%, rgba(191, 67, 81, 0.45) 100%)";
                      e.currentTarget.style.backgroundSize = "4px 4px, 4px 4px, 100% 100%";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(255, 215, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.25)";
                      e.currentTarget.style.background = "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.3) 1px, transparent 1px), linear-gradient(135deg, rgba(74, 21, 27, 0.5) 0%, rgba(140, 37, 48, 0.35) 100%)";
                      e.currentTarget.style.backgroundSize = "4px 4px, 4px 4px, 100% 100%";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
                    }}
                  >
                    <span 
                      className="opt-badge"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #b38f36 0%, #ffd700 50%, #b38f36 100%)",
                        border: "1.5px solid #8a6f27",
                        color: "#3a2305",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        transition: "all 0.2s",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.5), inset 0 0 0 1.5px #fff5c0, inset 0 0 0 3px #b38f36, inset 0 0 0 4.5px #ffd700"
                      }}
                    >
                      {optionLetter}
                    </span>
                    <span style={{ fontSize: "17px", fontFamily: "Georgia, serif", color: "#ffd700", textShadow: "0 1px 2px rgba(0,0,0,0.85)", letterSpacing: "0.5px" }}>{choice}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {securityError && (
        <p style={{ color: "var(--accent-rose)", fontSize: "14px", fontWeight: 600, marginTop: "12px", animation: "shake 0.3s ease", textShadow: "0 0 8px rgba(255, 75, 114, 0.4)" }}>
          {securityError}
        </p>
      )}


    </div>
  );
}

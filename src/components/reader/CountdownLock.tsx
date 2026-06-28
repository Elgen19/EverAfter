"use client";

import React, { useState, useEffect, useRef } from "react";

interface CountdownLockProps {
  sendLaterDate: string;
  onUnlock: () => void;
}

const PadlockSVG = () => (
  <svg 
    width="80" 
    height="100" 
    viewBox="0 0 24 30" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{
      color: "var(--accent-gold)",
      filter: "drop-shadow(0 0 15px rgba(226, 184, 87, 0.65))",
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

export default function CountdownLock({ sendLaterDate, onUnlock }: CountdownLockProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [phase, setPhase] = useState<"intro" | "card">("intro");

  const getFormattedReleaseDate = () => {
    try {
      const date = new Date(sendLaterDate);
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return sendLaterDate;
    }
  };

  useEffect(() => {
    // Play the dramatic intro for 2.6 s then reveal the card
    const timer = setTimeout(() => setPhase("card"), 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(sendLaterDate) - +new Date();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onUnlock();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [sendLaterDate, onUnlock]);

  if (timeLeft.isExpired) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => {
    const blockRef = useRef<HTMLDivElement>(null);
    return (
      <div 
        ref={blockRef}
        style={{
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)", 
          border: "1px solid rgba(226, 184, 87, 0.15)",
          borderRadius: "16px", 
          padding: "16px 12px", 
          minWidth: "85px",
          position: "relative",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        onMouseEnter={() => {
          if (blockRef.current) {
            blockRef.current.style.borderColor = "var(--accent-gold)";
            blockRef.current.style.transform = "translateY(-4px)";
            blockRef.current.style.boxShadow = "0 12px 40px rgba(226, 184, 87, 0.25)";
          }
        }}
        onMouseLeave={() => {
          if (blockRef.current) {
            blockRef.current.style.borderColor = "rgba(226, 184, 87, 0.15)";
            blockRef.current.style.transform = "translateY(0)";
            blockRef.current.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)";
          }
        }}
      >
        {/* Top glowing dot */}
        <div style={{
          position: "absolute",
          top: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "var(--accent-gold)",
          boxShadow: "0 0 10px var(--accent-gold)"
        }} />

        <span style={{
          fontSize: "36px", 
          fontWeight: 700, 
          color: "#fff",
          fontFamily: "var(--font-ui)", 
          textShadow: "0 0 12px rgba(255, 255, 255, 0.2)",
          lineHeight: 1.1,
        }}>
          {value.toString().padStart(2, "0")}
        </span>
        <span style={{
          fontSize: "10px", 
          color: "var(--accent-gold)", 
          textTransform: "uppercase",
          letterSpacing: "1.5px", 
          marginTop: "6px",
          fontWeight: 600,
          opacity: 0.8
        }}>
          {label}
        </span>
      </div>
    );
  };

  // ── Dramatic intro screen ──
  if (phase === "intro") {
    return (
      <>
        <style>{`
          @keyframes seal-drop-in {
            0%   { opacity: 0; transform: scale(0.3) rotate(-15deg); }
            60%  { opacity: 1; transform: scale(1.65) rotate(4deg); }
            80%  { transform: scale(1.4) rotate(-2deg); }
            100% { transform: scale(1.5) rotate(0deg); }
          }
          @keyframes text-float-up {
            0%   { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-out-intro {
            0%   { opacity: 1; }
            100% { opacity: 0; pointer-events: none; }
          }
          @keyframes float-padlock {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(1.5deg); }
          }
          @keyframes shackle-pulse {
            0%, 100% { stroke-width: 1.5px; opacity: 0.85; }
            50% { stroke-width: 2.2px; opacity: 1; filter: drop-shadow(0 0 6px rgba(226, 184, 87, 0.8)); }
          }
        `}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "28px", backgroundColor: "#0b0711",
          animation: "fade-out-intro 0.6s ease 2.0s forwards"
        }}>
          {/* Animated lock SVG icon */}
          <div style={{
            lineHeight: 1,
            animation: "seal-drop-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards",
            marginBottom: "20px"
          }}>
            <PadlockSVG />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 48px)",
            fontFamily: "var(--font-cursive, serif)",
            fontWeight: "normal",
            color: "var(--accent-gold)",
            textShadow: "0 0 20px rgba(226,184,87,0.55), 0 2px 8px rgba(0,0,0,0.5)",
            margin: 0,
            textAlign: "center",
            animation: "text-float-up 0.6s ease 0.5s both"
          }}>
            This letter is sealed...
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "15px", color: "var(--text-muted)", margin: 0,
            textAlign: "center", letterSpacing: "0.5px",
            animation: "text-float-up 0.6s ease 0.85s both"
          }}>
            A love letter locked in time, waiting for its moment.
          </p>
        </div>
      </>
    );
  }

  // ── Main countdown card ──
  return (
    <>
      <style>{`
        @keyframes float-padlock {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @keyframes shackle-pulse {
          0%, 100% { stroke-width: 1.5px; opacity: 0.85; }
          50% { stroke-width: 2.2px; opacity: 1; filter: drop-shadow(0 0 6px rgba(226, 184, 87, 0.8)); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.15); }
          40% { transform: scale(1.05); }
          60% { transform: scale(1.2); }
        }
      `}</style>

      <div
        className="glass animate-reveal"
        style={{
          width: "100%", 
          maxWidth: "540px", 
          padding: "48px 36px", 
          textAlign: "center",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: "28px",
          boxShadow: "0 30px 70px rgba(0,0,0,0.55)", 
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(20, 15, 30, 0.7) 0%, rgba(10, 7, 18, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative background aura */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(226, 184, 87, 0.12) 0%, transparent 70%)",
          zIndex: 1,
          pointerEvents: "none"
        }} />

        {/* Vintage Padlock */}
        <div style={{ zIndex: 2, position: "relative" }}>
          <PadlockSVG />
        </div>

        <div style={{ zIndex: 2 }}>
          {/* Cursive title */}
          <h2 style={{
            fontSize: "clamp(24px, 6vw, 34px)",
            fontFamily: "var(--font-cursive, cursive)",
            fontWeight: "normal",
            color: "#fff",
            background: "linear-gradient(135deg, #ffd875 0%, #ff4b72 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "12px",
            lineHeight: 1.2,
          }}>
            A Promise Kept in Time
          </h2>
          
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "440px", margin: "0 auto" }}>
            A private letter was sealed by your partner. The stars will align and automatically reveal its contents on:
          </p>

          <div style={{ marginTop: "16px" }}>
            <span style={{
              fontSize: "14px", 
              color: "#fff", 
              fontWeight: 600, 
              letterSpacing: "0.5px",
              backgroundColor: "rgba(226, 184, 87, 0.1)", 
              padding: "10px 24px",
              borderRadius: "30px", 
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(226, 184, 87, 0.3)",
              boxShadow: "0 0 20px rgba(226, 184, 87, 0.1)"
            }}>
              <span style={{ fontSize: "16px" }}>📅</span>
              {getFormattedReleaseDate()}
            </span>
          </div>
        </div>

        {/* Countdown Grid */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", width: "100%", marginTop: "8px", zIndex: 2 }}>
          <TimeBlock value={timeLeft.days} label="Days" />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Mins" />
          <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>

        {/* Decorative Quote Card Footer */}
        <div 
          style={{ 
            marginTop: "12px", 
            borderTop: "1px solid rgba(255,255,255,0.06)", 
            paddingTop: "24px", 
            width: "100%",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span style={{ fontSize: "16px", color: "var(--accent-rose)", opacity: 0.85, animation: "heartbeat 2s infinite" }}>❤️</span>
          <p style={{ 
            fontSize: "12px", 
            color: "var(--text-muted)", 
            fontStyle: "italic", 
            margin: 0,
            maxWidth: "380px",
            lineHeight: 1.5,
            opacity: 0.9
          }}>
            "Patience is not the ability to wait, but the ability to keep a good attitude while waiting."
          </p>
        </div>
      </div>
    </>
  );
}

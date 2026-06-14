"use client";

import React, { useState, useEffect } from "react";

interface CountdownLockProps {
  sendLaterDate: string;
  onUnlock: () => void;
}

export default function CountdownLock({ sendLaterDate, onUnlock }: CountdownLockProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  // Dramatic intro: "null" = intro playing, "card" = card visible
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

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-card)",
      borderRadius: "12px", padding: "16px 20px", minWidth: "80px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
    }}>
      <span style={{
        fontSize: "32px", fontWeight: "bold", color: "var(--accent-gold)",
        fontFamily: "var(--font-ui)", textShadow: "0 0 10px rgba(226, 184, 87, 0.4)"
      }}>
        {value.toString().padStart(2, "0")}
      </span>
      <span style={{
        fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase",
        letterSpacing: "1px", marginTop: "4px"
      }}>
        {label}
      </span>
    </div>
  );

  // ── Dramatic intro screen ──
  if (phase === "intro") {
    return (
      <>
        <style>{`
          @keyframes seal-drop-in {
            0%   { opacity: 0; transform: scale(0.3) rotate(-15deg); }
            60%  { opacity: 1; transform: scale(1.15) rotate(4deg); }
            80%  { transform: scale(0.95) rotate(-2deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes seal-pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 12px rgba(226,184,87,0.5)); }
            50%       { filter: drop-shadow(0 0 28px rgba(226,184,87,0.9)); }
          }
          @keyframes text-float-up {
            0%   { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-out-intro {
            0%   { opacity: 1; }
            100% { opacity: 0; pointer-events: none; }
          }
        `}</style>
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "28px", backgroundColor: "#0b0711",
          animation: "fade-out-intro 0.6s ease 2s forwards"
        }}>
          {/* Animated lock icon */}
          <div style={{
            fontSize: "100px", lineHeight: 1,
            animation: "seal-drop-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards, seal-pulse-glow 1.4s ease-in-out 0.7s infinite"
          }}>
            🔒
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 48px)",
            fontFamily: "'Dancing Script','Great Vibes','Sacramento',cursive",
            fontWeight: "bold",
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
        @keyframes countdown-lock-spin {
          0%   { transform: rotate(-8deg) scale(1); }
          25%  { transform: rotate(8deg) scale(1.08); }
          50%  { transform: rotate(-4deg) scale(1); }
          75%  { transform: rotate(4deg) scale(1.04); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes lock-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(226, 184, 87, 0.2), 0 0 0 0 rgba(226,184,87,0.3); }
          50%       { box-shadow: 0 0 35px rgba(226, 184, 87, 0.45), 0 0 0 8px rgba(226,184,87,0); }
        }
      `}</style>

      <div
        className="glass animate-reveal"
        style={{
          width: "100%", maxWidth: "520px", padding: "40px 30px", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)", border: "1px solid var(--border-card)",
          borderRadius: "20px"
        }}
      >
        {/* Animated lock icon */}
        <div style={{
          width: "90px", height: "90px", borderRadius: "50%",
          backgroundColor: "rgba(226, 184, 87, 0.08)",
          border: "2px dashed var(--accent-gold)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "44px", color: "var(--accent-gold)",
          animation: "countdown-lock-spin 3s ease-in-out infinite, lock-glow-pulse 2s ease-in-out infinite",
        }}>
          🔒
        </div>

        <div>
          {/* Cursive title */}
          <h2 style={{
            fontSize: "clamp(22px, 5vw, 32px)",
            fontFamily: "'Dancing Script','Great Vibes','Sacramento',cursive",
            fontWeight: "bold",
            color: "var(--accent-gold)",
            textShadow: "0 0 14px rgba(226,184,87,0.4)",
            marginBottom: "10px",
            lineHeight: 1.3,
          }}>
            This letter is sealed...
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto" }}>
            A private, scheduled letter has been written for you. It will automatically unlock and reveal itself on:
          </p>
          <p style={{
            fontSize: "15px", color: "var(--accent-rose)", fontWeight: "bold", marginTop: "10px",
            backgroundColor: "rgba(255, 75, 114, 0.08)", padding: "8px 16px",
            borderRadius: "30px", display: "inline-block",
            border: "1px solid rgba(255, 75, 114, 0.15)"
          }}>
            ✨ {getFormattedReleaseDate()}
          </p>
        </div>

        {/* Countdown Grid */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%", marginTop: "12px" }}>
          <TimeBlock value={timeLeft.days} label="Days" />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Mins" />
          <TimeBlock value={timeLeft.seconds} label="Secs" />
        </div>

        <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", width: "100%" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
            "Patience is the companion of wisdom... Count down the moments."
          </p>
        </div>
      </div>
    </>
  );
}

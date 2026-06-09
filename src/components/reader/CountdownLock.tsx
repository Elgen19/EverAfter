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

  const getFormattedReleaseDate = () => {
    try {
      const date = new Date(sendLaterDate);
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return sendLaterDate;
    }
  };

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

  if (timeLeft.isExpired) {
    return null;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid var(--border-card)",
      borderRadius: "12px",
      padding: "16px 20px",
      minWidth: "80px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
    }}>
      <span style={{
        fontSize: "32px",
        fontWeight: "bold",
        color: "var(--accent-gold)",
        fontFamily: "var(--font-ui)",
        textShadow: "0 0 10px rgba(226, 184, 87, 0.4)"
      }}>
        {value.toString().padStart(2, "0")}
      </span>
      <span style={{
        fontSize: "11px",
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginTop: "4px"
      }}>
        {label}
      </span>
    </div>
  );

  return (
    <div 
      className="glass animate-reveal"
      style={{
        width: "100%",
        maxWidth: "520px",
        padding: "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        border: "1px solid var(--border-card)",
        borderRadius: "20px"
      }}
    >
      {/* pulsing lock icon */}
      <div 
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          backgroundColor: "rgba(226, 184, 87, 0.08)",
          border: "2px dashed var(--accent-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "44px",
          color: "var(--accent-gold)",
          animation: "pulse 2s infinite ease-in-out",
          boxShadow: "0 0 20px rgba(226, 184, 87, 0.2)"
        }}
      >
        🔒
      </div>

      <div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
          This letter is sealed...
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "420px", margin: "0 auto" }}>
          A private, scheduled letter has been written for you. It will automatically unlock and reveal itself on:
        </p>
        <p style={{ 
          fontSize: "15px", 
          color: "var(--accent-rose)", 
          fontWeight: "bold", 
          marginTop: "10px",
          backgroundColor: "rgba(255, 75, 114, 0.08)",
          padding: "8px 16px",
          borderRadius: "30px",
          display: "inline-block",
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
  );
}

"use client";

import React from "react";

interface RomanticAlertModalProps {
  alertTitle: string;
  alertMessage: string;
  onClose: () => void;
}

export default function RomanticAlertModal({ alertTitle, alertMessage, onClose }: RomanticAlertModalProps) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000,
        backgroundColor: "rgba(11, 7, 17, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass animate-reveal"
        style={{
          width: "100%", maxWidth: "460px", padding: "40px 30px",
          textAlign: "center", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "20px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          borderRadius: "16px",
        }}
      >
        <span style={{ fontSize: "40px", animation: "heartbeat-survey 1.5s infinite" }}>💖</span>
        <div>
          <h3
            style={{
              fontSize: "22px", fontWeight: "normal",
              fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
              color: "var(--accent-rose)", marginBottom: "10px",
            }}
          >
            {alertTitle}
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            {alertMessage}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "10px 24px", borderRadius: "8px",
            backgroundColor: "var(--accent-rose)",
            backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
            border: "none", color: "#fff", fontWeight: 600, fontSize: "13px",
            cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 75, 114, 0.2)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          Close 💌
        </button>
      </div>
    </div>
  );
}

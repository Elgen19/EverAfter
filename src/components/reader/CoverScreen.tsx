import React, { useState } from "react";

interface CoverScreenProps {
  sender: string;
  recipient: string;
  onComplete: () => void;
}

export default function CoverScreen({ sender, recipient, onComplete }: CoverScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleClick = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "scale(1.03)" : "scale(1)",
        transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          maxWidth: "600px",
          width: "100%",
          animation: "fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      >
        {/* Branding header */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffb338", // Warm gold color
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "3px",
            opacity: 0.9,
          }}
        >
          <span>💌</span>
          <span>AN EVERAFTER KEEPSAKE</span>
        </div>

        {/* Sender and Recipient names */}
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            gap: "12px",
            margin: "40px 0"
          }}
        >
          <span 
            style={{ 
              fontSize: "64px", 
              color: "#fff", 
              fontFamily: "var(--font-cursive, cursive)",
              textShadow: "0 0 20px rgba(255,255,255,0.15)",
              lineHeight: 1.2
            }}
          >
            From {sender || "Yours Truly"}
          </span>
          <span 
            style={{ 
              fontSize: "24px", 
              color: "rgba(255, 255, 255, 0.6)", 
              fontFamily: "inherit",
              fontWeight: "normal",
              margin: "8px 0"
            }}
          >
            to
          </span>
          <span 
            style={{ 
              fontSize: "64px", 
              color: "#fff", 
              fontFamily: "var(--font-cursive, cursive)",
              textShadow: "0 0 20px rgba(255,255,255,0.15)",
              lineHeight: 1.2
            }}
          >
            {recipient || "My Beloved"}
          </span>
        </div>

        {/* Action Prompt */}
        <div 
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "20px",
            transition: "color 0.3s",
          }}
        >
          <span>Press anywhere to open</span>
          <span style={{ fontSize: "16px" }}>➔</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </div>
  );
}

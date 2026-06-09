"use client";

import React, { useState, useEffect } from "react";

interface CustomCSSProperties extends React.CSSProperties {
  "--tx"?: string;
  "--ty"?: string;
  "--scale"?: number;
  "--rot"?: string;
}

interface EnvelopeProps {
  recipient: string;
  sender: string;
  content: string;
  theme: string; // "classic" | "rose" | "lavender" | "celestial"
  sealSymbol?: string; // "heart" | "rose" | "star" | "ring"
  sealColor?: string; // hex code
  greeting?: string;
  farewell?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

function getWaxTones(hex: string) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  
  // blend 45% white
  const lr = Math.min(255, Math.round(r + (255 - r) * 0.45));
  const lg = Math.min(255, Math.round(g + (255 - g) * 0.45));
  const lb = Math.min(255, Math.round(b + (255 - b) * 0.45));
  const lightHex = `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
  
  // blend 45% black
  const dr = Math.round(r * 0.55);
  const dg = Math.round(g * 0.55);
  const db = Math.round(b * 0.55);
  const darkHex = `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
  
  return {
    main: hex,
    light: lightHex,
    dark: darkHex
  };
}

export default function Envelope({
  recipient,
  sender,
  content,
  theme,
  sealSymbol = "heart",
  sealColor = "#bd1a3d",
  greeting,
  farewell,
  onOpen,
  onClose,
}: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [burstHearts, setBurstHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);

  // Trigger full page letter overlay after slide-out animation finishes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsFullView(true);
      }, 3000); // Wait for flap rotation (1.2s) + letter slide out (1.8s)
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsFullView(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    setIsSealBroken(true);

    // Generate romantic heart burst particles!
    const heartsList = ["❤️", "💖", "💝", "💕", "✨", "🌸"];
    const newBursts = [];
    for (let i = 0; i < 22; i++) {
      const char = heartsList[Math.floor(Math.random() * heartsList.length)];
      const tx = `${(Math.random() - 0.5) * 360}px`;
      const ty = `${-150 - Math.random() * 220}px`; // shoots upwards
      const scale = Math.random() * 0.9 + 0.6;
      const rot = `${(Math.random() - 0.5) * 180}deg`;
      newBursts.push({
        id: i,
        char,
        tx,
        ty,
        scale,
        rot
      });
    }
    setBurstHearts(newBursts);

    if (onOpen) onOpen();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullView(false);
    // Add longer timeout before closing envelope to let full view scale down first
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 800); // Slower retracting delay
  };

  // Get theme display class name
  const themeClass = `theme-${theme || "classic"}`;

  // Get symbol character
  const getSymbolChar = (symbol: string) => {
    switch (symbol) {
      case "rose": return "🌹";
      case "star": return "⭐";
      case "ring": return "💍";
      case "heart":
      default:
        return "❤";
    }
  };

  return (
    <div 
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "500px",
        position: "relative",
      }}
    >
      {/* 3D Envelope container */}
      <div 
        className={`envelope-wrapper ${themeClass}`}
        onClick={handleOpen}
        style={{
          transform: isFullView 
            ? "scale(0.8) translateY(100px)" 
            : isOpen 
              ? "translateY(110px) scale(0.95)" 
              : "scale(1)",
          opacity: isFullView ? 0 : 1,
          transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
          pointerEvents: isFullView ? "none" : "auto",
        }}
      >
        <div className={`envelope ${isOpen ? "open" : ""}`}>
          {/* Top Flap with rounded corners using SVG path */}
          <svg 
            className="envelope-flap" 
            viewBox="0 0 550 175"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "175px",
              pointerEvents: "none"
            }}
          >
            <path d="M 12,0 A 12,12 0 0 0 0,12 L 275,175 L 550,12 A 12,12 0 0 0 538,0 Z" fill="#f6f5ee" />
          </svg>

          {/* Gold lining */}
          <div className="envelope-gold-lining" />

          {/* Elegant Corner Filigrees */}
          <div className="envelope-corner top-left" style={{ zIndex: isOpen ? 2 : 7 }} />
          <div className="envelope-corner top-right" style={{ zIndex: isOpen ? 2 : 7 }} />
          <div className="envelope-corner bottom-left" style={{ zIndex: isOpen ? 2 : 7 }} />
          <div className="envelope-corner bottom-right" style={{ zIndex: isOpen ? 2 : 7 }} />

          {/* Postage Stamp */}
          <div className="envelope-stamp" style={{ zIndex: isOpen ? 2 : 7 }}>
            <div className="envelope-stamp-inner">
              <span className="envelope-stamp-heart">❤</span>
              <span className="envelope-stamp-value">1st Class</span>
            </div>
          </div>

          {/* Postmark cancellation waves */}
          <svg className="envelope-postmark" viewBox="0 0 100 100" style={{ zIndex: isOpen ? 2 : 7 }}>
            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 0,40 Q 25,30 50,40 T 100,40" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
            <path d="M 0,50 Q 25,40 50,50 T 100,50" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
            <path d="M 0,60 Q 25,50 50,60 T 100,60" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          </svg>

          {/* Sender Address (From on bottom-left corner) */}
          <div 
            className="envelope-sender-address" 
            style={{ 
              position: "absolute",
              bottom: "25px",
              left: "35px",
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              color: "rgba(47, 42, 36, 0.65)",
              textAlign: "left",
              lineHeight: "1.2",
              zIndex: isOpen ? 2 : 7,
              pointerEvents: "none",
              maxWidth: "220px",
            }}
          >
            <div style={{ fontSize: "8px", fontFamily: "var(--font-ui)", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.5, marginBottom: "2px" }}>From:</div>
            <div style={{ fontWeight: "bold", fontSize: "16px", color: "rgba(47, 42, 36, 0.85)" }}>{sender || "Yours Truly"}</div>
            <div>123 Romance Avenue</div>
            <div>Hearts Desires, LV 14314</div>
          </div>

          {/* Mock Delivery Address (Recipient on bottom-right corner) */}
          <div 
            className="envelope-mock-address" 
            style={{ 
              position: "absolute",
              bottom: "25px",
              right: "35px",
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              color: "rgba(47, 42, 36, 0.75)",
              textAlign: "left",
              lineHeight: "1.2",
              zIndex: isOpen ? 2 : 7,
              pointerEvents: "none",
              maxWidth: "220px",
            }}
          >
            <div style={{ fontSize: "8px", fontFamily: "var(--font-ui)", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.5, marginBottom: "2px" }}>Deliver To:</div>
            <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--stationery-accent, #9c2d2a)" }}>{recipient || "My Beloved"}</div>
            <div>777 Sweetheart Lane</div>
            <div>Garden of Eden, LV 14314</div>
          </div>

          {/* Heart fountain burst */}
          {burstHearts.map((h) => (
            <span
              key={h.id}
              className="burst-heart"
              style={{
                "--tx": h.tx,
                "--ty": h.ty,
                "--scale": h.scale,
                "--rot": h.rot,
              } as CustomCSSProperties}
            >
              {h.char}
            </span>
          ))}

          {/* Left/Right folding structures */}
          <div className="envelope-left-side" />
          <div className="envelope-pocket" />

          {/* Wax Seal Drips */}
          {!isOpen && !isSealBroken && (
            <>
              <div 
                style={{
                  position: "absolute",
                  top: "198px",
                  left: "calc(50% - 24px)",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${getWaxTones(sealColor).light}, ${getWaxTones(sealColor).main})`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.2)",
                  zIndex: 8,
                  pointerEvents: "none"
                }}
              />
              <div 
                style={{
                  position: "absolute",
                  top: "148px",
                  left: "calc(50% + 32px)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${getWaxTones(sealColor).light}, ${getWaxTones(sealColor).main})`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.2)",
                  zIndex: 8,
                  pointerEvents: "none"
                }}
              />
            </>
          )}

          {/* Wax Seal */}
          <button 
            className="wax-seal" 
            style={{
              "--seal-color-main": getWaxTones(sealColor).main,
              "--seal-color-light": getWaxTones(sealColor).light,
              "--seal-color-dark": getWaxTones(sealColor).dark,
              display: isSealBroken && !isOpen ? "none" : undefined,
            } as React.CSSProperties}
            aria-label="Open Letter"
          >
            <span style={{ fontSize: "28px" }}>
              {getSymbolChar(sealSymbol)}
            </span>
          </button>

          {/* Tiny preview letter sheet inside */}
          <div className="envelope-letter">
            <div style={{ fontSize: "10px", lineHeight: "1.3", opacity: 0.8, overflow: "hidden" }}>
              {content || "Loading your sweet words..."}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Full Screen Stationery Sheet (Fade-in portal style) */}
      <div
        className={themeClass}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 90,
          background: "transparent",
          backdropFilter: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isFullView ? 1 : 0,
          pointerEvents: isFullView ? "auto" : "none",
          transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: "80px 20px 20px 20px",
        }}
      >
        <style>{`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        `}</style>
        {/* Twinkling Starry Celestial Background */}
        <div className="celestial-stars" />
        <div className="celestial-nebula" />

        {/* The beautiful letter paper page */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "70vh",
            backgroundColor: "var(--stationery-bg)",
            backgroundImage: "var(--bg-image)",
            border: "1px solid var(--stationery-border)",
            borderRadius: "16px",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
            color: "var(--stationery-text)",
            fontFamily: "var(--stationery-font)",
            display: "flex",
            flexDirection: "column",
            transform: isFullView ? "scale(1) translateY(0)" : "scale(0.9) translateY(40px)",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
          }}
        >
          {/* Top header border/design */}
          <div 
            style={{
              height: "12px",
              background: `repeating-linear-gradient(45deg, 
                var(--stationery-accent), 
                var(--stationery-accent) 15px, 
                var(--stationery-bg) 15px, 
                var(--stationery-bg) 30px, 
                #ff4b72 30px, 
                #ff4b72 45px, 
                var(--stationery-bg) 45px, 
                var(--stationery-bg) 60px
              )`,
              borderBottom: "1px solid var(--stationery-border)"
            }}
          />

          {/* Letter Body Scroll Container */}
          <div
            className="hide-scrollbar"
            style={{
              padding: "48px 48px 36px 48px",
              overflowY: "auto",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Header: To */}
            <div 
              style={{
                fontSize: "20px",
                fontStyle: "italic",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                paddingBottom: "8px",
                color: "var(--stationery-accent)",
              }}
            >
              {greeting ? `${greeting} ` : ""}{recipient || "My Loved One"},
            </div>



            {/* Letter Content (Splits newlines into paragraphs) */}
            <div
              style={{
                fontSize: theme === "rose" ? "32px" : "18px",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                color: "var(--stationery-text)",
                flex: 1,
                paddingBottom: "24px"
              }}
            >
              {content}
            </div>

            {/* Footer: From */}
            <div
              style={{
                textAlign: "right",
                marginTop: "auto",
                paddingTop: "24px",
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {farewell && (
                <div style={{ fontSize: "16px", fontStyle: "italic", opacity: 0.7, marginBottom: "4px" }}>
                  {farewell}
                </div>
              )}
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "var(--stationery-accent)",
                  marginTop: "6px",
                }}
              >
                {sender || "Yours Truly"}
              </div>
            </div>
          </div>

          {/* Floating Close Action */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(0, 0, 0, 0.05)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--stationery-text)",
              opacity: 0.6,
              transition: "opacity 0.2s, background-color 0.2s",
            }}
            title="Fold Back into Envelope"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)")}
          >
            {/* SVG X icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { 
  Playfair_Display, 
  Allura, 
  Cinzel_Decorative, 
  Cormorant_Garamond, 
  Libre_Baskerville,
  Lora,
  DM_Serif_Display,
  Source_Serif_4
} from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-google",
  display: "swap",
});

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allura-google",
  display: "swap",
});

const cinzelDec = Cinzel_Decorative({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cinzel-dec-google",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant-google",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville-google",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora-google",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif-display-google",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4-google",
  display: "swap",
});

interface StationeryPreviewProps {
  theme: string;
  backdrop: string;
  previewBackdropUrl: string;
  hasBackdrop: boolean;
  greeting: string;
  farewell: string;
  recipient: string;
  sender: string;
  content: string;
  getGlassyBg: () => string;
  getGlassyBorder: () => string;
}

export default function StationeryPreview({
  theme,
  previewBackdropUrl,
  hasBackdrop,
  greeting,
  farewell,
  recipient,
  sender,
  content,
  getGlassyBg,
  getGlassyBorder,
}: StationeryPreviewProps) {
  const getBackdropOverlay = (themeName: string) => {
    switch (themeName) {
      case "celestial":
        return "rgba(9, 14, 36, 0.45)";
      case "royal":
        return "rgba(247, 241, 227, 0.35)";
      case "scroll":
        return "rgba(237, 220, 185, 0.35)";
      case "blush":
        return "rgba(255, 253, 247, 0.4)";
      case "lavender":
        return "rgba(94, 11, 28, 0.45)";
      case "midnight_rose":
        return "rgba(17, 14, 16, 0.45)";
      case "obsidian_poppy":
        return "rgba(28, 28, 31, 0.45)";
      default:
        return "transparent";
    }
  };

  const overlayColor = getBackdropOverlay(theme);

  return (
    <div
      className={`theme-${theme} studio-preview-wrapper ${playfair.variable} ${allura.variable} ${cinzelDec.variable} ${cormorant.variable} ${libreBaskerville.variable} ${lora.variable} ${dmSerifDisplay.variable} ${sourceSerif4.variable}`}
      style={{
        borderRadius: "16px",
        padding: previewBackdropUrl ? "30px 20px" : "0px",
        backgroundImage: previewBackdropUrl 
          ? `linear-gradient(${overlayColor}, ${overlayColor}), url(${previewBackdropUrl})` 
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "all 0.4s ease",
      }}
    >
      <div
        className={`stationery-sheet theme-${theme} ${hasBackdrop ? "has-backdrop" : ""} studio-preview-card`}
        style={{
          width: "100%",
          height: "680px",
          backgroundColor: getGlassyBg(),
          backgroundImage: hasBackdrop ? "none" : "var(--bg-image)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backdropFilter: hasBackdrop ? "blur(16px)" : "none",
          WebkitBackdropFilter: hasBackdrop ? "blur(16px)" : "none",
          border: `1px solid ${getGlassyBorder()}`,
          borderRadius: "16px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
          color: "var(--stationery-text)",
          fontFamily: "var(--stationery-font)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "all 0.4s ease",
          position: "relative",
        }}
      >
        {/* Dark Theme Particle Effects */}
        {theme === "celestial" && (
          <>
            {/* Twinkling Star Sparkles */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
              {Array.from({ length: 14 }).map((_, idx) => {
                const size = 3 + Math.random() * 4;
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const delay = Math.random() * 4;
                const duration = 2 + Math.random() * 3;
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      background: "#fff",
                      borderRadius: "50%",
                      boxShadow: "0 0 10px #fff, 0 0 20px #dcdde1",
                      animation: `star-pulse ${duration}s infinite ease-in-out ${delay}s`
                    }}
                  />
                );
              })}
            </div>

            {/* Celestial Corner Ornaments - only show in glassy backdrop mode fallback */}
            {hasBackdrop && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <g id="celestial-corner-preview">
                      <path d="M 8,8 L 30,12 L 20,28 L 8,8 M 20,28 L 36,36 L 24,48" fill="none" stroke="rgba(220, 221, 225, 0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                      <circle cx="8" cy="8" r="2.5" fill="#dcdde1" />
                      <circle cx="30" cy="12" r="1.5" fill="#dcdde1" />
                      <circle cx="20" cy="28" r="3" fill="#fff" style={{ filter: "drop-shadow(0 0 3px #fff)" }} />
                      <circle cx="36" cy="36" r="1.5" fill="#dcdde1" />
                      <circle cx="24" cy="48" r="2" fill="#dcdde1" />
                    </g>
                  </defs>
                  <use href="#celestial-corner-preview" x="0" y="0" />
                  <use href="#celestial-corner-preview" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                  <use href="#celestial-corner-preview" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                  <use href="#celestial-corner-preview" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                </svg>
              </div>
            )}
          </>
        )}

        {theme === "lavender" && (
          <>
            {/* Wavy Gold Stardust */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const size = 2 + Math.random() * 5;
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const delay = Math.random() * 6;
                const duration = 4 + Math.random() * 5;
                const colors = ["#ffeea1", "#d4af37", "#f3e5ab"];
                const bgColor = colors[idx % colors.length];
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      background: bgColor,
                      borderRadius: "50%",
                      boxShadow: `0 0 8px ${bgColor}, 0 0 16px rgba(212, 175, 55, 0.4)`,
                      animation: `dust-float ${duration}s infinite linear ${delay}s`
                    }}
                  />
                );
              })}
            </div>


            {/* Left & Right Climbing Golden Vines */}
            {hasBackdrop && (
              <>
                <div style={{ position: "absolute", top: "45px", bottom: "45px", left: "6px", width: "20px", zIndex: 5, pointerEvents: "none", opacity: 0.65 }}>
                  <svg width="100%" height="100%">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <g key={i} transform={`translate(0, ${10 + i * 36})`}>
                        <path d="M 6,0 Q 14,-10 6,-20 Q -2,-10 6,0 Z" fill="none" stroke="#d4af37" strokeWidth="0.8" />
                        <path d="M 6,-10 L 14,-14" fill="none" stroke="#d4af37" strokeWidth="0.8" />
                        <circle cx="14" cy="-14" r="1.5" fill="#d4af37" />
                      </g>
                    ))}
                  </svg>
                </div>
                <div style={{ position: "absolute", top: "45px", bottom: "45px", right: "6px", width: "20px", zIndex: 5, pointerEvents: "none", opacity: 0.65, transform: "scaleX(-1)" }}>
                  <svg width="100%" height="100%">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <g key={i} transform={`translate(0, ${10 + i * 36})`}>
                        <path d="M 6,0 Q 14,-10 6,-20 Q -2,-10 6,0 Z" fill="none" stroke="#d4af37" strokeWidth="0.8" />
                        <path d="M 6,-10 L 14,-14" fill="none" stroke="#d4af37" strokeWidth="0.8" />
                        <circle cx="14" cy="-14" r="1.5" fill="#d4af37" />
                      </g>
                    ))}
                  </svg>
                </div>
              </>
            )}

            {/* Intricate Gold Filigree Frame & Corners */}
            {hasBackdrop && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffeea1" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#aa7c11" />
                    </linearGradient>
                    <g id="gold-rose-corner-filigree">
                      <path d="M 8,8 Q 28,10 36,26 C 40,32 34,38 28,32 C 22,26 28,14 40,18 C 46,20 44,28 38,26" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" />
                      <path d="M 8,8 Q 10,28 26,36 C 32,40 38,34 32,28 C 26,22 14,28 18,40 C 20,46 28,44 26,38" fill="none" stroke="url(#goldGrad)" strokeWidth="1.2" />
                      <path d="M 14,20 Q 18,17 21,14 M 20,14 C 21,12 24,12 25,14 C 26,16 24,19 22,18 Z" fill="url(#goldGrad)" fillOpacity="0.2" stroke="url(#goldGrad)" strokeWidth="0.8" />
                      <path d="M 14,20 C 12,21 12,24 14,25 C 16,26 19,24 18,22 Z" fill="url(#goldGrad)" fillOpacity="0.2" stroke="url(#goldGrad)" strokeWidth="0.8" />
                      <circle cx="30" cy="30" r="4.5" fill="#3d020a" stroke="url(#goldGrad)" strokeWidth="1" />
                      <path d="M 28,28 C 30,26 32,30 30,32 Z" fill="url(#goldGrad)" />
                    </g>
                  </defs>
                  <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.4" />
                  <use href="#gold-rose-corner-filigree" x="0" y="0" />
                  <use href="#gold-rose-corner-filigree" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                  <use href="#gold-rose-corner-filigree" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                  <use href="#gold-rose-corner-filigree" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                </svg>
              </div>
            )}

            {/* 3D Golden Rose Emblem (Bottom-Right) */}
            <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "64px", height: "64px", zIndex: 6, pointerEvents: "none" }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffeea1" />
                    <stop offset="50%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#aa7c11" />
                  </linearGradient>
                </defs>
                <path d="M 55,60 Q 40,75 35,90 M 55,65 Q 65,70 60,75 M 48,70 Q 30,70 38,65 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
                <path d="M 40,72 C 34,70 28,74 34,78 C 40,82 44,78 40,72 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.5" />
                <path d="M 58,74 C 64,72 70,76 64,80 C 58,84 54,80 58,74 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.5" />
                <path d="M 50,22 C 35,22 30,38 50,58 C 70,38 65,22 50,22 Z" fill="url(#goldGrad)" fillOpacity="0.8" stroke="url(#goldGrad)" strokeWidth="0.8" />
                <path d="M 50,30 C 40,32 40,48 50,48 C 60,48 60,32 50,30 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.8" />
                <circle cx="50" cy="40" r="8" fill="#fff" fillOpacity="0.15" stroke="url(#goldGrad)" strokeWidth="1" />
                <circle cx="50" cy="40" r="4" fill="url(#goldGrad)" />
              </svg>
            </div>
          </>
        )}

        {theme === "midnight_rose" && (
          <>
            {/* Fluttering Green Leaves */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
              {Array.from({ length: 8 }).map((_, idx) => {
                const left = Math.random() * 100;
                const size = 10 + Math.random() * 12;
                const delay = Math.random() * 6;
                const duration = 6 + Math.random() * 6;
                const rotation = Math.random() * 360;
                const leafEmoji = idx % 2 === 0 ? "🍃" : "🌿";
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: "-20px",
                      left: `${left}%`,
                      fontSize: `${size}px`,
                      opacity: idx % 3 === 0 ? 0.4 : 0.65,
                      transform: `rotate(${rotation}deg)`,
                      animation: `petal-fall ${duration}s infinite linear ${delay}s`
                    }}
                  >
                    {leafEmoji}
                  </div>
                );
              })}
            </div>

            {/* Ivy Corner Ornaments - only show in glassy backdrop mode fallback */}
            {hasBackdrop && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <g id="ivy-corner-preview">
                      <path d="M 12,12 Q 22,14 30,26 M 12,12 Q 14,22 26,30" fill="none" stroke="#8c6c30" strokeWidth="1.2" opacity="0.75" />
                      <circle cx="30" cy="26" r="3" fill="#355c3c" stroke="#8c6c30" strokeWidth="0.5" />
                      <circle cx="26" cy="30" r="3" fill="#355c3c" stroke="#8c6c30" strokeWidth="0.5" />
                      <circle cx="18" cy="18" r="1.5" fill="#8c6c30" />
                    </g>
                  </defs>
                  <use href="#ivy-corner-preview" x="0" y="0" />
                  <use href="#ivy-corner-preview" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                  <use href="#ivy-corner-preview" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                  <use href="#ivy-corner-preview" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                </svg>
              </div>
            )}
          </>
        )}

        {theme === "obsidian_poppy" && (
          <>
            {/* Floating Rose Gold Stardust */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const size = 2 + Math.random() * 5;
                const top = Math.random() * 100;
                const left = Math.random() * 100;
                const delay = Math.random() * 6;
                const duration = 4 + Math.random() * 5;
                const colors = ["#ebd1c5", "#c59279", "#e8c4b0", "#ffdcd0"];
                const bgColor = colors[idx % colors.length];
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      background: bgColor,
                      borderRadius: "50%",
                      boxShadow: `0 0 8px ${bgColor}, 0 0 16px rgba(197, 146, 121, 0.4)`,
                      animation: `dust-float ${duration}s infinite linear ${delay}s`
                    }}
                  />
                );
              })}
            </div>

            {/* Geometric Rose Gold Corner Ornaments - only show in glassy backdrop mode fallback */}
            {hasBackdrop && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="roseGoldGradPreview" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ebd1c5" />
                      <stop offset="50%" stopColor="#c59279" />
                      <stop offset="100%" stopColor="#8c5b43" />
                    </linearGradient>
                    <g id="poppy-corner-preview">
                      <path d="M 12,12 L 48,12 M 12,12 L 12,48" fill="none" stroke="url(#roseGoldGradPreview)" strokeWidth="1.5" />
                      <path d="M 18,18 L 38,18 M 18,18 L 18,38" fill="none" stroke="url(#roseGoldGradPreview)" strokeWidth="0.8" opacity="0.7" />
                      <path d="M 12,30 L 30,12" fill="none" stroke="url(#roseGoldGradPreview)" strokeWidth="0.8" />
                      <path d="M 18,32 L 32,18" fill="none" stroke="url(#roseGoldGradPreview)" strokeWidth="0.8" />
                      <path d="M 22,22 L 26,26 L 22,30 L 18,26 Z" fill="url(#roseGoldGradPreview)" fillOpacity="0.25" stroke="url(#roseGoldGradPreview)" strokeWidth="0.8" />
                      <circle cx="26" cy="26" r="1.5" fill="#e8c4b0" />
                    </g>
                  </defs>
                  <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" fill="none" stroke="url(#roseGoldGradPreview)" strokeWidth="0.8" opacity="0.3" />
                  <use href="#poppy-corner-preview" x="0" y="0" />
                  <use href="#poppy-corner-preview" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                  <use href="#poppy-corner-preview" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                  <use href="#poppy-corner-preview" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                </svg>
              </div>
            )}
          </>
        )}

        {/* Royal decorations */}
        {theme === "royal" && (
          <>
            <div style={{ position: "absolute", top: "10px", left: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
            <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
            <div style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
            <div style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
            <div style={{ position: "absolute", left: "4px", top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: "12px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
            <div style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "12px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
            <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", color: "#C9A227", zIndex: 10, pointerEvents: "none" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.15" />
                <path d="M3 20h18" strokeWidth="2" />
                <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                <circle cx="2" cy="3" r="1.5" fill="currentColor" />
                <circle cx="22" cy="3" r="1.5" fill="currentColor" />
              </svg>
            </div>
          </>
        )}

        {/* Blush decorations */}
        {theme === "blush" && (
          <>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
              <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                <defs>
                  <g id="blush-corner-preview">
                    <path d="M 10,10 C 22,10 26,14 26,26 C 26,20 22,20 22,10" fill="none" stroke="#B76E79" strokeWidth="1" />
                    <path d="M 10,10 C 10,22 14,26 26,26" fill="none" stroke="#B76E79" strokeWidth="1" />
                    <path d="M 14,20 Q 18,18 20,14" fill="none" stroke="#B76E79" strokeWidth="0.75" />
                    <path d="M 20,14 C 24,16 26,20 22,22 C 18,20 18,16 20,14 Z" fill="#E8B4B8" opacity="0.35" />
                  </g>
                </defs>
                <use href="#blush-corner-preview" x="0" y="0" />
                <use href="#blush-corner-preview" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                <use href="#blush-corner-preview" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                <use href="#blush-corner-preview" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
              </svg>
            </div>
            <div style={{ position: "absolute", bottom: "25px", left: "25px", fontSize: "64px", filter: "saturate(35%) opacity(0.22)", pointerEvents: "none", zIndex: 4 }}>
              🌹
            </div>
          </>
        )}

        {/* Letter content */}
        <div
          className="hide-scrollbar stationery-scroll-container"
          style={{
            padding: theme === "royal" ? "24px 24px 24px 24px" :
                     theme === "midnight_rose" ? "48px 56px 40px 56px" :
                     theme === "celestial" ? "48px 56px 40px 56px" :
                     theme === "obsidian_poppy" ? "52px 80px 40px 80px" :
                     "24px 32px 32px 32px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: theme === "obsidian_poppy" ? "8px" : "20px",
            overflowY: "auto",
            zIndex: 6,
          }}
        >
          {/* Greeting header */}
          <div
            className="letter-greeting"
            style={{
              fontWeight: theme === "midnight_rose" ? "bold" :
                          theme === "celestial" ? "normal" :
                          theme === "obsidian_poppy" ? "normal" :
                          theme === "blush" ? "600" :
                          theme === "royal" ? "bold" : "normal",
              fontFamily: theme === "midnight_rose" ? "var(--font-playfair)" :
                          theme === "celestial" ? "var(--font-great-vibes)" :
                          theme === "obsidian_poppy" ? "var(--font-dancing-script)" :
                          theme === "lavender" ? "var(--font-great-vibes)" :
                          "var(--stationery-greeting-font, var(--font-cursive))",
              fontStyle: theme === "midnight_rose" ? "italic" : "normal",
              borderBottom: theme === "blush" || theme === "royal" || theme === "celestial" || theme === "midnight_rose" || theme === "lavender" || theme === "obsidian_poppy" ? "none" : "1px solid rgba(0,0,0,0.05)",
              textAlign: (theme === "blush" || theme === "midnight_rose") ? "center" :
                         theme === "lavender" ? "right" :
                         "left",
              paddingBottom: theme === "obsidian_poppy" ? "2px" : "10px",
              paddingLeft: "0px",
              paddingRight: theme === "lavender" ? "24px" : "0px",
              borderLeft: "none",
              fontSize: theme === "midnight_rose" ? "22px" :
                        theme === "celestial" ? "28px" :
                        theme === "obsidian_poppy" ? "25px" :
                        theme === "lavender" ? "28px" :
                        "22px",
              letterSpacing: "normal",
              textTransform: "none",
              color: theme === "midnight_rose" ? "#1a4325" :
                     theme === "celestial" ? "#d4af37" :
                     theme === "obsidian_poppy" ? "#e8c4b0" :
                     theme === "blush" ? "var(--stationery-text)" : "var(--stationery-accent)",
              textShadow: "none",
            }}
          >
            {greeting ? `${greeting} ` : ""}{recipient || "My Love"},
          </div>

          {theme === "blush" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "-10px 0 5px 0" }}>
              <div style={{ height: "1px", width: "30px", backgroundColor: "#B76E79", opacity: 0.4 }} />
              <span style={{ color: "#E8B4B8", fontSize: "10px" }}>❤</span>
              <div style={{ height: "1px", width: "30px", backgroundColor: "#B76E79", opacity: 0.4 }} />
            </div>
          )}

          {theme === "royal" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "-5px 0 5px 0" }}>
              <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
              <span style={{ color: "#7B1E1E", fontSize: "14px" }}>⚜️</span>
              <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
            </div>
          )}

          {/* Letter body */}
          <div
            className="letter-body"
            style={{ 
              fontSize: "var(--stationery-font-size-preview, 15px)", 
              lineHeight: "var(--stationery-line-height, 1.7)", 
              whiteSpace: "pre-wrap", 
              color: "var(--stationery-text)", 
              fontFamily: "var(--stationery-font)", 
              letterSpacing: "var(--stationery-letter-spacing, 0.3px)", 
              flex: 1 
            }}
          >
            {content || "Start writing your letter in the form on the left. Tell them how much you love them, share a beautiful memory, or write a poem. Your words will appear here in real-time as you write..."}
          </div>

          {/* Sign-off */}
          <div 
            style={{ 
              textAlign: (theme === "blush" || theme === "midnight_rose") ? "center" :
                         (theme === "lavender" || theme === "obsidian_poppy") ? "left" :
                         "right",
              marginTop: "auto", 
              borderTop: "1px solid rgba(0,0,0,0.05)", 
              paddingTop: theme === "obsidian_poppy" ? "10px" : "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: (theme === "blush" || theme === "midnight_rose") ? "center" :
                          (theme === "lavender" || theme === "obsidian_poppy") ? "flex-start" :
                          "flex-end",
              paddingRight: (theme === "blush" || theme === "midnight_rose" || theme === "obsidian_poppy") ? "0px" :
                            theme === "scroll" ? "36px" :
                            theme === "royal" ? "16px" :
                            "0px",
              paddingLeft: theme === "lavender" ? "32px" : "0px",
            }}
          >
            {farewell && (
              <div 
                className="letter-farewell" 
                style={{ 
                  fontFamily: theme === "midnight_rose" ? "var(--font-cormorant)" :
                              theme === "celestial" ? "var(--font-cormorant)" :
                              theme === "obsidian_poppy" ? "var(--font-cormorant)" :
                              theme === "lavender" ? "var(--font-cormorant)" :
                              "var(--stationery-font)",
                  fontStyle: "italic",
                  fontSize: theme === "obsidian_poppy" ? "17px" : "15px",
                  fontWeight: "400",
                  letterSpacing: "normal",
                  textTransform: "none",
                  color: theme === "midnight_rose" ? "#3c2f2f" :
                         theme === "obsidian_poppy" ? "#ebd1c5" :
                         "var(--stationery-text)",
                  opacity: 0.85,
                  marginBottom: "4px" 
                }}
              >
                {farewell}
              </div>
            )}
            <div
              className="letter-signature"
              style={{
                fontFamily: theme === "midnight_rose" ? "var(--font-great-vibes)" :
                            theme === "celestial" ? "var(--font-great-vibes)" :
                            theme === "obsidian_poppy" ? "var(--font-dancing-script)" :
                            theme === "lavender" ? "var(--font-great-vibes)" :
                            "var(--stationery-sig-font, var(--font-cursive))",
                fontSize: (theme === "midnight_rose" || theme === "celestial" || theme === "obsidian_poppy") ? "30px" : "26px",
                lineHeight: "1.2",
                fontWeight: "normal",
                color: theme === "midnight_rose" ? "#1a4325" :
                       theme === "celestial" ? "#ffeea1" :
                       theme === "obsidian_poppy" ? "#ffdcd0" :
                       theme === "lavender" ? "#ffeea1" :
                       theme === "blush" ? "#B76E79" : "var(--stationery-accent)",
                marginTop: "4px",
                letterSpacing: "0.5px",
                textShadow: theme === "celestial" ? "0 0 10px rgba(255, 255, 255, 0.5)" :
                            theme === "obsidian_poppy" ? "0 0 12px rgba(255, 220, 208, 0.2)" :
                            theme === "midnight_rose" ? "none" :
                            "0 0 10px rgba(197, 146, 121, 0.15)",
              }}
            >
              {sender || "Yours Truly"}
            </div>

            {theme === "blush" && (
              <div style={{ width: "100px", height: "1px", background: "linear-gradient(to right, transparent, #B76E79, transparent)", marginTop: "4px", marginLeft: "auto" }} />
            )}

            {theme === "royal" && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "radial-gradient(circle, #a83232 0%, #7B1E1E 60%, #4d0f0f 100%)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", border: "1px solid rgba(123,30,30,0.5)"
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" style={{ opacity: 0.85, filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}>
                    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="#C9A227" fillOpacity="0.2" />
                    <path d="M3 20h18" />
                  </svg>
                  <div style={{ position: "absolute", top: "-2px", left: "-2px", right: "-2px", bottom: "-2px", borderRadius: "50%", border: "1.5px solid #7B1E1E", opacity: 0.35 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

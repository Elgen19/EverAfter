"use client";

import React from "react";

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
  return (
    <div
      className={`theme-${theme} studio-preview-wrapper`}
      style={{
        borderRadius: "16px",
        padding: previewBackdropUrl ? "30px 20px" : "0px",
        backgroundImage: previewBackdropUrl ? `url(${previewBackdropUrl})` : "none",
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
          className="hide-scrollbar"
          style={{
            padding: theme === "royal" ? "36px 24px 24px 24px" : "40px 40px 32px 40px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: "20px",
            overflowY: "auto",
            zIndex: 6,
          }}
        >
          {/* Greeting header */}
          <div
            style={{
              fontSize: theme === "blush" ? "24px" : theme === "royal" ? "24px" : "22px",
              fontWeight: theme === "blush" ? "600" : theme === "royal" ? "bold" : "normal",
              fontFamily: theme === "blush" ? "var(--font-playfair)" : theme === "royal" ? "var(--font-cinzel-dec)" : "var(--font-cursive)",
              borderBottom: theme === "blush" || theme === "royal" ? "none" : "1px solid rgba(0,0,0,0.05)",
              textAlign: theme === "blush" ? "center" : "left",
              paddingBottom: "6px",
              color: theme === "blush" ? "var(--stationery-text)" : "var(--stationery-accent)",
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
            style={{ fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "var(--stationery-text)", fontFamily: "var(--stationery-font)", letterSpacing: "0.3px", flex: 1 }}
          >
            {content || "Start writing your letter in the form on the left. Tell them how much you love them, share a beautiful memory, or write a poem. Your words will appear here in real-time as you write..."}
          </div>

          {/* Sign-off */}
          <div style={{ textAlign: "right", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
            {farewell && (
              <div style={{ fontSize: "16px", fontFamily: "var(--font-cursive)", opacity: 0.75, marginBottom: "4px" }}>
                {farewell}
              </div>
            )}
            <div
              style={{
                fontSize: "24px",
                fontFamily: theme === "blush" ? "var(--font-allura)" : theme === "royal" ? "var(--font-great-vibes)" : "var(--font-cursive)",
                color: theme === "blush" ? "#B76E79" : "var(--stationery-accent)",
                marginTop: "4px",
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

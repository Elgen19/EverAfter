"use client";

import React, { useState } from "react";

interface SecurityGateCreatorProps {
  securityEnabled: boolean;
  setSecurityEnabled: (val: boolean) => void;
  securityType: "date" | "boolean" | "choice";
  setSecurityType: (val: "date" | "boolean" | "choice") => void;
  securityQuestion: string;
  setSecurityQuestion: (val: string) => void;
  securityAnswer: string;
  setSecurityAnswer: (val: string) => void;
  securityChoices: string[];
  setSecurityChoices: (val: string[]) => void;
  securityConfirmed: boolean;
  setSecurityConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

const MONTHS_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const SelectorOrnament = () => (
  <svg width="24" height="12" viewBox="0 0 24 12" style={{ fill: "none", stroke: "#ffd700", strokeWidth: 1.5, opacity: 0.9 }}>
    <path d="M2 6 C6 2, 10 10, 14 6 C18 2, 22 10, 22 6" />
    <circle cx="12" cy="6" r="1.5" fill="#ffd700" />
  </svg>
);

const HeartOrnamentSVG = () => (
  <svg 
    width="32" 
    height="30" 
    viewBox="0 0 24 22" 
    fill="none" 
    style={{
      filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))",
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

export default function SecurityGateCreator({
  securityEnabled,
  setSecurityEnabled,
  securityType,
  setSecurityType,
  securityQuestion,
  setSecurityQuestion,
  securityAnswer,
  setSecurityAnswer,
  securityChoices,
  setSecurityChoices,
  securityConfirmed,
  setSecurityConfirmed,
  showAlert
}: SecurityGateCreatorProps) {
  // Local preview states
  const [previewSwipeOffset, setPreviewSwipeOffset] = useState(0);
  const [isPreviewSwiping, setIsPreviewSwiping] = useState(false);
  const [previewStartX, setPreviewStartX] = useState(0);

  const [previewDialMonth, setPreviewDialMonth] = useState(6);
  const [previewDialDay, setPreviewDialDay] = useState(8);
  const [previewDialYear, setPreviewDialYear] = useState(2026);
  const [previewSelectedChoice, setPreviewSelectedChoice] = useState<string | null>(null);

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={securityEnabled} 
            onChange={(e) => {
              setSecurityEnabled(e.target.checked);
              if (!e.target.checked) setSecurityConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          🔒 Add Security Question
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recipient answer check</span>
      </div>

      {securityEnabled && (
        <div className="creator-accordion-content">
          
          {/* Mode selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { id: "boolean", name: "Secret Yes/No Gate" },
              { id: "date", name: "Anniversary Date Lock" },
              { id: "choice", name: "Love Trivia Quiz" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={securityConfirmed}
                onClick={() => {
                  setSecurityType(item.id as "date" | "boolean" | "choice");
                  setSecurityAnswer("");
                }}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  cursor: securityConfirmed ? "not-allowed" : "pointer",
                  background: securityType === item.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 500,
                  opacity: securityConfirmed ? 0.6 : 1
                }}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Question Prompt</label>
            <input 
              type="text"
              disabled={securityConfirmed}
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder={
                securityType === "boolean" ? "e.g. Is our cat's name Ming?" :
                securityType === "date" ? "e.g. When was our first date?" :
                "e.g. What is my absolute favorite dessert?"
              }
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: securityConfirmed ? 0.6 : 1
              }}
            />
          </div>

          {/* Answer Inputs based on type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Correct Answer</label>
            
            {securityType === "boolean" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["yes", "no"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={securityConfirmed}
                    onClick={() => setSecurityAnswer(val)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      fontSize: "12px",
                      cursor: securityConfirmed ? "not-allowed" : "pointer",
                      borderRadius: "6px",
                      border: securityAnswer === val ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      background: securityAnswer === val ? "rgba(255, 75, 114, 0.1)" : "transparent",
                      color: "#fff",
                      opacity: securityConfirmed ? 0.6 : 1
                    }}
                  >
                    {val === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            )}

            {securityType === "date" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                <input 
                  type="date"
                  disabled={securityConfirmed}
                  value={securityAnswer === "__HASHED__" ? "" : securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                    opacity: securityConfirmed ? 0.6 : 1,
                    width: "100%"
                  }}
                />
                {securityAnswer === "__HASHED__" && (
                  <span style={{ fontSize: "11px", color: "var(--accent-gold)", textAlign: "left", display: "block" }}>
                    🔒 Existing anniversary date lock is encrypted. Select a new date to change it.
                  </span>
                )}
              </div>
            )}

            {securityType === "choice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { idx: 0, placeholder: "Option 1 (e.g. Chocolate Cake)" },
                  { idx: 1, placeholder: "Option 2 (e.g. Red Velvet Cupcake)" },
                  { idx: 2, placeholder: "Option 3 (e.g. Strawberry Ice Cream)" }
                ].map((item) => (
                  <div key={item.idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="radio" 
                      name="correctChoice"
                      disabled={securityConfirmed || !securityChoices[item.idx]}
                      checked={securityAnswer === securityChoices[item.idx] && securityChoices[item.idx] !== ""}
                      onChange={() => setSecurityAnswer(securityChoices[item.idx])}
                      style={{ accentColor: "var(--accent-rose)", cursor: securityConfirmed ? "not-allowed" : "pointer" }}
                    />
                    <input 
                      type="text"
                      disabled={securityConfirmed}
                      value={securityChoices[item.idx]}
                      onChange={(e) => {
                        const newChoices = [...securityChoices];
                        newChoices[item.idx] = e.target.value;
                        setSecurityChoices(newChoices);
                      }}
                      placeholder={item.placeholder}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "#fff",
                        fontSize: "12px",
                        outline: "none",
                        opacity: securityConfirmed ? 0.6 : 1
                      }}
                    />
                  </div>
                ))}
                 {securityAnswer === "__HASHED__" && (
                  <span style={{ fontSize: "11px", color: "var(--accent-gold)", textAlign: "left", display: "block" }}>
                    🔒 Existing correct choice is encrypted (could not match options). Select a radio button next to one of the options to set a new correct choice.
                  </span>
                )}
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  * Fill options, then select the radio button next to the correct answer.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Question Preview */}
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>GATE PREVIEW</span>
            <div 
              style={{ 
                padding: "24px 16px", 
                marginTop: "8px", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center"
              }}
            >
              <div 
                style={{ 
                  fontSize: "32px",
                  fontFamily: "var(--font-cursive)",
                  fontWeight: "normal",
                  color: "#ffd700",
                  lineHeight: "1.4",
                  margin: "2px 0 0 0",
                  textShadow: "0 2px 10px rgba(255, 215, 0, 0.3)"
                }}
              >
                {securityQuestion || "Question prompt will appear here..."}
              </div>

              {/* Ornate Gold Pearl Divider SVG (Responsive stretch matching width of choices) */}
              <div style={{ display: "flex", width: "100%", padding: "0 10px", margin: "8px 0 12px 0", opacity: 0.9, zIndex: 2 }}>
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

              {/* Interactive YES/NO slider */}
              {securityType === "boolean" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div 
                    className="swipe-track"
                    onMouseMove={(e) => {
                      if (!isPreviewSwiping) return;
                      const clientX = e.clientX;
                      let offset = clientX - previewStartX;
                      offset = Math.max(-90, Math.min(90, offset));
                      setPreviewSwipeOffset(offset);
                    }}
                    onMouseUp={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    onMouseLeave={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    onTouchMove={(e) => {
                      if (!isPreviewSwiping) return;
                      const clientX = e.touches[0].clientX;
                      let offset = clientX - previewStartX;
                      offset = Math.max(-90, Math.min(90, offset));
                      setPreviewSwipeOffset(offset);
                    }}
                    onTouchEnd={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    style={{ margin: "10px auto" }}
                  >
                    <span className="swipe-label" style={{ opacity: previewSwipeOffset <= -40 ? 1 : 0.4, color: previewSwipeOffset <= -40 ? "var(--accent-rose)" : "inherit" }}>
                      👈 No
                    </span>
                    
                    <div
                      className="swipe-handle"
                      onMouseDown={(e) => {
                        setIsPreviewSwiping(true);
                        setPreviewStartX(e.clientX - previewSwipeOffset);
                      }}
                      onTouchStart={(e) => {
                        setIsPreviewSwiping(true);
                        setPreviewStartX(e.touches[0].clientX - previewSwipeOffset);
                      }}
                      style={{
                        transform: `translateX(${previewSwipeOffset}px)`,
                        transition: isPreviewSwiping ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      }}
                    >
                      <span style={{ fontSize: "18px", userSelect: "none" }}>❤️</span>
                    </div>
                    
                    <span className="swipe-label" style={{ opacity: previewSwipeOffset >= 40 ? 1 : 0.4, color: previewSwipeOffset >= 40 ? "#2ec4b6" : "inherit" }}>
                      Yes 👉
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Drag the heart slider to preview
                  </p>
                </div>
              )}

              {/* Interactive date combo dial lock */}
              {securityType === "date" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <SharedDefs />

                  {/* Drum Headers */}
                  <div style={{ display: "flex", width: "100%", maxWidth: "370px", justifyContent: "space-between", padding: "0 32px", marginBottom: "6px", zIndex: 2 }}>
                    <span style={{ fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "90px", textAlign: "center", letterSpacing: "1px" }}>Month</span>
                    <span style={{ fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "90px", textAlign: "center", letterSpacing: "1px" }}>Day</span>
                    <span style={{ fontSize: "12px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffd700", textShadow: "0 1px 4px rgba(0,0,0,0.5)", width: "110px", textAlign: "center", letterSpacing: "1px" }}>Year</span>
                  </div>

                  {/* Combination Lock Drum Slots Wrapper with Heavy Gold Border */}
                  <div 
                    style={{
                      display: "flex",
                      width: "100%",
                      maxWidth: "370px",
                      height: "170px",
                      background: "linear-gradient(to bottom, #2b080c 0%, #150204 100%)",
                      border: "8px double #ffd700",
                      borderRadius: "24px",
                      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.85), 0 0 0 1px #b38f36, inset 0 0 25px rgba(0, 0, 0, 0.9)",
                      position: "relative",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 14px",
                      margin: "10px auto",
                      zIndex: 2,
                      scale: "0.85"
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
                      value={previewDialMonth}
                      options={MONTHS_ABBR}
                      onUp={() => setPreviewDialMonth((prev) => (prev === 12 ? 1 : prev + 1))}
                      onDown={() => setPreviewDialMonth((prev) => (prev === 1 ? 12 : prev - 1))}
                      currentIndex={previewDialMonth - 1}
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
                      value={previewDialDay}
                      options={Array.from({ length: 31 }, (_, i) => (i + 1).toString())}
                      onUp={() => setPreviewDialDay((prev) => (prev === 31 ? 1 : prev + 1))}
                      onDown={() => setPreviewDialDay((prev) => (prev === 1 ? 31 : prev - 1))}
                      currentIndex={previewDialDay - 1}
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
                      value={previewDialYear}
                      options={Array.from({ length: 41 }, (_, i) => (1995 + i).toString())}
                      onUp={() => setPreviewDialYear((prev) => prev + 1)}
                      onDown={() => setPreviewDialYear((prev) => prev - 1)}
                      currentIndex={previewDialYear - 1995}
                      width="110px"
                      isYear={true}
                    />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "8px" }}>
                    Scroll or swipe to test spinning dials
                  </p>
                </div>
              )}

              {/* Interactive quiz choices */}
              {securityType === "choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                  {securityChoices.map((choice, i) => {
                    const optionLetter = String.fromCharCode(65 + i);
                    const isSelected = previewSelectedChoice === choice;
                    const displayVal = choice || `Option ${i + 1}`;
                    return (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => setPreviewSelectedChoice(displayVal)}
                        style={{ 
                          width: "100%", 
                          padding: "14px 18px", 
                          fontSize: "13px", 
                          border: isSelected ? "1.5px solid #ffd700" : "1.5px solid rgba(212, 175, 55, 0.25)", 
                          borderRadius: "14px", 
                          color: "#fff", 
                          background: isSelected 
                            ? "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.06) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.35) 1px, transparent 1px), linear-gradient(135deg, rgba(140, 37, 48, 0.65) 0%, rgba(191, 67, 81, 0.45) 100%)"
                            : "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 1px, transparent 1px), radial-gradient(circle at 0 0, rgba(0, 0, 0, 0.3) 1px, transparent 1px), linear-gradient(135deg, rgba(74, 21, 27, 0.5) 0%, rgba(140, 37, 48, 0.35) 100%)",
                          backgroundSize: "4px 4px, 4px 4px, 100% 100%",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          textAlign: "left", 
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          boxShadow: isSelected 
                            ? "0 0 15px rgba(255, 215, 0, 0.255), inset 0 0 10px rgba(255, 215, 0, 0.15)"
                            : "0 4px 10px rgba(0,0,0,0.3)"
                        }}
                      >
                        <span 
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #b38f36 0%, #ffd700 50%, #b38f36 100%)",
                            border: "1.5px solid #8a6f27",
                            color: "#3a2305",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.5), inset 0 0 0 1.2px #fff5c0, inset 0 0 0 2.4px #b38f36, inset 0 0 0 3.6px #ffd700"
                          }}
                        >
                          {optionLetter}
                        </span>
                        <span style={{ fontSize: "15px", fontFamily: "Georgia, serif", color: "#ffd700", textShadow: "0 1px 2px rgba(0,0,0,0.85)", letterSpacing: "0.5px" }}>{displayVal}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Confirm Question lock button */}
          <button
            type="button"
            onClick={() => {
              if (!securityQuestion.trim() || !securityAnswer.trim()) {
                if (showAlert) {
                  showAlert("Security Configuration Incomplete", "To protect your secret letter, please provide both a question and the correct answer before confirming.");
                } else {
                  alert("Please fill in question prompt and correct answer before confirming.");
                }
                return;
              }
              setSecurityConfirmed(!securityConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: securityConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: securityConfirmed ? "0 0 10px rgba(46, 196, 182, 0.2)" : "none",
              transition: "all 0.2s"
            }}
          >
            {securityConfirmed ? "✓ Question Confirmed! (Click to Edit)" : "Confirm Question 💖"}
          </button>

        </div>
      )}
    </div>
  );
}

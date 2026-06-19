"use client";

import React, { useState, useEffect, useRef } from "react";

// Inline Typewriter for Creator Studio previews
function TypewriterPreview({ text, speed = 60, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!text) return;
    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += 1;
      setDisplayedText(text.substring(0, currentLength));
      if (currentLength >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);

    return () => {
      clearInterval(interval);
      setDisplayedText("");
    };
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

interface IntroCreatorProps {
  introEnabled: boolean;
  setIntroEnabled: (val: boolean) => void;
  introText: string;
  setIntroText: (val: string) => void;
  introAnimation: "typewriter" | "fade-float" | "pulse";
  setIntroAnimation: (val: "typewriter" | "fade-float" | "pulse") => void;
  introConfirmed: boolean;
  setIntroConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function IntroCreator({
  introEnabled,
  setIntroEnabled,
  introText,
  setIntroText,
  introAnimation,
  setIntroAnimation,
  introConfirmed,
  setIntroConfirmed,
  showAlert
}: IntroCreatorProps) {
  const [introReplay, setIntroReplay] = useState(0);

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={introEnabled} 
            onChange={(e) => {
              setIntroEnabled(e.target.checked);
              if (!e.target.checked) setIntroConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          ✨ Introductory Statement
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Displays before envelope</span>
      </div>

      {introEnabled && (
        <div className="creator-accordion-content">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)" }}>Statement Text (Required)</span>
              <span style={{ color: introText.length > 200 ? "var(--accent-rose)" : "var(--text-muted)" }}>
                {introText.length}/200
              </span>
            </div>
            <textarea 
              value={introText}
              disabled={introConfirmed}
              onChange={(e) => setIntroText(e.target.value.slice(0, 200))}
              placeholder="Write a catchy introductory phrase..."
              required={introEnabled}
              rows={2}
              maxLength={200}
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                resize: "none",
                opacity: introConfirmed ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Animation Style</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "typewriter", name: "Typewriter" },
                { id: "fade-float", name: "Fade & Float" },
                { id: "pulse", name: "Pulse Beat" }
              ].map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  disabled={introConfirmed}
                  onClick={() => setIntroAnimation(anim.id as "typewriter" | "fade-float" | "pulse")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    cursor: introConfirmed ? "not-allowed" : "pointer",
                    background: introAnimation === anim.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#fff",
                    opacity: introConfirmed ? 0.6 : 1
                  }}
                >
                  {anim.name}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Style Preview Box */}
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>ANIMATION PREVIEW</span>
              <button 
                type="button"
                onClick={() => setIntroReplay(r => r + 1)}
                style={{ background: "none", border: "none", color: "var(--accent-purple)", fontSize: "11px", cursor: "pointer" }}
              >
                🔄 Replay
              </button>
            </div>
            <div className="creator-preview-box">
              <div
                key={`${introAnimation}-${introText.length}-${introReplay}`}
                className={`font-${introAnimation} preview-font ${introAnimation !== "typewriter" ? `anim-${introAnimation}` : ""}`}
                style={{
                  textAlign: "center",
                  color: "#fff",
                  width: "100%"
                }}
              >
                {introAnimation === "typewriter" ? (
                  <TypewriterPreview text={introText || "I have a message for you..."} speed={50} />
                ) : (
                  <span>{introText || "I have a message for you..."}</span>
                )}
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={() => {
              if (!introText.trim()) {
                if (showAlert) {
                  showAlert("Introductory Statement Required", "Do not leave them waiting, sweetheart. Please enter your introductory statement to set the perfect mood.");
                } else {
                  alert("Please write statement text before confirming.");
                }
                return;
              }
              setIntroConfirmed(!introConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: introConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {introConfirmed ? "✓ Intro Confirmed! (Click to Edit)" : "Confirm Intro 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

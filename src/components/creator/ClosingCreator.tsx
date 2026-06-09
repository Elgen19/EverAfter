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

interface ClosingCreatorProps {
  closingEnabled: boolean;
  setClosingEnabled: (val: boolean) => void;
  closingText: string;
  setClosingText: (val: string) => void;
  closingAnimation: "typewriter" | "fade-float" | "pulse";
  setClosingAnimation: (val: "typewriter" | "fade-float" | "pulse") => void;
  closingConfirmed: boolean;
  setClosingConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function ClosingCreator({
  closingEnabled,
  setClosingEnabled,
  closingText,
  setClosingText,
  closingAnimation,
  setClosingAnimation,
  closingConfirmed,
  setClosingConfirmed,
  showAlert
}: ClosingCreatorProps) {
  const [closingReplay, setClosingReplay] = useState(0);

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={closingEnabled} 
            onChange={(e) => {
              setClosingEnabled(e.target.checked);
              if (!e.target.checked) setClosingConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          ✍ Closing Statement (P.S.)
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Displays after letter</span>
      </div>

      {closingEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingLeft: "20px", borderLeft: "2px solid var(--accent-rose)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)" }}>Statement Text (Required)</span>
              <span style={{ color: closingText.length > 200 ? "var(--accent-rose)" : "var(--text-muted)" }}>
                {closingText.length}/200
              </span>
            </div>
            <textarea 
              value={closingText}
              disabled={closingConfirmed}
              onChange={(e) => setClosingText(e.target.value.slice(0, 200))}
              placeholder="e.g. P.S. Count down the days until we meet again..."
              required={closingEnabled}
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
                opacity: closingConfirmed ? 0.6 : 1
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
                  disabled={closingConfirmed}
                  onClick={() => setClosingAnimation(anim.id as "typewriter" | "fade-float" | "pulse")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    cursor: closingConfirmed ? "not-allowed" : "pointer",
                    background: closingAnimation === anim.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#fff",
                    opacity: closingConfirmed ? 0.6 : 1
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
                onClick={() => setClosingReplay(r => r + 1)}
                style={{ background: "none", border: "none", color: "var(--accent-purple)", fontSize: "11px", cursor: "pointer" }}
              >
                🔄 Replay
              </button>
            </div>
            <div className="creator-preview-box">
              <div
                key={`${closingAnimation}-${closingText.length}-${closingReplay}`}
                className={`font-${closingAnimation} preview-font ${closingAnimation !== "typewriter" ? `anim-${closingAnimation}` : ""}`}
                style={{
                  textAlign: "center",
                  color: "#fff",
                  width: "100%"
                }}
              >
                {closingAnimation === "typewriter" ? (
                  <TypewriterPreview text={closingText || "P.S. I miss you..."} speed={50} />
                ) : (
                  <span>{closingText || "P.S. I miss you..."}</span>
                )}
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={() => {
              if (!closingText.trim()) {
                if (showAlert) {
                  showAlert("Closing Statement Required", "Do not leave them without a beautiful farewell, sweetheart. Please enter your P.S. closing statement.");
                } else {
                  alert("Please write statement text before confirming.");
                }
                return;
              }
              setClosingConfirmed(!closingConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: closingConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {closingConfirmed ? "✓ Closing Confirmed! (Click to Edit)" : "Confirm Closing 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

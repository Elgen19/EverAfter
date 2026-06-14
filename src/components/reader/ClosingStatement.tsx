"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Custom typewriter component for multi-line support
function Typewriter({ text, speed = 60, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = React.useRef(onComplete);

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

interface ClosingStatementProps {
  text: string;
  animation: "typewriter" | "fade-float" | "pulse";
  isLastStep: boolean;
  onComplete: () => void;
}

export default function ClosingStatement({ text, animation, isLastStep, onComplete }: ClosingStatementProps) {
  const [closingStage, setClosingStage] = useState<"before" | "animating" | "completed" | "exiting">("before");

  useEffect(() => {
    setClosingStage("before");
    let entryTimer: NodeJS.Timeout | null = null;
    const beforeTimer = setTimeout(() => {
      setClosingStage("animating");
      if (animation !== "typewriter") {
        entryTimer = setTimeout(() => {
          setClosingStage("completed");
        }, 1000);
      }
    }, 1000);

    return () => {
      clearTimeout(beforeTimer);
      if (entryTimer) clearTimeout(entryTimer);
    };
  }, [text, animation]);

  useEffect(() => {
    if (closingStage === "completed") {
      if (isLastStep) {
        // Do not auto-advance or fade out if it is the last step
        return;
      }

      const textLength = text.length;
      const readingDelay = Math.max(2000, textLength * 55 + 1500);
      const timer = setTimeout(() => {
        setClosingStage("exiting");
      }, readingDelay);
      return () => clearTimeout(timer);
    }
  }, [closingStage, text, isLastStep]);

  useEffect(() => {
    if (closingStage === "exiting") {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [closingStage, onComplete]);

  return (
    <div 
      style={{
        maxWidth: "600px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        padding: "20px",
      }}
    >
      <div
        className={`font-${animation} reader-font ${animation !== "typewriter" ? `anim-${animation}` : ""}`}
        style={{
          minHeight: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          opacity: (closingStage === "before" || closingStage === "exiting") ? 0 : 1,
          transition: "opacity 2.5s ease-in-out",
        }}
      >
        {animation === "typewriter" ? (
          closingStage !== "before" && (
            <Typewriter 
              text={text} 
              speed={55}
              onComplete={() => setClosingStage("completed")} 
            />
          )
        ) : (
          <span>{text}</span>
        )}
      </div>

      {isLastStep && closingStage === "completed" && (
        <div style={{ animation: "float-up-intro 0.6s ease" }}>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.close();
                setTimeout(() => {
                  window.location.href = "/dashboard";
                }, 150);
              }
            }}
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-muted)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-card)";
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

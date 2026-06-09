"use client";

import React, { useState, useEffect } from "react";

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

interface IntroStatementProps {
  text: string;
  animation: "typewriter" | "fade-float" | "pulse";
  onComplete: () => void;
}

export default function IntroStatement({ text, animation, onComplete }: IntroStatementProps) {
  const [introStage, setIntroStage] = useState<"before" | "animating" | "completed" | "exiting">("before");

  useEffect(() => {
    setIntroStage("before");
    let entryTimer: NodeJS.Timeout | null = null;
    const beforeTimer = setTimeout(() => {
      setIntroStage("animating");
      if (animation !== "typewriter") {
        entryTimer = setTimeout(() => {
          setIntroStage("completed");
        }, 1000);
      }
    }, 1000);

    return () => {
      clearTimeout(beforeTimer);
      if (entryTimer) clearTimeout(entryTimer);
    };
  }, [text, animation]);

  useEffect(() => {
    if (introStage === "completed") {
      const textLength = text.length;
      const readingDelay = Math.max(2000, textLength * 55 + 1500);
      const timer = setTimeout(() => {
        setIntroStage("exiting");
      }, readingDelay);
      return () => clearTimeout(timer);
    }
  }, [introStage, text]);

  useEffect(() => {
    if (introStage === "exiting") {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [introStage, onComplete]);

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
          opacity: (introStage === "before" || introStage === "exiting") ? 0 : 1,
          transition: "opacity 1.0s ease-in-out",
        }}
      >
        {animation === "typewriter" ? (
          introStage !== "before" && (
            <Typewriter 
              text={text} 
              speed={55}
              onComplete={() => setIntroStage("completed")} 
            />
          )
        ) : (
          <span>{text}</span>
        )}
      </div>
    </div>
  );
}

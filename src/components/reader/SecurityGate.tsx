"use client";

import React, { useState, useEffect, useRef } from "react";

interface SecurityGateProps {
  securityData: {
    type: "date" | "boolean" | "choice";
    question: string;
    answer: string;
    choices?: string[];
  };
  onSuccess: () => void;
}

export default function SecurityGate({ securityData, onSuccess }: SecurityGateProps) {
  const [shaking, setShaking] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [showInputs, setShowInputs] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // YES/NO swipe states
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);

  // Date dials states
  const [dialMonth, setDialMonth] = useState(6);
  const [dialDay, setDialDay] = useState(8);
  const [dialYear, setDialYear] = useState(2026);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id");
      const d = searchParams.get("d");
      const key = id ? `unlocked_${id}` : (d ? `unlocked_${d.slice(0, 10)}` : "unlocked_temp");
      if (sessionStorage.getItem(key) === "true") {
        onSuccess();
        return;
      }
    }

    const timer = setTimeout(() => {
      setShowInputs(true);
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [onSuccess]);

  const checkAnswer = (answerProvided: string) => {
    let correct = securityData.answer.trim().toLowerCase();
    let provided = answerProvided.trim().toLowerCase();

    // Map True/False to Yes/No
    if (correct === "true") correct = "yes";
    if (correct === "false") correct = "no";
    if (provided === "true") provided = "yes";
    if (provided === "false") provided = "no";

    if (correct === provided) {
      setSecurityError("");
      onSuccess();
    } else {
      setSecurityError("A sweet guess, but that's not the key to my heart... Try again, darling! 💖");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);

      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setSecurityError("");
      }, 4000);
    }
  };

  const playClickSound = (freq: number) => {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch {}
    }
  };

  const isDarkBgType = securityData.type === "boolean" || securityData.type === "choice";

  return (
    <div 
      className={`${shaking ? "shake-anim" : ""} animate-reveal hide-scrollbar`}
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        animation: "float-up-intro 0.6s ease",
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        background: isDarkBgType ? "rgba(25, 12, 22, 0.95)" : undefined,
        border: isDarkBgType ? "1.5px solid var(--accent-gold)" : undefined,
        borderRadius: isDarkBgType ? "20px" : undefined,
        boxShadow: isDarkBgType ? "0 15px 40px rgba(0, 0, 0, 0.5)" : undefined,
        backdropFilter: isDarkBgType ? "blur(12px)" : undefined,
        WebkitBackdropFilter: isDarkBgType ? "blur(12px)" : undefined,
      }}
    >
      <style>{`
        @keyframes fadeInSecurityQuestion {
          from { transform: scale(0.98); filter: blur(2px); }
          to { transform: scale(1); filter: blur(0); }
        }
        @keyframes fadeInSecurityInputs {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div 
        style={{ 
          opacity: 1,
          fontSize: "42px",
          fontFamily: "var(--font-cursive)",
          fontWeight: "normal",
          color: "#fff",
          lineHeight: "1.4",
          margin: "12px 0 0 0",
          animation: "fadeInSecurityQuestion 1.5s ease-in-out 0.2s forwards"
        }}
      >
        {securityData.question}
      </div>

      {showInputs && (
        <div style={{ animation: "fadeInSecurityInputs 1s ease-in-out forwards", width: "100%", marginTop: "10px" }}>
          
          {securityData.type === "boolean" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div 
                className="swipe-track"
                onMouseMove={(e) => {
                  if (!isSwiping) return;
                  const clientX = e.clientX;
                  let offset = clientX - startX;
                  offset = Math.max(-90, Math.min(90, offset));
                  setSwipeOffset(offset);
                }}
                onMouseUp={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  if (swipeOffset >= 75) checkAnswer("yes");
                  else if (swipeOffset <= -75) checkAnswer("no");
                  setSwipeOffset(0);
                }}
                onMouseLeave={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  setSwipeOffset(0);
                }}
                onTouchMove={(e) => {
                  if (!isSwiping) return;
                  const clientX = e.touches[0].clientX;
                  let offset = clientX - startX;
                  offset = Math.max(-90, Math.min(90, offset));
                  setSwipeOffset(offset);
                }}
                onTouchEnd={() => {
                  if (!isSwiping) return;
                  setIsSwiping(false);
                  if (swipeOffset >= 75) checkAnswer("yes");
                  else if (swipeOffset <= -75) checkAnswer("no");
                  setSwipeOffset(0);
                }}
              >
                <span className="swipe-label" style={{ opacity: swipeOffset <= -40 ? 1 : 0.4, color: swipeOffset <= -40 ? "var(--accent-rose)" : "inherit" }}>
                  👈 No
                </span>
                
                <div
                  className="swipe-handle"
                  onMouseDown={(e) => {
                    setIsSwiping(true);
                    setStartX(e.clientX - swipeOffset);
                  }}
                  onTouchStart={(e) => {
                    setIsSwiping(true);
                    setStartX(e.touches[0].clientX - swipeOffset);
                  }}
                  style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: isSwiping ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  }}
                >
                  <span style={{ fontSize: "18px", userSelect: "none" }}>❤️</span>
                </div>
                
                <span className="swipe-label" style={{ opacity: swipeOffset >= 40 ? 1 : 0.4, color: swipeOffset >= 40 ? "#2ec4b6" : "inherit" }}>
                  Yes 👉
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                Swipe left for No, right for Yes
              </p>
            </div>
          )}

          {securityData.type === "date" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="date-lock-container">
                <div className="dial-column">
                  <button 
                    type="button" 
                    className="dial-btn"
                    onClick={() => {
                      playClickSound(600);
                      setDialMonth((prev) => (prev === 12 ? 1 : prev + 1));
                    }}
                  >
                    ▲
                  </button>
                  <div className="dial-window">{dialMonth.toString().padStart(2, "0")}</div>
                  <button 
                    type="button" 
                    className="dial-btn down"
                    onClick={() => {
                      playClickSound(450);
                      setDialMonth((prev) => (prev === 1 ? 12 : prev - 1));
                    }}
                  >
                    ▼
                  </button>
                  <span className="dial-label">Month</span>
                </div>

                <div className="dial-column">
                  <button 
                    type="button" 
                    className="dial-btn"
                    onClick={() => {
                      playClickSound(600);
                      setDialDay((prev) => (prev === 31 ? 1 : prev + 1));
                    }}
                  >
                    ▲
                  </button>
                  <div className="dial-window">{dialDay.toString().padStart(2, "0")}</div>
                  <button 
                    type="button" 
                    className="dial-btn down"
                    onClick={() => {
                      playClickSound(450);
                      setDialDay((prev) => (prev === 1 ? 31 : prev - 1));
                    }}
                  >
                    ▼
                  </button>
                  <span className="dial-label">Day</span>
                </div>

                <div className="dial-column">
                  <button 
                    type="button" 
                    className="dial-btn"
                    onClick={() => {
                      playClickSound(600);
                      setDialYear((prev) => (prev === 2035 ? 1995 : prev + 1));
                    }}
                  >
                    ▲
                  </button>
                  <div className="dial-window">{dialYear}</div>
                  <button 
                    type="button" 
                    className="dial-btn down"
                    onClick={() => {
                      playClickSound(450);
                      setDialYear((prev) => (prev === 1995 ? 2035 : prev - 1));
                    }}
                  >
                    ▼
                  </button>
                  <span className="dial-label">Year</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const pad = (n: number) => n.toString().padStart(2, "0");
                  const dateStr = `${dialYear}-${pad(dialMonth)}-${pad(dialDay)}`;
                  checkAnswer(dateStr);
                }}
                style={{
                  padding: "12px 32px",
                  borderRadius: "30px",
                  backgroundColor: "var(--accent-gold)",
                  color: "#16120c",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(226, 184, 87, 0.35)",
                  marginTop: "12px",
                  transition: "transform 0.1s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                Pull Latch & Unlock 🔑
              </button>
            </div>
          )}

          {securityData.type === "choice" && securityData.choices && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {securityData.choices.map((choice, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => checkAnswer(choice)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-card)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-purple)";
                      e.currentTarget.style.background = "rgba(156, 108, 250, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-card)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  >
                    <span className="quiz-option-badge">{optionLetter}</span>
                    <span>{choice}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {securityError && (
        <p style={{ color: "var(--accent-rose)", fontSize: "14px", fontWeight: 600, marginTop: "12px", animation: "shake 0.3s ease", textShadow: "0 0 8px rgba(255, 75, 114, 0.4)" }}>
          {securityError}
        </p>
      )}
    </div>
  );
}

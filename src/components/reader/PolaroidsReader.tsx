"use client";

import React, { useState, useEffect } from "react";
import { PolaroidItem } from "@/utils/encoding";

interface PolaroidsReaderProps {
  polaroids: PolaroidItem[];
  theme: string;
  onComplete: () => void;
}

export default function PolaroidsReader({
  polaroids,
  theme,
  onComplete,
}: PolaroidsReaderProps) {
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [topIndex, setTopIndex] = useState<number>(0);
  const [slidingIndex, setSlidingIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [interacted, setInteracted] = useState<boolean>(false);

  // Initialize and filter out any empty records
  useEffect(() => {
    if (polaroids && Array.isArray(polaroids)) {
      const filtered = polaroids.filter(p => p.imageUrl && p.imageUrl.trim() !== "");
      setItems(filtered);
      setTopIndex(filtered.length - 1);
    }
  }, [polaroids]);

  // Synthesize paper swoosh/rustle sound using Web Audio API
  const playSwooshSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const duration = 0.22;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Populate buffer with noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Soft low-pass filter sweep
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + duration);
      
      // Volume fade envelope
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime); // Keep it ambient
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noise.start();
    } catch (err) {
      // Autoplay rules might block audio if they haven't clicked the page yet
      console.log("Web Audio API blocked or not supported:", err);
    }
  };

  const handleCardClick = (index: number) => {
    if (slidingIndex !== null) return;
    setInteracted(true);

    if (index === topIndex) {
      // If it's already the top card, click flips it
      setFlippedIndex(flippedIndex === index ? null : index);
      playSwooshSound();
    } else {
      // If it's a background card, slide it out and put it on top of the stack
      setSlidingIndex(index);
      setFlippedIndex(null);
      playSwooshSound();

      // Step 1: Slide out
      setTimeout(() => {
        // Step 2: Update top card index
        setTopIndex(index);
        
        // Step 3: Slide back in on top
        setTimeout(() => {
          setSlidingIndex(null);
        }, 350);
      }, 350);
    }
  };

  if (items.length === 0) {
    return (
      <div className="glass" style={{ maxWidth: "480px", padding: "40px", textAlign: "center" }}>
        <h3 style={{ fontSize: "20px", color: "var(--accent-rose)", marginBottom: "8px", fontFamily: "var(--font-cursive)" }}>No Photos Sealed</h3>
        <button className="glowing-mailbox-btn" onClick={onComplete} style={{ marginTop: "16px", padding: "10px 24px", border: "none", borderRadius: "8px", background: "var(--accent-rose)", color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
          Continue Journey
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        width: "100%", 
        maxWidth: "460px",
        padding: "0 20px"
      }}
    >
      <style>{`
        .polaroid-card-container {
          perspective: 1000px;
          position: relative;
          width: 270px;
          height: 320px;
          margin-bottom: 24px;
        }
        .polaroid-card {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background-color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 12px 12px 32px 12px;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, z-index 0.3s ease;
          cursor: pointer;
        }
        .polaroid-card:hover {
          box-shadow: 0 12px 28px rgba(0,0,0,0.3);
        }
        .polaroid-front {
          position: absolute;
          inset: 12px 12px 32px 12px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .polaroid-image {
          width: 100%;
          height: 220px;
          border-radius: 4px;
          background-color: #efefef;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .polaroid-caption-wrapper {
          flex: 1;
          display: flex;
          alignItems: center;
          justifyContent: center;
          text-align: center;
        }
        .polaroid-caption {
          font-family: var(--font-cursive);
          font-size: 14px;
          color: #4f4f4f;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 4px;
        }
        .polaroid-back {
          position: absolute;
          inset: 0;
          background-color: #faf6ee;
          background-image: radial-gradient(#d3c7b7 0.5px, transparent 0.5px);
          background-size: 8px 8px;
          border-radius: 8px;
          padding: 24px 16px;
          transform: rotateY(180deg);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          box-shadow: inset 0 0 15px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.03);
        }
        .polaroid-back-header {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--accent-rose);
          font-weight: bold;
          border-bottom: 1.5px dashed rgba(255, 75, 114, 0.25);
          padding-bottom: 8px;
          margin-bottom: 16px;
          width: 80%;
        }
        .polaroid-back-text {
          font-family: var(--font-cursive);
          font-size: 15px;
          color: #3b3b3b;
          line-height: 1.6;
          margin: 0;
          padding: 0 10px;
          word-break: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
        }
        .polaroid-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 10px;
          text-align: center;
          animation: pulse-hint 2s ease-in-out infinite;
        }
        @keyframes pulse-hint {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @media (max-width: 480px) {
          .polaroid-card-container {
            width: 220px;
            height: 270px;
          }
          .polaroid-front {
            inset: 10px 10px 28px 10px;
          }
          .polaroid-image {
            height: 180px;
          }
          .polaroid-caption {
            font-size: 12px;
          }
          .polaroid-back-text {
            font-size: 13px;
          }
        }
      `}</style>

      {/* 3D Polaroid stack container */}
      <div className="polaroid-card-container">
        {items.map((item, index) => {
          const isTop = index === topIndex;
          const isSliding = index === slidingIndex;
          const isFlipped = index === flippedIndex && isTop;

          // Static rotation values to create staggered look
          let rotation = "-4deg";
          let offsetX = "-14px";
          let offsetY = "0px";
          if (index % 3 === 1) {
            rotation = "4deg";
            offsetX = "14px";
            offsetY = "-8px";
          } else if (index % 3 === 2) {
            rotation = "-1deg";
            offsetX = "0px";
            offsetY = "6px";
          }

          // Build dynamic transformations
          let transformStr = "";
          if (isSliding) {
            // Slide card out to the side
            transformStr = "translateX(220px) rotate(16deg) scale(1.05)";
          } else if (isFlipped) {
            // Flip the top card
            transformStr = "rotateY(180deg) scale(1.05) translate(0, 0)";
          } else if (isTop) {
            // Top card sits flat and slightly scaled up
            transformStr = "rotateY(0deg) scale(1.05) translate(0, 0)";
          } else {
            // Underneath cards remain staggered
            transformStr = `rotateY(0deg) rotate(${rotation}) translate(${offsetX}, ${offsetY})`;
          }

          return (
            <div
              key={index}
              className="polaroid-card"
              style={{
                transform: transformStr,
                zIndex: isSliding ? 40 : isTop ? 30 : 10 + index,
                pointerEvents: slidingIndex !== null ? "none" : "auto"
              }}
              onClick={() => handleCardClick(index)}
              title={isTop ? "Click to flip card" : "Click to bring to front"}
            >
              {/* Front side */}
              <div className="polaroid-front">
                <div 
                  className="polaroid-image"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
                <div className="polaroid-caption-wrapper">
                  <span className="polaroid-caption">
                    {item.caption || "A Sealed Memory"}
                  </span>
                </div>
              </div>

              {/* Back side */}
              <div className="polaroid-back">
                <div className="polaroid-back-header">Memory Details</div>
                <p className="polaroid-back-text">
                  {item.caption || "Sealed inside EverAfter... 💖"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interaction Hint */}
      <span className="polaroid-hint">
        {topIndex === items.length - 1 && !interacted 
          ? "👇 Click the top photo to flip it, or others to reorder!"
          : "✨ Click top card to flip, background cards to shuffle"}
      </span>

      {/* Continue wizard button */}
      <button
        className="glowing-mailbox-btn"
        onClick={onComplete}
        style={{
          marginTop: "30px",
          padding: "12px 32px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "var(--accent-rose)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
          transition: "all 0.3s ease"
        }}
      >
        Continue Journey ➔
      </button>
    </div>
  );
}

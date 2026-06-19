"use client";

import React, { useState, useEffect } from "react";
import { PolaroidItem } from "@/utils/encoding";

interface PolaroidsReaderProps {
  polaroids: PolaroidItem[];
  theme: string;
  onComplete: () => void;
  isSheetExpanded?: boolean;
}

export default function PolaroidsReader({
  polaroids,
  theme,
  onComplete,
  isSheetExpanded = false,
}: PolaroidsReaderProps) {
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [topIndex, setTopIndex] = useState<number>(0);
  const [slidingIndex, setSlidingIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [interacted, setInteracted] = useState<boolean>(false);

  // Dragging and swiping states
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const [entryComplete, setEntryComplete] = useState(false);

  // Initialize and filter out any empty records
  useEffect(() => {
    if (polaroids && Array.isArray(polaroids)) {
      const filtered = polaroids.filter(p => p.imageUrl && p.imageUrl.trim() !== "");
      setItems(filtered);
      setTopIndex(filtered.length - 1);
    }
  }, [polaroids]);

  // Trigger staggered swoosh sounds and settle the entry Complete state
  useEffect(() => {
    if (isSheetExpanded && items.length > 0) {
      // Play staggered swoosh sound for each card shooting out of the envelope
      const soundTimers = items.map((_, index) => {
        return setTimeout(() => {
          playSwooshSound();
        }, index * 150 + 150); // aligned with card entry delay + 150ms buffer
      });

      // Mark entry complete once all cards are fully settled
      const settleDelay = Math.max(0, items.length - 1) * 150 + 1100;
      const settleTimer = setTimeout(() => {
        setEntryComplete(true);
      }, settleDelay);

      return () => {
        soundTimers.forEach((t) => clearTimeout(t));
        clearTimeout(settleTimer);
      };
    } else {
      setEntryComplete(false);
    }
  }, [isSheetExpanded, items.length]);

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

  const triggerSwipe = (dir: "left" | "right") => {
    setSwipeDirection(dir);
    setSlidingIndex(topIndex);
    setFlippedIndex(null);
    playSwooshSound();
    setInteracted(true);

    // Apply swipe translation offset
    setDragOffset({ x: dir === "right" ? 350 : -350, y: 0 });

    setTimeout(() => {
      // Rotate items array: top card (last element) goes to bottom (first element)
      setItems((prevItems) => {
        if (prevItems.length <= 1) return prevItems;
        const last = prevItems[prevItems.length - 1];
        const rest = prevItems.slice(0, prevItems.length - 1);
        return [last, ...rest];
      });

      setSlidingIndex(null);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 350);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (slidingIndex !== null || swipeDirection !== null) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (dragOffset.x > threshold) {
      triggerSwipe("right");
    } else if (dragOffset.x < -threshold) {
      triggerSwipe("left");
    } else {
      // If drag distance is small, treat as click to flip
      if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
        setFlippedIndex(flippedIndex === topIndex ? null : topIndex);
        playSwooshSound();
      }
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (slidingIndex !== null || swipeDirection !== null) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80;
    if (dragOffset.x > threshold) {
      triggerSwipe("right");
    } else if (dragOffset.x < -threshold) {
      triggerSwipe("left");
    } else {
      // If drag distance is small, treat as click to flip
      if (Math.abs(dragOffset.x) < 8 && Math.abs(dragOffset.y) < 8) {
        setFlippedIndex(flippedIndex === topIndex ? null : topIndex);
        playSwooshSound();
      }
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleCardClick = (index: number) => {
    if (slidingIndex !== null || swipeDirection !== null) return;
    setInteracted(true);

    if (index === topIndex) {
      setFlippedIndex(flippedIndex === index ? null : index);
      playSwooshSound();
    } else {
      // Clicking a background card cycles the top card off
      triggerSwipe("left");
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
          padding: 12px 12px 36px 12px;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, z-index 0.3s ease;
          cursor: pointer;
          touch-action: none;
        }
        .polaroid-card:hover {
          box-shadow: 0 12px 28px rgba(0,0,0,0.3);
        }
        .polaroid-front {
          position: absolute;
          inset: 12px 12px 36px 12px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .polaroid-image {
          width: 100%;
          height: 272px;
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
          .polaroid-card {
            padding: 10px 10px 30px 10px;
          }
          .polaroid-front {
            inset: 10px 10px 30px 10px;
          }
          .polaroid-image {
            height: 230px;
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
          if (!isSheetExpanded) {
            // Tucked inside the envelope pocket
            transformStr = "scale(0.05) translateY(240px) rotate(0deg)";
          } else if (isTop && (isDragging || swipeDirection !== null)) {
            // Top card is active, dragging, or swiping
            const rotateVal = dragOffset.x * 0.05;
            const flipRotation = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
            transformStr = `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotateVal}deg) ${flipRotation} scale(1.05)`;
          } else if (isSliding) {
            // Slide card out to the side (fallback click transition)
            transformStr = "translateX(220px) rotate(16deg) scale(1.05)";
          } else if (isFlipped) {
            // Flip the top card
            transformStr = "rotateY(180deg) scale(1.05) translateY(-20px)";
          } else if (isTop) {
            // Top card sits flat and slightly scaled up
            transformStr = "rotateY(0deg) scale(1.05) translateY(-20px)";
          } else {
            // Underneath cards remain staggered
            transformStr = `rotateY(0deg) rotate(${rotation}) translate(${offsetX}, calc(${offsetY} - 20px))`;
          }

          // Top card drag handlers, background cards click handlers
          const cardHandlers = (isTop && items.length > 1) ? {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseLeave,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
          } : {
            onClick: () => handleCardClick(index),
          };

          return (
            <div
              key={item.imageUrl || index}
              className="polaroid-card"
              style={{
                transform: transformStr,
                zIndex: isSliding ? 40 : isTop ? 30 : 10 + index,
                pointerEvents: (slidingIndex !== null && !isDragging) || !isSheetExpanded ? "none" : "auto",
                transition: isTop && isDragging ? "none" : (
                  isSheetExpanded
                    ? `transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 150}ms, box-shadow 0.3s ease, z-index 0.3s ease`
                    : `transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0ms, box-shadow 0.3s ease, z-index 0.3s ease`
                )
              }}
              {...cardHandlers}
              title={isTop ? (items.length > 1 ? "Drag left/right to browse, click to flip" : "Click to flip") : "Click to browse"}
            >
              {/* Front side - Only photo, no words */}
              <div className="polaroid-front">
                <div 
                  className="polaroid-image"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
                <div className="polaroid-caption-wrapper" />
              </div>

              {/* Back side - Words / Caption */}
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
      <span 
        className="polaroid-hint"
        style={{
          opacity: entryComplete ? 0.7 : 0,
          transform: entryComplete ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          pointerEvents: entryComplete ? "auto" : "none"
        }}
      >
        {items.length > 1
          ? interacted
            ? "✨ Swipe left/right to browse, click top card to flip"
            : "👇 Swipe left/right to browse, click top photo to flip!"
          : "✨ Click photo to flip"}
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
          opacity: entryComplete ? 1 : 0,
          transform: entryComplete ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease, background-color 0.2s, box-shadow 0.2s",
          pointerEvents: entryComplete ? "auto" : "none"
        }}
      >
        Continue Journey ➔
      </button>
    </div>
  );
}

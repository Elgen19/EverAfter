"use client";

import React, { useState, useEffect } from "react";
import { Caveat } from "next/font/google";
import { PolaroidItem } from "@/utils/encoding";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat-google",
  display: "swap",
});

interface PolaroidsReaderProps {
  polaroids: PolaroidItem[];
  theme: string;
  onComplete: () => void;
  isSheetExpanded?: boolean;
  isStandalone?: boolean;
}

export default function PolaroidsReader({
  polaroids,
  theme,
  onComplete,
  isSheetExpanded = false,
  isStandalone = false,
}: PolaroidsReaderProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [topIndex, setTopIndex] = useState<number>(0);
  const [slidingIndex, setSlidingIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [interacted, setInteracted] = useState<boolean>(false);
  const lastTouchTimeRef = React.useRef<number>(0);

  // Dragging and swiping states
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  // Hover tilt states
  const [hoverOffset, setHoverOffset] = useState({ rx: 0, ry: 0 });

  const [entryComplete, setEntryComplete] = useState(false);

  // Initialize and filter out any empty records
  useEffect(() => {
    if (polaroids && Array.isArray(polaroids)) {
      const filtered = polaroids.filter(p => p.imageUrl && p.imageUrl.trim() !== "");
      setItems(filtered);
      setTopIndex(filtered.length - 1);
    }
  }, [polaroids]);

  // Trigger entry animation flag in standalone mode
  useEffect(() => {
    if (isStandalone && isSheetExpanded) {
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isStandalone, isSheetExpanded]);

  const handleMouseMoveHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - lastTouchTimeRef.current < 1000) return;
    if (isDragging || slidingIndex !== null || swipeDirection !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = (y / (rect.height / 2)) * -6; // max 6deg vertical rotation
    const ry = (x / (rect.width / 2)) * 6;   // max 6deg horizontal rotation
    setHoverOffset({ rx, ry });
  };

  const handleMouseLeaveHover = () => {
    setHoverOffset({ rx: 0, ry: 0 });
  };

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
    if (Date.now() - lastTouchTimeRef.current < 1000) return;
    if (slidingIndex !== null || swipeDirection !== null) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (Date.now() - lastTouchTimeRef.current < 1000) return;
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
    lastTouchTimeRef.current = Date.now();
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
    lastTouchTimeRef.current = Date.now();
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

  const currentItem = items[items.length - 1];
  const originalIndex = polaroids.findIndex(p => p.imageUrl === currentItem?.imageUrl);
  const displayIndex = originalIndex !== -1 ? originalIndex + 1 : 1;

  const truncateCaption = (text: string | undefined) => {
    if (!text) return "💖";
    if (text.length > 10) {
      return text.slice(0, 10) + "...";
    }
    return text;
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
      className={`${caveat.variable}`}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        width: "100%", 
        maxWidth: "460px",
        padding: "60px 20px 20px 20px",
        position: "relative"
      }}
    >
      {/* Title Statement */}
      <h2
        style={{
          fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
          fontSize: "36px",
          color: "var(--accent-gold, #e2b857)",
          marginBottom: "32px",
          textAlign: "center",
          fontWeight: "normal",
          opacity: entryComplete ? 0.95 : 0,
          transform: entryComplete ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}
      >
        Captured Memories
      </h2>
      <style>{`
        .polaroid-card-container {
          position: relative;
          width: 270px;
          height: 330px;
          margin-bottom: 24px;
          perspective: 1000px;
        }
        .polaroid-card {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          background-color: #ffffff;
          background-image: radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0px), radial-gradient(rgba(0,0,0,0.02) 1px, transparent 0px);
          background-size: 4px 4px;
          background-position: 0 0, 2px 2px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.12), inset 0 0 10px rgba(0,0,0,0.03);
          padding: 12px 12px 42px 12px;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, z-index 0.3s ease;
          cursor: pointer;
          touch-action: none;
        }
        .polaroid-card:hover {
          box-shadow: 0 16px 36px rgba(0,0,0,0.28);
        }
        .polaroid-tape {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 80px;
          height: 24px;
          background-color: rgba(226, 184, 87, 0.28);
          backdrop-filter: blur(1.5px);
          -webkit-backdrop-filter: blur(1.5px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          border-left: 1.5px dashed rgba(255,255,255,0.4);
          border-right: 1.5px dashed rgba(255,255,255,0.4);
          z-index: 50;
          pointer-events: none;
        }
        .polaroid-front {
          position: absolute;
          inset: 12px 12px 42px 12px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .polaroid-image {
          width: 100%;
          height: 236px;
          border-radius: 4px;
          background-color: #efefef;
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .polaroid-caption-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .polaroid-caption {
          font-family: var(--font-caveat-google), var(--font-cursive), cursive;
          font-size: 22px;
          color: #2b2b2b;
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
        .polaroid-postmark {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 52px;
          height: 52px;
          border: 1px dashed rgba(255, 75, 114, 0.3);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          color: rgba(255, 75, 114, 0.45);
          font-weight: bold;
          transform: rotate(18deg);
          pointer-events: none;
          letter-spacing: 0.5px;
          line-height: 1.2;
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
          font-family: var(--font-caveat-google), var(--font-cursive), cursive;
          font-size: 22px;
          color: #2b2b2b;
          line-height: 1.4;
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
        .desktop-nav-arrows {
          position: absolute;
          top: 50%;
          left: -80px;
          right: -80px;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          pointer-events: none;
          z-index: 100;
          width: 430px;
        }
        .nav-arrow-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background-color: rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 24px;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          padding-bottom: 4px;
        }
        .nav-arrow-btn:hover {
          background-color: rgba(255, 75, 114, 0.15);
          border-color: rgba(255, 75, 114, 0.45);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 75, 114, 0.25);
        }
        @keyframes pulse-hint {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @media (max-width: 480px) {
          .polaroid-card-container {
            width: 220px;
            height: 280px;
          }
          .polaroid-card {
            padding: 10px 10px 36px 10px;
          }
          .polaroid-front {
            inset: 10px 10px 36px 10px;
          }
          .polaroid-image {
            height: 194px;
          }
          .polaroid-caption {
            font-size: 18px;
          }
          .polaroid-back-text {
            font-size: 18px;
          }
          .desktop-nav-arrows {
            display: none;
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
          if (!isSheetExpanded || (isStandalone && !animateIn)) {
            if (isStandalone) {
              const rotDeg = index * 6 - ((items.length - 1) * 3);
              transformStr = `translateY(360px) scale(0.6) rotate(${rotDeg}deg)`;
            } else {
              // Tucked inside the envelope pocket
              transformStr = "scale(0.05) translateY(240px) rotate(0deg)";
            }
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
            transformStr = `rotateY(180deg) scale(1.05) translateY(15px) rotateX(${hoverOffset.rx}deg) rotateY(${-hoverOffset.ry}deg)`;
          } else if (isTop) {
            // Top card sits flat and slightly scaled up
            transformStr = `rotateY(0deg) scale(1.05) translateY(15px) rotateX(${hoverOffset.rx}deg) rotateY(${hoverOffset.ry}deg)`;
          } else {
            // Underneath cards remain staggered
            transformStr = `rotateY(0deg) rotate(${rotation}) translate(${offsetX}, calc(${offsetY} + 15px))`;
          }

          // Unified top card drag, hover-tilt, click handlers
          const cardHandlers = isTop ? {
            onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
              if (Date.now() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseDown(e);
            },
            onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
              if (Date.now() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseMove(e);
              handleMouseMoveHover(e);
            },
            onMouseUp: () => {
              if (Date.now() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseUp();
              else {
                setFlippedIndex(flippedIndex === topIndex ? null : topIndex);
                playSwooshSound();
              }
              handleMouseLeaveHover();
            },
            onMouseLeave: () => {
              if (Date.now() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseLeave();
              handleMouseLeaveHover();
            },
            onTouchStart: (e: React.TouchEvent) => {
              lastTouchTimeRef.current = Date.now();
              if (items.length > 1) handleTouchStart(e);
            },
            onTouchMove: (e: React.TouchEvent) => {
              if (items.length > 1) handleTouchMove(e);
            },
            onTouchEnd: () => {
              lastTouchTimeRef.current = Date.now();
              if (items.length > 1) handleTouchEnd();
              else {
                setFlippedIndex(flippedIndex === topIndex ? null : topIndex);
                playSwooshSound();
              }
            },
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
            }
          } : {
            onClick: () => handleCardClick(index),
          };

          return (
            <div
              key={item.imageUrl || index}
              className="polaroid-card"
              style={{
                transform: transformStr,
                opacity: (!isSheetExpanded || (isStandalone && !animateIn)) ? 0 : 1,
                zIndex: isSliding ? 40 : isTop ? 30 : 10 + index,
                pointerEvents: (slidingIndex !== null && !isDragging) || !isSheetExpanded ? "none" : "auto",
                transition: isTop && isDragging ? "none" : (
                  isSheetExpanded
                    ? `transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 150}ms, opacity 0.8s ease ${index * 150}ms, box-shadow 0.3s ease, z-index 0.3s ease`
                    : `transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0ms, opacity 0.6s ease 0ms, box-shadow 0.3s ease, z-index 0.3s ease`
                )
              }}
              {...cardHandlers}
              title={isTop ? (items.length > 1 ? "Drag left/right to browse, click to flip" : "Click to flip") : "Click to browse"}
            >
              {isSheetExpanded && (
                <div className="polaroid-tape" />
              )}

              {/* Front side - Only photo, no words */}
              <div className="polaroid-front">
                <div 
                  className="polaroid-image"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
                <div className="polaroid-caption-wrapper">
                  <span className="polaroid-caption">{truncateCaption(item.caption)}</span>
                </div>
              </div>

              {/* Back side - Words / Caption */}
              <div className="polaroid-back">
                <div className="polaroid-postmark">
                  <span>EVERAFTER</span>
                  <span style={{ fontSize: "10px", margin: "2px 0" }}>❤️</span>
                  <span>POSTAL</span>
                </div>
                <div className="polaroid-back-header">Memory Details</div>
                <p className="polaroid-back-text">
                  {item.caption || "Sealed inside EverAfter... 💖"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pill-shaped photo counter */}
      <div
        style={{
          marginTop: "16px",
          padding: "6px 14px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 600,
          opacity: entryComplete ? 0.9 : 0,
          transform: entryComplete ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          pointerEvents: entryComplete ? "auto" : "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
        }}
      >
        <span>📸</span>
        <span>Photo {displayIndex} of {polaroids.length}</span>
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

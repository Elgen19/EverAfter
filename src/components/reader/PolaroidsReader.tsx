"use client";

import React, { useState, useEffect } from "react";
import { Caveat } from "next/font/google";
import { PolaroidItem } from "@/utils/encoding";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat-google",
  display: "swap",
});

const playSwooshSound = () => {
  return; // sound disabled per user request
};

const getNowTime = () => Date.now();

const getThemeColor = (theme: string) => {
  switch (theme) {
    case "celestial":
      return "#090e24"; // deep midnight blue
    case "royal":
      return "#140f0c"; // dark brown/bronze
    case "scroll":
      return "#120e0a"; // dark parchment/ink
    case "blush":
      return "#140c0e"; // dark rose/blush
    case "lavender":
      return "#1a050a"; // dark deep purple/berry
    default:
      return "#100907"; // default dark sunset brown/black
  }
};

interface PolaroidsReaderProps {
  polaroids: PolaroidItem[];
  theme: string;
  onComplete: () => void;
  isSheetExpanded?: boolean;
  isStandalone?: boolean;
  layout?: "stack" | "collage";
  collageStyle?: "simple" | "forever" | "sunset";
  collageBgPosition?: "top" | "center" | "bottom";
  collageBgZoom?: number;
  title?: string;
  showHearts?: boolean;
  sender?: string;
  preview?: boolean;
}

export default function PolaroidsReader({
  polaroids,
  theme,
  onComplete,
  isSheetExpanded = false,
  isStandalone = false,
  layout = "stack",
  collageStyle = "simple",
  collageBgPosition = "center",
  collageBgZoom = 100,
  title = "Captured Memories",
  showHearts = true,
  sender = "",
  preview = false,
}: PolaroidsReaderProps) {
  const isPreviewOrStandalone = preview || isStandalone;
  const [animateIn, setAnimateIn] = useState(false);
  const [items, setItems] = useState<PolaroidItem[]>([]);
  const [topIndex, setTopIndex] = useState<number>(0);
  const [slidingIndex, setSlidingIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [interacted, setInteracted] = useState<boolean>(false);
  const lastTouchTimeRef = React.useRef<number>(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

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

  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const bgImage = items[0]?.imageUrl || "/ocean_sunset.png";
    if (bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => {
        setIsPortrait(img.width < img.height);
      };
    }
  }, [items]);

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
    if (getNowTime() - lastTouchTimeRef.current < 1000) return;
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
    if (getNowTime() - lastTouchTimeRef.current < 1000) return;
    if (slidingIndex !== null || swipeDirection !== null) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (getNowTime() - lastTouchTimeRef.current < 1000) return;
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
    lastTouchTimeRef.current = getNowTime();
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
    lastTouchTimeRef.current = getNowTime();
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
    if (text.length > 24) {
      return text.slice(0, 24) + "...";
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

  if (items.length === 3) {
    return (
      <div 
        className={`${caveat.variable}`}
        style={{
          position: isPreviewOrStandalone ? "relative" : "fixed",
          inset: isPreviewOrStandalone ? "auto" : 0,
          width: "100%",
          height: isPreviewOrStandalone ? "100%" : "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          overflow: "hidden",
          zIndex: 85,
          paddingTop: isPreviewOrStandalone ? "10px" : "110px",
          paddingBottom: isPreviewOrStandalone ? "20px" : "80px",
        }}
      >
        <style>{`
          .three-photo-board {
            position: relative;
            width: 100%;
            max-width: 500px;
            height: ${preview ? "330px" : "380px"};
            margin: ${preview ? "10px auto" : "20px auto"};
            perspective: 1000px;
          }
          .three-photo-card {
            position: absolute;
            width: ${preview ? "140px" : "160px"};
            height: ${preview ? "175px" : "200px"};
            background-color: #fff;
            border-radius: 6px;
            padding: 6px 6px ${preview ? "20px" : "24px"} 6px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            transform-style: preserve-3d;
            transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
          }
          .three-photo-card:hover {
            box-shadow: 0 16px 36px rgba(0,0,0,0.45);
            z-index: 50 !important;
          }
          .three-photo-img {
            width: 100%;
            height: ${preview ? "120px" : "145px"};
            background-size: cover;
            background-position: center;
            border-radius: 4px;
            border: 1px solid rgba(0,0,0,0.05);
          }
          .three-photo-caption {
            font-family: var(--font-caveat-google), var(--font-cursive), cursive;
            font-size: ${preview ? "13px" : "16px"};
            color: #2b2b2b;
            text-align: center;
            margin-top: ${preview ? "6px" : "8px"};
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* Responsive Scaling for Mobiles */
          @media (max-width: 500px) {
            .three-photo-board {
              height: 300px;
              max-width: 360px;
            }
            .three-photo-card {
              width: 120px;
              height: 155px;
              padding: 6px 6px 18px 6px;
            }
            .three-photo-img {
              height: 110px;
            }
            .three-photo-caption {
              font-size: 13px;
              margin-top: 6px;
            }
          }
        `}</style>

        {/* Header Title */}
        <h2
          style={{
            fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
            fontSize: "36px",
            color: "var(--accent-gold, #e2b857)",
            marginBottom: "24px",
            textAlign: "center",
            fontWeight: "normal",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)"
          }}
        >
          Captured Memories
        </h2>

        {/* Board Container */}
        <div className="three-photo-board">
          {items.map((item, index) => {
            const originalIndex = polaroids.findIndex(p => p.imageUrl === item.imageUrl);
            const isFlipped = flippedIndex === originalIndex;

            // Positioning variables
            let left = "10%";
            let top = "10px";
            let rotation = "-4deg";
            let zIndex = 10 + index;

            if (layout === "collage") {
              /* Polaroid Scatter Layout (based on Reference Image 1) */
              if (index === 0) { // Photo 1 (left)
                left = "8%";
                top = preview ? "15px" : "20px";
                rotation = "-6deg";
                zIndex = 10;
              } else if (index === 2) { // Photo 3 (right)
                left = "54%";
                top = preview ? "20px" : "30px";
                rotation = "7deg";
                zIndex = 11;
              } else if (index === 1) { // Photo 2 (center-bottom, overlaps both)
                left = "30%";
                top = preview ? "110px" : "120px";
                rotation = "-4deg";
                zIndex = 12; // Overlaps both
              }
            } else {
              /* Diagonal Cascade Layout (based on Reference Image 2) */
              if (index === 0) { // Top-left
                left = "8%";
                top = preview ? "15px" : "15px";
                rotation = "-4deg";
                zIndex = 10;
              } else if (index === 1) { // Center
                left = "33%";
                top = preview ? "75px" : "85px";
                rotation = "3deg";
                zIndex = 11;
              } else if (index === 2) { // Bottom-right
                left = "58%";
                top = preview ? "135px" : "155px";
                rotation = "-2deg";
                zIndex = 12;
              }
            }

            const cardStyle: React.CSSProperties = {
              left: left,
              top: top,
              transform: isFlipped ? "rotateY(180deg)" : `rotate(${rotation}) scale(${hoveredCardIndex === originalIndex ? 1.05 : 1})`,
              zIndex: zIndex,
            };

            return (
              <div
                key={item.imageUrl}
                className="three-photo-card"
                style={cardStyle}
                onMouseEnter={() => setHoveredCardIndex(originalIndex)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setFlippedIndex(isFlipped ? null : originalIndex);
                  playSwooshSound();
                }}
              >
                {/* Front Side */}
                <div
                  style={{
                    position: "absolute",
                    inset: "8px 8px 24px 8px",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    className="three-photo-img"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="three-photo-caption">
                    {item.caption || "💖"}
                  </div>
                </div>

                {/* Back Side (Written Note) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#faf6ee",
                    backgroundImage: "radial-gradient(#d3c7b7 0.5px, transparent 0.5px)",
                    backgroundSize: "8px 8px",
                    borderRadius: "6px",
                    padding: "16px 12px",
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "inset 0 0 15px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.03)",
                  }}
                >
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "var(--accent-rose)", borderBottom: "1.5px dashed rgba(255, 75, 114, 0.25)", paddingBottom: "4px", width: "80%", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Note ✍
                  </span>
                  <p style={{ fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive", fontSize: "18px", color: "#2b2b2b", margin: 0, lineHeight: "1.3", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical" }}>
                    {item.backText || item.caption || "No caption added..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Wizard Button */}
        <button
          className="glowing-mailbox-btn"
          onClick={onComplete}
          style={{
            position: preview ? "absolute" : "relative",
            bottom: preview ? "15px" : "auto",
            marginTop: preview ? "0px" : "30px",
            padding: "12px 32px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--accent-rose)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
            transition: "all 0.2s",
            zIndex: 100,
          }}
        >
          Continue Journey ➔
        </button>
      </div>
    );
  }

  if (layout === "collage") {
    const isSunset = collageStyle === "sunset";
    const isForever = collageStyle === "forever";
    const isSimple = collageStyle === "simple";

    const bgImage = items[0]?.imageUrl || "/ocean_sunset.png";
    const cards = items.slice(1, 3);

    return (
      <div 
        className={`${caveat.variable}`}
        style={{
          position: isPreviewOrStandalone ? "relative" : "fixed",
          inset: isPreviewOrStandalone ? "auto" : 0,
          width: "100%",
          height: isPreviewOrStandalone ? "100%" : "100vh",
          minHeight: "auto", // Allow smaller viewports to fit without scrolling
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "transparent", // Show the original dark app background
          overflow: "hidden", // DO NOT SCROLL!
          zIndex: 85,
          paddingTop: isPreviewOrStandalone ? "10px" : "110px",
          paddingBottom: isPreviewOrStandalone ? "10px" : "80px",
        }}
      >
        <style>{`
          @keyframes float-heart-1 {
            0%, 100% { transform: translateY(0) scale(1) rotate(-5deg); }
            50% { transform: translateY(-5px) scale(1.1) rotate(5deg); }
          }
          @keyframes float-heart-2 {
            0%, 100% { transform: translateY(0) scale(1) rotate(5deg); }
            50% { transform: translateY(-4px) scale(1.06) rotate(-2deg); }
          }
          @keyframes collage-card-in {
            0% { opacity: 0; transform: translateY(40px) scale(0.9); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .polaroid-collage-card {
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
            transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
            width: var(--card-w, ${preview ? "145px" : "220px"});
            height: var(--card-h, ${preview ? "185px" : "270px"});
          }
          .polaroid-collage-card:hover {
            box-shadow: 0 16px 36px rgba(0,0,0,0.45);
          }
          .polaroid-collage-img {
            height: var(--img-h, ${preview ? "125px" : "190px"});
            transition: height 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
          }

          /* Desktop default layout positions */
          .simple-style-card-0 {
            left: 8% !important;
            top: -30px !important;
          }
          .simple-style-card-1 {
            left: 14% !important;
            bottom: -30px !important;
          }
          .forever-style-card-0 {
            right: 8% !important;
            top: -25px !important;
          }
          .forever-style-card-1 {
            right: 14% !important;
            bottom: -25px !important;
          }
          .sunset-style-card-0 {
            left: 15% !important;
            top: 35px !important;
          }
          .sunset-style-card-1 {
            right: 15% !important;
            bottom: 35px !important;
          }

          /* Responsive adjustments */
          @media (max-width: 900px) {
            .sunset-collage-band {
              height: calc(100vh - 270px) !important;
              min-height: 240px !important; // Allow scaling down to prevent scrolling
              max-height: 580px !important;
              margin: 20px auto !important;
              width: 92% !important;
            }
            .polaroid-collage-card {
              --card-w: 180px;
              --card-h: 220px;
              --img-h: 150px;
            }
            .simple-style-card-0 {
              left: 5% !important;
              top: -15px !important;
            }
            .simple-style-card-1 {
              left: 10% !important;
              bottom: -15px !important;
            }
            .forever-style-card-0 {
              right: 5% !important;
              top: -15px !important;
            }
            .forever-style-card-1 {
              right: 10% !important;
              bottom: -15px !important;
            }
            .sunset-style-card-0 {
              left: 10% !important;
              top: 25px !important;
            }
            .sunset-style-card-1 {
              right: 10% !important;
              bottom: 25px !important;
            }
          }

          @media (max-width: 600px) {
            .sunset-collage-band {
              height: calc(100vh - 290px) !important;
              min-height: 180px !important; // Allow scaling down to prevent scrolling
              max-height: 480px !important;
              width: 95% !important;
            }
            .polaroid-collage-card {
              --card-w: 135px;
              --card-h: 175px;
              --img-h: 115px;
            }
            .simple-style-card-0 {
              left: 3% !important;
              top: -10px !important;
            }
            .simple-style-card-1 {
              left: 8% !important;
              bottom: -10px !important;
            }
            .forever-style-card-0 {
              right: 3% !important;
              top: -10px !important;
            }
            .forever-style-card-1 {
              right: 8% !important;
              bottom: -10px !important;
            }
            .sunset-style-card-0 {
              left: 5% !important;
              top: 15px !important;
            }
            .sunset-style-card-1 {
              right: 5% !important;
              bottom: 15px !important;
            }
          }
        `}</style>

        {/* 1. Header Banner based on layout style */}
        {isSimple && (
          <div style={{
            width: "100%",
            textAlign: "center",
            marginBottom: "12px",
            zIndex: 10,
          }}>
            <h2 style={{
              fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
              fontSize: "36px",
              color: "#f3f1f6", // Light color for readability on dark background
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}>
              {title || "Simple Love Story"}
              {showHearts && (
                <span className="dancing-hearts" style={{ display: "inline-flex", gap: "3px" }}>
                  <span style={{ display: "inline-block", animation: "float-heart-1 2.5s ease-in-out infinite" }}>❤️</span>
                  <span style={{ display: "inline-block", animation: "float-heart-2 2.2s ease-in-out infinite" }}>❤️</span>
                </span>
              )}
            </h2>
            <span style={{ fontSize: "11px", color: "#a59fb1", marginTop: "4px" }}>Click photo to flip and read the memory notes</span>
          </div>
        )}

        {isForever && (
          <div style={{
            width: "100%",
            textAlign: "center",
            marginBottom: "12px",
            zIndex: 10,
          }}>
            <h2 style={{
              fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
              fontSize: "36px",
              color: "#ffeae3", // Light color for readability on dark background
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}>
              {title || "Forever Us Story"}
              {showHearts && (
                <span className="dancing-hearts" style={{ display: "inline-flex", gap: "3px" }}>
                  <span style={{ display: "inline-block", animation: "float-heart-1 2.5s ease-in-out infinite" }}>❤️</span>
                  <span style={{ display: "inline-block", animation: "float-heart-2 2.2s ease-in-out infinite" }}>❤️</span>
                </span>
              )}
            </h2>
            <span style={{ fontSize: "11px", color: "#d9b8bd", marginTop: "4px" }}>Click photo to flip and read the memory notes</span>
          </div>
        )}

        {isSunset && (
          <div style={{
            width: "100%",
            textAlign: "center",
            marginBottom: "12px",
            zIndex: 10,
          }}>
            <h2 style={{
              fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
              fontSize: "40px",
              color: "#ffdcd0",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textShadow: "0 0 15px rgba(255, 75, 114, 0.5), 0 2px 10px rgba(0,0,0,0.5)",
            }}>
              {title || "Sunset Kiss"}
              {showHearts && (
                <span className="dancing-hearts" style={{ display: "inline-flex", gap: "3px" }}>
                  <span style={{ display: "inline-block", animation: "float-heart-1 2.5s ease-in-out infinite" }}>❤️</span>
                  <span style={{ display: "inline-block", animation: "float-heart-2 2.2s ease-in-out infinite" }}>❤️</span>
                </span>
              )}
            </h2>
            <span style={{ fontSize: "11px", color: "#cca8a8", marginTop: "4px" }}>Click photo to flip and read the memory notes</span>
          </div>
        )}

        {/* Forever Us: Floating Hearts Column Left */}
        {isForever && showHearts && (
          <div style={{
            position: "absolute",
            left: "15%",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            zIndex: 10,
            pointerEvents: "none",
          }}>
            <span style={{ fontSize: "40px", filter: "drop-shadow(0 0 10px rgba(255, 75, 114, 0.4))", animation: "float-heart-1 2.5s infinite" }}>❤️</span>
            <span style={{ fontSize: "56px", filter: "drop-shadow(0 0 12px rgba(255, 75, 114, 0.5))", animation: "float-heart-2 2.2s infinite", marginLeft: "25px" }}>❤️</span>
            <span style={{ fontSize: "32px", filter: "drop-shadow(0 0 8px rgba(255, 75, 114, 0.3))", animation: "float-heart-1 2.0s infinite", marginLeft: "10px" }}>❤️</span>
          </div>
        )}

        {/* Central Band Container */}
        <div 
          className="sunset-collage-band"
          style={{
            position: "relative",
            width: "90%",
            maxWidth: "1000px",
            height: preview ? "260px" : "calc(100vh - 250px)",
            minHeight: preview ? "260px" : "520px",
            maxHeight: preview ? "260px" : "750px",
            zIndex: 10,
            margin: preview ? "10px auto" : "40px auto",
            boxShadow: "none", // Remove black shadow rectangle outline
            overflow: "visible", // Unclip polaroid cards!
          }}
        >
          {/* Zoomable Background Layer Wrapper (constrains background scaling/zoom to the band height) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              borderRadius: "4px",
              zIndex: 1,
            }}
          >
            {/* Ambient Blurred Background Layer (always covers the full band) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                filter: "blur(20px) brightness(0.65)",
                transform: "scale(1.15)", // Prevents blur edges
                zIndex: 1,
              }}
            />

            {/* Foreground Main Image Layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${bgImage})`,
                backgroundSize: isPortrait ? "contain" : "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: isPortrait 
                  ? "center center"
                  : (collageBgPosition === "top" ? "center top" :
                     collageBgPosition === "bottom" ? "center bottom" :
                     "center 30%"), // Biased up for better face framing
                transform: `scale(${collageBgZoom / 100})`,
                zIndex: 2,
                transition: "transform 0.2s ease-out",
              }}
            />
          </div>

          {/* Top Edge */}
          {isSimple && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                top: "-1px",
                left: 0,
                width: "100%",
                height: "45px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 10 L5 8 L10 9 L15 7 L20 10 L25 8 L30 9 L35 7 L40 10 L45 8 L50 9 L55 7 L60 10 L65 8 L70 9 L75 7 L80 10 L85 8 L90 9 L95 7 L100 10 L100 0 L0 0 Z" />
            </svg>
          )}

          {isForever && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                top: "-1px",
                left: 0,
                width: "100%",
                height: "45px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 10 Q25 6, 50 10 Q75 14, 100 10 L100 0 L0 0 Z" />
            </svg>
          )}

          {isSunset && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                top: "-1px",
                left: 0,
                width: "100%",
                height: "50px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 10 L5 8 L10 9 L15 7 L20 10 L25 8 L30 9 L35 7 L40 10 L45 8 L50 9 L55 7 L60 10 L65 8 L70 9 L75 7 L80 10 L85 8 L90 9 L95 7 L100 10 L100 0 L0 0 Z" />
            </svg>
          )}

          {/* Bottom Edge */}
          {isSimple && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                width: "100%",
                height: "45px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 0 L5 2 L10 1 L15 3 L20 0 L25 2 L30 1 L35 3 L40 0 L45 2 L50 1 L55 3 L60 0 L65 2 L70 1 L75 3 L80 0 L85 2 L90 1 L95 3 L100 0 L100 10 L0 10 Z" />
            </svg>
          )}

          {isForever && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                width: "100%",
                height: "45px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 0 L100 0 L100 8 Q75 12, 50 8 Q25 4, 0 8 Z" />
            </svg>
          )}

          {isSunset && (
            <svg 
              viewBox="0 0 100 10" 
              preserveAspectRatio="none" 
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                width: "100%",
                height: "50px",
                fill: getThemeColor(theme),
                zIndex: 5,
              }}
            >
              <path d="M0 0 L5 2 L10 1 L15 3 L20 0 L25 2 L30 1 L35 3 L40 0 L45 2 L50 1 L55 3 L60 0 L65 2 L70 1 L75 3 L80 0 L85 2 L90 1 L95 3 L100 0 L100 10 L0 10 Z" />
            </svg>
          )}

          {/* Render the Polaroid Cards */}
          {cards.map((item, index) => {
            const originalIndex = index + 1;
            const isFlipped = flippedIndex === originalIndex;
            const cardClass = isSimple 
              ? `simple-style-card-${index}` 
              : isForever 
                ? `forever-style-card-${index}` 
                : `sunset-style-card-${index}`;

            // Rotation details
            let rotation = "-5deg";
            if (isSimple) {
              rotation = index === 0 ? "-5deg" : "-7deg";
            } else if (isForever) {
              rotation = index === 0 ? "4deg" : "-5deg";
            } else { // sunset
              rotation = index === 0 ? "-6deg" : "6deg";
            }

            return (
              <div
                key={item.imageUrl || index}
                onMouseEnter={() => setHoveredCardIndex(originalIndex)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                onClick={() => {
                  setFlippedIndex(isFlipped ? null : originalIndex);
                  setInteracted(true);
                }}
                className={`polaroid-collage-card ${cardClass}`}
                style={{
                  position: "absolute",
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  padding: "8px 8px 36px 8px",
                  boxShadow: hoveredCardIndex === originalIndex ? "0 12px 28px rgba(0,0,0,0.4)" : "0 6px 16px rgba(0,0,0,0.25)",
                  transformStyle: "preserve-3d",
                  transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
                  cursor: "pointer",
                  transform: isFlipped
                    ? "rotateY(180deg) scale(1.05)"
                    : `rotate(${rotation}) scale(${hoveredCardIndex === originalIndex ? 1.05 : 1})`,
                  zIndex: hoveredCardIndex === originalIndex ? 25 : 12 + index,
                }}
                title={isFlipped ? "Click to see photo" : "Click to read memory note"}
              >
                {/* Front Side: Photo */}
                <div style={{
                  position: "absolute",
                  inset: "8px 8px 36px 8px",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div 
                    className="polaroid-collage-img"
                    style={{
                      width: "100%",
                      borderRadius: "3px",
                      backgroundColor: "#f0f0f0",
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }} 
                  />
                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
                      fontSize: "16px",
                      color: "#2b2b2b",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      padding: "0 2px",
                    }}>
                      {truncateCaption(item.caption)}
                    </span>
                  </div>
                </div>

                {/* Back Side: Written note */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "#fcf8ee",
                  borderRadius: "6px",
                  padding: "16px 12px",
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.03)",
                }}>
                  <div style={{ borderBottom: "1px dashed rgba(255, 75, 114, 0.2)", width: "100%", paddingBottom: "6px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", color: "var(--accent-rose)", fontWeight: "bold" }}>Memory Note ✍</span>
                  </div>
                  <p style={{
                    fontFamily: "var(--font-caveat-google), var(--font-cursive), cursive",
                    fontSize: "18px",
                    color: "#2b2b2b",
                    lineHeight: "1.4",
                    margin: 0,
                    padding: "0 6px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {item.backText || item.caption || "Sealed inside EverAfter... 💖"}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Credit/Signature in the sunset band */}
          {isSimple && (
            <div style={{
              position: "absolute",
              bottom: "45px",
              right: "12%",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "13px",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              zIndex: 8,
              letterSpacing: "0.5px",
            }}>
              {sender ? `@${sender.toLowerCase().replace(/\s+/g, "")}` : "@reallygreatsite"}
            </div>
          )}

          {isForever && (
            <div style={{
              position: "absolute",
              bottom: "45px",
              left: "12%",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "13px",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              zIndex: 8,
              letterSpacing: "0.5px",
            }}>
              {sender ? `@${sender.toLowerCase().replace(/\s+/g, "")}` : "@reallygreatsite"}
            </div>
          )}

          {isSunset && (
            <div style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255, 220, 208, 0.8)",
              fontSize: "13px",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              zIndex: 8,
              letterSpacing: "0.5px",
            }}>
              {sender ? `@${sender.toLowerCase().replace(/\s+/g, "")}` : "@reallygreatsite"}
            </div>
          )}
        </div>

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
            transition: "all 0.2s",
          }}
        >
          Continue Journey ➔
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
              if (getNowTime() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseDown(e);
            },
            onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
              if (getNowTime() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseMove(e);
              handleMouseMoveHover(e);
            },
            onMouseUp: () => {
              if (getNowTime() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseUp();
              else {
                setFlippedIndex(flippedIndex === topIndex ? null : topIndex);
                playSwooshSound();
              }
              handleMouseLeaveHover();
            },
            onMouseLeave: () => {
              if (getNowTime() - lastTouchTimeRef.current < 1000) return;
              if (items.length > 1) handleMouseLeave();
              handleMouseLeaveHover();
            },
            onTouchStart: (e: React.TouchEvent) => {
              lastTouchTimeRef.current = getNowTime();
              if (items.length > 1) handleTouchStart(e);
            },
            onTouchMove: (e: React.TouchEvent) => {
              if (items.length > 1) handleTouchMove(e);
            },
            onTouchEnd: () => {
              lastTouchTimeRef.current = getNowTime();
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
                  {item.backText || item.caption || "Sealed inside EverAfter... 💖"}
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

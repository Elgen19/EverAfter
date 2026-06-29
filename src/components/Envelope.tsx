"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Playfair_Display, 
  Allura, 
  Cinzel_Decorative, 
  Cormorant_Garamond, 
  Libre_Baskerville,
  Lora,
  DM_Serif_Display,
  Source_Serif_4
} from "next/font/google";
import PolaroidsReader from "./reader/PolaroidsReader";
import { PolaroidItem } from "@/utils/encoding";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-google",
  display: "swap",
});

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allura-google",
  display: "swap",
});

const cinzelDec = Cinzel_Decorative({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cinzel-dec-google",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant-google",
  display: "swap",
});

const geist = {
  variable: "--font-geist-google",
  className: "geist-fallback-sans",
  style: { fontFamily: "sans-serif" }
};

const geistMono = {
  variable: "--font-geist-mono-google",
  className: "geist-fallback-mono",
  style: { fontFamily: "monospace" }
};

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville-google",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora-google",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif-display-google",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif-4-google",
  display: "swap",
});

interface CustomCSSProperties extends React.CSSProperties {
  "--tx"?: string;
  "--ty"?: string;
  "--scale"?: number;
  "--rot"?: string;
}

interface MaybePortalProps {
  children: React.ReactNode;
  preview: boolean;
}

function MaybePortal({ children, preview }: MaybePortalProps) {
  if (preview) {
    return <>{children}</>;
  }
  return createPortal(children, document.body);
}

interface EnvelopeProps {
  recipient: string;
  sender: string;
  content: string;
  theme: string; // "royal" | "scroll" | "blush" | "lavender" | "celestial"
  sealSymbol?: string; // "heart" | "rose" | "star" | "ring"
  sealColor?: string; // hex code
  envelopeStyle?: string;
  greeting?: string;
  farewell?: string;
  backdrop?: string;
  isOnlyStep?: boolean;
  onOpen?: () => void;
  onClose?: () => void;

  // Adjacent polaroids configuration
  polaroids?: PolaroidItem[];
  polaroidsLayout?: "stack" | "collage";
  polaroidsCollageStyle?: "simple" | "forever" | "sunset";
  polaroidsCollageBgPosition?: "top" | "center" | "bottom";
  polaroidsCollageBgZoom?: number;
  polaroidsTitle?: string;
  polaroidsShowHearts?: boolean;
  activeStep?: string;
  onStepComplete?: () => void;
  isAdjacentToPolaroids?: boolean;
  polaroidsFirst?: boolean;
  preview?: boolean;

  // Voice Narration
  narration?: {
    enabled: boolean;
    audioUrl?: string;
    syncData?: { text: string; time: number }[];
  };
}

export default function Envelope({
  recipient,
  sender,
  content,
  theme,
  sealSymbol = "heart",
  sealColor = "#bd1a3d",
  envelopeStyle = "vintage-rose",
  greeting,
  farewell,
  backdrop = "none",
  isOnlyStep = false,
  onOpen,
  onClose,
  polaroids,
  polaroidsLayout = "stack",
  polaroidsCollageStyle = "simple",
  polaroidsCollageBgPosition = "center",
  polaroidsCollageBgZoom = 100,
  polaroidsTitle = "Captured Memories",
  polaroidsShowHearts = true,
  activeStep,
  onStepComplete,
  isAdjacentToPolaroids = false,
  polaroidsFirst = false,
  preview = false,
  narration,
}: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [burstHearts, setBurstHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);

  // Sub-view active sheet states
  const [activeSheet, setActiveSheet] = useState<"letter" | "polaroids" | "none">("none");
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [forceHideEnvelope, setForceHideEnvelope] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Voice Narration states
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const [narrationTime, setNarrationTime] = useState(0);
  const [narrationDuration, setNarrationDuration] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeSentenceRef = useRef<HTMLSpanElement | null>(null);

  const syncData = narration?.syncData || [];

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const time = e.currentTarget.currentTime;
    setNarrationTime(time);
    if (syncData.length > 0) {
      const nextIdx = syncData.findIndex(item => item.time > time);
      let idx = -1;
      if (nextIdx !== -1) {
        idx = Math.max(0, nextIdx - 1);
      } else {
        idx = syncData.length - 1;
      }
      setActiveSentenceIndex(idx);
    }
  };

  useEffect(() => {
    if (activeSentenceIndex !== -1 && activeSentenceRef.current) {
      const activeSpan = activeSentenceRef.current;
      const container = activeSpan.closest(".stationery-scroll-container") as HTMLElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const spanRect = activeSpan.getBoundingClientRect();
        
        // Calculate exact relative scroll position to center the active sentence
        const relativeTop = spanRect.top - containerRect.top + container.scrollTop;
        const targetScrollTop = relativeTop - (container.clientHeight / 2) + (spanRect.height / 2);
        
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth"
        });
      }
    }
  }, [activeSentenceIndex]);

  // Map legacy state to expanded sub-view
  const isFullView = (isSheetExpanded && activeSheet === "letter") || forceHideEnvelope;

  // Synthesize paper swoosh sound using Web Audio API
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
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + duration);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
    } catch (err) {
      console.log("Web Audio API blocked or not supported:", err);
    }
  };

  // Trigger sheet expanded view when envelope opens or activeStep changes
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    if (isOpen) {
      if (isFirstOpen) {
        timer1 = setTimeout(() => {
          if (activeStep === "polaroids") {
            setActiveSheet("polaroids");
          } else {
            setActiveSheet("letter");
          }
          setIsSheetExpanded(true);
          setIsFirstOpen(false);

          if (activeStep === "polaroids") {
            timer2 = setTimeout(() => {
              setForceHideEnvelope(true);
            }, 1100);
          }
        }, 3000); // Flap rotation (1.2s) + letter slide out (1.8s)
      } else {
        // If it's a step transition (already opened)
        if (activeStep === "polaroids") {
          setActiveSheet("polaroids");
          timer1 = setTimeout(() => {
            setIsSheetExpanded(true);
            timer2 = setTimeout(() => {
              setForceHideEnvelope(true);
            }, 1100);
          }, 450); // Pause for dramatic anticipation before slide-up
        } else if (activeStep === "envelope") {
          setActiveSheet("letter");
          timer1 = setTimeout(() => {
            setIsSheetExpanded(true);
          }, 450); // Pause for dramatic anticipation before slide-up
        }
      }
    } else {
      setIsSheetExpanded(false);
      setActiveSheet("none");
      setIsFirstOpen(true);
      setForceHideEnvelope(false);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, activeStep, isFirstOpen, isAdjacentToPolaroids, polaroids]);

  const handleOpen = () => {
    if (isOpen || isBreaking) return;
    setIsBreaking(true);

    // Crack and shake for 2.2s (slower breaking)
    setTimeout(() => {
      setIsOpen(true);
      setIsSealBroken(true);
      setIsBreaking(false);

      // Generate dynamic theme-specific burst particles!
      let particlesList = ["❤️", "💖", "💝", "💕", "✨", "🌸"];
      if (theme === "blush") {
        particlesList = ["🌸", "🌹", "💖", "💕", "✨", "🌸"];
      } else if (theme === "celestial") {
        particlesList = ["✨", "🌟", "⭐", "💫", "🌙", "✨"];
      } else if (theme === "royal") {
        particlesList = ["⚜️", "👑", "✨", "⭐", "⚜️", "👑"];
      }

      const newBursts = [];
      for (let i = 0; i < 32; i++) {
        const char = particlesList[Math.floor(Math.random() * particlesList.length)];
        const tx = `${(Math.random() - 0.5) * 380}px`;
        const ty = `${-150 - Math.random() * 250}px`; // shoots upwards
        const scale = Math.random() * 0.9 + 0.6;
        const rot = `${(Math.random() - 0.5) * 180}deg`;
        newBursts.push({
          id: i,
          char,
          tx,
          ty,
          scale,
          rot
        });
      }
      setBurstHearts(newBursts);

      if (onOpen) onOpen();
    }, 2200);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Immediately bring back the envelope for polaroids transition
    setForceHideEnvelope(false);
    setIsSheetExpanded(false);
    
    const closeDuration = activeSheet === "polaroids" ? 1200 : 1600;
    
    setTimeout(() => {
      setActiveSheet("none");
      
      const isLetterFirstTransition = isAdjacentToPolaroids && !polaroidsFirst && activeStep === "envelope";
      const isPolaroidFirstTransition = isAdjacentToPolaroids && polaroidsFirst && activeStep === "polaroids";
      
      if (isLetterFirstTransition || isPolaroidFirstTransition) {
        if (onStepComplete) onStepComplete();
      } else {
        setIsOpen(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1600); // Wait for flap to close
      }
    }, closeDuration);
  };

  const hasBackdrop = backdrop && backdrop !== "none";

  const getGlassyBg = () => {
    if (!hasBackdrop) return "var(--stationery-bg)";
    switch (theme) {
      case "royal": return "rgba(247, 241, 227, 0.85)";
      case "scroll": return "rgba(237, 220, 185, 0.88)";
      case "blush": return "rgba(255, 253, 247, 0.85)";
      case "lavender": return "rgba(94, 11, 28, 0.88)";
      case "midnight_rose": return "rgba(17, 14, 16, 0.85)";
      case "obsidian_poppy": return "rgba(28, 28, 31, 0.85)";
      case "celestial":
      default:
        return "rgba(9, 14, 36, 0.82)";
    }
  };

  const getGlassyBorder = () => {
    if (!hasBackdrop) return "var(--stationery-border)";
    switch (theme) {
      case "royal": return "rgba(201, 162, 39, 0.5)";
      case "scroll": return "rgba(92, 56, 31, 0.5)";
      case "blush": return "rgba(183, 110, 121, 0.5)";
      case "lavender": return "rgba(212, 175, 55, 0.4)";
      case "midnight_rose": return "rgba(156, 28, 46, 0.45)";
      case "obsidian_poppy": return "rgba(197, 146, 121, 0.4)";
      case "celestial":
      default:
        return "rgba(220, 221, 225, 0.25)";
    }
  };
  const getSolidBg = () => {
    switch (theme) {
      case "royal": return "#F7F1E3";
      case "scroll": return "#eddcb9";
      case "blush": return "#FFFDF7";
      case "lavender": return "#3d020a";
      case "midnight_rose": return "#110e10";
      case "obsidian_poppy": return "#1c1c1f";
      case "celestial":
        return "#090e24";
    }
  };
  const solidBg = getSolidBg();

  // Get theme display class name
  const themeClass = `theme-${theme || "scroll"}`;

  const showIdleAnim = !isOpen && !isSealBroken && !isBreaking;
  const isVintageWhite = envelopeStyle === "vintage-white";
  const isCelestialBlue = envelopeStyle === "celestial-blue";
  const isVintageRose = !isVintageWhite && !isCelestialBlue;
  const labelColor = isVintageWhite ? "rgba(47, 42, 36, 0.5)" : "rgba(244, 230, 206, 0.55)";
  const textColor = isVintageWhite ? "rgba(47, 42, 36, 0.65)" : "rgba(244, 230, 206, 0.85)";
  const nameColor = isVintageWhite ? "#9c1c2e" : "#e2b857";

  return (
    <div 
      className={`envelope-outer-wrapper ${playfair.variable} ${allura.variable} ${cinzelDec.variable} ${cormorant.variable} ${geist.variable} ${geistMono.variable} ${libreBaskerville.variable} ${lora.variable} ${dmSerifDisplay.variable} ${sourceSerif4.variable}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "var(--envelope-min-height, 500px)",
        width: "100%",
        height: "100%",
        flex: preview ? 1 : undefined,
        position: "relative",
        gap: "24px",
      }}
    >
      <div className={preview ? "envelope-container-preview" : "envelope-container"} style={{ transform: preview ? "scale(0.82)" : "scale(1)", transformOrigin: "center" }}>
        <div 
          className={`envelope-wrapper ${themeClass} vintage-rose-style ${showIdleAnim ? "envelope-idle" : ""}`}
        onClick={handleOpen}
        style={{
          transform: isFullView 
            ? "var(--envelope-full-transform, scale(0.8) translateY(100px))" 
            : isOpen 
              ? "var(--envelope-open-transform, translateY(110px) scale(0.95))" 
              : "var(--envelope-closed-transform, scale(1))",
          opacity: isFullView ? 0 : 1,
          visibility: isFullView ? "hidden" : "visible",
          transition: `transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease, visibility 0s linear ${isFullView ? "0.8s" : "0s"}`,
          pointerEvents: isFullView ? "none" : "auto",
        }}
      >
        <div 
          className={`envelope ${isOpen ? "open" : ""} vintage-rose-style`}
          style={{
            "--env-bg-image": isCelestialBlue ? "url(/celestial_envelope_open.png)" :
                              isVintageWhite ? "url(/white_envelope_open.png)" : "url(/vintage_envelope_open.png)",
            "--env-flap-image": isCelestialBlue ? "url(/celestial_envelope_flap.png)" :
                                isVintageWhite ? "url(/white_envelope_flap.png)" : "url(/vintage_envelope_flap.png)",
            "--env-bg-pos": isCelestialBlue ? "-81.7px -278px" :
                            isVintageWhite ? "-81.7px -278px" : "-81.7px -277.3px",
            "--env-flap-pos": isCelestialBlue ? "-81.7px -57.2px" :
                              isVintageWhite ? "-81.7px -32.8px" : "-81.7px -211.9px",
          } as React.CSSProperties}
        >
          <>
            {/* Layer 1: Envelope Back */}
            <div className={`vintage-envelope-back ${isOpen ? "open" : ""}`} />

            {/* Layer 2: Envelope Front Pocket */}
            <div className={`vintage-envelope-front-pocket ${isOpen ? "open" : ""}`}>
              {/* Sender Address */}
              <div 
                className="envelope-sender-address" 
                style={{ 
                  position: "absolute",
                  bottom: "25px",
                  left: "35px",
                  fontFamily: "var(--font-ui)",
                  fontSize: "13px",
                  color: textColor,
                  textAlign: "left",
                  lineHeight: "1.2",
                  zIndex: 7,
                  pointerEvents: "none",
                  maxWidth: "220px",
                }}
              >
                <div style={{ fontSize: "8px", fontFamily: "var(--font-ui)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px", color: labelColor }}>From:</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: nameColor }}>{sender || "Yours Truly"}</div>
                <div>123 Romance Avenue</div>
                <div>Hearts Desires, LV 14314</div>
              </div>

              {/* Mock Delivery Address */}
              <div 
                className="envelope-mock-address" 
                style={{ 
                  position: "absolute",
                  bottom: "25px",
                  right: "35px",
                  fontFamily: "var(--font-ui)",
                  fontSize: "13px",
                  color: textColor,
                  textAlign: "left",
                  lineHeight: "1.2",
                  zIndex: 7,
                  pointerEvents: "none",
                  maxWidth: "220px",
                }}
              >
                <div style={{ fontSize: "8px", fontFamily: "var(--font-ui)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px", color: labelColor }}>Deliver To:</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: nameColor }}>{recipient || "My Beloved"}</div>
                <div>777 Sweetheart Lane</div>
                <div>Garden of Eden, LV 14314</div>
              </div>
            </div>
            
            {/* Layer 3: Rotating/Folding Flap */}
            <div 
              className={`vintage-envelope-flap-part ${isOpen ? "open" : ""}`} 
              style={
                isVintageWhite ? { backgroundPosition: "-81.7px -32.8px" } :
                isCelestialBlue ? { backgroundPosition: "-81.7px -57.2px" } :
                undefined
              }
            />
          </>

          {/* Heart fountain burst */}
          {burstHearts.map((h) => (
            <span
              key={h.id}
              className="burst-heart"
              style={{
                "--tx": h.tx,
                "--ty": h.ty,
                "--scale": h.scale,
                "--rot": h.rot,
              } as CustomCSSProperties}
            >
              {h.char}
            </span>
          ))}

          {/* Wax Seal */}
          <button 
            className={`wax-seal vintage-rose-style ${isBreaking ? "breaking" : ""}`}
            style={{
              "--seal-color-main": isVintageRose ? "#b38f36" : isCelestialBlue ? "#b76e79" : "#9c1c2e",
              "--seal-color-light": isVintageRose ? "#ffd670" : isCelestialBlue ? "#e8b4b8" : "#e2b857",
              "--seal-color-dark": isVintageRose ? "#7a5c18" : isCelestialBlue ? "#5c2f45" : "#5c0a18",
              "--seal-bg-image": isCelestialBlue ? "url(/vintage_heart_seal.jpg)" :
                                 isVintageWhite ? "url(/vintage_red_seal.png)" : "url(/vintage_rose_seal.png)",
              display: isSealBroken && !isOpen ? "none" : undefined,
              width: "106px",
              height: "106px",
              left: "calc(50% - 53px)",
              top: "167px"
            } as React.CSSProperties}
            onClick={handleOpen}
            aria-label="Open Letter"
          >
            <div className="wax-seal-quarter top-left" />
            <div className="wax-seal-quarter top-right" />
            <div className="wax-seal-quarter bottom-left" />
            <div className="wax-seal-quarter bottom-right" />
          </button>

          {/* Tiny preview letter sheet inside */}
          <div 
            className="envelope-letter"
            style={{
              background: theme === "royal" ? "#F7F1E3" :
                          theme === "scroll" ? "#eddcb9" :
                          theme === "blush" ? "#FFFDF7" :
                          theme === "lavender" ? "#150b24" :
                          theme === "midnight_rose" ? "#110e10" :
                          theme === "obsidian_poppy" ? "#1c1c1f" :
                          theme === "celestial" ? "#090e24" :
                          "var(--stationery-bg)",
              transform: (isOpen && isFirstOpen && activeSheet === "none" && activeStep === "envelope")
                ? "translateY(-270px) scaleY(1.05) translateZ(3px)" 
                : "translateY(0) scaleY(1) translateZ(0)",
              opacity: (isOpen && isFirstOpen && activeSheet === "none" && activeStep === "envelope") ? 1 : 0,
              visibility: (isOpen && isFirstOpen && activeSheet === "none" && activeStep === "envelope") ? "visible" : "hidden",
              transition: (isOpen && isFirstOpen && activeSheet === "none" && activeStep === "envelope")
                ? "transform 2.0s cubic-bezier(0.25, 1, 0.5, 1) 1.5s, opacity 0.8s ease 1.5s, visibility 0s linear 1.5s"
                : "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0s, opacity 0.6s ease 0s, visibility 0s linear 0.6s"
            }}
          >
            <div style={{ fontSize: "10px", lineHeight: "1.3", opacity: 0.8, overflow: "hidden" }}>
              {content || "Loading your sweet words..."}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Expanded Full Screen Stationery Sheet (Fade-in portal style) */}
      {activeSheet === "letter" && mounted && (
        <MaybePortal preview={preview}>
          <div
            className={`stationery-sheet-portal ${isOnlyStep || !activeStep ? "no-timeline" : ""} ${playfair.variable} ${allura.variable} ${cinzelDec.variable} ${cormorant.variable} ${geist.variable} ${geistMono.variable} ${libreBaskerville.variable} ${lora.variable} ${dmSerifDisplay.variable} ${sourceSerif4.variable}`}
            style={{
              opacity: isSheetExpanded ? 1 : 0,
              pointerEvents: isSheetExpanded ? "auto" : "none",
              transition: "opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: preview ? "absolute" : "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* The beautiful letter paper page */}
             <div
              className={`stationery-sheet ${themeClass}`}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "590px",
                height: preview ? "90%" : "85vh",
                maxHeight: preview ? "600px" : "calc(100vh - 110px)",
                backgroundColor: "var(--stationery-bg)",
                backgroundImage: "var(--bg-image)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                border: "1.5px solid var(--stationery-border)",
                borderRadius: "16px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
              color: "var(--stationery-text)",
              fontFamily: "var(--stationery-font)",
              display: "flex",
              flexDirection: "column",
              transform: isSheetExpanded ? "scale(1) translateY(0)" : "scale(0.1) translateY(420px)",
              transition: isSheetExpanded 
                ? "transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)" 
                : "transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)",
              overflow: "hidden",
            }}
          >
            {/* Dark Theme Particle Effects */}
            {/* Dark Theme Particle Effects */}
            {theme === "celestial" && (
              <>
                {/* Twinkling Star Sparkles */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
                  {Array.from({ length: 14 }).map((_, idx) => {
                    const size = 3 + ((idx * 5) % 5);
                    const top = (idx * 17) % 100;
                    const left = (idx * 29) % 100;
                    const delay = (idx * 0.9) % 4;
                    const duration = 2 + ((idx * 1.1) % 4);
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: `${top}%`,
                          left: `${left}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          background: "#fff",
                          borderRadius: "50%",
                          boxShadow: "0 0 10px #fff, 0 0 20px #dcdde1",
                          animation: `star-pulse ${duration}s infinite ease-in-out ${delay}s`
                        }}
                      />
                    );
                  })}
                </div>

                {/* Celestial Corner Ornaments */}
                {true && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                      <defs>
                        <g id="celestial-corner-reader">
                          <path d="M 8,8 L 30,12 L 20,28 L 8,8 M 20,28 L 36,36 L 24,48" fill="none" stroke="rgba(220, 221, 225, 0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                          <circle cx="8" cy="8" r="2.5" fill="#dcdde1" />
                          <circle cx="30" cy="12" r="1.5" fill="#dcdde1" />
                          <circle cx="20" cy="28" r="3" fill="#fff" style={{ filter: "drop-shadow(0 0 3px #fff)" }} />
                          <circle cx="36" cy="36" r="1.5" fill="#dcdde1" />
                          <circle cx="24" cy="48" r="2" fill="#dcdde1" />
                        </g>
                      </defs>
                      <use href="#celestial-corner-reader" x="0" y="0" />
                      <use href="#celestial-corner-reader" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                      <use href="#celestial-corner-reader" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                      <use href="#celestial-corner-reader" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                    </svg>
                  </div>
                )}
              </>
            )}

            {theme === "lavender" && (
              <>
                {/* Wavy Gold Stardust */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const size = 2 + ((idx * 7) % 6);
                    const top = (idx * 23) % 100;
                    const left = (idx * 37) % 100;
                    const delay = (idx * 1.3) % 6;
                    const duration = 4 + ((idx * 1.9) % 5);
                    const colors = ["#ffeea1", "#d4af37", "#f3e5ab"];
                    const bgColor = colors[idx % colors.length];
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: `${top}%`,
                          left: `${left}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          background: bgColor,
                          borderRadius: "50%",
                          boxShadow: `0 0 8px ${bgColor}, 0 0 16px rgba(212, 175, 55, 0.4)`,
                          animation: `dust-float ${duration}s infinite linear ${delay}s`
                        }}
                      />
                    );
                  })}
                </div>




                {/* 3D Golden Rose Emblem (Bottom-Right) */}
                <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "64px", height: "64px", zIndex: 6, pointerEvents: "none" }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffeea1" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#aa7c11" />
                      </linearGradient>
                    </defs>
                    <path d="M 55,60 Q 40,75 35,90 M 55,65 Q 65,70 60,75 M 48,70 Q 30,70 38,65 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
                    <path d="M 40,72 C 34,70 28,74 34,78 C 40,82 44,78 40,72 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.5" />
                    <path d="M 58,74 C 64,72 70,76 64,80 C 58,84 54,80 58,74 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.5" />
                    <path d="M 50,22 C 35,22 30,38 50,58 C 70,38 65,22 50,22 Z" fill="url(#goldGrad)" fillOpacity="0.8" stroke="url(#goldGrad)" strokeWidth="0.8" />
                    <path d="M 50,30 C 40,32 40,48 50,48 C 60,48 60,32 50,30 Z" fill="url(#goldGrad)" stroke="url(#goldGrad)" strokeWidth="0.8" />
                    <circle cx="50" cy="40" r="8" fill="#fff" fillOpacity="0.15" stroke="url(#goldGrad)" strokeWidth="1" />
                    <circle cx="50" cy="40" r="4" fill="url(#goldGrad)" />
                  </svg>
                </div>
              </>
            )}

            {theme === "midnight_rose" && (
              <>
                {/* Fluttering Green Leaves */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const left = (idx * 47) % 100;
                    const size = 10 + ((idx * 13) % 13);
                    const delay = (idx * 1.7) % 6;
                    const duration = 6 + ((idx * 2.3) % 7);
                    const rotation = (idx * 53) % 360;
                    const leafEmoji = idx % 2 === 0 ? "🍃" : "🌿";
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: "-20px",
                          left: `${left}%`,
                          fontSize: `${size}px`,
                          opacity: idx % 3 === 0 ? 0.4 : 0.65,
                          transform: `rotate(${rotation}deg)`,
                          animation: `petal-fall ${duration}s infinite linear ${delay}s`
                        }}
                      >
                        {leafEmoji}
                      </div>
                    );
                  })}
                </div>


              </>
            )}

            {theme === "obsidian_poppy" && (
              <>
                {/* Floating Rose Gold Stardust */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const size = 2 + ((idx * 7) % 6);
                    const top = (idx * 23) % 100;
                    const left = (idx * 37) % 100;
                    const delay = (idx * 1.3) % 6;
                    const duration = 4 + ((idx * 1.9) % 5);
                    const colors = ["#ebd1c5", "#c59279", "#e8c4b0", "#ffdcd0"];
                    const bgColor = colors[idx % colors.length];
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: `${top}%`,
                          left: `${left}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          background: bgColor,
                          borderRadius: "50%",
                          boxShadow: `0 0 8px ${bgColor}, 0 0 16px rgba(197, 146, 121, 0.4)`,
                          animation: `dust-float ${duration}s infinite linear ${delay}s`
                        }}
                      />
                    );
                  })}
                </div>

                {/* Geometric Rose Gold Corner Ornaments */}
                {true && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
                    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="roseGoldGradReader" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ebd1c5" />
                          <stop offset="50%" stopColor="#c59279" />
                          <stop offset="100%" stopColor="#8c5b43" />
                        </linearGradient>
                        <g id="poppy-corner-reader">
                          <path d="M 12,12 L 48,12 M 12,12 L 12,48" fill="none" stroke="url(#roseGoldGradReader)" strokeWidth="1.5" />
                          <path d="M 18,18 L 38,18 M 18,18 L 18,38" fill="none" stroke="url(#roseGoldGradReader)" strokeWidth="0.8" opacity="0.7" />
                          <path d="M 12,30 L 30,12" fill="none" stroke="url(#roseGoldGradReader)" strokeWidth="0.8" />
                          <path d="M 18,32 L 32,18" fill="none" stroke="url(#roseGoldGradReader)" strokeWidth="0.8" />
                          <path d="M 22,22 L 26,26 L 22,30 L 18,26 Z" fill="url(#roseGoldGradReader)" fillOpacity="0.25" stroke="url(#roseGoldGradReader)" strokeWidth="0.8" />
                          <circle cx="26" cy="26" r="1.5" fill="#e8c4b0" />
                        </g>
                      </defs>
                      <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" fill="none" stroke="url(#roseGoldGradReader)" strokeWidth="0.8" opacity="0.3" />
                      <use href="#poppy-corner-reader" x="0" y="0" />
                      <use href="#poppy-corner-reader" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                      <use href="#poppy-corner-reader" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                      <use href="#poppy-corner-reader" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                    </svg>
                  </div>
                )}
              </>
            )}

            {theme === "blush" && (
              <>
                {/* Delicate corner floral SVGs */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
                  <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                    <defs>
                      <g id="blush-corner-reader">
                        <path d="M 10,10 C 22,10 26,14 26,26 C 26,20 22,20 22,10" fill="none" stroke="#B76E79" strokeWidth="1" />
                        <path d="M 10,10 C 10,22 14,26 26,26" fill="none" stroke="#B76E79" strokeWidth="1" />
                        <path d="M 14,20 Q 18,18 20,14" fill="none" stroke="#B76E79" strokeWidth="0.75" />
                        <path d="M 20,14 C 24,16 26,20 22,22 C 18,20 18,16 20,14 Z" fill="#E8B4B8" opacity="0.35" />
                      </g>
                    </defs>
                    <use href="#blush-corner-reader" x="0" y="0" />
                    <use href="#blush-corner-reader" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                    <use href="#blush-corner-reader" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                    <use href="#blush-corner-reader" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                  </svg>
                </div>

                {/* Light watercolor rose in bottom-left corner */}
                <div style={{
                  position: "absolute",
                  bottom: "35px",
                  left: "35px",
                  fontSize: "72px",
                  filter: "saturate(35%) opacity(0.22)",
                  pointerEvents: "none",
                  zIndex: 4
                }}>
                  🌹
                </div>
              </>
            )}

            {theme === "royal" && (
              <>
                <div style={{ position: "absolute", top: "10px", left: "10px", fontSize: "18px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "18px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                <div style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "18px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                <div style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "18px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                <div style={{ position: "absolute", left: "4px", top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: "14px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
                <div style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "14px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
                <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", color: "#C9A227", zIndex: 10, pointerEvents: "none" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.15" />
                    <path d="M3 20h18" strokeWidth="2" />
                    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                    <circle cx="2" cy="3" r="1.5" fill="currentColor" />
                    <circle cx="22" cy="3" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </>
            )}

            {/* Letter Body Scroll Container */}
            <div
              className="hide-scrollbar stationery-scroll-container"
              style={{
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: theme === "obsidian_poppy" ? "8px" : "24px",
                zIndex: 6,
                padding: theme === "royal" ? "24px 24px 24px 24px" :
                         theme === "midnight_rose" ? "48px 56px 40px 56px" :
                         theme === "celestial" ? "48px 56px 40px 56px" :
                         theme === "obsidian_poppy" ? "52px 80px 40px 80px" :
                         "24px 32px 32px 32px",
              }}
            >
              {/* Header: To */}
              <div 
                className="letter-greeting"
                style={{
                  fontWeight: theme === "midnight_rose" ? "bold" :
                              theme === "celestial" ? "normal" :
                              theme === "obsidian_poppy" ? "normal" :
                              theme === "blush" ? "600" :
                              theme === "royal" ? "bold" : "normal",
                  fontFamily: theme === "midnight_rose" ? "var(--font-playfair)" :
                              theme === "celestial" ? "var(--font-great-vibes)" :
                              theme === "obsidian_poppy" ? "var(--font-dancing-script)" :
                              theme === "lavender" ? "var(--font-great-vibes)" :
                              "var(--stationery-greeting-font, var(--font-cursive))",
                  fontStyle: theme === "midnight_rose" ? "italic" : "normal",
                  borderBottom: theme === "blush" || theme === "royal" || theme === "celestial" || theme === "midnight_rose" || theme === "lavender" || theme === "obsidian_poppy" ? "none" : "1px solid rgba(0,0,0,0.05)",
                  textAlign: (theme === "blush" || theme === "midnight_rose") ? "center" :
                             theme === "lavender" ? "right" :
                             "left",
                  paddingBottom: theme === "obsidian_poppy" ? "4px" : "12px",
                  paddingLeft: "0px",
                  paddingRight: theme === "lavender" ? "24px" : "0px",
                  borderLeft: "none",
                  fontSize: theme === "midnight_rose" ? "26px" :
                            theme === "celestial" ? "32px" :
                            theme === "obsidian_poppy" ? "30px" :
                            theme === "lavender" ? "32px" :
                            "26px",
                  letterSpacing: "normal",
                  textTransform: "none",
                  color: theme === "midnight_rose" ? "#1a4325" :
                         theme === "celestial" ? "#d4af37" :
                         theme === "obsidian_poppy" ? "#e8c4b0" :
                         theme === "blush" ? "var(--stationery-text)" : "var(--stationery-accent)",
                  textShadow: "none",
                }}
              >
                {greeting ? `${greeting} ` : ""}{recipient || "My Loved One"},
              </div>

              {theme === "blush" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "-10px 0 0px 0" }}>
                  <div style={{ height: "1px", width: "40px", backgroundColor: "#B76E79", opacity: 0.4 }} />
                  <span style={{ color: "#E8B4B8", fontSize: "12px" }}>❤</span>
                  <div style={{ height: "1px", width: "40px", backgroundColor: "#B76E79", opacity: 0.4 }} />
                </div>
              )}

              {theme === "royal" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "-10px 0 0px 0" }}>
                  <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
                  <span style={{ color: "#7B1E1E", fontSize: "14px" }}>⚜️</span>
                  <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
                </div>
              )}

              {/* Removed top banner to make room for bottom right floater */}

              <div
                className="letter-body"
                style={{
                  fontSize: "var(--stationery-font-size, 18px)",
                  lineHeight: "var(--stationery-line-height, 1.8)",
                  whiteSpace: "pre-wrap",
                  color: "var(--stationery-text)",
                  fontFamily: "var(--stationery-font)",
                  letterSpacing: "var(--stationery-letter-spacing, 0.3px)",
                  flex: 1,
                  paddingBottom: theme === "obsidian_poppy" ? "8px" : "24px"
                }}
              >
                {narration?.enabled && syncData.length > 0 ? (
                  syncData.map((item, idx) => {
                    const isActive = idx === activeSentenceIndex;
                    return (
                      <span
                        key={idx}
                        ref={isActive ? activeSentenceRef : null}
                        style={{
                          transition: "all 0.4s ease",
                          color: isActive ? (theme === "blush" ? "#B76E79" : "var(--accent-gold)") : "var(--stationery-text)",
                          opacity: isActive ? 1 : 0.8,
                          textShadow: isActive ? (theme === "blush" ? "0 0 8px rgba(183, 110, 121, 0.35)" : "0 0 10px rgba(226, 184, 87, 0.45)") : "none",
                          fontWeight: isActive ? "bold" : "normal"
                        }}
                      >
                        {item.text}{" "}
                      </span>
                    );
                  })
                ) : (
                  content
                )}
              </div>

              {/* Footer: From */}
              <div
                style={{
                  textAlign: (theme === "blush" || theme === "midnight_rose") ? "center" :
                             (theme === "lavender" || theme === "obsidian_poppy") ? "left" :
                             "right",
                  marginTop: "auto",
                  paddingTop: theme === "obsidian_poppy" ? "12px" : "28px",
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: (theme === "blush" || theme === "midnight_rose") ? "center" :
                              (theme === "lavender" || theme === "obsidian_poppy") ? "flex-start" :
                              "flex-end",
                  paddingRight: (theme === "blush" || theme === "midnight_rose" || theme === "obsidian_poppy") ? "0px" :
                                theme === "scroll" ? "36px" :
                                theme === "royal" ? "16px" :
                                "0px",
                  paddingLeft: theme === "lavender" ? "32px" : "0px",
                }}
              >
                {farewell && (
                  <div 
                    className="letter-farewell" 
                    style={{ 
                      fontFamily: theme === "midnight_rose" ? "var(--font-cormorant)" :
                                  theme === "celestial" ? "var(--font-cormorant)" :
                                  theme === "obsidian_poppy" ? "var(--font-cormorant)" :
                                  theme === "lavender" ? "var(--font-cormorant)" :
                                  "var(--stationery-font)",
                      fontStyle: "italic",
                      fontSize: theme === "obsidian_poppy" ? "21px" : "18px",
                      fontWeight: "400",
                      letterSpacing: "normal",
                      textTransform: "none",
                      color: theme === "midnight_rose" ? "#8c6c30" :
                             theme === "obsidian_poppy" ? "#ebd1c5" :
                             "var(--stationery-text)",
                      opacity: 0.85,
                      marginBottom: "6px" 
                    }}
                  >
                    {farewell}
                  </div>
                )}
                <div
                  className="letter-signature"
                  style={{
                    fontFamily: theme === "midnight_rose" ? "var(--font-great-vibes)" :
                                theme === "celestial" ? "var(--font-great-vibes)" :
                                theme === "obsidian_poppy" ? "var(--font-dancing-script)" :
                                theme === "lavender" ? "var(--font-great-vibes)" :
                                "var(--stationery-sig-font, var(--font-cursive))",
                    fontSize: (theme === "midnight_rose" || theme === "celestial" || theme === "obsidian_poppy") ? "36px" : "32px",
                    lineHeight: "1.2",
                    fontWeight: "normal",
                    color: theme === "midnight_rose" ? "#1a4325" :
                           theme === "celestial" ? "#ffeea1" :
                           theme === "obsidian_poppy" ? "#ffdcd0" :
                           theme === "lavender" ? "#ffeea1" :
                           theme === "blush" ? "#B76E79" : "var(--stationery-accent)",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                    textShadow: theme === "celestial" ? "0 0 10px rgba(255, 255, 255, 0.5)" :
                                theme === "obsidian_poppy" ? "0 0 12px rgba(255, 220, 208, 0.2)" :
                                theme === "midnight_rose" ? "none" :
                                "0 0 12px rgba(197, 146, 121, 0.15)",
                  }}
                >
                  {sender || "Yours Truly"}
                </div>

                {theme === "blush" && (
                  <div style={{ 
                    width: "120px", 
                    height: "1px", 
                    background: "linear-gradient(to right, transparent, #B76E79, transparent)", 
                    marginTop: "4px", 
                    marginLeft: "auto" 
                  }} />
                )}

                {theme === "royal" && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #a83232 0%, #7B1E1E 60%, #4d0f0f 100%)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      border: "1px solid rgba(123,30,30,0.5)"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" style={{ opacity: 0.85, filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}>
                        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="#C9A227" fillOpacity="0.2" />
                        <path d="M3 20h18" />
                      </svg>
                      <div style={{
                        position: "absolute",
                        top: "-3px",
                        left: "-3px",
                        right: "-3px",
                        bottom: "-3px",
                        borderRadius: "50%",
                        border: "2px solid #7B1E1E",
                        opacity: 0.35
                      }} />
                    </div>
                  </div>
                )}
                {isOnlyStep && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "40px", paddingBottom: "20px" }}>
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
                        padding: "10px 24px",
                        borderRadius: "8px",
                        backgroundColor: theme === "blush" ? "#B76E79" : "var(--accent-rose)",
                        backgroundImage: theme === "blush" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(255, 75, 114, 0.2)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      Close & Exit 💌
                    </button>
                  </div>
                )}
                {/* Floating Voice Narration Play/Pause FAB */}
                {narration?.enabled && narration.audioUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!narrationAudioRef.current) return;
                      if (narrationPlaying) {
                        narrationAudioRef.current.pause();
                        setNarrationPlaying(false);
                      } else {
                        narrationAudioRef.current.play().then(() => {
                          setNarrationPlaying(true);
                        });
                      }
                    }}
                    style={{
                      position: "absolute",
                      bottom: "24px",
                      right: "24px",
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: theme === "blush" ? "#B76E79" : "var(--accent-rose)",
                      backgroundImage: theme === "blush" ? "none" : "linear-gradient(135deg, #ff4b72, #ff758f)",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      boxShadow: narrationPlaying 
                        ? "0 0 20px var(--accent-rose), 0 6px 20px rgba(255, 75, 114, 0.4)" 
                        : "0 6px 20px rgba(0, 0, 0, 0.3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 200,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: narrationPlaying ? "scale(1.08)" : "scale(1)",
                    }}
                    title={narrationPlaying ? "Pause Narration" : "Play Narration"}
                  >
                    {narrationPlaying ? (
                      <div style={{ display: "flex", gap: "3px", alignItems: "center", height: "18px" }}>
                        <style>{`
                          @keyframes bounce-bar-audio-float {
                            0% { transform: scaleY(0.3); }
                            100% { transform: scaleY(1.3); }
                          }
                        `}</style>
                        <div style={{ width: "3.5px", height: "14px", background: "#fff", transformOrigin: "bottom", animation: "bounce-bar-audio-float 0.5s infinite alternate 0.1s" }} />
                        <div style={{ width: "3.5px", height: "14px", background: "#fff", transformOrigin: "bottom", animation: "bounce-bar-audio-float 0.5s infinite alternate 0.3s" }} />
                        <div style={{ width: "3.5px", height: "14px", background: "#fff", transformOrigin: "bottom", animation: "bounce-bar-audio-float 0.5s infinite alternate 0.5s" }} />
                      </div>
                    ) : (
                      // Microphone SVG icon
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#fff" }}>
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    )}

                    <audio
                      ref={narrationAudioRef}
                      src={narration.audioUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={(e) => setNarrationDuration(e.currentTarget.duration)}
                      onEnded={() => {
                        setNarrationPlaying(false);
                        setNarrationTime(0);
                        setActiveSentenceIndex(-1);
                      }}
                      style={{ display: "none" }}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Floating Close Action inside the letter sheet */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: theme === "celestial" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.05)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--stationery-text)",
                opacity: 0.6,
                transition: "opacity 0.2s, background-color 0.2s",
                zIndex: 100,
              }}
              title="Fold Back into Envelope"
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              {/* SVG X icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </MaybePortal>
      )}

      {/* Expanded Full Screen Polaroid Stack (Fade-in portal style) */}
      {activeSheet === "polaroids" && mounted && (
        <MaybePortal preview={preview}>
          <div
            style={{
              position: preview ? "absolute" : "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 90,
              background: "transparent",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isSheetExpanded ? 1 : 0,
              pointerEvents: isSheetExpanded ? "auto" : "none",
              transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <PolaroidsReader
                polaroids={polaroids || []}
                theme={theme}
                onComplete={() => handleClose()}
                isSheetExpanded={isSheetExpanded}
                layout={polaroidsLayout}
                collageStyle={polaroidsCollageStyle}
                collageBgPosition={polaroidsCollageBgPosition}
                collageBgZoom={polaroidsCollageBgZoom}
                title={polaroidsTitle}
                showHearts={polaroidsShowHearts}
                sender={sender}
                preview={preview}
              />
            </div>
          </div>
        </MaybePortal>
      )}

      {isOnlyStep && isSealBroken && !isOpen && !isFullView && !isBreaking && (
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.close();
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 150);
            }
          }}
          className="animate-reveal"
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "var(--text-main)",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.transform = "none";
          }}
        >
          Back to Dashboard 🏠
        </button>
      )}
    </div>
  );
}

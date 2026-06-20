"use client";

import React, { useState, useEffect } from "react";

interface SealingAnimationProps {
  envelopeStyle: string;
  sealSymbol: string;
  sealColor: string;
  recipient: string;
  sender: string;
  content: string;
  theme: string;
  greeting: string;
  farewell: string;
  onComplete: () => void;
  isInline?: boolean;
}

export default function SealingAnimation({
  envelopeStyle,
  sealSymbol,
  sealColor,
  recipient,
  sender,
  content,
  theme,
  greeting,
  farewell,
  onComplete,
  isInline = false
}: SealingAnimationProps) {
  const [stage, setStage] = useState(0);
  const [burstHearts, setBurstHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);
  const [stampHandleStage, setStampHandleStage] = useState<"hidden" | "descend" | "press" | "lift">("hidden");
  const [showWaxDrip, setShowWaxDrip] = useState(false);
  const [showDetailedSeal, setShowDetailedSeal] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Audio thud/chime effect when stamp hits
  const playStampSound = () => {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        
        // Deep stamp thud sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);

        // High pitch chime/shimmer for magic feel
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);
        
        gain2.gain.setValueAtTime(0.07, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.55);
      } catch {}
    }
  };

  // Audio paper folding sound
  const playFoldSound = () => {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.35);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } catch {}
    }
  };

  // Audio envelope mailing sweep sound
  const playMailSound = () => {
    if (typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.7);
        
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } catch {}
    }
  };

  const triggerHeartBurst = () => {
    const heartsList = ["💖", "💝", "💕", "✨", "🌸", "❤️"];
    const newBursts = [];
    for (let i = 0; i < 22; i++) {
      const char = heartsList[Math.floor(Math.random() * heartsList.length)];
      const tx = `${(Math.random() - 0.5) * 220}px`;
      const ty = `${(Math.random() - 0.5) * 220}px`;
      const scale = Math.random() * 0.75 + 0.5;
      const rot = `${(Math.random() - 0.5) * 360}deg`;
      newBursts.push({ id: i, char, tx, ty, scale, rot });
    }
    setBurstHearts(newBursts);
  };

  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Slow, deliberate Timer Timeline (13.8 seconds total)
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1500),  // Stage 1: Fold the top section (envelope hidden)
      setTimeout(() => setStage(2), 3100),  // Stage 2: Fold the bottom section (envelope hidden)
      setTimeout(() => setStage(3), 4700),  // Stage 3: Envelope slides up from bottom
      setTimeout(() => setStage(4), 6300),  // Stage 4: Tuck letter inside envelope
      setTimeout(() => setStage(5), 7800),  // Stage 5: Close the envelope flap
      setTimeout(() => setStage(6), 9300),  // Stage 6: Wax stamping starts
      
      // Wax Stamping sub-timings:
      setTimeout(() => {
        setStampHandleStage("descend");
      }, 9300),                             // 0.0s: Stamp handle begins descent
      setTimeout(() => {
        setStampHandleStage("press");
        setShowDetailedSeal(true);
        setShowFlash(true);
        if (!isInline) playStampSound();
        triggerHeartBurst();
      }, 10100),                            // 0.8s: Handle hits wax (sound, flash, hearts, detail reveals)
      setTimeout(() => {
        setStampHandleStage("lift");
      }, 10900),                            // 1.6s: Handle lifts back up and fades out (revealing finished seal)

      setTimeout(() => setStage(7), 11800), // Stage 7: Envelope swipes right (mailed away)
      setTimeout(() => onCompleteRef.current(), 13800) // Stage 8: Complete callback
    ];

    return () => timers.forEach(clearTimeout);
  }, [isInline]);

  // Trigger audio effects on stage transitions
  useEffect(() => {
    if (isInline) return;
    if (stage === 1 || stage === 2) {
      playFoldSound();
    } else if (stage === 7) {
      playMailSound();
    }
  }, [stage, isInline]);

  const isVintageWhite = envelopeStyle === "vintage-white";
  const isCelestialBlue = envelopeStyle === "celestial-blue";
  const isVintageRose = !isVintageWhite && !isCelestialBlue;
  const labelColor = isVintageWhite ? "rgba(47, 42, 36, 0.5)" : "rgba(244, 230, 206, 0.55)";
  const textColor = isVintageWhite ? "rgba(47, 42, 36, 0.65)" : "rgba(244, 230, 206, 0.85)";
  const nameColor = isVintageWhite ? "#9c1c2e" : "#e2b857";

  const getPaperBg = () => {
    switch (theme) {
      case "royal": return "#F7F1E3";
      case "scroll": return "#eddcb9";
      case "blush": return "#FFFDF7";
      case "lavender": return "#f7f4fc";
      case "celestial": return "#090e24";
      default: return "#fdfbf7";
    }
  };

  const getPaperBorderColor = () => {
    switch (theme) {
      case "royal": return "#e2b857";
      case "scroll": return "#5c381f";
      case "blush": return "#b76e79";
      case "lavender": return "#e8dbf8";
      case "celestial": return "#e2b857";
      default: return "#f3edd7";
    }
  };

  const getPaperTextColor = () => {
    switch (theme) {
      case "celestial": return "#f3f1f6";
      default: return "#2f2a24";
    }
  };

  const getStatusText = () => {
    switch (stage) {
      case 0:
        return "Preparing your letter... 💌";
      case 1:
        return "Folding top fold... ✍️";
      case 2:
        return "Folding bottom fold... ✍️";
      case 3:
        return "Positioning envelope... 🕊️";
      case 4:
        return "Tucking your letter inside... 📨";
      case 5:
        return "Closing the envelope flap... 🔒";
      case 6:
        if (stampHandleStage === "descend") return "Positioning stamp... 🔍";
        if (stampHandleStage === "press") return "Pressing custom seal... 🖋️";
        return "Lifting stamp matrix... ✨";
      case 7:
      default:
        return "Mailing your letter away! 🚀";
    }
  };

  const showStampHandle = stampHandleStage !== "hidden";

  return (
    <div 
      className={`sealing-animation-container ${isInline ? "sealing-animation-container-inline" : ""}`}
      style={{
        position: isInline ? "absolute" : "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isInline ? "transparent" : "rgba(11, 7, 17, 0.96)",
        zIndex: isInline ? 10 : 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: isInline ? "none" : "blur(15px)",
        WebkitBackdropFilter: isInline ? "none" : "blur(15px)",
        color: "#fff",
        fontFamily: "var(--font-ui)",
        animation: isInline ? "none" : "fadeInStudioOverlay 0.5s ease forwards",
        overflow: "hidden",
        transform: isInline ? "scale(0.55)" : "none",
        transformOrigin: "center"
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .sealing-animation-container-inline {
            transform: scale(0.42) !important;
          }
        }
        @media (max-width: 768px) {
          .sealing-animation-container:not(.sealing-animation-container-inline) .sealing-animation-inner-scaler {
            transform: scale(0.75) !important;
          }
        }
        @media (max-width: 480px) {
          .sealing-animation-container:not(.sealing-animation-container-inline) .sealing-animation-inner-scaler {
            transform: scale(0.58) !important;
          }
        }
        @media (max-width: 360px) {
          .sealing-animation-container:not(.sealing-animation-container-inline) .sealing-animation-inner-scaler {
            transform: scale(0.48) !important;
          }
        }
        @keyframes fadeInStudioOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sealStampEffect {
          0% {
            transform: translateZ(4px) scale(2.5) rotate(-30deg);
            opacity: 0;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.6));
          }
          70% {
            transform: translateZ(4px) scale(0.9) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: translateZ(4px) scale(1) rotate(-10deg);
            opacity: 1;
            filter: drop-shadow(0 8px 24px rgba(0,0,0,0.35));
          }
        }
        @keyframes floatUpText {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes sealFlashEffect {
          0% {
            transform: translate(-50%, -50%) translateZ(6px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateZ(6px) scale(18);
            opacity: 0;
          }
        }
        @keyframes stampToolAction {
          0% {
            transform: translateZ(8px) translateY(-500px) rotate(-8deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          32% {
            /* Descend and hit the wax at 7.9s (0.8s elapsed) */
            transform: translateZ(8px) translateY(0px) rotate(-2deg);
            opacity: 1;
          }
          36% {
            /* Hit impact: compress and tilt */
            transform: translateZ(8px) translateY(3px) scaleY(0.92) scaleX(1.04) rotate(0deg);
            opacity: 1;
          }
          44% {
            /* Slight wobble to spread wax */
            transform: translateZ(8px) translateY(-1px) scaleY(1.01) scaleX(0.99) rotate(2deg);
            opacity: 1;
          }
          52% {
            /* Settle in place */
            transform: translateZ(8px) translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
          }
          64% {
            /* Settle hold */
            transform: translateZ(8px) translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
          }
          76% {
            /* Retract upwards */
            transform: translateZ(8px) translateY(-200px) rotate(-3deg);
            opacity: 0.8;
          }
          100% {
            /* Lifts completely off-screen and fades out by 9.6s (2.5s elapsed) */
            transform: translateZ(8px) translateY(-500px) rotate(-5deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* 3D Scaling Animation Wrapper for Mobile */}
      <div 
        className="sealing-animation-inner-scaler"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
          pointerEvents: "none"
        }}
      >
      {/* 3D Folding Letter Paper (Only visible before tucking is complete) */}
      {stage <= 4 && (
        <div 
          className="letter-paper-wrapper"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "500px",
            height: "360px",
            transformStyle: "preserve-3d",
            perspective: "1000px",
            transition: "all 1.4s cubic-bezier(0.4, 0, 0.2, 1)", // Slower fold/slide transition
            zIndex: 10,
            opacity: stage >= 4 ? 0 : 1,
            // Centering and sliding transition coordinates
            transform: 
              stage >= 4
                ? "translate(-50%, -132px) scale(0.85)" // Tucks down inside envelope
                : stage === 3 
                  ? "translate(-50%, -348px) scale(0.85)" // Floats just above open envelope flap
                  : "translate(-50%, -50%) scale(1)", // Centered folding position
            pointerEvents: "none"
          }}
        >
          {/* Top fold section */}
          <div 
            className="top-section-container"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "120px",
              transformOrigin: "bottom",
              transformStyle: "preserve-3d",
              transform: stage >= 1 ? "rotateX(-179deg)" : "rotateX(0deg)",
              transition: "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)", // Slower 3D fold
              zIndex: 3
            }}
          >
            {/* Front side (Content) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: getPaperBg(),
              border: `1px solid ${getPaperBorderColor()}`,
              borderBottom: "1px dashed rgba(0,0,0,0.08)",
              borderRadius: "8px 8px 0 0",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              padding: "16px 20px",
              color: getPaperTextColor(),
              overflow: "hidden"
            }}>
              <div style={{ fontFamily: "var(--font-cursive)", fontSize: "20px", marginBottom: "4px" }}>
                {greeting || "Dearest,"}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.4" }}>
                {content ? content.substring(0, 100) : "Writing you a secret message..."}
              </div>
            </div>
            
            {/* Back side (Plain Paper) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: getPaperBg(),
              border: `1px solid ${getPaperBorderColor()}`,
              borderRadius: "0 0 8px 8px",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow: "inset 0 0 15px rgba(0,0,0,0.05)"
            }} />
          </div>

          {/* Middle fold section */}
          <div 
            className="paper-section middle-section"
            style={{
              position: "absolute",
              top: "120px",
              left: 0,
              width: "100%",
              height: "120px",
              background: getPaperBg(),
              borderLeft: `1px solid ${getPaperBorderColor()}`,
              borderRight: `1px solid ${getPaperBorderColor()}`,
              padding: "10px 20px",
              color: getPaperTextColor(),
              overflow: "hidden",
              zIndex: 2
            }}
          >
            <div style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.4" }}>
              {content && content.length > 100 ? content.substring(100, 250) : ""}
            </div>
          </div>

          {/* Bottom fold section */}
          <div 
            className="bottom-section-container"
            style={{
              position: "absolute",
              top: "240px",
              left: 0,
              width: "100%",
              height: "120px",
              transformOrigin: "top",
              transformStyle: "preserve-3d",
              transform: stage >= 2 ? "rotateX(179deg)" : "rotateX(0deg)",
              transition: "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)", // Slower 3D fold
              zIndex: 3
            }}
          >
            {/* Front side (Content) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: getPaperBg(),
              border: `1px solid ${getPaperBorderColor()}`,
              borderTop: "1px dashed rgba(0,0,0,0.08)",
              borderRadius: "0 0 8px 8px",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              padding: "16px 20px",
              color: getPaperTextColor(),
              overflow: "hidden"
            }}>
              <div style={{ fontSize: "11px", opacity: 0.8, lineHeight: "1.4", marginBottom: "12px" }}>
                {content && content.length > 250 ? content.substring(250, 400) : ""}
              </div>
              <div style={{ fontFamily: "var(--font-cursive)", fontSize: "18px", textAlign: "right" }}>
                {farewell || "With all my love,"}
              </div>
            </div>

            {/* Back side (Plain Paper) */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: getPaperBg(),
              border: `1px solid ${getPaperBorderColor()}`,
              borderRadius: "8px 8px 0 0",
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow: "inset 0 0 15px rgba(0,0,0,0.05)"
            }} />
          </div>
        </div>
      )}

      {/* Envelope Area */}
      <div 
        className={`envelope-wrapper theme-${theme} vintage-rose-style`} 
        style={{ 
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: 
            stage <= 2 ? "translate(-50%, 100vh) scale(0.85)" : 
            stage >= 7  ? "translate(120vw, -40%) rotate(10deg) scale(0.8)" : 
            "translate(-50%, -40%) scale(0.85)", 
          transition: 
            stage === 3 ? "transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)" : // Slower envelope slide up
            stage >= 7  ? "transform 2.0s cubic-bezier(0.25, 1, 0.3, 1)" : // Slower envelope glide right
            "transform 0.6s ease",
          zIndex: 5
        }}
      >
        <div 
          className="envelope vintage-rose-style"
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
          {/* Layer 1: Envelope Back */}
          <div className="vintage-envelope-back" />

          {/* Layer 2: Envelope Front Pocket */}
          <div 
            className="vintage-envelope-front-pocket"
            style={{
              clipPath: "inset(120px 0px 0px 0px)",
              WebkitClipPath: "inset(120px 0px 0px 0px)"
            }}
          >
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

            {/* Recipient Address */}
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

          {/* Layer 3: Folding Flap */}
          <div 
            className="vintage-envelope-flap-part"
            style={{
              transform: stage >= 5 ? "rotateX(-180deg) translateZ(-2px)" : "rotateX(0deg) translateZ(-1px)",
              zIndex: stage >= 5 ? 6 : 1,
              transition: "transform 1.3s cubic-bezier(0.4, 0, 0.2, 1)", // Slower flap closing
              ...(isVintageWhite ? { backgroundPosition: "-81.7px -32.8px" } :
                  isCelestialBlue ? { backgroundPosition: "-81.7px -57.2px" } : {}),
            }}
          />

          {/* Layer 4: Letter sliding inside */}
          <div 
            className="envelope-letter"
            style={{
              background: theme === "royal" ? "#F7F1E3" :
                          theme === "scroll" ? "#eddcb9" :
                          theme === "blush" ? "#FFFDF7" :
                          theme === "lavender" ? "#f7f4fc" :
                          theme === "celestial" ? "#090e24" :
                          "var(--stationery-bg)",
              width: "500px",
              height: "120px",
              left: "25px",
              bottom: "105px",
              border: `1px solid ${getPaperBorderColor()}`,
              borderRadius: "6px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15), inset 0 0 15px rgba(0,0,0,0.05)",
              transform: stage >= 4 ? "translateY(0px)" : "translateY(-216px)",
              opacity: stage >= 4 ? 1 : 0,
              transition: "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease", // Slower tucking
              zIndex: 3,
              padding: "0"
            }}
          >
            <div style={{
              fontFamily: "var(--font-cursive)",
              fontSize: "12px",
              lineHeight: "1.3",
              opacity: 0.75,
              color: getPaperTextColor(),
              padding: "8px 16px",
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}>
              <div>{greeting || "Dearest,"}</div>
              <div style={{ fontSize: "10px", lineHeight: "1.2", whiteSpace: "normal" }}>
                {content ? content.substring(0, 160) : "..."}
              </div>
            </div>
          </div>

          {/* Layer 5.2: Wax Seal detailed crest stamp (Stamped on hit) */}
          {showDetailedSeal && (
            <button 
              className="wax-seal vintage-rose-style"
              style={{
                "--seal-color-main": isVintageRose ? "#b38f36" : isCelestialBlue ? "#b76e79" : "#9c1c2e",
                "--seal-color-light": isVintageRose ? "#ffd670" : isCelestialBlue ? "#e8b4b8" : "#e2b857",
                "--seal-color-dark": isVintageRose ? "#7a5c18" : isCelestialBlue ? "#5c2f45" : "#5c0a18",
                "--seal-bg-image": isCelestialBlue ? "url(/vintage_heart_seal.jpg)" :
                                   isVintageWhite ? "url(/vintage_red_seal.png)" : "url(/vintage_rose_seal.png)",
                zIndex: 7,
                animation: "sealStampEffect 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                transform: "translateZ(4px)",
                width: "106px",
                height: "106px",
                left: "calc(50% - 53px)",
                top: "167px"
              } as React.CSSProperties}
            >
              <div className="wax-seal-quarter top-left" />
              <div className="wax-seal-quarter top-right" />
              <div className="wax-seal-quarter bottom-left" />
              <div className="wax-seal-quarter bottom-right" />
            </button>
          )}

          {/* Layer 5.3: Stamping Metal Stamp Handle Tool */}
          {showStampHandle && (
            <img 
              src="/sealing_stamp_tool_transparent.png"
              alt="Stamp Tool"
              style={{
                position: "absolute",
                left: "50%",
                top: "220px",
                marginLeft: "-50px", // Half of width (100px)
                marginTop: "-220px", // Align bottom of stamp to 220px
                width: "100px",
                height: "auto",
                zIndex: 20, // Stays in front of everything
                pointerEvents: "none",
                animation: "stampToolAction 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards"
              }}
            />
          )}

          {/* Stamping Flash overlay */}
          {showFlash && (
            <div 
              style={{
                position: "absolute",
                top: "220px",
                left: "50%",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 0 50px 25px rgba(255, 255, 255, 0.8)",
                transform: "translate(-50%, -50%) translateZ(6px)",
                pointerEvents: "none",
                zIndex: 15,
                animation: "sealFlashEffect 0.65s ease-out forwards"
              }}
            />
          )}

          {/* Heart fountain burst relative to the pocket */}
          {burstHearts.map((h) => (
            <span
              key={h.id}
              className="burst-heart"
              style={{
                "--tx": h.tx,
                "--ty": h.ty,
                "--scale": h.scale,
                "--rot": h.rot,
                zIndex: 25
              } as React.CSSProperties}
            >
              {h.char}
            </span>
          ))}
        </div>
      </div>
      </div>

      {/* Animation Status Title */}
      <h2 
        key={stage}
        style={{
          position: "absolute",
          bottom: "10%",
          left: 0,
          right: 0,
          fontSize: "24px",
          fontWeight: "normal",
          fontFamily: "var(--font-cursive)",
          color: stage === 6 ? "var(--accent-gold)" : "#fff",
          textAlign: "center",
          animation: "floatUpText 0.4s ease-out forwards",
          minHeight: "36px",
          letterSpacing: "0.5px"
        }}
      >
        {getStatusText()}
      </h2>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";

interface CustomCSSProperties extends React.CSSProperties {
  "--tx"?: string;
  "--ty"?: string;
  "--scale"?: number;
  "--rot"?: string;
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
}: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isSealBroken, setIsSealBroken] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [burstHearts, setBurstHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);

  // Trigger full page letter overlay after slide-out animation finishes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsFullView(true);
      }, 3000); // Wait for flap rotation (1.2s) + letter slide out (1.8s)
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsFullView(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (isOpen || isBreaking) return;
    setIsBreaking(true);

    // Crack and shake for 2.2s (slower breaking)
    setTimeout(() => {
      setIsOpen(true);
      setIsSealBroken(true);
      setIsBreaking(false);

      // Generate romantic heart burst particles!
      const heartsList = ["❤️", "💖", "💝", "💕", "✨", "🌸"];
      const newBursts = [];
      for (let i = 0; i < 22; i++) {
        const char = heartsList[Math.floor(Math.random() * heartsList.length)];
        const tx = `${(Math.random() - 0.5) * 360}px`;
        const ty = `${-150 - Math.random() * 220}px`; // shoots upwards
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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullView(false);
    // Add longer timeout before closing envelope to let full view scale down first
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 800); // Slower retracting delay
  };

  const hasBackdrop = (backdrop && backdrop !== "none") || theme === "celestial";

  const getGlassyBg = () => {
    if (!hasBackdrop) return "var(--stationery-bg)";
    switch (theme) {
      case "royal": return "rgba(247, 241, 227, 0.55)";
      case "scroll": return "rgba(237, 220, 185, 0.55)";
      case "blush": return "rgba(255, 253, 247, 0.5)";
      case "lavender": return "rgba(247, 244, 252, 0.5)";
      case "celestial":
      default:
        return "rgba(9, 14, 36, 0.45)";
    }
  };

  const getGlassyBorder = () => {
    if (!hasBackdrop) return "var(--stationery-border)";
    switch (theme) {
      case "royal": return "rgba(201, 162, 39, 0.5)";
      case "scroll": return "rgba(92, 56, 31, 0.5)";
      case "blush": return "rgba(183, 110, 121, 0.5)";
      case "lavender": return "rgba(232, 219, 248, 0.45)";
      case "celestial":
      default:
        return "rgba(226, 184, 87, 0.25)";
    }
  };
  const getSolidBg = () => {
    switch (theme) {
      case "royal": return "#F7F1E3";
      case "scroll": return "#eddcb9";
      case "blush": return "#FFFDF7";
      case "lavender": return "#f7f4fc";
      case "celestial":
      default:
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "500px",
        position: "relative",
        gap: "24px",
      }}
    >
      <div className="envelope-container">
        <div 
          className={`envelope-wrapper ${themeClass} vintage-rose-style ${showIdleAnim ? "envelope-idle" : ""}`}
        onClick={handleOpen}
        style={{
          transform: isFullView 
            ? "scale(0.8) translateY(100px)" 
            : isOpen 
              ? "translateY(110px) scale(0.95)" 
              : "scale(1)",
          opacity: isFullView ? 0 : 1,
          visibility: isFullView ? "hidden" : "visible",
          transition: `transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, visibility 0s linear ${isFullView ? "0.4s" : "0s"}`,
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
              ...(isVintageWhite ? {
                width: "112px",
                height: "112px",
                left: "calc(50% - 56px)",
                top: "164px"
              } : {}),
              ...(isCelestialBlue ? {
                width: "106px",
                height: "106px",
                left: "calc(50% - 53px)",
                top: "167px"
              } : {})
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
                          theme === "lavender" ? "#f7f4fc" :
                          theme === "celestial" ? "#090e24" :
                          "var(--stationery-bg)"
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
      <div
        style={{
          position: "fixed",
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
          opacity: isFullView ? 1 : 0,
          pointerEvents: isFullView ? "auto" : "none",
          transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: "20px",
        }}
      >
        <style>{`
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        `}</style>


        {/* The beautiful letter paper page */}
        <div
          className={`stationery-sheet ${themeClass} ${hasBackdrop ? "has-backdrop" : ""}`}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "680px",
            height: "80vh",
            maxHeight: "calc(100vh - 160px)",
            backgroundColor: getGlassyBg(),
            backgroundImage: hasBackdrop ? "none" : "var(--bg-image)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backdropFilter: hasBackdrop ? "blur(16px)" : "none",
            WebkitBackdropFilter: hasBackdrop ? "blur(16px)" : "none",
            border: `1px solid ${getGlassyBorder()}`,
            borderRadius: "16px",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
            color: "var(--stationery-text)",
            fontFamily: "var(--stationery-font)",
            display: "flex",
            flexDirection: "column",
            transform: isFullView ? "scale(1) translateY(0)" : "scale(0.9) translateY(40px)",
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
          }}
        >
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
              gap: "24px",
              zIndex: 6,
            }}
          >
            {/* Header: To */}
            <div 
              style={{
                fontSize: theme === "blush" ? "28px" : theme === "royal" ? "28px" : "26px",
                fontWeight: theme === "blush" ? "600" : theme === "royal" ? "bold" : "normal",
                fontFamily: theme === "blush" ? "var(--font-playfair)" : theme === "royal" ? "var(--font-cinzel-dec)" : "var(--font-cursive)",
                borderBottom: theme === "blush" || theme === "royal" ? "none" : "1px solid rgba(0,0,0,0.05)",
                textAlign: theme === "blush" ? "center" : "left",
                paddingBottom: "8px",
                color: theme === "blush" ? "var(--stationery-text)" : "var(--stationery-accent)",
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

            <div
              className="letter-body"
              style={{
                fontSize: "18px",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                color: "var(--stationery-text)",
                fontFamily: "var(--stationery-font)",
                letterSpacing: "0.3px",
                flex: 1,
                paddingBottom: "24px"
              }}
            >
              {content}
            </div>



            {/* Footer: From */}
            <div
              style={{
                textAlign: "right",
                marginTop: "auto",
                paddingTop: "24px",
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {farewell && (
                <div style={{ fontSize: "20px", fontFamily: "var(--font-cursive)", opacity: 0.75, marginBottom: "4px" }}>
                  {farewell}
                </div>
              )}
              <div
                style={{
                  fontSize: "30px",
                  fontFamily: theme === "blush" ? "var(--font-allura)" : theme === "royal" ? "var(--font-great-vibes)" : "var(--font-cursive)",
                  color: theme === "blush" ? "#B76E79" : "var(--stationery-accent)",
                  marginTop: "6px",
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

import React from "react";

export type LetterStyle = "royal" | "scroll" | "blush" | "lavender" | "celestial" | "midnight_rose" | "obsidian_poppy";

/**
 * Renders the theme-specific decorations (corner ornaments, inner borders, etc.)
 * for a given letter style. Used in the PDF preview and live preview panels.
 */
export function renderDecorations(styleKey: LetterStyle, isMini: boolean): React.ReactNode {
  const paddingVal = isMini ? "6px" : "12px";
  const emojiSize = isMini ? "12px" : "18px";
  const vineSize = isMini ? "10px" : "12px";
  const topOffset = isMini ? "8px" : "14px";

  return (
    <>
      {styleKey === "royal" && (
        <>
          <div style={{ position: "absolute", top: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c9a227", pointerEvents: "none", zIndex: 5, fontFamily: "sans-serif" }}>⚜️</div>
          <div style={{ position: "absolute", top: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c9a227", pointerEvents: "none", zIndex: 5, fontFamily: "sans-serif" }}>⚜️</div>
          <div style={{ position: "absolute", bottom: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c9a227", pointerEvents: "none", zIndex: 5, fontFamily: "sans-serif" }}>⚜️</div>
          <div style={{ position: "absolute", bottom: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c9a227", pointerEvents: "none", zIndex: 5, fontFamily: "sans-serif" }}>⚜️</div>
          {!isMini && (
            <>
              <div style={{ position: "absolute", left: "6px", top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: vineSize, opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
              <div style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: vineSize, opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
              <div style={{ position: "absolute", top: topOffset, left: "50%", transform: "translateX(-50%)", color: "#C9A227", pointerEvents: "none", zIndex: 5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.15" />
                  <path d="M3 20h18" strokeWidth="2" />
                  <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </>
          )}
        </>
      )}

      {styleKey === "blush" && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs>
                <g id={`blush-corner-svg-${isMini ? "mini" : "full"}`}>
                  <path d="M 10,10 C 22,10 26,14 26,26 C 26,20 22,20 22,10" fill="none" stroke="#B76E79" strokeWidth="1.2" />
                  <path d="M 10,10 C 10,22 14,26 26,26" fill="none" stroke="#B76E79" strokeWidth="1.2" />
                  <path d="M 14,20 Q 18,18 20,14" fill="none" stroke="#B76E79" strokeWidth="0.8" />
                  <path d="M 20,14 C 24,16 26,20 22,22 C 18,20 18,16 20,14 Z" fill="#E8B4B8" opacity="0.35" />
                </g>
              </defs>
              <use href={`#blush-corner-svg-${isMini ? "mini" : "full"}`} x="0" y="0" />
              <use href={`#blush-corner-svg-${isMini ? "mini" : "full"}`} x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
              <use href={`#blush-corner-svg-${isMini ? "mini" : "full"}`} x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
              <use href={`#blush-corner-svg-${isMini ? "mini" : "full"}`} x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: isMini ? "10px" : "25px", left: isMini ? "10px" : "25px", fontSize: isMini ? "24px" : "48px", filter: "saturate(35%) opacity(0.18)", pointerEvents: "none", zIndex: 4 }}>🌹</div>
        </>
      )}

      {styleKey === "scroll" && (
        <>
          <div style={{ position: "absolute", top: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", top: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", bottom: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", bottom: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
        </>
      )}

      {styleKey === "lavender" && (
        <>
          {/* Golden Rose Emblem at Bottom Right */}
          <div style={{ position: "absolute", bottom: isMini ? "8px" : "16px", right: isMini ? "8px" : "16px", width: isMini ? "32px" : "64px", height: isMini ? "32px" : "64px", zIndex: 6, pointerEvents: "none" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="goldGradPdf" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffeea1" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#aa7c11" />
                </linearGradient>
              </defs>
              <path d="M 55,60 Q 40,75 35,90 M 55,65 Q 65,70 60,75 M 48,70 Q 30,70 38,65 Z" fill="none" stroke="url(#goldGradPdf)" strokeWidth="2" />
              <path d="M 40,72 C 34,70 28,74 34,78 C 40,82 44,78 40,72 Z" fill="url(#goldGradPdf)" stroke="url(#goldGradPdf)" strokeWidth="0.5" />
              <path d="M 58,74 C 64,72 70,76 64,80 C 58,84 54,80 58,74 Z" fill="url(#goldGradPdf)" stroke="url(#goldGradPdf)" strokeWidth="0.5" />
              <path d="M 50,22 C 35,22 30,38 50,58 C 70,38 65,22 50,22 Z" fill="url(#goldGradPdf)" fillOpacity="0.8" stroke="url(#goldGradPdf)" strokeWidth="0.8" />
              <path d="M 50,30 C 40,32 40,48 50,48 C 60,48 60,32 50,30 Z" fill="url(#goldGradPdf)" stroke="url(#goldGradPdf)" strokeWidth="0.8" />
              <circle cx="50" cy="40" r="8" fill="#fff" fillOpacity="0.15" stroke="url(#goldGradPdf)" strokeWidth="1" />
              <circle cx="50" cy="40" r="4" fill="url(#goldGradPdf)" />
            </svg>
          </div>
        </>
      )}

      {styleKey === "celestial" && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs>
                <g id="celestial-corner-pdf">
                  <path d="M 8,8 L 30,12 L 20,28 L 8,8 M 20,28 L 36,36 L 24,48" fill="none" stroke="rgba(220, 221, 225, 0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="8" cy="8" r="2.5" fill="#dcdde1" />
                  <circle cx="30" cy="12" r="1.5" fill="#dcdde1" />
                  <circle cx="20" cy="28" r="3" fill="#fff" style={{ filter: "drop-shadow(0 0 3px #fff)" }} />
                  <circle cx="36" cy="36" r="1.5" fill="#dcdde1" />
                  <circle cx="24" cy="48" r="2" fill="#dcdde1" />
                </g>
              </defs>
              <use href="#celestial-corner-pdf" x="0" y="0" />
              <use href="#celestial-corner-pdf" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
              <use href="#celestial-corner-pdf" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
              <use href="#celestial-corner-pdf" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
            </svg>
          </div>
        </>
      )}

      {styleKey === "midnight_rose" && (
        <>
          <div style={{ position: "absolute", top: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#8c6c30", pointerEvents: "none", zIndex: 5 }}>🌹</div>
          <div style={{ position: "absolute", top: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#8c6c30", pointerEvents: "none", zIndex: 5 }}>🌹</div>
          <div style={{ position: "absolute", bottom: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#8c6c30", pointerEvents: "none", zIndex: 5 }}>🌹</div>
          <div style={{ position: "absolute", bottom: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#8c6c30", pointerEvents: "none", zIndex: 5 }}>🌹</div>
        </>
      )}

      {styleKey === "obsidian_poppy" && (
        <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
            <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs>
                <linearGradient id="roseGoldGradPdf" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ebd1c5" />
                  <stop offset="50%" stopColor="#c59279" />
                  <stop offset="100%" stopColor="#8c5b43" />
                </linearGradient>
                <g id="poppy-corner-pdf">
                  <path d="M 12,12 L 48,12 M 12,12 L 12,48" fill="none" stroke="url(#roseGoldGradPdf)" strokeWidth="1.5" />
                  <path d="M 18,18 L 38,18 M 18,18 L 18,38" fill="none" stroke="url(#roseGoldGradPdf)" strokeWidth="0.8" opacity="0.7" />
                  <path d="M 12,30 L 30,12" fill="none" stroke="url(#roseGoldGradPdf)" strokeWidth="0.8" />
                  <path d="M 18,32 L 32,18" fill="none" stroke="url(#roseGoldGradPdf)" strokeWidth="0.8" />
                  <path d="M 22,22 L 26,26 L 22,30 L 18,26 Z" fill="url(#roseGoldGradPdf)" fillOpacity="0.25" stroke="url(#roseGoldGradPdf)" strokeWidth="0.8" />
                  <circle cx="26" cy="26" r="1.5" fill="#e8c4b0" />
                </g>
              </defs>
              <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" fill="none" stroke="url(#roseGoldGradPdf)" strokeWidth="0.8" opacity="0.3" />
              <use href="#poppy-corner-pdf" x="0" y="0" />
              <use href="#poppy-corner-pdf" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
              <use href="#poppy-corner-pdf" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
              <use href="#poppy-corner-pdf" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
            </svg>
          </div>
        </>
      )}
    </>
  );
}

export function getThemeColors(theme: string) {
  switch (theme) {
    case "royal": return { border: "rgba(201, 162, 39, 0.6)", buttonBg: "#7B1E1E", shadow: "rgba(123, 30, 30, 0.4)", accent: "#C9A227" };
    case "blush": return { border: "rgba(183, 110, 121, 0.6)", buttonBg: "#B76E79", shadow: "rgba(183, 110, 121, 0.4)", accent: "#E8B4B8" };
    case "lavender": return { border: "rgba(212, 175, 55, 0.6)", buttonBg: "#7a091a", shadow: "rgba(122, 9, 26, 0.4)", accent: "#d4af37" };
    case "midnight_rose": return { border: "rgba(140, 108, 48, 0.6)", buttonBg: "#1a4325", shadow: "rgba(26, 67, 37, 0.35)", accent: "#8c6c30" };
    case "celestial": return { border: "rgba(220, 221, 225, 0.5)", buttonBg: "#131c38", shadow: "rgba(19, 28, 56, 0.4)", accent: "#e2b857" };
    case "obsidian_poppy": return { border: "rgba(197, 146, 121, 0.6)", buttonBg: "#4a3328", shadow: "rgba(74, 51, 40, 0.4)", accent: "#c59279" };
    default: return { border: "rgba(226, 184, 87, 0.5)", buttonBg: "var(--accent-rose)", shadow: "rgba(255, 75, 114, 0.45)", accent: "var(--accent-rose)" };
  }
}

export function getPreviewStyle(styleKey: LetterStyle): React.CSSProperties {
  const base: React.CSSProperties = { backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  switch (styleKey) {
    case "blush": return { ...base, backgroundColor: "#FFFDF7", color: "#2F2F2F", border: "1px solid #B76E79", boxShadow: "inset 0 0 0 4px #FFFDF7, inset 0 0 0 5px #B76E79" };
    case "royal": return { ...base, backgroundColor: "#F7F1E3", color: "#3A2618", border: "4px double #C9A227" };
    case "lavender": return { ...base, backgroundColor: "#3d020a", backgroundImage: "url('/crimson_gold_rose_bg.jpg')", color: "#f5e6e8", border: "none" };
    case "celestial": return { ...base, backgroundColor: "#090e24", backgroundImage: "url('/celestial_eagle_bg.jpg')", color: "#f5f6fa", border: "none" };
    case "midnight_rose": return { ...base, backgroundColor: "#fdfbf7", backgroundImage: "url('/midnight_rose_bg.jpg')", color: "#3c2f2f", border: "none" };
    case "obsidian_poppy": return { ...base, backgroundColor: "#1c1c1f", backgroundImage: "url('/obsidian_poppy_bg.jpg')", color: "#e8c4b0", border: "none" };
    case "scroll":
    default: return { ...base, backgroundColor: "#eddcb9", backgroundImage: "radial-gradient(circle at 10% 20%, rgba(139, 90, 43, 0.03) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 90, 43, 0.03) 0%, transparent 40%)", color: "#2c1a0c", border: "none" };
  }
}

export function getPdfPageStyle(styleKey: LetterStyle): React.CSSProperties {
  const base: React.CSSProperties = { width: "210mm", height: "296mm", boxSizing: "border-box", position: "relative", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "flex-start", backgroundClip: "padding-box", backgroundSize: "100% 100%", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  switch (styleKey) {
    case "blush": return { ...base, backgroundColor: "#FFFDF7", color: "#2F2F2F", border: "1px solid #B76E79", padding: "50px 45px 65px 45px", fontFamily: "'Playfair Display', Georgia, serif", boxShadow: "inset 0 0 0 4px #FFFDF7, inset 0 0 0 5px #B76E79" };
    case "royal": return { ...base, backgroundColor: "#F7F1E3", color: "#3A2618", border: "4px double #C9A227", padding: "60px 45px 50px 45px", fontFamily: "'Cinzel', Times, serif" };
    case "lavender": return { ...base, backgroundColor: "#3d020a", backgroundImage: "url('/crimson_gold_rose_bg.jpg')", color: "#f5e6e8", border: "none", padding: "50px 45px", fontFamily: "'Playfair Display', Georgia, serif" };
    case "celestial": return { ...base, backgroundColor: "#090e24", backgroundImage: "url('/celestial_eagle_bg.jpg')", color: "#f5f6fa", border: "none", padding: "50px 45px", fontFamily: "'Playfair Display', Georgia, serif" };
    case "midnight_rose": return { ...base, backgroundColor: "#fdfbf7", backgroundImage: "url('/midnight_rose_bg.jpg')", color: "#3c2f2f", border: "none", padding: "50px 45px", fontFamily: "'Cormorant Garamond', Georgia, serif" };
    case "obsidian_poppy": return { ...base, backgroundColor: "#1c1c1f", backgroundImage: "url('/obsidian_poppy_bg.jpg')", color: "#e8c4b0", border: "none", padding: "50px 45px", fontFamily: "'Source Serif 4', Georgia, serif" };
    case "scroll":
    default: return { ...base, backgroundColor: "#eddcb9", backgroundImage: "radial-gradient(circle at 10% 20%, rgba(139, 90, 43, 0.03) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 90, 43, 0.03) 0%, transparent 40%)", color: "#2c1a0c", border: "none", padding: "50px 45px", fontFamily: "'Playfair Display', Georgia, serif" };
  }
}

export function splitContentIntoPages(text: string, styleKey: LetterStyle): string[] {
  let charLimit = 1000;
  if (styleKey === "royal") charLimit = 900;
  if (styleKey === "midnight_rose") charLimit = 950;
  if (styleKey === "obsidian_poppy") charLimit = 950;

  const paragraphs = text.split("\n");
  const pages: string[] = [];
  let currentPageText: string[] = [];
  let currentLength = 0;

  for (const para of paragraphs) {
    const paraLength = para.length;
    if (currentLength + paraLength > charLimit && currentPageText.length > 0) {
      pages.push(currentPageText.join("\n"));
      currentPageText = [];
      currentLength = 0;
    }
    if (paraLength > charLimit) {
      const sentences = para.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [para];
      for (const sentence of sentences) {
        if (currentLength + sentence.length > charLimit && currentPageText.length > 0) {
          pages.push(currentPageText.join("\n"));
          currentPageText = [];
          currentLength = 0;
        }
        currentPageText.push(sentence);
        currentLength += sentence.length;
      }
    } else {
      currentPageText.push(para);
      currentLength += paraLength + 1;
    }
  }
  if (currentPageText.length > 0) pages.push(currentPageText.join("\n"));
  return pages;
}

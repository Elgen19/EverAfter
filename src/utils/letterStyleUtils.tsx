import React from "react";

export type LetterStyle = "vintage" | "blush" | "royal" | "minimalist";

/**
 * Renders the theme-specific decorations (corner ornaments, inner borders, etc.)
 * for a given letter style. Used in the PDF preview and live preview panels.
 */
export function renderDecorations(styleKey: LetterStyle, isMini: boolean): React.ReactNode {
  const paddingVal = isMini ? "6px" : "12px";
  const emojiSize = isMini ? "12px" : "18px";
  const vineSize = isMini ? "10px" : "12px";
  const topOffset = isMini ? "8px" : "14px";

  let innerBorderStyle: React.CSSProperties = {};
  switch (styleKey) {
    case "royal":
      innerBorderStyle = { position: "absolute", top: isMini ? "6px" : "10px", left: isMini ? "6px" : "10px", right: isMini ? "6px" : "10px", bottom: isMini ? "6px" : "10px", border: "1px solid rgba(201, 162, 39, 0.35)", pointerEvents: "none", zIndex: 4 };
      break;
    case "blush":
      innerBorderStyle = { position: "absolute", top: isMini ? "5px" : "8px", left: isMini ? "5px" : "8px", right: isMini ? "5px" : "8px", bottom: isMini ? "5px" : "8px", border: "1px dashed rgba(232, 180, 184, 0.5)", pointerEvents: "none", zIndex: 4 };
      break;
    case "vintage":
      innerBorderStyle = { position: "absolute", top: isMini ? "7px" : "12px", left: isMini ? "7px" : "12px", right: isMini ? "7px" : "12px", bottom: isMini ? "7px" : "12px", border: "1px solid rgba(195, 161, 117, 0.4)", pointerEvents: "none", zIndex: 4 };
      break;
    case "minimalist":
      innerBorderStyle = { position: "absolute", top: isMini ? "4px" : "6px", left: isMini ? "4px" : "6px", right: isMini ? "4px" : "6px", bottom: isMini ? "4px" : "6px", border: "1px solid rgba(34, 34, 34, 0.05)", pointerEvents: "none", zIndex: 4 };
      break;
  }

  return (
    <>
      <div style={innerBorderStyle} />

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

      {styleKey === "vintage" && (
        <>
          <div style={{ position: "absolute", top: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", top: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", bottom: paddingVal, left: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
          <div style={{ position: "absolute", bottom: paddingVal, right: paddingVal, fontSize: emojiSize, color: "#c3a175", pointerEvents: "none", zIndex: 5, fontFamily: "serif" }}>❀</div>
        </>
      )}

      {styleKey === "minimalist" && (
        <>
          <div style={{ position: "absolute", top: isMini ? "6px" : "10px", left: isMini ? "6px" : "10px", fontSize: isMini ? "10px" : "12px", color: "#888888", fontFamily: "monospace", pointerEvents: "none", zIndex: 5 }}>┌</div>
          <div style={{ position: "absolute", top: isMini ? "6px" : "10px", right: isMini ? "6px" : "10px", fontSize: isMini ? "10px" : "12px", color: "#888888", fontFamily: "monospace", pointerEvents: "none", zIndex: 5 }}>┐</div>
          <div style={{ position: "absolute", bottom: isMini ? "6px" : "10px", left: isMini ? "6px" : "10px", fontSize: isMini ? "10px" : "12px", color: "#888888", fontFamily: "monospace", pointerEvents: "none", zIndex: 5 }}>└</div>
          <div style={{ position: "absolute", bottom: isMini ? "6px" : "10px", right: isMini ? "6px" : "10px", fontSize: isMini ? "10px" : "12px", color: "#888888", fontFamily: "monospace", pointerEvents: "none", zIndex: 5 }}>┘</div>
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
  switch (styleKey) {
    case "blush": return { backgroundColor: "#fffdfc", color: "#5f2f45", border: "2px solid #e8b4b8" };
    case "royal": return { backgroundColor: "#fffdf9", color: "#7b1e1e", border: "3px double #c9a227" };
    case "minimalist": return { backgroundColor: "#ffffff", color: "#222222", border: "1px solid #eeeeee" };
    case "vintage":
    default: return { backgroundColor: "#fcf8ee", color: "#4a2c11", border: "4px double #c3a175" };
  }
}

export function getPdfPageStyle(styleKey: LetterStyle): React.CSSProperties {
  const base: React.CSSProperties = { width: "210mm", height: "296mm", boxSizing: "border-box", position: "relative", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "flex-start", backgroundClip: "padding-box" };
  switch (styleKey) {
    case "blush": return { ...base, backgroundColor: "#fffdfc", color: "#5f2f45", border: "2px solid #e8b4b8", padding: "50px 45px 65px 45px", fontFamily: "'Playfair Display', Georgia, serif" };
    case "royal": return { ...base, backgroundColor: "#fffdf9", color: "#7b1e1e", border: "3px double #c9a227", padding: "60px 45px 50px 45px", fontFamily: "'Cinzel', Times, serif" };
    case "minimalist": return { ...base, backgroundColor: "#ffffff", color: "#222222", border: "1px solid #eeeeee", padding: "45px", fontFamily: "'Playfair Display', Georgia, serif" };
    case "vintage":
    default: return { ...base, backgroundColor: "#fcf8ee", color: "#4a2c11", border: "8px double #c3a175", padding: "50px 45px 50px 45px", fontFamily: "'Playfair Display', Georgia, serif" };
  }
}

export function splitContentIntoPages(text: string, styleKey: LetterStyle): string[] {
  let charLimit = 1000;
  if (styleKey === "royal") charLimit = 900;
  if (styleKey === "minimalist") charLimit = 1100;

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

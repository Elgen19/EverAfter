"use client";

import React, { useState } from "react";

interface ThankYouProps {
  sender: string;
  recipient: string;
  content: string;
  theme?: string;
  onExit?: () => void;
  isWriteback?: boolean;
  parentLetterId?: string;
  recipientUid?: string;
}

type LetterStyle = "vintage" | "blush" | "royal" | "minimalist";

export default function ThankYou({ 
  sender, 
  recipient, 
  content, 
  theme = "scroll", 
  onExit,
  isWriteback = false,
  parentLetterId = "",
  recipientUid = ""
}: ThankYouProps) {
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<LetterStyle>("vintage");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const renderDecorations = (styleKey: LetterStyle, isMini: boolean) => {
    const sizeFactor = isMini ? 0.65 : 1;
    const paddingVal = isMini ? "6px" : "12px";
    const emojiSize = isMini ? "12px" : "18px";
    const vineSize = isMini ? "10px" : "12px";
    const topOffset = isMini ? "8px" : "14px";

    // Inner border style
    let innerBorderStyle: React.CSSProperties = {};
    switch (styleKey) {
      case "royal":
        innerBorderStyle = {
          position: "absolute",
          top: isMini ? "6px" : "10px",
          left: isMini ? "6px" : "10px",
          right: isMini ? "6px" : "10px",
          bottom: isMini ? "6px" : "10px",
          border: "1px solid rgba(201, 162, 39, 0.35)",
          pointerEvents: "none",
          zIndex: 4
        };
        break;
      case "blush":
        innerBorderStyle = {
          position: "absolute",
          top: isMini ? "5px" : "8px",
          left: isMini ? "5px" : "8px",
          right: isMini ? "5px" : "8px",
          bottom: isMini ? "5px" : "8px",
          border: "1px dashed rgba(232, 180, 184, 0.5)",
          pointerEvents: "none",
          zIndex: 4
        };
        break;
      case "vintage":
        innerBorderStyle = {
          position: "absolute",
          top: isMini ? "7px" : "12px",
          left: isMini ? "7px" : "12px",
          right: isMini ? "7px" : "12px",
          bottom: isMini ? "7px" : "12px",
          border: "1px solid rgba(195, 161, 117, 0.4)",
          pointerEvents: "none",
          zIndex: 4
        };
        break;
      case "minimalist":
        innerBorderStyle = {
          position: "absolute",
          top: isMini ? "4px" : "6px",
          left: isMini ? "4px" : "6px",
          right: isMini ? "4px" : "6px",
          bottom: isMini ? "4px" : "6px",
          border: "1px solid rgba(34, 34, 34, 0.05)",
          pointerEvents: "none",
          zIndex: 4
        };
        break;
    }

    return (
      <>
        {/* Detailed Inner Border Line */}
        <div style={innerBorderStyle} />

        {/* Style-Specific Corner Ornaments */}
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
                  <g id={`blush-corner-svg-${isMini ? 'mini' : 'full'}`}>
                    <path d="M 10,10 C 22,10 26,14 26,26 C 26,20 22,20 22,10" fill="none" stroke="#B76E79" strokeWidth="1.2" />
                    <path d="M 10,10 C 10,22 14,26 26,26" fill="none" stroke="#B76E79" strokeWidth="1.2" />
                    <path d="M 14,20 Q 18,18 20,14" fill="none" stroke="#B76E79" strokeWidth="0.8" />
                    <path d="M 20,14 C 24,16 26,20 22,22 C 18,20 18,16 20,14 Z" fill="#E8B4B8" opacity="0.35" />
                  </g>
                </defs>
                <use href={`#blush-corner-svg-${isMini ? 'mini' : 'full'}`} x="0" y="0" />
                <use href={`#blush-corner-svg-${isMini ? 'mini' : 'full'}`} x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                <use href={`#blush-corner-svg-${isMini ? 'mini' : 'full'}`} x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                <use href={`#blush-corner-svg-${isMini ? 'mini' : 'full'}`} x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
              </svg>
            </div>
            <div style={{ 
              position: "absolute", 
              bottom: isMini ? "10px" : "25px", 
              left: isMini ? "10px" : "25px", 
              fontSize: isMini ? "24px" : "48px", 
              filter: "saturate(35%) opacity(0.18)", 
              pointerEvents: "none", 
              zIndex: 4 
            }}>
              🌹
            </div>
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
  };

  const getThemeColors = () => {
    switch (theme) {
      case "royal":
        return {
          border: "rgba(201, 162, 39, 0.6)",
          buttonBg: "#7B1E1E",
          shadow: "rgba(123, 30, 30, 0.4)",
          accent: "#C9A227"
        };
      case "blush":
        return {
          border: "rgba(183, 110, 121, 0.6)",
          buttonBg: "#B76E79",
          shadow: "rgba(183, 110, 121, 0.4)",
          accent: "#E8B4B8"
        };
      case "lavender":
        return {
          border: "rgba(156, 108, 250, 0.5)",
          buttonBg: "var(--accent-purple)",
          shadow: "rgba(156, 108, 250, 0.35)",
          accent: "#c3b1e1"
        };
      case "celestial":
        return {
          border: "rgba(226, 184, 87, 0.4)",
          buttonBg: "var(--accent-rose)",
          shadow: "rgba(255, 75, 114, 0.4)",
          accent: "#e2b857"
        };
      default:
        return {
          border: "rgba(226, 184, 87, 0.5)",
          buttonBg: "var(--accent-rose)",
          shadow: "rgba(255, 75, 114, 0.45)",
          accent: "var(--accent-rose)"
        };
    }
  };

  const colors = getThemeColors();

  const getPreviewStyle = (styleKey: LetterStyle): React.CSSProperties => {
    switch (styleKey) {
      case "blush":
        return {
          backgroundColor: "#fffdfc",
          color: "#5f2f45",
          border: "2px solid #e8b4b8"
        };
      case "royal":
        return {
          backgroundColor: "#fffdf9",
          color: "#7b1e1e",
          border: "3px double #c9a227"
        };
      case "minimalist":
        return {
          backgroundColor: "#ffffff",
          color: "#222222",
          border: "1px solid #eeeeee"
        };
      case "vintage":
      default:
        return {
          backgroundColor: "#fcf8ee",
          color: "#4a2c11",
          border: "4px double #c3a175"
        };
    }
  };

  const splitContentIntoPages = (text: string, styleKey: LetterStyle): string[] => {
    let charLimit = 1000;
    if (styleKey === "royal") charLimit = 900;
    if (styleKey === "minimalist") charLimit = 1100;
    if (styleKey === "blush") charLimit = 1000;
    if (styleKey === "vintage") charLimit = 1000;

    const paragraphs = text.split("\n");
    const pages: string[] = [];
    let currentPageText: string[] = [];
    let currentLength = 0;

    for (const para of paragraphs) {
      const paraLength = para.length;

      // If adding this paragraph exceeds the limit, and we already have content, push current page and start a new one
      if (currentLength + paraLength > charLimit && currentPageText.length > 0) {
        pages.push(currentPageText.join("\n"));
        currentPageText = [];
        currentLength = 0;
      }

      // If a single paragraph is longer than the limit, we split it by sentences
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
        currentLength += paraLength + 1; // +1 for the newline
      }
    }

    if (currentPageText.length > 0) {
      pages.push(currentPageText.join("\n"));
    }

    return pages;
  };

  const getPdfPageStyle = (styleKey: LetterStyle): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: "210mm",
      height: "296mm",
      boxSizing: "border-box",
      position: "relative",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      backgroundClip: "padding-box",
    };

    switch (styleKey) {
      case "blush":
        return {
          ...baseStyle,
          backgroundColor: "#fffdfc",
          color: "#5f2f45",
          border: "2px solid #e8b4b8",
          padding: "50px 45px 65px 45px",
          fontFamily: "'Playfair Display', Georgia, serif"
        };
      case "royal":
        return {
          ...baseStyle,
          backgroundColor: "#fffdf9",
          color: "#7b1e1e",
          border: "3px double #c9a227",
          padding: "60px 45px 50px 45px",
          fontFamily: "'Cinzel', Times, serif"
        };
      case "minimalist":
        return {
          ...baseStyle,
          backgroundColor: "#ffffff",
          color: "#222222",
          border: "1px solid #eeeeee",
          padding: "45px",
          fontFamily: "'Playfair Display', Georgia, serif"
        };
      case "vintage":
      default:
        return {
          ...baseStyle,
          backgroundColor: "#fcf8ee",
          color: "#4a2c11",
          border: "8px double #c3a175",
          padding: "50px 45px 50px 45px",
          fontFamily: "'Playfair Display', Georgia, serif"
        };
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setTimeout(async () => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;

        const element = document.getElementById("letter-download-hidden-target");
        if (!element) {
          alert("Download target not found.");
          setIsGeneratingPDF(false);
          return;
        }

        const opt = {
          margin: 0,
          filename: `${recipient.replace(/\s+/g, "_") || "love"}_letter.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] }
        };

        await html2pdf().from(element).set(opt as any).save();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to download PDF. Please try again.");
      } finally {
        setIsGeneratingPDF(false);
        setShowStylePicker(false);
      }
    }, 150);
  };

  const renderPdfHiddenTarget = () => {
    if (!isGeneratingPDF) return null;

    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          overflow: "hidden"
        }}
      >
        {/* 1. The A4 pages target container (positive zIndex, no cover, fully opaque) */}
        <div
          id="letter-download-hidden-target"
          style={{
            position: "relative",
            zIndex: 1,
            opacity: 1,
            width: "210mm",
            margin: 0,
            padding: 0,
            background: "none"
          }}
        >
          {splitContentIntoPages(content, selectedStyle).map((pageText, idx, arr) => (
            <div
              key={idx}
              className="pdf-page-break"
              style={{
                ...getPdfPageStyle(selectedStyle),
                pageBreakBefore: idx === 0 ? "avoid" : "always"
              }}
            >
              {renderDecorations(selectedStyle, false)}

              {/* Greeting - only on first page */}
              {idx === 0 && (
                <div
                  style={{
                    fontSize: selectedStyle === "minimalist" ? "22px" : "28px",
                    fontFamily: selectedStyle === "royal" ? "'Great Vibes', cursive" :
                                selectedStyle === "blush" ? "'Allura', cursive" :
                                selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                                "var(--font-cursive)",
                    fontWeight: selectedStyle === "minimalist" ? "normal" : "bold",
                    marginBottom: "20px"
                  }}
                >
                  Dearest {recipient || "My Love"},
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  fontSize: selectedStyle === "minimalist" ? "16px" : "18px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  letterSpacing: selectedStyle === "royal" ? "0.5px" : "normal"
                }}
              >
                {pageText}
              </div>

              {/* Signature - only on last page */}
              {idx === arr.length - 1 && (
                <div
                  style={{
                    textAlign: "right",
                    fontSize: selectedStyle === "minimalist" ? "24px" : "30px",
                    fontFamily: selectedStyle === "royal" ? "'Great Vibes', cursive" :
                                selectedStyle === "blush" ? "'Allura', cursive" :
                                selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                                "var(--font-cursive)",
                    color: selectedStyle === "vintage" ? "#5c3818" :
                           selectedStyle === "blush" ? "#b76e79" :
                           selectedStyle === "royal" ? "#7b1e1e" :
                           "#111111",
                    marginTop: "20px"
                  }}
                >
                  Yours Truly,<br />
                  <span style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "26px" }}>
                    {sender || "Yours Truly"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 2. The solid loader overlay covering the target container */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
            backgroundColor: "rgba(11, 7, 17, 0.97)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px"
          }}
        >
          {/* Loader Card */}
          <div
            style={{
              padding: "30px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              textAlign: "center",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)"
            }}
          >
            <div style={{ fontSize: "48px", animation: "heartbeat-survey 1.2s infinite ease-in-out" }}>💖</div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>Preparing Your Love Letter...</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Generating a high-fidelity PDF, please wait a moment.</div>
          </div>
        </div>
      </div>
    );
  };

  const handleWriteBack = () => {
    window.location.href = `/create?writeback=true&to=${encodeURIComponent(sender)}&from=${encodeURIComponent(recipient)}&replyToId=${parentLetterId}&recipientUid=${recipientUid}`;
  };

  const handleClose = () => {
    if (onExit) {
      onExit();
      return;
    }
    if (typeof window !== "undefined") {
      window.close();
      setTimeout(() => {
        window.location.href = "/";
      }, 150);
    }
  };

  // Render full preview panel directly in-place of other cards if active
  if (showFullPreview) {
    return (
      <>
        <div
        className="animate-reveal hide-scrollbar"
        style={{
          width: "100%",
          maxWidth: "800px",
          padding: "32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "rgba(20, 15, 30, 0.85)",
          border: `1.5px solid ${colors.border}`,
          borderRadius: "20px",
          boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#fff",
          boxSizing: "border-box",
          animation: "float-up-intro 0.6s ease"
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            color: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive"
          }}
        >
          🔍 Full Letter Preview ({selectedStyle === "vintage" ? "Vintage Scroll" :
                                   selectedStyle === "blush" ? "Blush Rose" :
                                   selectedStyle === "royal" ? "Royal Crimson" :
                                   "Minimalist Clean"})
        </h3>

        {/* High-Fidelity Letter Sheet */}
        <div
          style={{
            width: "100%",
            maxHeight: "50vh",
            overflowY: "auto",
            borderRadius: "12px",
            padding: "40px",
            boxSizing: "border-box",
            textAlign: "left",
            position: "relative", // Ensure relative coordinates for decorations
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.25)",
            border: selectedStyle === "vintage" ? "8px double #c3a175" :
                    selectedStyle === "blush" ? "2px solid #e8b4b8" :
                    selectedStyle === "royal" ? "3px double #c9a227" :
                    "1px solid #eeeeee",
            backgroundColor: selectedStyle === "vintage" ? "#fcf8ee" :
                             selectedStyle === "blush" ? "#fffdfc" :
                             selectedStyle === "royal" ? "#fffdf9" :
                             "#ffffff",
            color: selectedStyle === "vintage" ? "#4a2c11" :
                   selectedStyle === "blush" ? "#5f2f45" :
                   selectedStyle === "royal" ? "#7b1e1e" :
                   "#222222",
            fontFamily: selectedStyle === "royal" ? "'Cinzel', Times, serif" :
                        "'Playfair Display', Georgia, serif",
          }}
        >
          {renderDecorations(selectedStyle, false)}

          {/* Greeting */}
          <div
            style={{
              fontSize: selectedStyle === "minimalist" ? "22px" : "28px",
              fontFamily: selectedStyle === "royal" ? "'Great Vibes', cursive" :
                          selectedStyle === "blush" ? "'Allura', cursive" :
                          selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                          "var(--font-cursive)",
              fontWeight: selectedStyle === "minimalist" ? "normal" : "bold",
              marginBottom: "20px"
            }}
          >
            Dearest {recipient || "My Love"},
          </div>

          {/* Letter Body Content */}
          <div
            style={{
              fontSize: selectedStyle === "minimalist" ? "16px" : "18px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              marginBottom: "40px",
              letterSpacing: selectedStyle === "royal" ? "0.5px" : "normal"
            }}
          >
            {content}
          </div>

          {/* Signature */}
          <div
            style={{
              textAlign: "right",
              fontSize: selectedStyle === "minimalist" ? "24px" : "30px",
              fontFamily: selectedStyle === "royal" ? "'Great Vibes', cursive" :
                          selectedStyle === "blush" ? "'Allura', cursive" :
                          selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                          "var(--font-cursive)",
              color: selectedStyle === "vintage" ? "#5c3818" :
                     selectedStyle === "blush" ? "#b76e79" :
                     selectedStyle === "royal" ? "#7b1e1e" :
                     "#111111",
            }}
          >
            Yours Truly,<br />
            <span style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "26px" }}>
              {sender || "Yours Truly"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
          <button
            onClick={() => {
              setShowFullPreview(false);
              setShowStylePicker(true);
            }}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "6px",
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "var(--text-muted)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)")}
          >
            ⬅️ Back to Style Selection
          </button>
          <button
            onClick={() => {
              handleDownloadPDF();
              setShowFullPreview(false);
            }}
            style={{
              flex: 1.5,
              padding: "12px",
              borderRadius: "6px",
              background: colors.buttonBg,
              backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 10px ${colors.shadow}`,
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            Download PDF 📥
          </button>
        </div>
      </div>
      {renderPdfHiddenTarget()}
    </>
  );
}

  // Render style picker panel directly in-place of the main card if active
  if (showStylePicker) {
    return (
      <>
        <div
        className="animate-reveal hide-scrollbar"
        style={{
          width: "100%",
          maxWidth: "720px",
          padding: "32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "rgba(20, 15, 30, 0.85)",
          border: `1.5px solid ${colors.border}`,
          borderRadius: "20px",
          boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#fff",
          boxSizing: "border-box",
          animation: "float-up-intro 0.6s ease"
        }}
      >
        <style>{`
          @media (max-width: 640px) {
            .style-picker-split {
              flex-direction: column-reverse !important;
            }
            .style-picker-options {
              width: 100% !important;
            }
            .style-picker-preview {
              width: 100% !important;
            }
          }
        `}</style>

        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            color: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive"
          }}
        >
          🎨 Choose Letter Style & Preview
        </h3>

        <div 
          className="style-picker-split" 
          style={{ display: "flex", gap: "24px", width: "100%", boxSizing: "border-box" }}
        >
          {/* Options Selector List */}
          <div 
            className="style-picker-options" 
            style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", width: "50%" }}
          >
            {[
              {
                id: "vintage",
                name: "Vintage Scroll",
                bg: "#fcf8ee",
                border: "#c3a175",
                font: "serif",
                color: "#4a2c11",
                desc: "Sepia parchment with double gold scroll border"
              },
              {
                id: "blush",
                name: "Blush Rose",
                bg: "#fffdfc",
                border: "#e8b4b8",
                font: "serif",
                color: "#5f2f45",
                desc: "Cream stationery sheet with pink highlights"
              },
              {
                id: "royal",
                name: "Royal Crimson",
                bg: "#fffdf9",
                border: "#c9a227",
                font: "serif",
                color: "#7b1e1e",
                desc: "Ivory paper with gold borders and red text"
              },
              {
                id: "minimalist",
                name: "Minimalist Clean",
                bg: "#ffffff",
                border: "#eeeeee",
                font: "sans-serif",
                color: "#222222",
                desc: "Modern white paper layout with serif text"
              }
            ].map((styleOpt) => (
              <div
                key={styleOpt.id}
                onClick={() => setSelectedStyle(styleOpt.id as LetterStyle)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: selectedStyle === styleOpt.id 
                    ? `2px solid ${colors.accent}` 
                    : "1.5px solid rgba(255, 255, 255, 0.08)",
                  background: selectedStyle === styleOpt.id
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(255, 255, 255, 0.01)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                {/* Visual Color Preview Box */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: styleOpt.bg,
                    border: `1.5px solid ${styleOpt.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: styleOpt.color,
                    fontSize: "13px",
                    fontFamily: styleOpt.font,
                    flexShrink: 0
                  }}
                >
                  Aa
                </div>

                {/* Text Details */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {styleOpt.name}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {styleOpt.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Live Preview Box */}
          <div 
            className="style-picker-preview" 
            style={{ 
              flex: 1.2, 
              width: "50%",
              height: "235px",
              boxSizing: "border-box",
              borderRadius: "8px",
              padding: "16px 20px",
              overflowY: "auto",
              textAlign: "left",
              position: "relative", // Ensure relative coordinates for decorations
              transition: "all 0.25s ease",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)",
              ...getPreviewStyle(selectedStyle)
            }}
          >
            {renderDecorations(selectedStyle, true)}
            {/* Styled Greeting */}
            <div 
              style={{ 
                fontSize: selectedStyle === "minimalist" ? "13px" : "15px",
                fontFamily: selectedStyle === "royal" ? "'Cinzel', serif" :
                            selectedStyle === "blush" ? "'Allura', cursive" :
                            selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                            "var(--font-cursive)",
                fontWeight: selectedStyle === "minimalist" ? "normal" : "bold",
                marginBottom: "8px"
              }}
            >
              Dearest {recipient || "My Love"},
            </div>
            {/* Styled content */}
            <div 
              style={{ 
                fontSize: selectedStyle === "minimalist" ? "12px" : "13px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                fontFamily: selectedStyle === "vintage" ? "'Playfair Display', serif" :
                            selectedStyle === "blush" ? "'Playfair Display', serif" :
                            selectedStyle === "royal" ? "'Cinzel', serif" :
                            "'Playfair Display', Georgia, serif"
              }}
            >
              {content || "I love you."}
            </div>
            {/* Styled Signature */}
            <div 
              style={{ 
                textAlign: "right",
                marginTop: "16px",
                fontSize: selectedStyle === "minimalist" ? "13px" : "16px",
                fontFamily: selectedStyle === "royal" ? "'Great Vibes', cursive" :
                            selectedStyle === "blush" ? "'Allura', cursive" :
                            selectedStyle === "vintage" ? "'Dancing Script', cursive" :
                            "var(--font-cursive)"
              }}
            >
              Yours Truly,<br />
              <span style={{ fontSize: selectedStyle === "minimalist" ? "14px" : "18px" }}>
                {sender || "Yours Truly"}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
          <button
            onClick={() => setShowStylePicker(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "6px",
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "var(--text-muted)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)")}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowStylePicker(false);
              setShowFullPreview(true);
            }}
            style={{
              flex: 1.2,
              padding: "12px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            }}
          >
            🔍 Preview Full Letter
          </button>
          <button
            onClick={handleDownloadPDF}
            style={{
              flex: 1.5,
              padding: "12px",
              borderRadius: "6px",
              background: colors.buttonBg,
              backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 10px ${colors.shadow}`,
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            Download PDF 📥
          </button>
        </div>
      </div>
      {renderPdfHiddenTarget()}
    </>
  );
}

  // Render the initial thank you card
  return (
    <>
      <div
      className="animate-reveal hide-scrollbar"
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "50px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        animation: "float-up-intro 0.6s ease",
        background: "rgba(20, 15, 30, 0.85)",
        border: `1.5px solid ${colors.border}`,
        borderRadius: "20px",
        boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#fff",
        boxSizing: "border-box"
      }}
    >
      <div 
        style={{ 
          fontSize: "64px", 
          marginBottom: "8px",
          animation: "heartbeat-survey 1.5s infinite ease-in-out"
        }}
      >
        💌
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h2
          style={{
            fontSize: "36px",
            fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
            color: colors.accent,
            margin: 0,
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
          }}
        >
          Thank You for Reading
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "var(--text-muted)",
            lineHeight: "1.6",
            margin: "12px 0 0 0",
            padding: "0 10px"
          }}
        >
          {isWriteback 
            ? "Thank you for reading this response. Every word was written with sincerity, warmth, and care in return for your original letter. Thank you for keeping the dialogue alive and preserving these precious memories."
            : "Every word in this letter was written with sincerity, warmth, and care. Thank you for sharing in these moments and preserving these memories."
          }
        </p>
      </div>

      {sender && recipient && (
        <div 
          style={{ 
            fontSize: "20px", 
            fontStyle: "italic", 
            fontFamily: "var(--font-cursive)", 
            color: "#fff",
            opacity: 0.9,
            marginTop: "10px",
            padding: "10px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          From {sender} to {recipient} with love
        </div>
      )}

      {/* Row of primary options: Download or Write Back */}
      <div style={{ display: "flex", gap: "12px", width: "100%", boxSizing: "border-box" }}>
        <button
          onClick={() => setShowStylePicker(true)}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          📥 Download Letter
        </button>

        {!isWriteback && (
          <button
            onClick={handleWriteBack}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              background: colors.buttonBg,
              backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: `0 4px 10px ${colors.shadow}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            ✍️ Write Back
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          backgroundColor: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "var(--text-muted)",
          fontWeight: 500,
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.2s",
          marginTop: "6px"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#fff";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
        }}
      >
        Close & Exit 🚪
      </button>
    </div>
    {renderPdfHiddenTarget()}
  </>
);
}

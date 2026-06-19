"use client";

import React, { useState } from "react";
import {
  LetterStyle,
  renderDecorations,
  getThemeColors,
  getPreviewStyle,
  getPdfPageStyle,
  splitContentIntoPages
} from "@/utils/letterStyleUtils";

interface ThankYouProps {
  sender: string;
  recipient: string;
  content: string;
  theme?: string;
  onExit?: () => void;
  isWriteback?: boolean;
  parentLetterId?: string;
  recipientUid?: string;
  showMailboxButton?: boolean;
  mailboxLink?: string;
  replyToId?: string;
}

const STYLE_OPTIONS = [
  { id: "vintage", name: "Vintage Scroll", bg: "#fcf8ee", border: "#c3a175", font: "serif", color: "#4a2c11", desc: "Sepia parchment with double gold scroll border" },
  { id: "blush", name: "Blush Rose", bg: "#fffdfc", border: "#e8b4b8", font: "serif", color: "#5f2f45", desc: "Cream stationery sheet with pink highlights" },
  { id: "royal", name: "Royal Crimson", bg: "#fffdf9", border: "#c9a227", font: "serif", color: "#7b1e1e", desc: "Ivory paper with gold borders and red text" },
  { id: "minimalist", name: "Minimalist Clean", bg: "#ffffff", border: "#eeeeee", font: "sans-serif", color: "#222222", desc: "Modern white paper layout with serif text" },
] as const;

const getCursiveFont = (styleKey: LetterStyle) => {
  if (styleKey === "royal") return "'Great Vibes', cursive";
  if (styleKey === "blush") return "'Allura', cursive";
  if (styleKey === "vintage") return "'Dancing Script', cursive";
  return "var(--font-cursive)";
};

const getBodyFont = (styleKey: LetterStyle) => {
  if (styleKey === "royal") return "'Cinzel', Times, serif";
  return "'Playfair Display', Georgia, serif";
};

export default function ThankYou({
  sender,
  recipient,
  content,
  theme = "scroll",
  onExit,
  isWriteback = false,
  parentLetterId = "",
  recipientUid = "",
  showMailboxButton = false,
  mailboxLink = "",
  replyToId = ""
}: ThankYouProps) {
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<LetterStyle>("vintage");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const colors = getThemeColors(theme);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setTimeout(async () => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById("letter-download-hidden-target");
        if (!element) { alert("Download target not found."); setIsGeneratingPDF(false); return; }
        const opt = {
          margin: 0,
          filename: `${recipient.replace(/\s+/g, "_") || "love"}_letter.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, scrollX: 0, scrollY: 0 },
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

  const handleWriteBack = () => {
    window.location.href = `/create?writeback=true&to=${encodeURIComponent(sender)}&from=${encodeURIComponent(recipient)}&replyToId=${parentLetterId}&recipientUid=${recipientUid}`;
  };

  const handleClose = () => {
    if (onExit) { onExit(); return; }
    if (typeof window !== "undefined") {
      window.close();
      setTimeout(() => { window.location.href = "/"; }, 150);
    }
  };

  // ── PDF hidden render target ──
  const PdfHiddenTarget = isGeneratingPDF ? (
    <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 99999, overflow: "hidden" }}>
      <div id="letter-download-hidden-target" style={{ position: "relative", zIndex: 1, opacity: 1, width: "210mm", margin: 0, padding: 0, background: "none" }}>
        {splitContentIntoPages(content, selectedStyle).map((pageText, idx, arr) => (
          <div key={idx} className="pdf-page-break" style={{ ...getPdfPageStyle(selectedStyle), pageBreakBefore: idx === 0 ? "avoid" : "always" } as React.CSSProperties}>
            {renderDecorations(selectedStyle, false)}
            {idx === 0 && (
              <div style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "28px", fontFamily: getCursiveFont(selectedStyle), fontWeight: selectedStyle === "minimalist" ? "normal" : "bold", marginBottom: "20px" }}>
                Dearest {recipient || "My Love"},
              </div>
            )}
            <div style={{ fontSize: selectedStyle === "minimalist" ? "16px" : "18px", lineHeight: "1.8", whiteSpace: "pre-wrap", letterSpacing: selectedStyle === "royal" ? "0.5px" : "normal" }}>
              {pageText}
            </div>
            {idx === arr.length - 1 && (
              <div style={{ textAlign: "right", fontSize: selectedStyle === "minimalist" ? "24px" : "30px", fontFamily: getCursiveFont(selectedStyle), color: selectedStyle === "vintage" ? "#5c3818" : selectedStyle === "blush" ? "#b76e79" : selectedStyle === "royal" ? "#7b1e1e" : "#111111", marginTop: "20px" }}>
                Yours Truly,<br />
                <span style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "26px" }}>{sender || "Yours Truly"}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 99999, backgroundColor: "rgba(11, 7, 17, 0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <div className="glass thankyou-card" style={{ width: "90%", maxWidth: "420px", padding: "24px 16px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", textAlign: "center", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          <div style={{ fontSize: "48px", animation: "heartbeat-survey 1.2s infinite ease-in-out" }}>💖</div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>Preparing Your Love Letter...</div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Generating a high-fidelity PDF, please wait a moment.</div>
        </div>
      </div>
    </div>
  ) : null;

  // ── Full Preview Panel ──
  if (showFullPreview) {
    return (
      <>
        <div className="animate-reveal hide-scrollbar thankyou-card" style={{ width: "100%", maxWidth: "800px", padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px", background: "rgba(20, 15, 30, 0.85)", border: `1.5px solid ${colors.border}`, borderRadius: "20px", boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "#fff", boxSizing: "border-box", animation: "float-up-intro 0.6s ease" }}>
          <h3 className="thankyou-title" style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive" }}>
            🔍 Full Letter Preview ({STYLE_OPTIONS.find(s => s.id === selectedStyle)?.name})
          </h3>
          <div className="thankyou-preview-sheet" style={{ width: "100%", maxHeight: "50vh", overflowY: "auto", borderRadius: "12px", padding: "40px", boxSizing: "border-box", textAlign: "left", position: "relative", boxShadow: "inset 0 4px 20px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.25)", fontFamily: getBodyFont(selectedStyle), ...getPreviewStyle(selectedStyle) }}>
            {renderDecorations(selectedStyle, false)}
            <div style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "28px", fontFamily: getCursiveFont(selectedStyle), fontWeight: selectedStyle === "minimalist" ? "normal" : "bold", marginBottom: "20px" }}>Dearest {recipient || "My Love"},</div>
            <div style={{ fontSize: selectedStyle === "minimalist" ? "16px" : "18px", lineHeight: "1.8", whiteSpace: "pre-wrap", marginBottom: "40px", letterSpacing: selectedStyle === "royal" ? "0.5px" : "normal" }}>{content}</div>
            <div style={{ textAlign: "right", fontSize: selectedStyle === "minimalist" ? "24px" : "30px", fontFamily: getCursiveFont(selectedStyle), color: selectedStyle === "vintage" ? "#5c3818" : selectedStyle === "blush" ? "#b76e79" : selectedStyle === "royal" ? "#7b1e1e" : "#111111" }}>
              Yours Truly,<br /><span style={{ fontSize: selectedStyle === "minimalist" ? "22px" : "26px" }}>{sender || "Yours Truly"}</span>
            </div>
          </div>
          <div className="style-picker-buttons" style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
            <button onClick={() => { setShowFullPreview(false); setShowStylePicker(true); }}
              style={{ flex: 1, padding: "12px", borderRadius: "6px", background: "none", border: "1px solid rgba(255, 255, 255, 0.15)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)")}
            >⬅️ Back to Style Selection</button>
            <button onClick={() => { handleDownloadPDF(); setShowFullPreview(false); }}
              style={{ flex: 1.5, padding: "12px", borderRadius: "6px", background: colors.buttonBg, backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)", color: "#fff", fontWeight: "bold", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: `0 4px 10px ${colors.shadow}`, transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >Download PDF 📥</button>
          </div>
        </div>
        {PdfHiddenTarget}
      </>
    );
  }

  // ── Style Picker Panel ──
  if (showStylePicker) {
    return (
      <>
        <div className="animate-reveal hide-scrollbar thankyou-card style-picker-card" style={{ width: "100%", maxWidth: "720px", padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", gap: "24px", background: "rgba(20, 15, 30, 0.85)", border: `1.5px solid ${colors.border}`, borderRadius: "20px", boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "#fff", boxSizing: "border-box", animation: "float-up-intro 0.6s ease" }}>
          <style>{`@media (max-width: 640px) { .style-picker-split { flex-direction: column-reverse !important; } .style-picker-options, .style-picker-preview { width: 100% !important; } }`}</style>
          <h3 className="thankyou-title" style={{ margin: 0, fontSize: "24px", fontWeight: "bold", color: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive" }}>
            🎨 Choose Letter Style & Preview
          </h3>
          <div className="style-picker-split" style={{ display: "flex", gap: "24px", width: "100%", boxSizing: "border-box" }}>
            {/* Style options list */}
            <div className="style-picker-options style-picker-options-grid" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", width: "50%" }}>
              {STYLE_OPTIONS.map((styleOpt) => (
                <div key={styleOpt.id} onClick={() => setSelectedStyle(styleOpt.id as LetterStyle)}
                  className="style-picker-opt-card"
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "8px", border: selectedStyle === styleOpt.id ? `2px solid ${colors.accent}` : "1.5px solid rgba(255, 255, 255, 0.08)", background: selectedStyle === styleOpt.id ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.01)", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
                >
                  <div className="style-picker-opt-icon" style={{ width: "32px", height: "32px", borderRadius: "6px", backgroundColor: styleOpt.bg, border: `1.5px solid ${styleOpt.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: styleOpt.color, fontSize: "13px", fontFamily: styleOpt.font, flexShrink: 0 }}>Aa</div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="style-picker-opt-name" style={{ fontSize: "13px", fontWeight: "bold", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{styleOpt.name}</div>
                    <div className="style-picker-opt-desc" style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{styleOpt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Live mini preview box */}
            <div className="style-picker-preview" style={{ flex: 1.2, width: "50%", height: "235px", boxSizing: "border-box", borderRadius: "8px", padding: "16px 20px", overflowY: "auto", textAlign: "left", position: "relative", transition: "all 0.25s ease", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)", ...getPreviewStyle(selectedStyle) }}>
              {renderDecorations(selectedStyle, true)}
              <div style={{ fontSize: selectedStyle === "minimalist" ? "13px" : "15px", fontFamily: getCursiveFont(selectedStyle), fontWeight: selectedStyle === "minimalist" ? "normal" : "bold", marginBottom: "8px" }}>Dearest {recipient || "My Love"},</div>
              <div style={{ fontSize: selectedStyle === "minimalist" ? "12px" : "13px", lineHeight: "1.6", whiteSpace: "pre-wrap", fontFamily: getBodyFont(selectedStyle) }}>{content || "I love you."}</div>
              <div style={{ textAlign: "right", marginTop: "16px", fontSize: selectedStyle === "minimalist" ? "13px" : "16px", fontFamily: getCursiveFont(selectedStyle) }}>
                Yours Truly,<br /><span style={{ fontSize: selectedStyle === "minimalist" ? "14px" : "18px" }}>{sender || "Yours Truly"}</span>
              </div>
            </div>
          </div>
          <div className="style-picker-buttons style-picker-buttons-horizontal" style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
            <button onClick={() => setShowStylePicker(false)}
              style={{ flex: 1, padding: "12px", borderRadius: "6px", background: "none", border: "1px solid rgba(255, 255, 255, 0.15)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)")}
            >Cancel</button>
            <button onClick={() => { setShowStylePicker(false); setShowFullPreview(true); }}
              style={{ flex: 1, padding: "12px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"; }}
            >Preview</button>
            <button onClick={handleDownloadPDF}
              style={{ flex: 1.2, padding: "12px", borderRadius: "6px", background: colors.buttonBg, backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)", color: "#fff", fontWeight: "bold", fontSize: "13px", border: "none", cursor: "pointer", boxShadow: `0 4px 10px ${colors.shadow}`, transition: "transform 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >Download</button>
          </div>
        </div>
        {PdfHiddenTarget}
      </>
    );
  }

  // ── Main Thank You Card ──
  return (
    <>
      <div className="animate-reveal hide-scrollbar thankyou-card" style={{ width: "100%", maxWidth: "500px", padding: "50px 30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", animation: "float-up-intro 0.6s ease", background: "rgba(20, 15, 30, 0.85)", border: `1.5px solid ${colors.border}`, borderRadius: "20px", boxShadow: `0 15px 40px rgba(0, 0, 0, 0.5), 0 0 15px ${colors.shadow}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "#fff", boxSizing: "border-box" }}>
        <div className="thankyou-emoji" style={{ fontSize: "64px", marginBottom: "8px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>💌</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h2 className="thankyou-title" style={{ fontSize: "36px", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", color: colors.accent, margin: 0, textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}>Thank You for Reading</h2>
          <p className="thankyou-desc" style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: "1.6", margin: "12px 0 0 0", padding: "0 10px" }}>
            {isWriteback
              ? "Thank you for reading this response. Every word was written with sincerity, warmth, and care in return for your original letter. Thank you for keeping the dialogue alive and preserving these precious memories."
              : "Every word in this letter was written with sincerity, warmth, and care. Thank you for sharing in these moments and preserving these memories."}
          </p>
        </div>
        {sender && recipient && (
          <div className="thankyou-signature" style={{ fontSize: "20px", fontStyle: "italic", fontFamily: "var(--font-cursive)", color: "#fff", opacity: 0.9, marginTop: "10px", padding: "10px 20px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", width: "100%", boxSizing: "border-box" }}>
            From {sender} to {recipient} with love
          </div>
        )}
        <div className="style-picker-buttons" style={{ display: "flex", gap: "12px", width: "100%", boxSizing: "border-box" }}>
          <button onClick={() => setShowStylePicker(true)}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          >📥 Download Letter</button>
          {!isWriteback && (
            <button onClick={handleWriteBack}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", background: colors.buttonBg, backgroundImage: theme === "blush" || theme === "royal" ? "none" : "linear-gradient(135deg, #ff4b72, #d9264c)", border: "none", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: `0 4px 10px ${colors.shadow}` }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >✍️ Write Back</button>
          )}
          {isWriteback && replyToId && (
            <button onClick={() => { window.location.href = `/letter?id=${replyToId}`; }}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "linear-gradient(135deg, #e2b857 0%, #b38f36 100%)", border: "none", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: "0 4px 10px rgba(226, 184, 87, 0.2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >Original Letter ↩</button>
          )}
        </div>
        <button 
          onClick={() => {
            const targetLink = mailboxLink || `/mailbox?ref=${parentLetterId}`;
            window.location.href = targetLink;
          }}
          className="glowing-mailbox-btn"
          style={{ 
            width: "100%", 
            padding: "12px", 
            borderRadius: "8px", 
            background: "linear-gradient(135deg, #ff4b72, #9c6cfa)", 
            border: "1px solid rgba(255, 255, 255, 0.2)", 
            color: "#fff", 
            fontWeight: "bold", 
            fontSize: "14px", 
            cursor: "pointer", 
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            boxShadow: "0 0 15px rgba(255, 75, 114, 0.6), 0 0 25px rgba(156, 108, 250, 0.4)",
            transition: "all 0.3s ease"
          }}
        >
          📬 View Mailbox
        </button>
      </div>
      {PdfHiddenTarget}
    </>
  );
}

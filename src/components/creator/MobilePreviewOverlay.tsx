"use client";

import React from "react";
import Envelope from "@/components/Envelope";
import StationeryPreview from "@/components/creator/StationeryPreview";

interface MobilePreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  previewMode: "letter" | "envelope";
  setPreviewMode: (mode: "letter" | "envelope") => void;
  envelopeResetKey: number;
  setEnvelopeResetKey: React.Dispatch<React.SetStateAction<number>>;
  recipient: string;
  sender: string;
  content: string;
  theme: string;
  sealSymbol: string;
  sealColor: string;
  envelopeStyle: string;
  greeting: string;
  farewell: string;
  backdrop: string;
  previewBackdropUrl: string;
  hasBackdrop: boolean;
  getGlassyBg: () => string;
  getGlassyBorder: () => string;
  getBackdropOverlay: () => string;
}

export default function MobilePreviewOverlay({
  isOpen,
  onClose,
  previewMode,
  setPreviewMode,
  envelopeResetKey,
  setEnvelopeResetKey,
  recipient,
  sender,
  content,
  theme,
  sealSymbol,
  sealColor,
  envelopeStyle,
  greeting,
  farewell,
  backdrop,
  previewBackdropUrl,
  hasBackdrop,
  getGlassyBg,
  getGlassyBorder,
  getBackdropOverlay,
}: MobilePreviewOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(11, 7, 17, 0.96)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        overflowY: "auto",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Header with Switcher and Close Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {(["letter", "envelope"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPreviewMode(mode)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                backgroundColor:
                  previewMode === mode ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.05)",
                border:
                  "1px solid " +
                  (previewMode === mode ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.1)"),
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {mode === "letter" ? "📄 Letter Preview" : "✉️ Envelope & Seal"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid var(--border-card)",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
        >
          Close ✕
        </button>
      </div>

      {/* Preview Content Area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {previewMode === "envelope" ? (
          <div
            className="glass"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "520px",
              maxHeight: "calc(100vh - 120px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              position: "relative",
              backgroundImage: previewBackdropUrl
                ? `linear-gradient(${getBackdropOverlay()}, ${getBackdropOverlay()}), url(${previewBackdropUrl})`
                : "none",
              backgroundColor: previewBackdropUrl ? "transparent" : "rgba(20, 15, 30, 0.4)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "16px",
            }}
          >
            <button
              type="button"
              onClick={() => setEnvelopeResetKey((prev) => prev + 1)}
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                zIndex: 200,
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid var(--border-card)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Reset Animation
            </button>
            <div className="studio-preview-envelope-scaler" style={{ transform: "scale(0.8)" }}>
              <Envelope
                key={envelopeResetKey}
                recipient={recipient}
                sender={sender}
                content={content}
                theme={theme}
                sealSymbol={sealSymbol}
                sealColor={sealColor}
                envelopeStyle={envelopeStyle}
                greeting={greeting}
                farewell={farewell}
                backdrop={backdrop}
                onClose={() => {}}
              />
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxHeight: "calc(100vh - 100px)", overflowY: "auto", paddingBottom: "24px" }}>
            <StationeryPreview
              theme={theme}
              backdrop={backdrop}
              previewBackdropUrl={previewBackdropUrl}
              hasBackdrop={hasBackdrop}
              greeting={greeting}
              farewell={farewell}
              recipient={recipient}
              sender={sender}
              content={content}
              getGlassyBg={getGlassyBg}
              getGlassyBorder={getGlassyBorder}
            />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Envelope from "@/components/Envelope";

export default function AnimationPage() {
  const [key, setKey] = useState(0);
  const [style, setStyle] = useState<"vintage-rose" | "vintage-white">("vintage-rose");

  useEffect(() => {
    // Trigger click on envelope wrapper to start opening sequence
    const openTimer = setTimeout(() => {
      const wrapper = document.querySelector(".envelope-wrapper") as HTMLElement;
      if (wrapper) {
        wrapper.click();
      }
    }, 1500);

    // After 10s, switch style and increment key to re-mount/reset
    const resetTimer = setTimeout(() => {
      setStyle((prev) => (prev === "vintage-rose" ? "vintage-white" : "vintage-rose"));
      setKey((prev) => prev + 1);
    }, 10000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(resetTimer);
    };
  }, [key]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at center, #1a0f2e 0%, #07050b 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Background Decorative Hearts */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 30% 30%, rgba(156, 108, 250, 0.08) 0%, rgba(255, 75, 114, 0.05) 50%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        position: "absolute",
        top: "40px",
        textAlign: "center",
        zIndex: 10,
        padding: "0 20px"
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          color: "#e2b857",
          fontSize: "28px",
          marginBottom: "8px",
          textShadow: "0 0 10px rgba(226, 184, 87, 0.4)"
        }}>
          Interactive Envelope Opening Animation
        </h1>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.06)",
          padding: "6px 14px",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.8)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          <span>Showing:</span>
          <span style={{ color: "#ff4b72", fontWeight: 700 }}>
            {style === "vintage-rose" ? "🌹 Vintage Rose Style" : "✉ Vintage Lace Style"}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "600px" }}>
        <Envelope
          key={key}
          recipient="My Beloved"
          sender="Your Devoted"
          content="From the moment we met, I knew you were my forever. These words represent my heart, sealed in digital stars..."
          theme="royal"
          sealSymbol="heart"
          sealColor="#9c1c2e"
          envelopeStyle={style}
          greeting="To My Dearest,"
          farewell="With all my love,"
          backdrop="none"
        />
      </div>

      <div style={{
        position: "absolute",
        bottom: "40px",
        textAlign: "center",
        zIndex: 10,
        color: "rgba(255,255,255,0.4)",
        fontSize: "12px",
        fontStyle: "italic"
      }}>
        This page automatically loops through the Vintage Rose and Vintage Lace envelope open sequences.
      </div>
    </div>
  );
}

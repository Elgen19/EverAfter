"use client";

import React, { useState } from "react";
import SealingAnimation from "@/components/creator/SealingAnimation";

export default function TestSealPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [envelopeStyle, setEnvelopeStyle] = useState("vintage-rose");
  const [theme, setTheme] = useState("royal");
  const [sealSymbol, setSealSymbol] = useState("heart");
  const [sealColor, setSealColor] = useState("#bd1a3d");
  const [recipient, setRecipient] = useState("My Beloved");
  const [sender, setSender] = useState("Yours Truly");
  const [greeting, setGreeting] = useState("To my dearest love,");
  const [farewell, setFarewell] = useState("With all my heart,");
  const [content, setContent] = useState(
    "From the moment we met, my world became brighter. You are my sunshine, my shelter, and my greatest adventure. I am writing this to remind you of my endless love for you."
  );

  const [message, setMessage] = useState("");

  const handleStart = () => {
    setMessage("");
    setIsPlaying(true);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setMessage("💖 Sealing Animation Completed Successfully!");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at center, #1b0c27 0%, #060309 100%)",
      color: "#f3f1f6",
      fontFamily: "var(--font-ui)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      overflowX: "hidden"
    }}>
      {/* Decorative stars */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 70% 20%, rgba(226, 184, 87, 0.08) 0%, rgba(156, 108, 250, 0.05) 50%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div className="glass" style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "600px",
        padding: "32px",
        background: "rgba(20, 15, 30, 0.65)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(16px)"
      }}>
        <h1 style={{
          fontFamily: "var(--font-cursive)",
          fontSize: "40px",
          color: "var(--accent-gold)",
          textAlign: "center",
          marginBottom: "12px"
        }}>
          Seal Animation Test Studio
        </h1>
        <p style={{
          textAlign: "center",
          fontSize: "14px",
          color: "var(--text-muted)",
          marginBottom: "28px"
        }}>
          Configure the envelope properties below and trigger the full 6-stage sealing workflow.
        </p>

        {message && (
          <div style={{
            background: "rgba(255, 75, 114, 0.15)",
            border: "1px solid var(--accent-rose)",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "bold",
            animation: "fadeInStudioOverlay 0.4s ease"
          }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Envelope Style & Stationery Theme */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Envelope Style</label>
              <select 
                value={envelopeStyle} 
                onChange={(e) => setEnvelopeStyle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              >
                <option value="vintage-rose">🌹 Vintage Rose (Pink)</option>
                <option value="vintage-white">✉ Vintage Lace (White)</option>
                <option value="celestial-blue">✨ Starry Night (Blue)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stationery Theme</label>
              <select 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              >
                <option value="royal">👑 Royal Gold</option>
                <option value="scroll">📜 Vintage Parchment</option>
                <option value="blush">🌸 Blush Rose</option>
                <option value="lavender">💜 Lavender Dream</option>
                <option value="celestial">🌌 Starry Celestial</option>
              </select>
            </div>
          </div>

          {/* Row 2: Seal Symbol & Seal Color */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Seal Symbol</label>
              <select 
                value={sealSymbol} 
                onChange={(e) => setSealSymbol(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              >
                <option value="heart">Heart ❤</option>
                <option value="rose">Rose 🌹</option>
                <option value="star">Star ⭐</option>
                <option value="ring">Ring 💍</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Seal Color</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  type="color" 
                  value={sealColor} 
                  onChange={(e) => setSealColor(e.target.value)}
                  style={{
                    width: "42px",
                    height: "42px",
                    padding: 0,
                    border: "none",
                    borderRadius: "8px",
                    background: "none",
                    cursor: "pointer"
                  }}
                />
                <input 
                  type="text" 
                  value={sealColor} 
                  onChange={(e) => setSealColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "#161122",
                    color: "#fff",
                    outline: "none",
                    fontFamily: "monospace"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Sender & Recipient */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sender Name</label>
              <input 
                type="text" 
                value={sender} 
                onChange={(e) => setSender(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recipient Name</label>
              <input 
                type="text" 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Row 4: Greeting & Farewell */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Greeting Prefix</label>
              <input 
                type="text" 
                value={greeting} 
                onChange={(e) => setGreeting(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Farewell Prefix</label>
              <input 
                type="text" 
                value={farewell} 
                onChange={(e) => setFarewell(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "#161122",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Row 5: Letter Content */}
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Letter Body Content</label>
            <textarea 
              rows={3}
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#161122",
                color: "#fff",
                outline: "none",
                resize: "vertical"
              }}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleStart}
            style={{
              marginTop: "12px",
              padding: "14px 28px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ff4b72 0%, #d9264c 100%)",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(255, 75, 114, 0.35)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 75, 114, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 75, 114, 0.35)";
            }}
          >
            Start Sealing Animation ✉✨
          </button>
        </div>
      </div>

      {isPlaying && (
        <SealingAnimation
          envelopeStyle={envelopeStyle}
          sealSymbol={sealSymbol}
          sealColor={sealColor}
          recipient={recipient}
          sender={sender}
          content={content}
          theme={theme}
          greeting={greeting}
          farewell={farewell}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}

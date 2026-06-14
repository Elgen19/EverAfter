"use client";

import React, { useEffect, useState, useCallback } from "react";
import SealingAnimation from "@/components/creator/SealingAnimation";

export default function HowItWorksSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // ── Step 1: Write & Style ──
  const [s1Phase, setS1Phase] = useState<"typing" | "backdrop" | "envelope">("typing");
  const [s1Message, setS1Message] = useState("");
  const [s1Backdrop, setS1Backdrop] = useState(0); // index into BACKDROPS
  const [s1Envelope, setS1Envelope] = useState(0); // index into ENVELOPES

  // ── Step 2: Enhance & Time-Lock ──
  const [s2Phase, setS2Phase] = useState<"security" | "music" | "schedule">("security");
  const [s2SecurityCheck, setS2SecurityCheck] = useState(false);
  const [s2Question, setS2Question] = useState("");
  const [s2Answer, setS2Answer] = useState("");
  const [s2MusicCheck, setS2MusicCheck] = useState(false);
  const [s2ScheduleCheck, setS2ScheduleCheck] = useState(false);

  // ── Step 3: Seal ──
  const [stampPlaced, setStampPlaced] = useState(false);
  const [stampPressing, setStampPressing] = useState(false);
  const [sealAnimKey, setSealAnimKey] = useState(0);

  // ── Step 4: Send & Track ──
  const [s4Phase, setS4Phase] = useState<"confirmation" | "dashboard">("confirmation");
  const [s4Copied, setS4Copied] = useState(false);
  const [receiptRead, setReceiptRead] = useState(false);
  const [rsvpAccepted, setRsvpAccepted] = useState(false);

  const BACKDROPS = [
    { src: "/cherry_blossoms.png", label: "Cherry Blossoms 🌸" },
    { src: "/cozy_cafe.png", label: "Cozy Cafe ☕" },
    { src: "/ocean_sunset.png", label: "Ocean Sunset 🌅" },
    { src: "/vintage_library.png", label: "Vintage Library 📚" },
  ];

  const ENVELOPES = [
    { src: "/vintage_envelope_open.png", label: "Red Envelope 🌹" },
    { src: "/white_envelope_open.png", label: "White Linen ✉️" },
    { src: "/celestial_envelope_open.png", label: "Starry Night ✨" },
  ];

  // Autoplay step cycling is handled dynamically by each step's animation completion.

  // ── Step 1 animation sequence ──
  useEffect(() => {
    if (activeStep !== 0) {
      setS1Phase("typing"); setS1Message(""); setS1Backdrop(0); setS1Envelope(0);
      return;
    }
    setS1Phase("typing"); setS1Message(""); setS1Backdrop(0); setS1Envelope(0);

    let cancelled = false;

    const typeText = async (text: string, speed: number) => {
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return;
        setS1Message(text.slice(0, i));
        await new Promise((r) => setTimeout(r, speed));
      }
    };

    const run = async () => {
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) return;

      // Phase 1: type message slowly
      await typeText("You make every single day feel like spring, and every night feel like home...", 65);
      await new Promise((r) => setTimeout(r, 1200));
      if (cancelled) return;

      // Phase 2: pick one backdrop
      setS1Phase("backdrop");
      setS1Backdrop(Math.floor(Math.random() * BACKDROPS.length));
      await new Promise((r) => setTimeout(r, 3000));
      if (cancelled) return;

      // Phase 3: pick one envelope
      setS1Phase("envelope");
      setS1Envelope(0);
      await new Promise((r) => setTimeout(r, 3000));
      if (cancelled) return;

      // End of Step 1: transition to Step 2 if autoplay is enabled
      if (autoPlay) {
        setActiveStep(1);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [activeStep, autoPlay]);

  // ── Step 2 animation sequence ──
  useEffect(() => {
    if (activeStep !== 1) {
      setS2Phase("security"); setS2SecurityCheck(false); setS2Question(""); setS2Answer(""); setS2MusicCheck(false); setS2ScheduleCheck(false);
      return;
    }
    setS2Phase("security"); setS2SecurityCheck(false); setS2Question(""); setS2Answer(""); setS2MusicCheck(false); setS2ScheduleCheck(false);

    let cancelled = false;
    const typeText = async (text: string, setter: React.Dispatch<React.SetStateAction<string>>, speed: number) => {
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return;
        setter(text.slice(0, i));
        await new Promise((r) => setTimeout(r, speed));
      }
    };
    const run = async () => {
      await new Promise((r) => setTimeout(r, 800));
      if (cancelled) return;
      setS2SecurityCheck(true);
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;
      await typeText("Did we first meet in New York?", setS2Question, 50);
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      await typeText("Yes", setS2Answer, 120);
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;
      setS2Phase("music"); setS2MusicCheck(true);
      await new Promise((r) => setTimeout(r, 2500));
      if (cancelled) return;
      setS2Phase("schedule"); setS2ScheduleCheck(true);
      await new Promise((r) => setTimeout(r, 3500));
      if (cancelled) return;

      // End of Step 2: transition to Step 3 if autoplay is enabled
      if (autoPlay) {
        setActiveStep(2);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeStep, autoPlay]);

  // ── Step 3: Seal animation ──
  const handleSealComplete = useCallback(() => {
    if (autoPlay) {
      setActiveStep(3);
    } else {
      setSealAnimKey((prev) => prev + 1);
    }
  }, [autoPlay]);

  // ── Step 4: Send & Track animation timeline ──
  useEffect(() => {
    if (activeStep !== 3) {
      setS4Phase("confirmation");
      setS4Copied(false);
      setReceiptRead(false);
      setRsvpAccepted(false);
      return;
    }
    setS4Phase("confirmation");
    setS4Copied(false);
    setReceiptRead(false);
    setRsvpAccepted(false);

    let cancelled = false;
    const run = async () => {
      // 1. Wait 1.8 seconds, then animate mock cursor click copy link
      await new Promise((r) => setTimeout(r, 1800));
      if (cancelled) return;
      setS4Copied(true);

      // 2. Wait 2.2 seconds, then transition to dashboard
      await new Promise((r) => setTimeout(r, 2200));
      if (cancelled) return;
      setS4Phase("dashboard");

      // 3. Initial dashboard shown (✓ Sent, unread). Wait 2.5s, then mark as read.
      await new Promise((r) => setTimeout(r, 2500));
      if (cancelled) return;
      setReceiptRead(true);

      // 4. Wait 3.5s, then mark RSVP as accepted.
      await new Promise((r) => setTimeout(r, 3500));
      if (cancelled) return;
      setRsvpAccepted(true);

      // 5. Wait 4.0 seconds on the final state, then loop back to Step 1 if autoplaying
      await new Promise((r) => setTimeout(r, 4000));
      if (cancelled) return;

      if (autoPlay) {
        setActiveStep(0);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [activeStep, autoPlay]);

  // ─── Shared styles ───
  const labelBadge: React.CSSProperties = { padding: "6px 14px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" as const };

  return (
    <div className="hiw-layout">
      {/* ── Stepper buttons (left) ── */}
      <div className="hiw-stepper">
        {[
          { title: "Write & Style", desc: "Compose your letter, choose a backdrop, and pick an envelope style." },
          { title: "Enhance & Time-Lock", desc: "Add security gates, ambient lo-fi tracks, and scheduled release." },
          { title: "Seal in Digital Wax", desc: "Close the flap and press the stamp to seal with realistic gold wax." },
          { title: "Send & Track", desc: "Copy your link. Get real-time read receipts and RSVP notifications." },
        ].map((step, i) => (
          <button key={i} onClick={() => { setActiveStep(i); setAutoPlay(false); }}
            className={`hiw-step-btn ${activeStep === i ? "active" : ""}`}
          >
            <span className="hiw-step-num">{String(i + 1).padStart(2, "0")}</span>
            <div className="hiw-step-content">
              <h4 className="hiw-step-title">{step.title}</h4>
              <p className="hiw-step-desc">{step.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Canvas (right) ── */}
      <div className="hiw-canvas">

        {/* ═══════ STEP 1: Write & Style ═══════ */}
        {activeStep === 0 && (
          <div className="hiw-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", width: "100%", height: "100%", padding: "20px", boxSizing: "border-box" }}>
            <style>{`
              @keyframes hiw-backdrop-in { 0% { opacity:0; transform:scale(1.08); } 100% { opacity:1; transform:scale(1); } }
              @keyframes hiw-envelope-in { 0% { opacity:0; transform:translateY(24px) scale(0.92); } 100% { opacity:1; transform:translateY(0) scale(1); } }
            `}</style>

            {s1Phase === "typing" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-rose)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>EverAfter Studio</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Pour your heart into words — each letter is handcrafted on vintage stationery.</div>
                </div>

                {/* Letter paper */}
                <div style={{ background: "#fcf8ee", borderRadius: "10px", border: "4px double #c3a175", padding: "22px", width: "100%", maxWidth: "340px", minHeight: "180px", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                  <div style={{ fontSize: "17px", fontFamily: "'Dancing Script', cursive", color: "#4a2c11", fontWeight: "bold", marginBottom: "10px" }}>My Dearest Love,</div>
                  <div style={{ fontSize: "13px", fontFamily: "'Playfair Display', serif", color: "#4a2c11", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                    {s1Message}
                    <span style={{ borderRight: "2px solid #c3a175", animation: "blink-cursor 0.75s step-end infinite", marginLeft: "1px", display: "inline-block", height: "1em", verticalAlign: "middle" }} />
                  </div>
                  <div style={{ position: "absolute", top: "6px", left: "8px", fontSize: "10px", color: "#c3a175" }}>❀</div>
                  <div style={{ position: "absolute", top: "6px", right: "8px", fontSize: "10px", color: "#c3a175" }}>❀</div>
                  <div style={{ position: "absolute", bottom: "6px", left: "8px", fontSize: "10px", color: "#c3a175" }}>❀</div>
                  <div style={{ position: "absolute", bottom: "6px", right: "8px", fontSize: "10px", color: "#c3a175" }}>❀</div>
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(255,75,114,0.08)", border: "1px solid rgba(255,75,114,0.2)", color: "var(--accent-rose)", justifyContent: "center" }}>
                  ✍️ Composing your love letter...
                </div>
              </>
            )}

            {s1Phase === "backdrop" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-purple)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Letter Backdrop</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Set the scene — your letter is displayed over an immersive, full-page backdrop.</div>
                </div>

                {/* Backdrop preview */}
                <div style={{ width: "100%", maxWidth: "360px", height: "220px", borderRadius: "14px", overflow: "hidden", position: "relative", border: "1px solid var(--border-card)", boxShadow: "0 14px 35px rgba(0,0,0,0.45)" }}>
                  <img
                    key={s1Backdrop}
                    src={BACKDROPS[s1Backdrop].src}
                    alt={BACKDROPS[s1Backdrop].label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", animation: "hiw-backdrop-in 1s ease both" }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", backdropFilter: "blur(1px)" }}>
                    <div style={{ background: "rgba(252,248,238,0.92)", borderRadius: "8px", padding: "14px 18px", maxWidth: "75%", border: "2px double #c3a175", boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}>
                      <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "13px", color: "#4a2c11", fontWeight: "bold" }}>My Dearest Love,</div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "10px", color: "#4a2c11", lineHeight: 1.5, marginTop: "4px" }}>You make every single day feel like spring...</div>
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(156,108,250,0.08)", border: "1px solid rgba(156,108,250,0.2)", color: "var(--accent-purple)", justifyContent: "center", flexDirection: "column", gap: "2px", textAlign: "center", padding: "8px 16px" }}>
                  <span>🌸 Backdrop — {BACKDROPS[s1Backdrop].label}</span>
                  <span style={{ fontSize: "9px", opacity: 0.7, fontWeight: 400 }}>The reader sees your letter over this beautiful scene</span>
                </div>
              </>
            )}

            {s1Phase === "envelope" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Envelope Style</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Pick the envelope that wraps your letter — sealed with a realistic wax stamp.</div>
                </div>

                {/* Envelope preview */}
                <div style={{ width: "280px", height: "200px" }}>
                  <img
                    key={s1Envelope}
                    src={ENVELOPES[s1Envelope].src}
                    alt={ENVELOPES[s1Envelope].label}
                    style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.5))", animation: "hiw-envelope-in 0.8s cubic-bezier(0.34,1.56,0.64,1) both" }}
                  />
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(226,184,87,0.08)", border: "1px solid rgba(226,184,87,0.2)", color: "var(--accent-gold)", justifyContent: "center", flexDirection: "column", gap: "2px", textAlign: "center", padding: "8px 16px" }}>
                  <span>✉️ Envelope — {ENVELOPES[s1Envelope].label}</span>
                  <span style={{ fontSize: "9px", opacity: 0.7, fontWeight: 400 }}>Your recipient opens this before reading the letter</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════ STEP 2: Enhance & Time-Lock ═══════ */}
        {activeStep === 1 && (
          <div className="hiw-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", width: "100%", height: "100%", padding: "20px", boxSizing: "border-box" }}>
            
            {s2Phase === "security" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-rose)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Security Gate</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Lock with a security question — only your recipient knows the key.</div>
                </div>

                {/* Card */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "20px", width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "#fff" }}>
                    <input type="checkbox" checked={s2SecurityCheck} readOnly style={{ accentColor: "var(--accent-rose)" }} />
                    🔑 Security Question Gate
                  </div>
                  {s2SecurityCheck && (
                    <div className="hiw-fade-in" style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "16px", borderLeft: "2px solid var(--accent-rose)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Security Question</span>
                        <input type="text" readOnly value={s2Question} placeholder="e.g. Did we first meet in New York?"
                          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "11px", outline: "none" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expected Answer</span>
                        <input type="text" readOnly value={s2Answer} placeholder="Yes"
                          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "11px", outline: "none", width: "80px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(255,75,114,0.08)", border: "1px solid rgba(255,75,114,0.2)", color: "var(--accent-rose)", justifyContent: "center" }}>
                  🔒 Status: Locked behind security question
                </div>
              </>
            )}

            {s2Phase === "music" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-purple)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Atmosphere & Music</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Set the mood — embed an ambient soundtrack that loops in the background.</div>
                </div>

                {/* Card */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "20px", width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "#fff" }}>
                    <input type="checkbox" checked={s2MusicCheck} readOnly style={{ accentColor: "var(--accent-purple)" }} />
                    🎵 Ambient Lo-fi Track
                  </div>
                  {s2MusicCheck && (
                    <div className="hiw-fade-in" style={{ gap: "16px", paddingLeft: "16px", borderLeft: "2px solid var(--accent-purple)", display: "flex", alignItems: "center" }}>
                      <div className="hiw-vinyl" />
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600 }}>Midnight Lo-fi Piano</span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Looping soundtrack</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(156,108,250,0.08)", border: "1px solid rgba(156,108,250,0.2)", color: "var(--accent-purple)", justifyContent: "center" }}>
                  🎵 Status: Lo-fi music track set
                </div>
              </>
            )}

            {s2Phase === "schedule" && (
              <>
                {/* Header */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Time-Locked Release</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>Timed release — schedule the exact anniversary date and time it unlocks.</div>
                </div>

                {/* Card */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "20px", width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "14px", textAlign: "left", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "bold", color: "#fff" }}>
                    <input type="checkbox" checked={s2ScheduleCheck} readOnly style={{ accentColor: "var(--accent-gold)" }} />
                    ⏳ Scheduled Release
                  </div>
                  {s2ScheduleCheck && (
                    <div className="hiw-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingLeft: "16px", borderLeft: "2px solid var(--accent-gold)" }}>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Release Date</span>
                        <div style={{ backgroundColor: "rgba(0,0,0,0.25)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>2026-06-25</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Release Time</span>
                        <div style={{ backgroundColor: "rgba(0,0,0,0.25)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 10px", color: "#fff", fontSize: "11px", marginTop: "4px", fontWeight: 600 }}>00:00 AM</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="glass" style={{ ...labelBadge, background: "rgba(226,184,87,0.08)", border: "1px solid rgba(226,184,87,0.2)", color: "var(--accent-gold)", justifyContent: "center" }}>
                  ⏳ Status: Time-locked until release
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════ STEP 3: Seal ═══════ */}
        {activeStep === 2 && (
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <SealingAnimation
              key={sealAnimKey}
              isInline={true}
              envelopeStyle="vintage-rose"
              sealSymbol="heart"
              sealColor="#b38f36"
              recipient="Faith"
              sender="Ethan"
              content="You make every single day feel like spring, and every night feel like home..."
              theme="scroll"
              greeting="Dearest Faith,"
              farewell="With all my love, Ethan"
              onComplete={handleSealComplete}
            />
          </div>
        )}

        {/* ═══════ STEP 4: Send & Track ═══════ */}
        {activeStep === 3 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: "12px", boxSizing: "border-box" }}>
            <style>{`
              @keyframes pointerClick {
                0% { transform: translate(15px, 15px); opacity: 0; }
                30% { transform: translate(15px, 15px); opacity: 1; }
                70% { transform: translate(0, 0); opacity: 1; }
                80% { transform: translate(0, 0) scale(0.85); opacity: 1; }
                90% { transform: translate(0, 0); opacity: 1; }
                100% { transform: translate(0, 0); opacity: 0; }
              }
            `}</style>

            {s4Phase === "confirmation" && (
              <div className="hiw-fade-in" style={{
                background: "rgba(20, 15, 30, 0.95)",
                border: "1.5px solid rgba(226, 184, 87, 0.4)",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "340px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                position: "relative"
              }}>
                {/* Header */}
                <div>
                  <div style={{ fontSize: "28px", marginBottom: "4px" }}>✉️</div>
                  <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#fff", margin: 0 }}>Letter Sealed Successfully! 🌹</h3>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>Your love letter is locked in digital wax and ready to be delivered.</p>
                </div>

                {/* Mock Link Box */}
                <div style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px"
                }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
                    everafterletters.xyz/letter/faith-143
                  </span>
                  <button style={{
                    background: s4Copied ? "var(--accent-rose)" : "rgba(255,255,255,0.08)",
                    border: "none",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "default",
                    transition: "all 0.2s"
                  }}>
                    {s4Copied ? "✓ Copied!" : "Copy Link"}
                  </button>
                </div>

                {/* Send Email Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                  <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Recipient Email Address</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input type="text" readOnly value="faith@example.com" style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "11px",
                      flex: 1
                    }} />
                    <button style={{
                      background: "var(--accent-rose)",
                      border: "none",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "default"
                    }}>Send Email</button>
                  </div>
                </div>

                {/* Mock pointer hand */}
                {!s4Copied && (
                  <div style={{
                    position: "absolute",
                    right: "32px",
                    top: "128px",
                    fontSize: "20px",
                    animation: "pointerClick 1.5s ease forwards",
                    pointerEvents: "none",
                    zIndex: 20
                  }}>
                    👆
                  </div>
                )}
              </div>
            )}

            {s4Phase === "dashboard" && (
              <div className="hiw-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", height: "95%", padding: "12px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "bold", fontFamily: "var(--font-cursive)", background: "linear-gradient(to right, #ff4b72, #9c6cfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EverAfter</span>
                </div>
                <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--accent-rose)", borderBottom: "1.5px solid var(--accent-rose)", paddingBottom: "4px" }}>Sent Letters (1)</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", paddingBottom: "4px" }}>Received (0)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", gap: "12px", textAlign: "left" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "12px", color: "#fff" }}>To: Faith</span>
                      <span style={{ fontSize: "8px", fontWeight: "bold", background: "rgba(255,75,114,0.15)", color: "var(--accent-rose)", padding: "1px 6px", borderRadius: "8px" }}>RED ENVELOPE</span>
                      {receiptRead ? (
                        <span style={{ fontSize: "8px", fontWeight: "bold", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 6px", borderRadius: "8px" }}>✓✓ Read</span>
                      ) : (
                        <span style={{ fontSize: "8px", fontWeight: "bold", background: "rgba(156,163,175,0.15)", color: "#9ca3af", padding: "1px 6px", borderRadius: "8px" }}>✓ Sent</span>
                      )}
                      {rsvpAccepted && (
                        <span style={{ fontSize: "8px", fontWeight: "bold", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "1px 6px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>🌹 RSVP Accepted</span>
                      )}
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>My Heart in a Page</span>
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)" }}>June 15, 2026</span>
                  </div>
                  <button style={{ padding: "4px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-card)", color: "#fff", fontSize: "9px", cursor: "default" }}>Link 🔗</button>
                </div>
                
                {receiptRead && (
                  <div className="glass anim-pulse hiw-fade-in" style={{ padding: "12px 16px", border: "1px solid rgba(75,255,114,0.2)", display: "flex", alignItems: "center", gap: "10px", background: "rgba(20,30,20,0.7)", marginTop: "auto", width: "100%" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: rsvpAccepted ? "rgba(75,255,114,0.15)" : "rgba(255,75,114,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: rsvpAccepted ? "#4bff72" : "var(--accent-rose)", fontSize: "12px", fontWeight: "bold" }}>
                      {rsvpAccepted ? "🌹" : "✓✓"}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: rsvpAccepted ? "#4bff72" : "#ff4b72" }}>
                        {rsvpAccepted ? "RSVP Accepted! 🌹" : "Letter Opened! 💖"}
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                        {rsvpAccepted ? "Faith accepted your date invitation!" : "Faith broke the wax seal & read your letter."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

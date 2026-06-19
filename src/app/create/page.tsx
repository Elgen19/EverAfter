"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useLetterForm } from "@/hooks/useLetterForm";
import { THEMES, BACKDROPS, BACKDROP_PREVIEWS } from "./constants";
import FloatingHearts from "@/components/FloatingHearts";
import Envelope from "@/components/Envelope";
import SealingAnimation from "@/components/creator/SealingAnimation";
import StationeryPreview from "@/components/creator/StationeryPreview";
import ShareLinkModal from "@/components/creator/ShareLinkModal";
import RomanticAlertModal from "@/components/creator/RomanticAlertModal";

// Modular configurators
import EmojiPicker from "@/components/creator/EmojiPicker";
import SecurityGateCreator from "@/components/creator/SecurityGateCreator";
import IntroCreator from "@/components/creator/IntroCreator";
import ClosingCreator from "@/components/creator/ClosingCreator";
import DateInviteCreator from "@/components/creator/DateInviteCreator";
import SurveyCreator from "@/components/creator/SurveyCreator";
import MusicCreator from "@/components/creator/MusicCreator";
import SendLaterCreator from "@/components/creator/SendLaterCreator";
import AudioMessageCreator from "@/components/creator/AudioMessageCreator";
import PolaroidsCreator from "@/components/creator/PolaroidsCreator";

function CreateLetterStudio() {
  const form = useLetterForm();
  const [activeTab, setActiveTab] = useState<"write" | "design" | "addons" | "flow" | "preview">("write");
  const [pendingSelection, setPendingSelection] = useState<{
    type: "theme" | "backdrop" | "envelope";
    id: string;
    name: string;
    desc: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.user || !form.recipientProfile) {
      if (!form.recipient.trim()) {
        form.showRomanticAlert("Recipient Required", "Please write the name of your sweetheart so we know who to seal this envelope for.");
        setActiveTab("write");
        return;
      }
      if (!form.sender.trim()) {
        form.showRomanticAlert("Sender Required", "Please write your name or a sweet pseudonym so they know who this message is from.");
        setActiveTab("write");
        return;
      }
    }

    if (!form.content.trim()) {
      form.showRomanticAlert("Empty Heart", "Your love letter is currently empty. Write down your feelings and seal them in the envelope.");
      setActiveTab("write");
      return;
    }

    form.handleCreate(e);
  };

  if (form.loading || !form.user || !form.recipientProfile) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying session...</div>
      </div>
    );
  }

  const previewBackdropUrl = form.backdrop && form.backdrop !== "none"
    ? BACKDROP_PREVIEWS[form.backdrop]
    : (form.theme === "celestial" ? "/campfire_letter.png" : "");

  const hasBackdrop = (form.backdrop && form.backdrop !== "none") || form.theme === "celestial";

  const getGlassyBg = () => {
    if (!hasBackdrop) return "var(--stationery-bg)";
    switch (form.theme) {
      case "royal": return "rgba(247, 241, 227, 0.55)";
      case "scroll": return "rgba(237, 220, 185, 0.55)";
      case "blush": return "rgba(255, 253, 247, 0.5)";
      case "lavender": return "rgba(247, 244, 252, 0.5)";
      default: return "rgba(9, 14, 36, 0.45)";
    }
  };

  const getGlassyBorder = () => {
    if (!hasBackdrop) return "var(--stationery-border)";
    switch (form.theme) {
      case "royal": return "rgba(201, 162, 39, 0.5)";
      case "scroll": return "rgba(92, 56, 31, 0.5)";
      case "blush": return "rgba(183, 110, 121, 0.5)";
      case "lavender": return "rgba(232, 219, 248, 0.45)";
      default: return "rgba(226, 184, 87, 0.25)";
    }
  };

  return (
    <div className="studio-container" style={{ minHeight: "100vh", position: "relative", padding: "40px 20px" }}>
      <FloatingHearts />
      <style>{`
        @media (min-width: 992px) {
          .studio-container { height: 100vh !important; overflow: hidden !important; padding: 20px 20px 10px 20px !important; display: flex !important; flex-direction: column !important; }
          .studio-main { height: 100% !important; display: flex !important; flex-direction: column !important; flex: 1 !important; overflow: hidden !important; }
          .studio-grid { display: grid !important; grid-template-columns: 1fr 1.15fr !important; flex: 1 !important; overflow: hidden !important; align-items: stretch !important; gap: 30px !important; padding-bottom: 15px !important; }
          .studio-form { height: 100% !important; max-height: none !important; }
          .studio-preview-col { height: 100% !important; overflow: hidden !important; position: static !important; display: flex !important; flex-direction: column !important; }
          .studio-preview-wrapper { flex: 1 !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; }
          .studio-preview-card { width: 100% !important; height: 100% !important; max-height: calc(100vh - 180px) !important; }
        }
        @media (max-width: 991px) {
          .studio-preview-card {
            height: 460px !important;
          }
          .studio-preview-envelope-scaler {
            transform: scale(0.6) !important;
            transform-origin: center center;
          }
        }
        @media (max-width: 480px) {
          .studio-preview-envelope-scaler {
            transform: scale(0.48) !important;
            transform-origin: center center;
          }
        }
      `}</style>

      <main className="studio-main" style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>

        <header className="studio-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <Link
            href={form.isWriteback ? `/mailbox?ref=${form.queryReplyToId || ""}` : "/dashboard"}
            style={{ color: "var(--text-muted)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            {form.isWriteback ? "Mailbox" : "Dashboard"}
          </Link>
          <h1 style={{ fontSize: "36px", fontWeight: "normal", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", background: "linear-gradient(to right, #ff4b72, #9c6cfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.5px" }}>
            EverAfter Studio
          </h1>
          <div className="studio-header-spacer" style={{ width: "80px" }} />
        </header>

        {/* Mobile Segmented Tab Control */}
        <div className="mobile-tabs-container">
          {([
            { id: "write", label: "Write", icon: "✍️" },
            { id: "design", label: "Design", icon: "🎨" },
            { id: "addons", label: "Add-ons", icon: "🌟" },
            { id: "flow", label: "Flow", icon: "🔄" },
            { id: "preview", label: "Preview", icon: "👁️" }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`mobile-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span style={{ fontSize: "16px" }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="studio-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))", gap: "40px", alignItems: "start" }}>

          {/* ── Left: Form Editor ── */}
          <form id="create-letter-form" onSubmit={handleSubmit} className="glass studio-form hide-scrollbar" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "85vh", overflowY: "auto" }}>
            
            {/* --- Section 1: Write --- */}
            <div className={`studio-section ${activeTab === "write" ? "" : "hidden-mobile"}`}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, borderBottom: "1px solid var(--border-card)", paddingBottom: "12px", color: "var(--text-main)" }}>
                Write Your Letter
              </h2>

              {/* Names / email - only shown when not a logged-in user with profile */}
              {form.user && form.recipientProfile ? null : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {(["Recipient Name", "Sender Name"] as const).map((label, i) => (
                      <div key={label} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</label>
                        <input
                          type="text"
                          value={i === 0 ? form.recipient : form.sender}
                          onChange={(e) => i === 0 ? form.setRecipient(e.target.value) : form.setSender(e.target.value)}
                          placeholder={i === 0 ? "e.g. My Sweetheart" : "e.g. Your Love"}
                          maxLength={40}
                          style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none" }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Recipient's Email Address (Optional)</label>
                    <input type="email" value={form.email} onChange={(e) => form.handleEmailChange(e.target.value)} placeholder="e.g. beloved@example.com"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: form.emailError ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none" }}
                    />
                    {form.emailError && <span style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>⚠️ {form.emailError}</span>}
                  </div>
                </>
              )}

              {/* Greeting & Farewell */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {(["Letter Greeting Prefix", "Letter Farewell / Sign-off"] as const).map((label, i) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{label}</label>
                    <input
                      type="text"
                      value={i === 0 ? form.greeting : form.farewell}
                      onChange={(e) => i === 0 ? form.setGreeting(e.target.value) : form.setFarewell(e.target.value)}
                      placeholder={i === 0 ? "e.g. Dearest" : "e.g. With all my love,"}
                      maxLength={40}
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none" }}
                    />
                  </div>
                ))}
              </div>

              {/* Letter Body */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Body</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {["❤️", "🥰", "🌹", "✨", "😘"].map((emoji) => (
                        <button key={emoji} type="button" onClick={() => form.handleInsertEmoji(emoji)}
                          style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", padding: "2px", transition: "transform 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >{emoji}</button>
                      ))}
                    </div>
                    <EmojiPicker onSelect={form.handleInsertEmoji} />
                  </div>
                </div>
                <textarea
                  id="letter-body-textarea" value={form.content} onChange={(e) => form.setContent(e.target.value)}
                  placeholder="Write your feelings here..." rows={6}
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "14px", color: "#fff", fontSize: "14px", lineHeight: "1.6", outline: "none", resize: "vertical", minHeight: "120px" }}
                />
              </div>

              {/* Mobile next button */}
              <div className="mobile-only" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("design")}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent-purple)",
                    backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  Continue to Design 🎨
                </button>
              </div>
            </div>

            {/* --- Section 2: Design --- */}
            <div className={`studio-section ${activeTab === "design" ? "" : "hidden-mobile"}`} style={{ borderTop: "none", paddingTop: "0" }}>
              <h2 className="mobile-only" style={{ fontSize: "18px", fontWeight: 600, borderBottom: "1px solid var(--border-card)", paddingBottom: "12px", color: "var(--text-main)" }}>
                Design Stationery & Envelope
              </h2>

              {/* Theme selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Stationery Style</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {THEMES.map((t) => (
                    <button key={t.id} type="button" 
                      onClick={() => {
                        if (window.innerWidth < 992) {
                          setPendingSelection({ type: "theme", id: t.id, name: t.name, desc: t.desc });
                        } else {
                          form.setTheme(t.id);
                        }
                      }}
                      style={{ padding: "12px", borderRadius: "10px", border: form.theme === t.id ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)", background: form.theme === t.id ? "rgba(255, 75, 114, 0.08)" : "transparent", color: form.theme === t.id ? "#fff" : "var(--text-muted)", textAlign: "left", cursor: "pointer" }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Backdrop selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Page Backdrop</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {BACKDROPS.map((b) => (
                    <button key={b.id} type="button" 
                      onClick={() => {
                        if (window.innerWidth < 992) {
                          setPendingSelection({ type: "backdrop", id: b.id, name: b.name, desc: b.desc });
                        } else {
                          form.setBackdrop(b.id);
                        }
                      }}
                      style={{ padding: "12px", borderRadius: "10px", border: form.backdrop === b.id ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)", background: form.backdrop === b.id ? "rgba(255, 75, 114, 0.08)" : "transparent", color: form.backdrop === b.id ? "#fff" : "var(--text-muted)", textAlign: "left", cursor: "pointer", transition: "all 0.2s ease" }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{b.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Envelope style */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Envelope Style & Animation</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                  {[
                    { id: "vintage-rose", label: "🌹 Red Envelope", desc: "Classic vintage crimson envelope with a gold wax seal" },
                    { id: "vintage-white", label: "✉ Vintage Lace", desc: "Elegant white linen envelope with a ruby red wax seal" },
                    { id: "celestial-blue", label: "✨ Starry Night", desc: "Midnight blue constellation envelope with a blush heart wax seal" },
                  ].map((env) => (
                    <button key={env.id} type="button" 
                      onClick={() => {
                        if (window.innerWidth < 992) {
                          setPendingSelection({ type: "envelope", id: env.id, name: env.label, desc: env.desc });
                        } else {
                          form.setEnvelopeStyle(env.id);
                        }
                      }}
                      style={{ padding: "12px", borderRadius: "10px", border: form.envelopeStyle === env.id ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)", background: form.envelopeStyle === env.id ? "rgba(255, 75, 114, 0.08)" : "transparent", color: form.envelopeStyle === env.id ? "#fff" : "var(--text-muted)", textAlign: "left", cursor: "pointer", transition: "all 0.2s ease" }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{env.label}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}>{env.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Design tab step buttons */}
              <div className="mobile-flex-only" style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  Back to Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("addons")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent-purple)",
                    backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  Continue to Add-ons 🌟
                </button>
              </div>
            </div>

            {/* --- Section 3: Add-ons & Customizations --- */}
            <div className={`studio-section ${activeTab === "addons" ? "" : "hidden-mobile"}`} style={{ borderTop: "none", paddingTop: "0" }}>
              <h2 className="mobile-only" style={{ fontSize: "18px", fontWeight: 600, borderBottom: "1px solid var(--border-card)", paddingBottom: "12px", color: "var(--text-main)" }}>
                Add-ons & Background Music
              </h2>

              <MusicCreator music={form.music} setMusic={form.setMusic} musicType={form.musicType} setMusicType={form.setMusicType} musicUrl={form.musicUrl} setMusicUrl={form.setMusicUrl} />

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border-card)", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>Optional Customizations</h3>
                <SecurityGateCreator securityEnabled={form.securityEnabled} setSecurityEnabled={form.setSecurityEnabled} securityType={form.securityType} setSecurityType={form.setSecurityType} securityQuestion={form.securityQuestion} setSecurityQuestion={form.setSecurityQuestion} securityAnswer={form.securityAnswer} setSecurityAnswer={form.setSecurityAnswer} securityChoices={form.securityChoices} setSecurityChoices={form.setSecurityChoices} securityConfirmed={form.securityConfirmed} setSecurityConfirmed={form.setSecurityConfirmed} showAlert={form.showRomanticAlert} />
                <IntroCreator introEnabled={form.introEnabled} setIntroEnabled={form.setIntroEnabled} introText={form.introText} setIntroText={form.setIntroText} introAnimation={form.introAnimation} setIntroAnimation={form.setIntroAnimation} introConfirmed={form.introConfirmed} setIntroConfirmed={form.setIntroConfirmed} showAlert={form.showRomanticAlert} />
                <ClosingCreator closingEnabled={form.closingEnabled} setClosingEnabled={form.setClosingEnabled} closingText={form.closingText} setClosingText={form.setClosingText} closingAnimation={form.closingAnimation} setClosingAnimation={form.setClosingAnimation} closingConfirmed={form.closingConfirmed} setClosingConfirmed={form.setClosingConfirmed} showAlert={form.showRomanticAlert} />
                <DateInviteCreator dateInviteEnabled={form.dateInviteEnabled} setDateInviteEnabled={form.setDateInviteEnabled} dateInviteQuestion={form.dateInviteQuestion} setDateInviteQuestion={form.setDateInviteQuestion} dateInviteDate={form.dateInviteDate} setDateInviteDate={form.setDateInviteDate} dateInviteTime={form.dateInviteTime} setDateInviteTime={form.setDateInviteTime} dateInvitePlace={form.dateInvitePlace} setDateInvitePlace={form.setDateInvitePlace} dateInviteMapLink={form.dateInviteMapLink} setDateInviteMapLink={form.setDateInviteMapLink} dateInviteEmail={form.dateInviteEmail} setDateInviteEmail={form.setDateInviteEmail} dateInviteConfirmed={form.dateInviteConfirmed} setDateInviteConfirmed={form.setDateInviteConfirmed} sender={form.sender} recipient={form.recipient} showAlert={form.showRomanticAlert} />
                <SurveyCreator surveyEnabled={form.surveyEnabled} setSurveyEnabled={form.setSurveyEnabled} surveyQuestion={form.surveyQuestion} setSurveyQuestion={form.setSurveyQuestion} surveyType={form.surveyType} setSurveyType={form.setSurveyType} surveyConfirmed={form.surveyConfirmed} setSurveyConfirmed={form.setSurveyConfirmed} showAlert={form.showRomanticAlert} />
                {!form.user ? (
                  <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed var(--border-card)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                    🎤 Voice recording replies require an account. <Link href="/login" style={{ color: "var(--accent-rose)", fontWeight: "bold", textDecoration: "none" }}>Log in or Sign up</Link> to seal audio messages!
                  </div>
                ) : (
                  <AudioMessageCreator audioEnabled={form.audioEnabled} setAudioEnabled={form.setAudioEnabled} audioUrl={form.audioUrl} setAudioUrl={form.setAudioUrl} audioFile={form.audioFile} setAudioFile={form.setAudioFile} audioCustomMessage={form.audioCustomMessage} setAudioCustomMessage={form.setAudioCustomMessage} audioConfirmed={form.audioConfirmed} setAudioConfirmed={form.setAudioConfirmed} showAlert={form.showRomanticAlert} />
                )}
                <PolaroidsCreator
                  polaroidsEnabled={form.polaroidsEnabled}
                  setPolaroidsEnabled={form.setPolaroidsEnabled}
                  polaroids={form.polaroids}
                  setPolaroids={form.setPolaroids}
                  polaroidsConfirmed={form.polaroidsConfirmed}
                  setPolaroidsConfirmed={form.setPolaroidsConfirmed}
                  showAlert={form.showRomanticAlert}
                />
                <SendLaterCreator sendLaterEnabled={form.sendLaterEnabled} setSendLaterEnabled={form.setSendLaterEnabled} sendLaterDate={form.sendLaterDate} setSendLaterDate={form.setSendLaterDate} sendLaterTime={form.sendLaterTime} setSendLaterTime={form.setSendLaterTime} />
              </div>

              {/* Mobile Add-ons tab step buttons */}
              <div className="mobile-flex-only" style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("design")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  Back to Design
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("flow")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent-purple)",
                    backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  Go to Flow 🔄
                </button>
              </div>
            </div>

            {/* --- Section 4: Flow --- */}
            <div className={`studio-section ${activeTab === "flow" ? "" : "hidden-mobile"}`} style={{ borderTop: "none", paddingTop: "0" }}>
              <h2 className="mobile-only" style={{ fontSize: "18px", fontWeight: 600, borderBottom: "1px solid var(--border-card)", paddingBottom: "12px", color: "var(--text-main)" }}>
                Timeline Flow Sequence
              </h2>
              
              <div style={{ background: "rgba(156, 108, 250, 0.05)", border: "1px solid rgba(156, 108, 250, 0.2)", borderRadius: "10px", padding: "14px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                ℹ️ <strong>Love Letter Journey Flow:</strong> Rearrange the timeline flow of the recipient's love letter journey. Drag or use the arrows (▲/▼) below to reorder steps. Your recipient will experience your customized gates, date invitations, and audio messages in this exact sequence before opening the envelope!
              </div>

              {/* Step orderer */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {form.activeSteps.map((stepId, idx) => (
                    <div key={stepId} className="customizer-step-item">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: stepId === "envelope" ? "var(--accent-rose)" : "rgba(255,255,255,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", color: "#fff" }}>{idx + 1}</span>
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>{form.getStepLabel(stepId)}</span>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {(["up", "down"] as const).map((dir) => {
                          const disabled = dir === "up" ? idx === 0 : idx === form.activeSteps.length - 1;
                          return (
                            <button key={dir} type="button" onClick={() => form.moveStep(idx, dir)} disabled={disabled}
                              style={{ background: "none", border: "none", color: "#fff", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 0.7, padding: "4px 8px", fontSize: "13px" }}
                              title={`Move Step ${dir === "up" ? "Up" : "Down"}`}
                            >{dir === "up" ? "▲" : "▼"}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Flow tab step buttons */}
              <div className="mobile-flex-only" style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("addons")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  Back to Add-ons
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  style={{
                    flex: 1,
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent-purple)",
                    backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                    border: "none",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  Preview Letter 👁️
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit"
              className={activeTab === "flow" ? "" : "hidden-mobile"}
              style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "var(--accent-rose)", backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)", border: "none", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer", boxShadow: "0 8px 20px rgba(255, 75, 114, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s", marginTop: "12px" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              {form.editId ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Save Changes</>
              ) : form.isWriteback ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Send Write Back ✍️</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>Seal Envelope & Get Link</>
              )}
            </button>
          </form>

          {/* ── Right: Live Preview ── */}
          <div className={`studio-preview-col ${activeTab === "preview" ? "" : "hidden-mobile"}`} style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "20px" }}>
            <div className="studio-preview-mode-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["letter", "envelope"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => form.setPreviewMode(mode)}
                    style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", backgroundColor: form.previewMode === mode ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.05)", border: "1px solid " + (form.previewMode === mode ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.1)"), color: "#fff", cursor: "pointer", transition: "all 0.2s" }}
                  >{mode === "letter" ? "📄 Stationery View" : "✉️ Envelope & Seal"}</button>
                ))}
              </div>
              <span className="hidden-mobile" style={{ fontSize: "11px", backgroundColor: "rgba(156, 108, 250, 0.15)", color: "var(--accent-purple)", padding: "3px 8px", borderRadius: "12px", border: "1px solid rgba(156, 108, 250, 0.25)" }}>Live Editor</span>
            </div>

            {form.previewMode === "envelope" ? (
              <div className="glass studio-preview-card" style={{ width: "100%", height: "680px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", background: previewBackdropUrl ? `url(${previewBackdropUrl})` : "rgba(20, 15, 30, 0.4)", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "16px" }}>
                <button type="button" onClick={() => form.setEnvelopeResetKey(prev => prev + 1)}
                  style={{ position: "absolute", top: "16px", left: "16px", zIndex: 200, padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(255, 255, 255, 0.1)", border: "1px solid var(--border-card)", color: "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                >🔄 Reset Animation</button>
                <div className="studio-preview-envelope-scaler" style={{ transform: "scale(0.8)" }}>
                  <Envelope key={form.envelopeResetKey} recipient={form.recipient} sender={form.sender} content={form.content} theme={form.theme} sealSymbol={form.sealSymbol} sealColor={form.sealColor} envelopeStyle={form.envelopeStyle} greeting={form.greeting} farewell={form.farewell} backdrop={form.backdrop} onClose={() => {}} />
                </div>
              </div>
            ) : (
              <StationeryPreview
                theme={form.theme}
                backdrop={form.backdrop}
                previewBackdropUrl={previewBackdropUrl}
                hasBackdrop={!!hasBackdrop}
                greeting={form.greeting}
                farewell={form.farewell}
                recipient={form.recipient}
                sender={form.sender}
                content={form.content}
                getGlassyBg={getGlassyBg}
                getGlassyBorder={getGlassyBorder}
              />
            )}

            {/* Mobile-only Submit button for Preview tab */}
            <div className="mobile-only" style={{ marginTop: "12px" }}>
              <button type="submit" form="create-letter-form"
                style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "var(--accent-rose)", backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)", border: "none", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer", boxShadow: "0 8px 20px rgba(255, 75, 114, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {form.editId ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Save Changes</>
                ) : form.isWriteback ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>Send Write Back ✍️</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>Seal Envelope & Get Link</>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {form.showModal && (
        <ShareLinkModal
          shareUrl={form.shareUrl}
          copied={form.copied}
          isWriteback={form.isWriteback}
          editId={form.editId}
          envelopeStyle={form.envelopeStyle}
          sealColor={form.sealColor}
          sender={form.sender}
          recipient={form.recipient}
          title={form.title}
          email={form.email}
          emailToSend={form.emailToSend}
          setEmailToSend={form.setEmailToSend}
          emailStatus={form.emailStatus}
          sendingEmail={form.sendingEmail}
          user={form.user}
          queryReplyToId={form.queryReplyToId}
          onCopyLink={form.copyToClipboard}
          onSendEmail={form.handleSendEmail}
        />
      )}

      {form.alertOpen && (
        <RomanticAlertModal
          alertTitle={form.alertTitle}
          alertMessage={form.alertMessage}
          onClose={form.handleCloseAlert}
        />
      )}

      {form.showSealingAnimation && (
        <SealingAnimation
          envelopeStyle={form.envelopeStyle}
          sealSymbol={form.sealSymbol}
          sealColor={form.sealColor}
          recipient={form.recipient}
          sender={form.sender}
          content={form.content}
          theme={form.theme}
          greeting={form.greeting}
          farewell={form.farewell}
          onComplete={async () => {
            if (form.email.trim()) form.setEmailToSend(form.email.trim());
            if (form.savePromise) {
              try {
                const finalLink = await form.savePromise;
                form.setShareUrl(finalLink);
                if (form.sendViaEmail && form.email.trim()) {
                  // Auto-dispatch email
                  const { db } = await import("@/utils/firebase");
                  const { doc, updateDoc } = await import("firebase/firestore");
                  try {
                    const res = await fetch("/api/send-letter", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ recipientEmail: form.email.trim(), letterLink: finalLink, senderName: form.sender.trim() || "Yours Truly", recipientName: form.recipient.trim() || "My Love", title: form.title.trim() || "A Love Letter" })
                    });
                    const data = await res.json();
                    if (data.success) {
                      let letterId: string | null = null;
                      if (finalLink && finalLink.includes("&id=")) letterId = finalLink.split("&id=")[1]?.split("&")[0];
                      if (db && letterId) await updateDoc(doc(db, "letters", letterId), { emailSent: true });
                    }
                  } catch (err) { console.error("Auto email dispatch failed:", err); }
                }
              } catch (err) { console.error("Background save failed:", err); }
            }
            form.setShowSealingAnimation(false);
            form.setShowModal(true);
          }}
        />
      )}

      {/* Design card selection confirmation modal */}
      {pendingSelection && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1100,
          backgroundColor: "rgba(11, 7, 17, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="glass animate-reveal" style={{ width: "100%", maxWidth: "400px", padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", borderBottom: "1px solid var(--border-card)", paddingBottom: "10px" }}>
              Confirm {pendingSelection.type === "theme" ? "Stationery Style" : pendingSelection.type === "backdrop" ? "Backdrop" : "Envelope Style"}
            </h3>
            
            {/* Visual Preview Container */}
            <div style={{ width: "100%", marginTop: "4px" }}>
              {pendingSelection.type === "theme" && (() => {
                const isLavender = pendingSelection.id === "lavender";
                const isCelestial = pendingSelection.id === "celestial";
                const isRoyal = pendingSelection.id === "royal";
                const isScroll = pendingSelection.id === "scroll";

                const cardStyle: React.CSSProperties = {
                  width: "100%",
                  height: "140px",
                  backgroundColor: isCelestial ? "#070a1c" : "var(--stationery-bg, #F7F1E3)",
                  backgroundImage: isCelestial 
                    ? "radial-gradient(circle at center, #151a3a, #070a1c)" 
                    : isLavender 
                      ? "linear-gradient(rgba(123, 44, 191, 0.08) 1px, transparent 1px)" 
                      : "none",
                  backgroundSize: isLavender ? "100% 16px" : "auto",
                  border: isRoyal 
                    ? "4px double var(--stationery-border, #C9A227)" 
                    : isScroll 
                      ? "2px solid #5c381f" 
                      : "1.5px solid var(--stationery-border, #C9A227)",
                  borderRadius: isScroll ? "4px" : "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  color: "var(--stationery-text, #3A2618)",
                  fontFamily: "var(--stationery-font, serif)",
                  boxShadow: "inset 0 0 15px rgba(0,0,0,0.05)",
                  position: "relative",
                  boxSizing: "border-box"
                };

                return (
                  <div className={`theme-${pendingSelection.id}`} style={cardStyle}>
                    {isScroll && (
                      <>
                        <div style={{ position: "absolute", top: "-5px", left: "0", right: "0", height: "5px", backgroundColor: "#8b5a2b", borderRadius: "1px" }} />
                        <div style={{ position: "absolute", bottom: "-5px", left: "0", right: "0", height: "5px", backgroundColor: "#8b5a2b", borderRadius: "1px" }} />
                      </>
                    )}
                    <div style={{ fontSize: "11px", fontWeight: "bold", opacity: 0.8 }}>Dearest {form.recipient || "Beloved"},</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "6px 0" }}>
                      <div style={{ height: "1px", background: "var(--stationery-text, #3A2618)", opacity: 0.15, width: "90%" }} />
                      <div style={{ height: "1px", background: "var(--stationery-text, #3A2618)", opacity: 0.15, width: "80%" }} />
                      <div style={{ height: "1px", background: "var(--stationery-text, #3A2618)", opacity: 0.15, width: "85%" }} />
                    </div>
                    <div style={{ fontSize: "11px", textAlign: "right", fontStyle: "italic", opacity: 0.8, color: "var(--stationery-accent, #7B1E1E)" }}>
                      With love, {form.sender || "Sender"} ❤️
                    </div>
                  </div>
                );
              })()}

              {pendingSelection.type === "backdrop" && (
                pendingSelection.id === "none" ? (
                  <div style={{ width: "100%", height: "140px", borderRadius: "8px", border: "1px dashed var(--border-card)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)" }}>
                    <span style={{ fontSize: "20px" }}>✨</span>
                    <span style={{ fontSize: "12px" }}>No Backdrop (Solid background)</span>
                  </div>
                ) : (
                  <div style={{ position: "relative", width: "100%", height: "140px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-card)" }}>
                    <img src={BACKDROP_PREVIEWS[pendingSelection.id]} alt={pendingSelection.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )
              )}

              {pendingSelection.type === "envelope" && (() => {
                const envelopeImages: Record<string, string> = {
                  "vintage-rose": "/vintage_envelope_open.png",
                  "vintage-white": "/white_envelope_open.png",
                  "celestial-blue": "/celestial_envelope_open.png"
                };
                return (
                  <div style={{ position: "relative", width: "100%", height: "140px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-card)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
                    <img src={envelopeImages[pendingSelection.id] || "/vintage_envelope_open.png"} alt={pendingSelection.name} style={{ width: "90%", height: "90%", objectFit: "contain" }} />
                  </div>
                );
              })()}
            </div>

            <div>
              <strong style={{ color: "var(--accent-rose)", fontSize: "16px" }}>{pendingSelection.name}</strong>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px", lineHeight: "1.5" }}>{pendingSelection.desc}</p>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button type="button" onClick={() => setPendingSelection(null)} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid var(--border-card)", color: "var(--text-muted)", fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" 
                onClick={() => {
                  if (pendingSelection.type === "theme") form.setTheme(pendingSelection.id);
                  else if (pendingSelection.type === "backdrop") form.setBackdrop(pendingSelection.id);
                  else if (pendingSelection.type === "envelope") form.setEnvelopeStyle(pendingSelection.id);
                  setPendingSelection(null);
                }} 
                style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: "var(--accent-rose)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateLetterPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading studio...</div>
      </div>
    }>
      <CreateLetterStudio />
    </Suspense>
  );
}

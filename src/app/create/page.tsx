"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { encodeLetterData, LetterData } from "@/utils/encoding";
import FloatingHearts from "@/components/FloatingHearts";
import { db } from "@/utils/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

// Import modular configurators
import EmojiPicker from "@/components/creator/EmojiPicker";
import SecurityGateCreator from "@/components/creator/SecurityGateCreator";
import IntroCreator from "@/components/creator/IntroCreator";
import ClosingCreator from "@/components/creator/ClosingCreator";
import DateInviteCreator from "@/components/creator/DateInviteCreator";
import SurveyCreator from "@/components/creator/SurveyCreator";
import MusicCreator from "@/components/creator/MusicCreator";
import SendLaterCreator from "@/components/creator/SendLaterCreator";

const WAX_SEAL_COLORS = [
  { name: "Vintage Crimson", value: "#9c1c2e" },
  { name: "Deep Burgundy", value: "#5e0b1c" },
  { name: "Antique Gold", value: "#b38f36" },
  { name: "Midnight Navy", value: "#1b264f" },
  { name: "Sage Green", value: "#526e5b" },
  { name: "Dusty Rose", value: "#8c6b8c" }
];

const THEMES = [
  { id: "classic", name: "Classic Parchment", desc: "Elegant serif typography on aged paper" },
  { id: "rose", name: "Blush Rose", desc: "Romantic script typography with rose petal accents" },
  { id: "lavender", name: "Lavender Dream", desc: "Serene violet margins with ruled lines" },
  { id: "celestial", name: "Celestial Night", desc: "Gold stars on a deep space night sky" }
];

const SYMBOLS = [
  { id: "heart", char: "❤", name: "Heart" },
  { id: "rose", char: "🌹", name: "Rose" },
  { id: "star", char: "⭐", name: "Star" },
  { id: "ring", char: "💍", name: "Ring" }
];

export default function CreateLetterPage() {
  const router = useRouter();
  const { user, recipient: recipientProfile, loading } = useAuth();

  // Core Form state
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [email, setEmail] = useState("");

  // Guard routing checks
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!recipientProfile) {
        router.push("/recipient-setup");
      }
    }
  }, [user, recipientProfile, loading, router]);

  const getSenderFirstName = () => {
    if (!user) return "";
    const name = user.displayName || user.email.split("@")[0];
    let cleanName = name.replace(/[._-]/g, " ").trim();
    cleanName = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };

  // Pre-populate recipient name, sender name, and email from setup profile
  useEffect(() => {
    if (recipientProfile && user) {
      const recName = recipientProfile.firstName || "";
      let cleanRec = recName.replace(/[._-]/g, " ").trim();
      cleanRec = cleanRec.replace(/([a-z])([A-Z])/g, "$1 $2");
      const firstRec = cleanRec.split(/\s+/)[0] || "";
      
      setRecipient(firstRec);
      setSender(getSenderFirstName());
      setEmail(recipientProfile.email);
    }
  }, [recipientProfile, user]);

  const [emailError, setEmailError] = useState("");
  const title = "";
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("classic");
  const [sealSymbol, setSealSymbol] = useState("heart");
  const [sealColor, setSealColor] = useState("#9c1c2e");
  
  // Background music starts off ("normally off")
  const [music, setMusic] = useState(false);
  const [musicType, setMusicType] = useState<"synth" | "url">("synth");
  const [musicUrl, setMusicUrl] = useState("");

  // Customizations: Greeting & Closing Text
  const [greeting, setGreeting] = useState("Dearest");
  const [farewell, setFarewell] = useState("With all my love,");

  // Customization: Security Gate
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [securityType, setSecurityType] = useState<"date" | "boolean" | "choice">("boolean");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityChoices, setSecurityChoices] = useState<string[]>(["", "", ""]);
  const [securityConfirmed, setSecurityConfirmed] = useState(false);

  // Customization: Intro Statement
  const [introEnabled, setIntroEnabled] = useState(false);
  const [introText, setIntroText] = useState("");
  const [introAnimation, setIntroAnimation] = useState<"typewriter" | "fade-float" | "pulse">("typewriter");
  const [introConfirmed, setIntroConfirmed] = useState(false);

  // Customization: Closing Statement
  const [closingEnabled, setClosingEnabled] = useState(false);
  const [closingText, setClosingText] = useState("");
  const [closingAnimation, setClosingAnimation] = useState<"typewriter" | "fade-float" | "pulse">("typewriter");
  const [closingConfirmed, setClosingConfirmed] = useState(false);

  // Customization: Date Invitation
  const [dateInviteEnabled, setDateInviteEnabled] = useState(false);
  const [dateInviteQuestion, setDateInviteQuestion] = useState("Will you go on a date with me? 🌹");
  const [dateInviteDate, setDateInviteDate] = useState("");
  const [dateInviteTime, setDateInviteTime] = useState("");
  const [dateInvitePlace, setDateInvitePlace] = useState("");
  const [dateInviteMapLink, setDateInviteMapLink] = useState("");
  const [dateInviteEmail, setDateInviteEmail] = useState("");
  const [dateInviteConfirmed, setDateInviteConfirmed] = useState(false);

  // Customization: Survey
  const [surveyEnabled, setSurveyEnabled] = useState(false);
  const [surveyType, setSurveyType] = useState<"emoji" | "text" | "both">("both");
  const [surveyQuestion, setSurveyQuestion] = useState("How does this letter make you feel?");
  const [surveyConfirmed, setSurveyConfirmed] = useState(false);

  // Customization: Send Later (Scheduled Release Date-Time)
  const [sendLaterEnabled, setSendLaterEnabled] = useState(false);
  const [sendLaterDate, setSendLaterDate] = useState("");
  const [sendLaterTime, setSendLaterTime] = useState("");

  // Flow Order state
  const [stepOrder, setStepOrder] = useState<string[]>(["security", "intro", "envelope", "dateInvite", "closing", "survey"]);

  // Share URL modal state
  const [shareUrl, setShareUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Romantic Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showRomanticAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  // Active steps list for visualizer reordering
  const activeSteps = stepOrder.filter((id) => {
    if (id === "envelope") return true;
    if (id === "security" && securityEnabled) return true;
    if (id === "intro" && introEnabled) return true;
    if (id === "dateInvite" && dateInviteEnabled) return true;
    if (id === "closing" && closingEnabled) return true;
    if (id === "survey" && surveyEnabled) return true;
    return false;
  });

  const getStepLabel = (id: string) => {
    switch (id) {
      case "security": return "🔒 Security Gate";
      case "intro": return "✨ Intro Statement";
      case "envelope": return "✉ Envelope & Letter [Core]";
      case "dateInvite": return "🌹 Date Invitation";
      case "closing": return "✍ Closing Statement (P.S.)";
      case "survey": return "📊 Survey";
      default: return id;
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newActive = [...activeSteps];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newActive.length) return;

    const stepId = newActive[index];
    const targetStepId = newActive[targetIdx];

    // Enforce Intro must be before Envelope
    if (stepId === "intro" && direction === "down" && targetStepId === "envelope") {
      showRomanticAlert("Patience, Sweetheart", "Just as a prologue sets the stage for a grand romance, the introductory statement must whisper its sweet words before the letter envelope is opened.");
      return;
    }
    if (stepId === "envelope" && direction === "up" && targetStepId === "intro") {
      showRomanticAlert("Patience, Sweetheart", "Just as a prologue sets the stage for a grand romance, the introductory statement must whisper its sweet words before the letter envelope is opened.");
      return;
    }

    // Enforce Closing must be after Envelope
    if (stepId === "closing" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Timing is Everything", "A postscript is like a lingering kiss at the end of a date; it should only be shared after your main letter has been read.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "closing") {
      showRomanticAlert("Timing is Everything", "A postscript is like a lingering kiss at the end of a date; it should only be shared after your main letter has been read.");
      return;
    }

    // Enforce Date Invitation must be after Envelope
    if (stepId === "dateInvite" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Let Love Unfold", "Let them read of your devotion first, darling. The date invitation is best saved as a sweet surprise after they read your letter.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "dateInvite") {
      showRomanticAlert("Let Love Unfold", "Let them read of your devotion first, darling. The date invitation is best saved as a sweet surprise after they read your letter.");
      return;
    }

    // Enforce Survey must always be last
    if (stepId === "survey" && direction === "up") {
      showRomanticAlert("A Final Thought", "The survey must remain the final chapter of this journey, asking how their heart beats after reading your words.");
      return;
    }
    if (targetStepId === "survey" && direction === "down") {
      showRomanticAlert("A Final Thought", "The survey must remain the final chapter of this journey, asking how their heart beats after reading your words.");
      return;
    }

    const temp = newActive[index];
    newActive[index] = newActive[targetIdx];
    newActive[targetIdx] = temp;

    const disabled = ["security", "intro", "envelope", "dateInvite", "closing", "survey"].filter(id => !newActive.includes(id));
    setStepOrder([...newActive, ...disabled]);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = document.getElementById("letter-body-textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      const newText = currentText.substring(0, start) + emoji + currentText.substring(end);
      setContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  const sanitizeForFirestore = (val: any): any => {
    if (val === undefined) return null;
    if (val === null) return null;
    if (Array.isArray(val)) {
      return val.map(sanitizeForFirestore);
    }
    if (typeof val === "object") {
      const sanitized: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          sanitized[key] = sanitizeForFirestore(val[key]);
        }
      }
      return sanitized;
    }
    return val;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Main Recipient Email
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        showRomanticAlert("A Misdirected Letter", "Every love letter deserves to find its way. Please provide a valid email format so your words reach the right heart.");
        return;
      }
    }

    // Validate Date Invitation Email
    if (dateInviteEnabled && dateInviteEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dateInviteEmail.trim())) {
        showRomanticAlert("Where to RSVP?", "To make your date perfect, please enter a valid email address so they can send their sweet RSVP confirmation back to you.");
        return;
      }
    }

    // Validations for enabled modifications
    if (securityEnabled && !securityQuestion.trim()) {
      showRomanticAlert("A Key to Your Heart", "To guard your secret romance, please write a security question that only your true love would know how to answer.");
      return;
    }
    if (securityEnabled && !securityAnswer.trim()) {
      showRomanticAlert("The Secret Phrase", "Every gate needs a key. Please specify the correct answer to unlock this secret letter.");
      return;
    }
    if (introEnabled && !introText.trim()) {
      showRomanticAlert("Speak Your Mind", "Do not leave them in suspense! Please write a sweet introductory statement to set their heart fluttering.");
      return;
    }
    if (dateInviteEnabled && !dateInviteQuestion.trim()) {
      showRomanticAlert("Ask the Question", "Don't be shy! Write a beautiful question to invite them on your dream date.");
      return;
    }
    if (dateInviteEnabled) {
      if (!dateInviteDate.trim()) {
        showRomanticAlert("Date Details", "To sweep them off their feet, make sure to specify a date for this romantic encounter.");
        return;
      }
      if (!dateInviteTime.trim()) {
        showRomanticAlert("Date Details", "To sweep them off their feet, make sure to specify a time for this romantic encounter.");
        return;
      }
      if (!dateInvitePlace.trim()) {
        showRomanticAlert("Date Details", "To sweep them off their feet, make sure to specify a place/location for this romantic encounter.");
        return;
      }
      if (!dateInviteEmail.trim()) {
        showRomanticAlert("Date Details", "To sweep them off their feet, make sure to specify the recipient's email address for RSVP confirmation.");
        return;
      }
    }
    if (closingEnabled && !closingText.trim()) {
      showRomanticAlert("One Last Word", "Please enter the closing statement or P.S. to leave a sweet, lasting memory.");
      return;
    }
    if (sendLaterEnabled) {
      if (!sendLaterDate || !sendLaterTime) {
        showRomanticAlert("Timing the Surprise", "To deliver this letter at the perfect moment, please specify both the release date and time.");
        return;
      }
    }

    // Auto-confirm blocks
    if (securityEnabled && !securityConfirmed) setSecurityConfirmed(true);
    if (introEnabled && !introConfirmed) setIntroConfirmed(true);
    if (dateInviteEnabled && !dateInviteConfirmed) setDateInviteConfirmed(true);
    if (closingEnabled && !closingConfirmed) setClosingConfirmed(true);

    // Combine send later date-time
    const finalSendLaterDate = sendLaterEnabled ? `${sendLaterDate}T${sendLaterTime}` : undefined;

    const letterData: LetterData = {
      recipient: recipient.trim() || "My Love",
      sender: sender.trim() || "Yours Truly",
      email: email.trim() || undefined,
      title: title.trim() || "A Secret Letter",
      content: content.trim() || "I love you.",
      theme,
      sealSymbol,
      sealColor,
      music,
      musicType: music ? musicType : undefined,
      musicUrl: music && musicType === "url" ? musicUrl : undefined,
      timestamp: Date.now(),
      greeting: greeting.trim(),
      farewell: farewell.trim(),
      sendLaterDate: finalSendLaterDate,
      security: securityEnabled ? {
        enabled: true,
        type: securityType,
        question: securityQuestion.trim(),
        answer: securityAnswer.trim().toLowerCase(),
        choices: securityType === "choice" ? securityChoices.map(c => c.trim()).filter(Boolean) : undefined
      } : undefined,
      intro: introEnabled ? {
        enabled: true,
        text: introText.trim().substring(0, 200),
        animation: introAnimation
      } : undefined,
      closing: closingEnabled ? {
        enabled: true,
        text: closingText.trim().substring(0, 200),
        animation: closingAnimation
      } : undefined,
      dateInvite: dateInviteEnabled ? {
        enabled: true,
        question: dateInviteQuestion.trim(),
        activity: dateInvitePlace.trim() || undefined,
        dateTime: `${dateInviteDate} at ${dateInviteTime}` || undefined,
        date: dateInviteDate.trim() || undefined,
        time: dateInviteTime.trim() || undefined,
        place: dateInvitePlace.trim() || undefined,
        mapLink: dateInviteMapLink.trim() || undefined,
        email: dateInviteEmail.trim() || undefined
      } : undefined,
      survey: surveyEnabled ? {
        enabled: true,
        type: surveyType,
        question: surveyQuestion.trim()
      } : undefined,
      stepOrder
    };

    const encoded = encodeLetterData(letterData);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    let generatedLink = `${origin}/letter?d=${encoded}`;
    let letterId = "";

    // Save history & Persist in DB
    if (typeof window !== "undefined") {
      if (user) {
        try {
          const sanitizedData = sanitizeForFirestore(letterData);
          const docRef = await addDoc(collection(db, "letters"), {
            userId: user.uid,
            read: false,
            readAt: null,
            ...sanitizedData
          });
          
          letterId = docRef.id;
          generatedLink = `${origin}/letter?d=${encoded}&id=${letterId}`;
          await updateDoc(docRef, { link: generatedLink });
        } catch (err) {
          console.error("Failed to save letter in Firestore:", err);
          showRomanticAlert("Connection Interrupted", "A gentle breeze swept through the studio and disrupted our connection. Please try sealing your letter again.");
          return;
        }
      }
    }

    setShareUrl(generatedLink);
    setShowModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading || !user || !recipientProfile) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying session...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", padding: "40px 20px" }}>
      <FloatingHearts />
      
      <main style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <Link 
            href="/dashboard"
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Dashboard
          </Link>
          <h1 
            style={{
              fontSize: "36px",
              fontWeight: "normal",
              fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px"
            }}
          >
            EverAfter Studio
          </h1>
          <div style={{ width: "80px" }}></div>
        </header>

        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
            gap: "40px",
            alignItems: "start"
          }}
        >
          {/* Form Editor */}
          <form 
            onSubmit={handleCreate}
            className="glass"
            style={{
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxHeight: "85vh",
              overflowY: "auto"
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 600, borderBottom: "1px solid var(--border-card)", paddingBottom: "12px", color: "var(--text-main)" }}>
              Write Your Letter
            </h2>

            {user && recipientProfile ? null : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Recipient Name</label>
                    <input 
                      type="text" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. My Sweetheart"
                      maxLength={40}
                      required
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Sender Name</label>
                    <input 
                      type="text" 
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      placeholder="e.g. Your Love"
                      maxLength={40}
                      required
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#fff",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                    Recipient's Email Address (Optional)
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="e.g. beloved@example.com"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: emailError ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "#fff",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  {emailError && (
                    <span style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>
                      ⚠️ {emailError}
                    </span>
                  )}
                </div>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Greeting Prefix</label>
                <input 
                  type="text" 
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="e.g. Dearest"
                  maxLength={40}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Farewell / Sign-off</label>
                <input 
                  type="text" 
                  value={farewell}
                  onChange={(e) => setFarewell(e.target.value)}
                  placeholder="e.g. With all my love,"
                  maxLength={40}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "8px",
                    padding: "12px",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Body</label>
                
                {/* Emoji Selectors bar */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    {["❤️", "🥰", "🌹", "✨", "😘"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "16px",
                          cursor: "pointer",
                          padding: "2px",
                          transition: "transform 0.1s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <EmojiPicker onSelect={handleInsertEmoji} />
                </div>
              </div>
              <textarea 
                id="letter-body-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your feelings here..."
                required
                rows={6}
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  outline: "none",
                  resize: "vertical",
                  minHeight: "120px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border-card)", paddingTop: "20px" }}>
              
              {/* Stationery theme selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Stationery Style</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: theme === t.id ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                        background: theme === t.id ? "rgba(255, 75, 114, 0.08)" : "transparent",
                        color: theme === t.id ? "#fff" : "var(--text-muted)",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seal designs selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Wax Seal Design</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {SYMBOLS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSealSymbol(s.id)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: sealSymbol === s.id ? "2px solid var(--accent-rose)" : "1px solid var(--border-card)",
                          background: sealSymbol === s.id ? "rgba(255, 75, 114, 0.1)" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                        }}
                        title={s.name}
                      >
                        {s.char}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Wax Seal Color</label>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {WAX_SEAL_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSealColor(c.value)}
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: c.value,
                          border: sealColor === c.value ? "2px solid #fff" : "1px solid rgba(0,0,0,0.3)",
                          cursor: "pointer",
                          transform: sealColor === c.value ? "scale(1.15)" : "scale(1)",
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Music Configurators Panel */}
              <MusicCreator 
                music={music}
                setMusic={setMusic}
                musicType={musicType}
                setMusicType={setMusicType}
                musicUrl={musicUrl}
                setMusicUrl={setMusicUrl}
              />
            </div>

            {/* Customization Accordion Panels */}
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                Optional Customizations
              </h3>

              {/* 1. Security Gate */}
              <SecurityGateCreator 
                securityEnabled={securityEnabled}
                setSecurityEnabled={setSecurityEnabled}
                securityType={securityType}
                setSecurityType={setSecurityType}
                securityQuestion={securityQuestion}
                setSecurityQuestion={setSecurityQuestion}
                securityAnswer={securityAnswer}
                setSecurityAnswer={setSecurityAnswer}
                securityChoices={securityChoices}
                setSecurityChoices={setSecurityChoices}
                securityConfirmed={securityConfirmed}
                setSecurityConfirmed={setSecurityConfirmed}
                showAlert={showRomanticAlert}
              />

              {/* 2. Introductory Statement */}
              <IntroCreator 
                introEnabled={introEnabled}
                setIntroEnabled={setIntroEnabled}
                introText={introText}
                setIntroText={setIntroText}
                introAnimation={introAnimation}
                setIntroAnimation={setIntroAnimation}
                introConfirmed={introConfirmed}
                setIntroConfirmed={setIntroConfirmed}
                showAlert={showRomanticAlert}
              />

              {/* 3. Closing Statement */}
              <ClosingCreator 
                closingEnabled={closingEnabled}
                setClosingEnabled={setClosingEnabled}
                closingText={closingText}
                setClosingText={setClosingText}
                closingAnimation={closingAnimation}
                setClosingAnimation={setClosingAnimation}
                closingConfirmed={closingConfirmed}
                setClosingConfirmed={setClosingConfirmed}
                showAlert={showRomanticAlert}
              />

              {/* 4. Date Invitation */}
              <DateInviteCreator 
                dateInviteEnabled={dateInviteEnabled}
                setDateInviteEnabled={setDateInviteEnabled}
                dateInviteQuestion={dateInviteQuestion}
                setDateInviteQuestion={setDateInviteQuestion}
                dateInviteDate={dateInviteDate}
                setDateInviteDate={setDateInviteDate}
                dateInviteTime={dateInviteTime}
                setDateInviteTime={setDateInviteTime}
                dateInvitePlace={dateInvitePlace}
                setDateInvitePlace={setDateInvitePlace}
                dateInviteMapLink={dateInviteMapLink}
                setDateInviteMapLink={setDateInviteMapLink}
                dateInviteEmail={dateInviteEmail}
                setDateInviteEmail={setDateInviteEmail}
                dateInviteConfirmed={dateInviteConfirmed}
                setDateInviteConfirmed={setDateInviteConfirmed}
                sender={sender}
                recipient={recipient}
                showAlert={showRomanticAlert}
              />

              {/* 5. Survey */}
              <SurveyCreator 
                surveyEnabled={surveyEnabled}
                setSurveyEnabled={setSurveyEnabled}
                surveyQuestion={surveyQuestion}
                setSurveyQuestion={setSurveyQuestion}
                surveyType={surveyType}
                setSurveyType={setSurveyType}
                surveyConfirmed={surveyConfirmed}
                setSurveyConfirmed={setSurveyConfirmed}
                showAlert={showRomanticAlert}
              />

              {/* 6. Send Later */}
              <SendLaterCreator 
                sendLaterEnabled={sendLaterEnabled}
                setSendLaterEnabled={setSendLaterEnabled}
                sendLaterDate={sendLaterDate}
                setSendLaterDate={setSendLaterDate}
                sendLaterTime={sendLaterTime}
                setSendLaterTime={setSendLaterTime}
              />
            </div>

            {/* Visual Step Orderer timeline */}
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                  Customization Sequence Flow
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Rearrange the timeline flow of the recipient's love letter journey.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                {activeSteps.map((stepId, idx) => (
                  <div key={stepId} className="customizer-step-item">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span 
                        style={{ 
                          width: "22px", 
                          height: "22px", 
                          borderRadius: "50%", 
                          backgroundColor: stepId === "envelope" ? "var(--accent-rose)" : "rgba(255,255,255,0.08)", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>
                        {getStepLabel(stepId)}
                      </span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        type="button"
                        onClick={() => moveStep(idx, "up")}
                        disabled={idx === 0}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          opacity: idx === 0 ? 0.25 : 0.7,
                          padding: "4px 8px",
                          fontSize: "13px"
                        }}
                        title="Move Step Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(idx, "down")}
                        disabled={idx === activeSteps.length - 1}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: idx === activeSteps.length - 1 ? "not-allowed" : "pointer",
                          opacity: idx === activeSteps.length - 1 ? 0.25 : 0.7,
                          padding: "4px 8px",
                          fontSize: "13px"
                        }}
                        title="Move Step Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seal Envelope Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(255, 75, 114, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s",
                marginTop: "12px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
              Seal Envelope & Get Link
            </button>
          </form>

          {/* Stationery Page Live Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>LIVE PREVIEW (STATIONERY VIEW)</span>
              <span 
                style={{ 
                  fontSize: "11px", 
                  backgroundColor: "rgba(156, 108, 250, 0.15)", 
                  color: "var(--accent-purple)", 
                  padding: "3px 8px", 
                  borderRadius: "12px",
                  border: "1px solid rgba(156, 108, 250, 0.25)" 
                }}
              >
                Live Editor
              </span>
            </div>

            <div
              className={`theme-${theme}`}
              style={{
                width: "100%",
                minHeight: "560px",
                backgroundColor: "var(--stationery-bg)",
                backgroundImage: "var(--bg-image)",
                border: "1px solid var(--stationery-border)",
                borderRadius: "16px",
                boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                color: "var(--stationery-text)",
                fontFamily: "var(--stationery-font)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "all 0.4s ease",
              }}
            >
              <div 
                style={{
                  height: "10px",
                  background: `repeating-linear-gradient(45deg, 
                    var(--stationery-accent), 
                    var(--stationery-accent) 15px, 
                    var(--stationery-bg) 15px, 
                    var(--stationery-bg) 30px, 
                    #ff4b72 30px, 
                    #ff4b72 45px, 
                    var(--stationery-bg) 45px, 
                    var(--stationery-bg) 60px
                  )`,
                }}
              />

              <div style={{ padding: "36px 36px 28px 36px", display: "flex", flexDirection: "column", flex: 1, gap: "20px" }}>
                <div style={{ fontSize: "16px", fontStyle: "italic", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "6px", color: "var(--stationery-accent)" }}>
                  {greeting ? `${greeting} ` : ""}{recipient || "My Love"},
                </div>

                <div style={{ fontSize: theme === "rose" ? "26px" : "15px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "var(--stationery-text)", flex: 1 }}>
                  {content || "Start writing your letter in the form on the left. Tell them how much you love them, share a beautiful memory, or write a poem. Your words will appear here in real-time as you write..."}
                </div>

                <div style={{ textAlign: "right", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                  {farewell && (
                    <div style={{ fontSize: "13px", fontStyle: "italic", opacity: 0.7, marginBottom: "4px" }}>
                      {farewell}
                    </div>
                  )}
                  <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--stationery-accent)", marginTop: "4px" }}>
                    {sender || "Yours Truly"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Share Link Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: "rgba(11, 7, 17, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "40px 30px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: sealColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                color: "rgba(0,0,0,0.35)",
                boxShadow: `0 8px 24px ${sealColor}66, inset 0 2px 4px rgba(255,255,255,0.2)`,
                transform: "rotate(-10deg)",
              }}
            >
              {sealSymbol === "heart" && "❤"}
              {sealSymbol === "rose" && "🌹"}
              {sealSymbol === "star" && "⭐"}
              {sealSymbol === "ring" && "💍"}
            </div>

            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Letter Sealed!</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Your love letter has been converted into a magical, portable link containing all customizations. Send it to your special someone!
              </p>
            </div>

            <div
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  outline: "none",
                  width: "100%",
                  textOverflow: "ellipsis",
                }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  background: copied ? "#2ec4b6" : "var(--accent-rose)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
              <Link
                href="/dashboard"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-card)",
                  background: "transparent",
                  color: "var(--text-main)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                Back to Dashboard
              </Link>
              
              <Link
                href={`${shareUrl.replace(typeof window !== "undefined" ? window.location.origin : "", "")}&preview=true`}
                target="_blank"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "var(--accent-purple)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)",
                }}
              >
                Preview Letter
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {alertOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            backgroundColor: "rgba(11, 7, 17, 0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass animate-reveal"
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "40px 30px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
              borderRadius: "16px"
            }}
          >
            <span style={{ fontSize: "40px", animation: "heartbeat-survey 1.5s infinite" }}>💖</span>
            <div>
              <h3 
                style={{ 
                  fontSize: "22px", 
                  fontWeight: "normal", 
                  fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
                  color: "var(--accent-rose)",
                  marginBottom: "10px"
                }}
              >
                {alertTitle}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                {alertMessage}
              </p>
            </div>
            <button
              onClick={() => setAlertOpen(false)}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
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
              Close 💌
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

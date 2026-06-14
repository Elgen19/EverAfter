"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { encodeLetterData, LetterData } from "@/utils/encoding";
import FloatingHearts from "@/components/FloatingHearts";
import { db, storage } from "@/utils/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import Envelope from "@/components/Envelope";
import SealingAnimation from "@/components/creator/SealingAnimation";

// Import modular configurators
import EmojiPicker from "@/components/creator/EmojiPicker";
import SecurityGateCreator from "@/components/creator/SecurityGateCreator";
import IntroCreator from "@/components/creator/IntroCreator";
import ClosingCreator from "@/components/creator/ClosingCreator";
import DateInviteCreator from "@/components/creator/DateInviteCreator";
import SurveyCreator from "@/components/creator/SurveyCreator";
import MusicCreator from "@/components/creator/MusicCreator";
import SendLaterCreator from "@/components/creator/SendLaterCreator";
import AudioMessageCreator from "@/components/creator/AudioMessageCreator";

const WAX_SEAL_COLORS = [
  { name: "Vintage Crimson", value: "#9c1c2e" },
  { name: "Deep Burgundy", value: "#5e0b1c" },
  { name: "Antique Gold", value: "#b38f36" },
  { name: "Midnight Navy", value: "#1b264f" },
  { name: "Sage Green", value: "#526e5b" },
  { name: "Dusty Rose", value: "#8c6b8c" }
];

const THEMES = [
  { id: "royal", name: "Royal Gilt", desc: "Gold vine patterns, burgundy accents, and a royal crown crest" },
  { id: "scroll", name: "Royal Scroll", desc: "3D wooden scroll rollers and wavy deckle edges" },
  { id: "blush", name: "Blush Rose Gold", desc: "Soft cream paper, double-line borders, and rose-gold script" },
  { id: "lavender", name: "Lavender Dream", desc: "Serene violet paper with ruled notebook lines" },
  { id: "celestial", name: "Celestial Night", desc: "Indigo glass on starry sky landscapes" }
];

const SYMBOLS = [
  { id: "heart", char: "❤", name: "Heart" },
  { id: "rose", char: "🌹", name: "Rose" },
  { id: "star", char: "⭐", name: "Star" },
  { id: "ring", char: "💍", name: "Ring" }
];

const BACKDROPS = [
  { id: "none", name: "No Backdrop", desc: "Solid theme background" },
  { id: "campfire", name: "Campfire Night", desc: "Couples stargazing near a warm campfire" },
  { id: "ocean_sunset", name: "Ocean Sunset", desc: "A warm walk along a sandy beach at sunset" },
  { id: "cozy_cafe", name: "Cozy Café", desc: "Warm city lights through a rainy window" },
  { id: "cherry_blossoms", name: "Cherry Blossoms", desc: "Dreamy cherry blossom trees path in full bloom" },
  { id: "vintage_library", name: "Vintage Library", desc: "Bookshelves, leather chairs, and fireplace" }
];

const BACKDROP_PREVIEWS: Record<string, string> = {
  campfire: "/campfire_letter.png",
  ocean_sunset: "/ocean_sunset.png",
  cozy_cafe: "/cozy_cafe.png",
  cherry_blossoms: "/cherry_blossoms.png",
  vintage_library: "/vintage_library.png",
};

function CreateLetterStudio() {
  const router = useRouter();
  const { user, recipient: recipientProfile, loading } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isWriteback = searchParams.get("writeback") === "true";
  const queryTo = searchParams.get("to") || "";
  const queryFrom = searchParams.get("from") || "";
  const queryRecipientUid = searchParams.get("recipientUid") || "";
  const queryReplyToId = searchParams.get("replyToId") || "";

  // Preview options state
  const [previewMode, setPreviewMode] = useState<"letter" | "envelope">("letter");
  const [envelopeResetKey, setEnvelopeResetKey] = useState(0);

  // Email sending states
  const [emailToSend, setEmailToSend] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [sendViaEmail, setSendViaEmail] = useState(false);

  // Core Form state
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Love Letter");

  // Guard routing checks
  useEffect(() => {
    if (!loading) {
      if (!user && !isWriteback) {
        router.push("/login");
      } else if (user && !recipientProfile && !isWriteback) {
        router.push("/recipient-setup");
      }
    }
  }, [user, recipientProfile, loading, router, isWriteback]);

  const getSenderFirstName = () => {
    if (!user) return "";
    const name = user.displayName || user.email.split("@")[0];
    let cleanName = name.replace(/[._-]/g, " ").trim();
    cleanName = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };

  // Pre-populate recipient name, sender name, and email from setup profile
  useEffect(() => {
    if (recipientProfile && user && !isWriteback) {
      const recName = recipientProfile.firstName || "";
      let cleanRec = recName.replace(/[._-]/g, " ").trim();
      cleanRec = cleanRec.replace(/([a-z])([A-Z])/g, "$1 $2");
      const firstRec = cleanRec.split(/\s+/)[0] || "";
      
      setRecipient(firstRec);
      setSender(getSenderFirstName());
      setEmail(recipientProfile.email);
    }
  }, [recipientProfile, user, isWriteback]);

  // Pre-populate writeback names if replying
  useEffect(() => {
    if (isWriteback) {
      if (queryTo) setRecipient(queryTo);
      if (queryFrom) setSender(queryFrom);
      setTitle(`Reply to ${queryTo || "My Love"}`);
    }
  }, [isWriteback, queryTo, queryFrom]);


  const [emailError, setEmailError] = useState("");
  const [showSealingAnimation, setShowSealingAnimation] = useState(false);
  const [savePromise, setSavePromise] = useState<Promise<string> | null>(null);
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("scroll");
  const [backdrop, setBackdrop] = useState("none");
  const [sealSymbol, setSealSymbol] = useState("heart");
  const [sealColor, setSealColor] = useState("#9c1c2e");
  const [envelopeStyle, setEnvelopeStyle] = useState("vintage-rose");
  
  // Predefine seal color & symbol depending on the envelope style
  useEffect(() => {
    if (envelopeStyle === "vintage-white") {
      setSealColor("#9c1c2e");
      setSealSymbol("rose");
    } else if (envelopeStyle === "celestial-blue") {
      setSealColor("#b76e79");
      setSealSymbol("heart");
    } else {
      setSealColor("#b38f36");
      setSealSymbol("rose");
    }
  }, [envelopeStyle]);
  
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

  // Customization: Audio Message
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioCustomMessage, setAudioCustomMessage] = useState("Listen to my voice... ❤️");
  const [audioConfirmed, setAudioConfirmed] = useState(false);

  // Flow Order state
  const [stepOrder, setStepOrder] = useState<string[]>(["security", "intro", "envelope", "audioMessage", "dateInvite", "closing", "survey"]);

  // Load existing letter details if editing
  useEffect(() => {
    if (!editId || !db || !user) return;
    const loadLetter = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "letters", editId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId === user.uid) {
            setRecipient(data.recipient || "");
            setSender(data.sender || "");
            setTitle(data.title || "Love Letter");
            setContent(data.content || "");
            setTheme(data.theme || "scroll");
            setBackdrop(data.backdrop || "none");
            setSealSymbol(data.sealSymbol || "heart");
            setSealColor(data.sealColor || "#9c1c2e");
            setEnvelopeStyle(data.envelopeStyle || "vintage-rose");
            
            setMusic(data.music || false);
            if (data.musicType) setMusicType(data.musicType);
            if (data.musicUrl) setMusicUrl(data.musicUrl);
            
            setGreeting(data.greeting || "");
            setFarewell(data.farewell || "");
            
            if (data.security) {
              setSecurityEnabled(data.security.enabled || false);
              setSecurityType(data.security.type || "boolean");
              setSecurityQuestion(data.security.question || "");
              setSecurityAnswer(data.security.answer || "");
              setSecurityChoices(data.security.choices || []);
              setSecurityConfirmed(true);
            }
            if (data.intro) {
              setIntroEnabled(data.intro.enabled || false);
              setIntroText(data.intro.text || "");
              setIntroAnimation(data.intro.animation || "typewriter");
              setIntroConfirmed(true);
            }
            if (data.closing) {
              setClosingEnabled(data.closing.enabled || false);
              setClosingText(data.closing.text || "");
              setClosingAnimation(data.closing.animation || "typewriter");
              setClosingConfirmed(true);
            }
            if (data.survey) {
              setSurveyEnabled(data.survey.enabled || false);
              setSurveyType(data.survey.type || "both");
              setSurveyQuestion(data.survey.question || "");
              setSurveyConfirmed(true);
            }
            if (data.dateInvite) {
              setDateInviteEnabled(data.dateInvite.enabled || false);
              setDateInviteQuestion(data.dateInvite.question || "");
              setDateInviteDate(data.dateInvite.date || "");
              setDateInviteTime(data.dateInvite.time || "");
              setDateInvitePlace(data.dateInvite.place || "");
              setDateInviteMapLink(data.dateInvite.mapLink || "");
              setDateInviteEmail(data.dateInvite.email || "");
              setDateInviteConfirmed(true);
            }
            if (data.sendLaterDate) {
              setSendLaterEnabled(true);
              const [dVal, tVal] = data.sendLaterDate.split("T");
              setSendLaterDate(dVal || "");
              setSendLaterTime(tVal || "");
            }
            if (data.audioMessage) {
              setAudioEnabled(data.audioMessage.enabled || false);
              setAudioUrl(data.audioMessage.audioUrl || "");
              setAudioCustomMessage(data.audioMessage.customMessage || "");
              setAudioConfirmed(true);
            }
            if (data.stepOrder) {
              const loadedOrder = [...data.stepOrder];
              if (!loadedOrder.includes("audioMessage")) {
                const envIdx = loadedOrder.indexOf("envelope");
                if (envIdx !== -1) {
                  loadedOrder.splice(envIdx + 1, 0, "audioMessage");
                } else {
                  loadedOrder.push("audioMessage");
                }
              }
              setStepOrder(loadedOrder);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load letter for editing:", err);
      }
    };
    loadLetter();
  }, [editId, db, user]);

  const previewBackdropUrl = backdrop && backdrop !== "none"
    ? BACKDROP_PREVIEWS[backdrop]
    : (theme === "celestial" ? "/campfire_letter.png" : "");

  const hasBackdrop = (backdrop && backdrop !== "none") || theme === "celestial";

  const getGlassyBg = () => {
    if (!hasBackdrop) return "var(--stationery-bg)";
    switch (theme) {
      case "royal": return "rgba(247, 241, 227, 0.55)";
      case "scroll": return "rgba(237, 220, 185, 0.55)";
      case "blush": return "rgba(255, 253, 247, 0.5)";
      case "lavender": return "rgba(247, 244, 252, 0.5)";
      case "celestial":
      default:
        return "rgba(9, 14, 36, 0.45)";
    }
  };

  const getGlassyBorder = () => {
    if (!hasBackdrop) return "var(--stationery-border)";
    switch (theme) {
      case "royal": return "rgba(201, 162, 39, 0.5)";
      case "scroll": return "rgba(92, 56, 31, 0.5)";
      case "blush": return "rgba(183, 110, 121, 0.5)";
      case "lavender": return "rgba(232, 219, 248, 0.45)";
      case "celestial":
      default:
        return "rgba(226, 184, 87, 0.25)";
    }
  };

  const getSolidBg = () => {
    switch (theme) {
      case "royal": return "#F7F1E3";
      case "scroll": return "#eddcb9";
      case "blush": return "#FFFDF7";
      case "lavender": return "#f7f4fc";
      case "celestial":
      default:
        return "#090e24";
    }
  };
  const solidBg = getSolidBg();

  // Share URL modal state
  const [shareUrl, setShareUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Romantic Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [lastShowModalState, setLastShowModalState] = useState(false);

  const showRomanticAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setLastShowModalState(showModal);
    if (showModal) {
      setShowModal(false);
    }
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
    if (lastShowModalState) {
      setShowModal(true);
      setLastShowModalState(false);
    }
  };

  // Active steps list for visualizer reordering
  const activeSteps = stepOrder.filter((id) => {
    if (id === "envelope") return true;
    if (id === "security" && securityEnabled && securityConfirmed) return true;
    if (id === "intro" && introEnabled && introConfirmed) return true;
    if (id === "audioMessage" && audioEnabled && audioConfirmed) return true;
    if (id === "dateInvite" && dateInviteEnabled && dateInviteConfirmed) return true;
    if (id === "closing" && closingEnabled && closingConfirmed) return true;
    if (id === "survey" && surveyEnabled && surveyConfirmed) return true;
    return false;
  });

  const getStepLabel = (id: string) => {
    switch (id) {
      case "security": return "🔒 Security Gate";
      case "intro": return "✨ Intro Statement";
      case "envelope": return "✉ Envelope & Letter [Core]";
      case "audioMessage": return "🎤 Audio Message";
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

    // Enforce Audio Message must be after Envelope
    if (stepId === "audioMessage" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Let Love Unfold", "Let them read your letter first, darling. The voice message is best heard after they read your written words.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "audioMessage") {
      showRomanticAlert("Let Love Unfold", "Let them read your letter first, darling. The voice message is best heard after they read your written words.");
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

    const disabled = ["security", "intro", "envelope", "audioMessage", "dateInvite", "closing", "survey"].filter(id => !newActive.includes(id));
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

    if (sendViaEmail && !email.trim()) {
      showRomanticAlert("Email Required", "Please enter your recipient's email address to send the letter automatically.");
      return;
    }

    // Validate Date Invitation Email
    if (dateInviteEnabled && dateInviteEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dateInviteEmail.trim())) {
        showRomanticAlert("Where to RSVP?", "To make your date perfect, please enter a valid email address so they can send their sweet RSVP confirmation back to you.");
        return;
      }
    }

    // Check if enabled modifications are explicitly confirmed
    if (securityEnabled && !securityConfirmed) {
      showRomanticAlert("Confirm Your Security Gate", "You have enabled the security gate. Please press the 'Confirm Security' button to lock this customization in before sealing.");
      return;
    }
    if (introEnabled && !introConfirmed) {
      showRomanticAlert("Confirm Your Introduction", "You have enabled the introductory statement. Please press the 'Confirm Intro' button to lock this customization in before sealing.");
      return;
    }
    if (audioEnabled && !audioConfirmed) {
      showRomanticAlert("Confirm Your Audio Message", "You have enabled the audio message. Please press the 'Confirm Audio' button to lock this customization in before sealing.");
      return;
    }
    if (dateInviteEnabled && !dateInviteConfirmed) {
      showRomanticAlert("Confirm Your Date Invitation", "You have enabled the date invitation. Please press the 'Confirm Invitation' button to lock this customization in before sealing.");
      return;
    }
    if (closingEnabled && !closingConfirmed) {
      showRomanticAlert("Confirm Your Closing Statement", "You have enabled the closing statement. Please press the 'Confirm Closing' button to lock this customization in before sealing.");
      return;
    }
    if (surveyEnabled && !surveyConfirmed) {
      showRomanticAlert("Confirm Your Survey", "You have enabled the feedback survey. Please press the 'Confirm Survey' button to lock this customization in before sealing.");
      return;
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

      const checkNow = new Date();
      const checkYear = checkNow.getFullYear();
      const checkMonth = String(checkNow.getMonth() + 1).padStart(2, '0');
      const checkDay = String(checkNow.getDate()).padStart(2, '0');
      const checkLocalTodayStr = `${checkYear}-${checkMonth}-${checkDay}`;

      if (dateInviteDate < checkLocalTodayStr) {
        showRomanticAlert("Invalid Invitation Date", "The proposed invitation date cannot be in the past. Please choose today or a future date.");
        return;
      }

      const selectedDateTime = new Date(`${dateInviteDate}T${dateInviteTime}`);
      const minAllowedDateTime = new Date(checkNow.getTime() + 60 * 60 * 1000); // 1 hour from now

      if (selectedDateTime < minAllowedDateTime) {
        if (dateInviteDate === checkLocalTodayStr) {
          showRomanticAlert("Invalid Invitation Time", "The proposed invitation time must be at least 1 hour in the future from now to allow the receiver ample time to prepare.");
        } else {
          showRomanticAlert("Invalid Invitation Date & Time", "The proposed date and time must be at least 1 hour in the future from now.");
        }
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

    // Combine send later date-time
    const finalSendLaterDate = sendLaterEnabled ? `${sendLaterDate}T${sendLaterTime}` : undefined;

    const letterData: LetterData = {
      recipient: recipient.trim() || "My Love",
      sender: sender.trim() || "Yours Truly",
      email: email.trim() || undefined,
      title: title.trim() || "A Secret Letter",
      content: content.trim() || "I love you.",
      theme,
      backdrop,
      sealSymbol,
      sealColor,
      envelopeStyle,
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
      audioMessage: audioEnabled ? {
        enabled: true,
        audioUrl: audioUrl || undefined,
        customMessage: audioCustomMessage.trim() || undefined
      } : undefined,
      stepOrder
    };

    const letterDataForEncoding = { ...letterData };
    if (letterDataForEncoding.audioMessage) {
      letterDataForEncoding.audioMessage = {
        ...letterDataForEncoding.audioMessage,
        audioUrl: undefined
      };
    }
    const encoded = encodeLetterData(letterDataForEncoding);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const localGeneratedLink = `${origin}/letter?d=${encoded}`;

    // 1. Trigger sealing animation immediately without delay!
    setShareUrl(localGeneratedLink);
    setShowSealingAnimation(true);

    // 2. Perform Firestore save / file upload concurrently in the background
    const runBackgroundSave = async () => {
      let finalLink = localGeneratedLink;
      if (typeof window !== "undefined") {
        if (user || (isWriteback && queryRecipientUid)) {
          const sanitizedData = sanitizeForFirestore(letterData);
          if (editId) {
            const docRef = doc(db, "letters", editId);
            let finalAudioUrl = audioUrl;

            if (audioEnabled && audioFile) {
              const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
              const storageRef = ref(storage, `letters/${editId}/audio_message`);
              const snapshot = await uploadBytes(storageRef, audioFile);
              finalAudioUrl = await getDownloadURL(snapshot.ref);
              
              if (sanitizedData.audioMessage) {
                sanitizedData.audioMessage.audioUrl = finalAudioUrl;
              }
            }

            await updateDoc(docRef, { 
              senderEmail: user?.email || null,
              ...sanitizedData 
            });
            const letterId = editId;
            finalLink = `${origin}/letter?d=${encoded}&id=${letterId}`;
            await updateDoc(docRef, { link: finalLink });
          } else {
            const initialSanitizedData = { ...sanitizedData };
            if (audioEnabled && audioFile && initialSanitizedData.audioMessage) {
              initialSanitizedData.audioMessage.audioUrl = null;
            }

            const docRef = await addDoc(collection(db, "letters"), {
              userId: queryRecipientUid || user?.uid || "",
              senderEmail: user?.email || null,
              isWriteback: isWriteback,
              read: false,
              readAt: null,
              ...initialSanitizedData
            });
            const letterId = docRef.id;

            if (audioEnabled && audioFile) {
              const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
              const storageRef = ref(storage, `letter/${letterId}/audio_message`);
              const snapshot = await uploadBytes(storageRef, audioFile);
              const finalAudioUrl = await getDownloadURL(snapshot.ref);
              
              await updateDoc(docRef, { 
                "audioMessage.audioUrl": finalAudioUrl 
              });
            }

            finalLink = `${origin}/letter?d=${encoded}&id=${letterId}`;
            await updateDoc(docRef, { link: finalLink });
          }
        }
      }
      return finalLink;
    };

    const promise = runBackgroundSave();
    setSavePromise(promise);
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

  const handleSendEmail = async () => {
    if (!emailToSend.trim()) return;
    setSendingEmail(true);
    setEmailStatus("Sending letter invitation...");
    try {
      const res = await fetch("/api/send-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipientEmail: emailToSend.trim(),
          letterLink: shareUrl,
          senderName: sender.trim() || "Yours Truly",
          recipientName: recipient.trim() || "My Love",
          title: title.trim() || "A Love Letter"
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("✓ Email sent successfully!");
        
        let letterId = null;
        if (shareUrl && shareUrl.includes("&id=")) {
          letterId = shareUrl.split("&id=")[1]?.split("&")[0];
        }
        
        if (db && letterId) {
          const docRef = doc(db, "letters", letterId);
          await updateDoc(docRef, { 
            email: emailToSend.trim(),
            emailSent: true 
          });
        }
        
        setEmailToSend("");
      } else {
        setEmailStatus("Failed to send email. Please try again.");
      }
    } catch (err) {
      console.error("Failed to send email:", err);
      setEmailStatus("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
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
    <div className="studio-container" style={{ minHeight: "100vh", position: "relative", padding: "40px 20px" }}>
      <FloatingHearts />
      <style>{`
        @media (min-width: 992px) {
          .studio-container {
            height: 100vh !important;
            overflow: hidden !important;
            padding: 20px 20px 10px 20px !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .studio-main {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            flex: 1 !important;
            overflow: hidden !important;
          }
          .studio-grid {
            display: grid !important;
            grid-template-columns: 1fr 1.15fr !important;
            flex: 1 !important;
            overflow: hidden !important;
            align-items: stretch !important;
            gap: 30px !important;
            padding-bottom: 15px !important;
          }
          .studio-form {
            height: 100% !important;
            max-height: none !important;
          }
          .studio-preview-col {
            height: 100% !important;
            overflow: hidden !important;
            position: static !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .studio-preview-wrapper {
            flex: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .studio-preview-card {
            width: 100% !important;
            height: 100% !important;
            max-height: calc(100vh - 180px) !important;
          }
        }
      `}</style>
      
      <main className="studio-main" style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        <header className="studio-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
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
          <div className="studio-header-spacer" style={{ width: "80px" }}></div>
        </header>

        <div 
          className="studio-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))",
            gap: "40px",
            alignItems: "start"
          }}
        >
          {/* Form Editor */}
          <form 
            onSubmit={handleCreate}
            className="glass studio-form hide-scrollbar"
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

              {/* Page Backdrop selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Letter Page Backdrop</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {BACKDROPS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBackdrop(b.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: backdrop === b.id ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                        background: backdrop === b.id ? "rgba(255, 75, 114, 0.08)" : "transparent",
                        color: backdrop === b.id ? "#fff" : "var(--text-muted)",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>{b.name}</div>
                      <div style={{ fontSize: "11px", opacity: 0.7 }}>{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Envelope Style & Animation Selection */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Envelope Style & Animation</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setEnvelopeStyle("vintage-rose")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: envelopeStyle === "vintage-rose" ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      background: envelopeStyle === "vintage-rose" ? "rgba(255, 75, 114, 0.08)" : "transparent",
                      color: envelopeStyle === "vintage-rose" ? "#fff" : "var(--text-muted)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>🌹 Vintage Rose</div>
                    <div style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}>Classic vintage parchment envelope with a gold wax seal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvelopeStyle("vintage-white")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: envelopeStyle === "vintage-white" ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      background: envelopeStyle === "vintage-white" ? "rgba(255, 75, 114, 0.08)" : "transparent",
                      color: envelopeStyle === "vintage-white" ? "#fff" : "var(--text-muted)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>✉ Vintage Lace</div>
                    <div style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}>Elegant white linen envelope with a ruby red wax seal</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvelopeStyle("celestial-blue")}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: envelopeStyle === "celestial-blue" ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      background: envelopeStyle === "celestial-blue" ? "rgba(255, 75, 114, 0.08)" : "transparent",
                      color: envelopeStyle === "celestial-blue" ? "#fff" : "var(--text-muted)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "2px" }}>✨ Starry Night</div>
                    <div style={{ fontSize: "11px", opacity: 0.7, lineHeight: "1.3" }}>Midnight blue constellation envelope with a blush heart wax seal</div>
                  </button>
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

              {/* 6. Audio Message */}
              {!user ? (
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px dashed var(--border-card)", borderRadius: "10px", padding: "16px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                  🎤 Voice recording replies require an account. <Link href="/login" style={{ color: "var(--accent-rose)", fontWeight: "bold", textDecoration: "none" }}>Log in or Sign up</Link> to seal audio messages!
                </div>
              ) : (
                <AudioMessageCreator
                  audioEnabled={audioEnabled}
                  setAudioEnabled={setAudioEnabled}
                  audioUrl={audioUrl}
                  setAudioUrl={setAudioUrl}
                  audioFile={audioFile}
                  setAudioFile={setAudioFile}
                  audioCustomMessage={audioCustomMessage}
                  setAudioCustomMessage={setAudioCustomMessage}
                  audioConfirmed={audioConfirmed}
                  setAudioConfirmed={setAudioConfirmed}
                  showAlert={showRomanticAlert}
                />
              )}

              {/* 7. Send Later */}
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

            {/* Delivery Options */}
            <div style={{ borderTop: "1px solid var(--border-card)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-main)" }}>
                Delivery Options
              </h3>
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "12px",
                  background: "rgba(255, 255, 255, 0.02)", 
                  border: "1px solid var(--border-card)", 
                  borderRadius: "10px", 
                  padding: "16px" 
                }}
              >
                <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={sendViaEmail} 
                    onChange={(e) => setSendViaEmail(e.target.checked)}
                    style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "var(--accent-rose)" }}
                  />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", display: "block" }}>
                      Send letter via email automatically on seal ✉️
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                      We will automatically email the secure letter link to the recipient once you seal it.
                    </span>
                  </div>
                </label>

                {sendViaEmail && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Recipient's Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. partner@example.com"
                      required={sendViaEmail}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: emailError ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                    {emailError && (
                      <span style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>
                        ⚠️ {emailError}
                      </span>
                    )}
                  </div>
                )}
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
              {editId ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save Changes
                </>
              ) : isWriteback ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"></path>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Send Write Back ✍️
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  Seal Envelope & Get Link
                </>
              )}
            </button>
          </form>

          {/* Stationery Page Live Preview */}
          <div className="studio-preview-col" style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPreviewMode("letter")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    backgroundColor: previewMode === "letter" ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid " + (previewMode === "letter" ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.1)"),
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  📄 Stationery View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("envelope")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    backgroundColor: previewMode === "envelope" ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid " + (previewMode === "envelope" ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.1)"),
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  ✉️ Envelope & Seal
                </button>
              </div>
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

            {previewMode === "envelope" ? (
              <div 
                className="glass studio-preview-card" 
                style={{ 
                  width: "100%", 
                  height: "680px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                  background: previewBackdropUrl ? `url(${previewBackdropUrl})` : "rgba(20, 15, 30, 0.4)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "16px"
                }}
              >
                <button
                  type="button"
                  onClick={() => setEnvelopeResetKey(prev => prev + 1)}
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
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                >
                  🔄 Reset Animation
                </button>
                
                <div style={{ transform: "scale(0.8)" }}>
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
              <div
                className={`theme-${theme} studio-preview-wrapper`}
                style={{
                  borderRadius: "16px",
                  padding: previewBackdropUrl ? "30px 20px" : "0px",
                  backgroundImage: previewBackdropUrl ? `url(${previewBackdropUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  transition: "all 0.4s ease",
                }}
              >
                <div
                  className={`stationery-sheet theme-${theme} ${hasBackdrop ? "has-backdrop" : ""} studio-preview-card`}
                  style={{
                    width: "100%",
                    height: "680px",
                    backgroundColor: getGlassyBg(),
                    backgroundImage: hasBackdrop ? "none" : "var(--bg-image)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backdropFilter: hasBackdrop ? "blur(16px)" : "none",
                    WebkitBackdropFilter: hasBackdrop ? "blur(16px)" : "none",
                    border: `1px solid ${getGlassyBorder()}`,
                    borderRadius: "16px",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                    color: "var(--stationery-text)",
                    fontFamily: "var(--stationery-font)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                    position: "relative",
                  }}
                >
                  {theme === "royal" && (
                    <>
                      <div style={{ position: "absolute", top: "10px", left: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                      <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                      <div style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                      <div style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "16px", pointerEvents: "none", zIndex: 5 }}>⚜️</div>
                      <div style={{ position: "absolute", left: "4px", top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: "12px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
                      <div style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "12px", opacity: 0.7, pointerEvents: "none", zIndex: 5 }}>🌿</div>
                      <div style={{ position: "absolute", top: "12px", left: "50%", transform: "translateX(-50%)", color: "#C9A227", zIndex: 10, pointerEvents: "none" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor" fillOpacity="0.15" />
                          <path d="M3 20h18" strokeWidth="2" />
                          <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                          <circle cx="2" cy="3" r="1.5" fill="currentColor" />
                          <circle cx="22" cy="3" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                    </>
                  )}

                  {theme === "blush" && (
                    <>
                      {/* Delicate corner floral SVGs */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 5 }}>
                        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
                          <defs>
                            <g id="blush-corner-preview">
                              <path d="M 10,10 C 22,10 26,14 26,26 C 26,20 22,20 22,10" fill="none" stroke="#B76E79" strokeWidth="1" />
                              <path d="M 10,10 C 10,22 14,26 26,26" fill="none" stroke="#B76E79" strokeWidth="1" />
                              <path d="M 14,20 Q 18,18 20,14" fill="none" stroke="#B76E79" strokeWidth="0.75" />
                              <path d="M 20,14 C 24,16 26,20 22,22 C 18,20 18,16 20,14 Z" fill="#E8B4B8" opacity="0.35" />
                            </g>
                          </defs>
                          <use href="#blush-corner-preview" x="0" y="0" />
                          <use href="#blush-corner-preview" x="0" y="0" transform="translate(100%, 0) scale(-1, 1)" style={{ transformOrigin: "right top" }} />
                          <use href="#blush-corner-preview" x="0" y="0" transform="translate(0, 100%) scale(1, -1)" style={{ transformOrigin: "left bottom" }} />
                          <use href="#blush-corner-preview" x="0" y="0" transform="translate(100%, 100%) scale(-1, -1)" style={{ transformOrigin: "right bottom" }} />
                        </svg>
                      </div>

                      {/* Light watercolor rose in bottom-left corner */}
                      <div style={{
                        position: "absolute",
                        bottom: "25px",
                        left: "25px",
                        fontSize: "64px",
                        filter: "saturate(35%) opacity(0.22)",
                        pointerEvents: "none",
                        zIndex: 4
                      }}>
                        🌹
                      </div>
                    </>
                  )}

                  <div 
                    className="hide-scrollbar"
                    style={{ 
                      padding: theme === "royal" ? "36px 24px 24px 24px" : "40px 40px 32px 40px", 
                      display: "flex", 
                      flexDirection: "column", 
                      flex: 1, 
                      gap: "20px",
                      overflowY: "auto",
                      zIndex: 6,
                    }}
                  >
                    <div 
                      style={{ 
                        fontSize: theme === "blush" ? "24px" : theme === "royal" ? "24px" : "22px", 
                        fontWeight: theme === "blush" ? "600" : theme === "royal" ? "bold" : "normal", 
                        fontFamily: theme === "blush" ? "var(--font-playfair)" : theme === "royal" ? "var(--font-cinzel-dec)" : "var(--font-cursive)", 
                        borderBottom: theme === "blush" || theme === "royal" ? "none" : "1px solid rgba(0,0,0,0.05)", 
                        textAlign: theme === "blush" ? "center" : "left",
                        paddingBottom: "6px", 
                        color: theme === "blush" ? "var(--stationery-text)" : "var(--stationery-accent)" 
                      }}
                    >
                      {greeting ? `${greeting} ` : ""}{recipient || "My Love"},
                    </div>

                    {theme === "blush" && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", margin: "-10px 0 5px 0" }}>
                        <div style={{ height: "1px", width: "30px", backgroundColor: "#B76E79", opacity: 0.4 }} />
                        <span style={{ color: "#E8B4B8", fontSize: "10px" }}>❤</span>
                        <div style={{ height: "1px", width: "30px", backgroundColor: "#B76E79", opacity: 0.4 }} />
                      </div>
                    )}

                    {theme === "royal" && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "-5px 0 5px 0" }}>
                        <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
                        <span style={{ color: "#7B1E1E", fontSize: "14px" }}>⚜️</span>
                        <div style={{ height: "1px", flex: 1, backgroundColor: "#C9A227", opacity: 0.5 }} />
                      </div>
                    )}

                    <div className="letter-body" style={{ fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "var(--stationery-text)", fontFamily: "var(--stationery-font)", letterSpacing: "0.3px", flex: 1 }}>
                      {content || "Start writing your letter in the form on the left. Tell them how much you love them, share a beautiful memory, or write a poem. Your words will appear here in real-time as you write..."}
                    </div>



                    <div style={{ textAlign: "right", marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "16px" }}>
                      {farewell && (
                        <div style={{ fontSize: "16px", fontFamily: "var(--font-cursive)", opacity: 0.75, marginBottom: "4px" }}>
                          {farewell}
                        </div>
                      )}
                      <div 
                        style={{ 
                          fontSize: "24px", 
                          fontFamily: theme === "blush" ? "var(--font-allura)" : theme === "royal" ? "var(--font-great-vibes)" : "var(--font-cursive)", 
                          color: theme === "blush" ? "#B76E79" : "var(--stationery-accent)", 
                          marginTop: "4px" 
                        }}
                      >
                        {sender || "Yours Truly"}
                      </div>

                      {theme === "blush" && (
                        <div style={{ 
                          width: "100px", 
                          height: "1px", 
                          background: "linear-gradient(to right, transparent, #B76E79, transparent)", 
                          marginTop: "4px", 
                          marginLeft: "auto" 
                        }} />
                      )}

                      {theme === "royal" && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                          <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, #a83232 0%, #7B1E1E 60%, #4d0f0f 100%)",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.3), inset 0 1.5px 2px rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            border: "1px solid rgba(123,30,30,0.5)"
                          }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" style={{ opacity: 0.85, filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))" }}>
                              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="#C9A227" fillOpacity="0.2" />
                              <path d="M3 20h18" />
                            </svg>
                            <div style={{
                              position: "absolute",
                              top: "-2px",
                              left: "-2px",
                              right: "-2px",
                              bottom: "-2px",
                              borderRadius: "50%",
                              border: "1.5px solid #7B1E1E",
                              opacity: 0.35
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            {envelopeStyle === "vintage-rose" || envelopeStyle === "vintage-white" || envelopeStyle === "celestial-blue" ? (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundImage: envelopeStyle === "vintage-white" ? "url(/vintage_red_seal.png)" : 
                                   envelopeStyle === "celestial-blue" ? "url(/vintage_heart_seal.jpg)" :
                                   "url(/vintage_rose_seal.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  transform: "rotate(-10deg)",
                  WebkitMaskImage: "radial-gradient(circle, black 46%, transparent 48%)",
                  maskImage: "radial-gradient(circle, black 46%, transparent 48%)",
                }}
              />
            ) : (
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
                ❤
              </div>
            )}

            {editId ? (
              <>
                <div>
                  <h2 style={{ 
                    fontSize: "32px", 
                    fontWeight: "normal", 
                    fontFamily: "var(--font-allura), var(--font-sacramento), var(--font-great-vibes), cursive",
                    color: "var(--accent-rose)",
                    marginBottom: "8px" 
                  }}>
                    Changes Saved!
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    Your love letter has been successfully updated with all customizations and saved back to your dashboard.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
                  <Link
                    href="/dashboard"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "var(--accent-purple)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)",
                    }}
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 style={{ 
                    fontSize: "32px", 
                    fontWeight: "normal", 
                    fontFamily: "var(--font-allura), var(--font-sacramento), var(--font-great-vibes), cursive",
                    color: "var(--accent-rose)",
                    marginBottom: "8px" 
                  }}>
                    {isWriteback ? "Write Back Sealed!" : "Letter Sealed!"}
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                    {isWriteback ? (
                      "Your writeback has been sent and the sender will receive the writeback. You can also copy the link below to share it manually, or dispatch it directly to their email."
                    ) : (
                      "Your love letter has been converted into a magical, portable link containing all customizations. Send it to your special someone!"
                    )}
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

                {/* Email dispatch utility */}
                <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-card)", paddingTop: "16px", width: "100%", textAlign: "left" }}>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "bold", textTransform: "uppercase" }}>
                    {isWriteback ? "Send Write Back via Email ✉️" : "Send Letter via Email ✉️"}
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input 
                      type="email" 
                      placeholder="partner@example.com" 
                      value={emailToSend} 
                      onChange={(e) => setEmailToSend(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailToSend.trim()}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        backgroundColor: "var(--accent-purple)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        opacity: (sendingEmail || !emailToSend.trim()) ? 0.6 : 1,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-rose)";
                      }}
                      onMouseLeave={(e) => {
                        if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-purple)";
                      }}
                    >
                      {sendingEmail ? "Sending..." : "Send"}
                    </button>
                  </div>
                  {emailStatus && (
                    <p 
                      style={{ 
                        fontSize: "11px", 
                        color: emailStatus.includes("successfully") ? "#10b981" : "var(--accent-rose)", 
                        marginTop: "6px",
                        fontWeight: 500
                      }}
                    >
                      {emailStatus}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
                  {isWriteback ? (
                    <Link
                      href={queryReplyToId ? `/letter?id=${queryReplyToId}` : "/"}
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
                      Back to the start of the letter
                    </Link>
                  ) : (
                    <Link
                      href={user ? "/dashboard" : "/"}
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
                      {user ? "Back to Dashboard" : "Go to Homepage"}
                    </Link>
                  )}
                  
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
              </>
            )}
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
              onClick={handleCloseAlert}
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
      {showSealingAnimation && (
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
          onComplete={async () => {
            if (email.trim()) {
              setEmailToSend(email.trim());
            }
            if (savePromise) {
              try {
                const finalLink = await savePromise;
                setShareUrl(finalLink);

                // If sendViaEmail is true, automatically dispatch the letter via email
                if (sendViaEmail && email.trim()) {
                  setSendingEmail(true);
                  setEmailStatus("Sending letter invitation...");
                  try {
                    const res = await fetch("/api/send-letter", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        recipientEmail: email.trim(),
                        letterLink: finalLink,
                        senderName: sender.trim() || "Yours Truly",
                        recipientName: recipient.trim() || "My Love",
                        title: title.trim() || "A Love Letter"
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setEmailStatus("✓ Email sent successfully!");
                      
                      let letterId = null;
                      if (finalLink && finalLink.includes("&id=")) {
                        letterId = finalLink.split("&id=")[1]?.split("&")[0];
                      }
                      
                      if (db && letterId) {
                        const docRef = doc(db, "letters", letterId);
                        await updateDoc(docRef, { emailSent: true });
                      }
                    } else {
                      setEmailStatus("Failed to send email automatically. You can try sending manually below.");
                    }
                  } catch (err) {
                    console.error("Automatic email dispatch failed:", err);
                    setEmailStatus("Failed to send email automatically. You can try sending manually below.");
                  } finally {
                    setSendingEmail(false);
                  }
                }
              } catch (err) {
                console.error("Background save failed:", err);
              }
            }
            setShowSealingAnimation(false);
            setShowModal(true);
          }}
        />
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

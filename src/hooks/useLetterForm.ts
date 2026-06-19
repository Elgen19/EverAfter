"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { encodeLetterData, LetterData } from "@/utils/encoding";
import { db, storage } from "@/utils/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

export function useLetterForm() {
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

  // Core form state
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Love Letter");

  // Guard routing
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

  // Pre-populate from profile
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

  // Pre-populate writeback names
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

  // Predefine seal color & symbol depending on envelope style
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

  const [music, setMusic] = useState(false);
  const [musicType, setMusicType] = useState<"synth" | "url">("synth");
  const [musicUrl, setMusicUrl] = useState("");

  const [greeting, setGreeting] = useState("Dearest");
  const [farewell, setFarewell] = useState("With all my love,");

  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [securityType, setSecurityType] = useState<"date" | "boolean" | "choice">("boolean");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityChoices, setSecurityChoices] = useState<string[]>(["", "", ""]);
  const [securityConfirmed, setSecurityConfirmed] = useState(false);

  const [introEnabled, setIntroEnabled] = useState(false);
  const [introText, setIntroText] = useState("");
  const [introAnimation, setIntroAnimation] = useState<"typewriter" | "fade-float" | "pulse">("typewriter");
  const [introConfirmed, setIntroConfirmed] = useState(false);

  const [closingEnabled, setClosingEnabled] = useState(false);
  const [closingText, setClosingText] = useState("");
  const [closingAnimation, setClosingAnimation] = useState<"typewriter" | "fade-float" | "pulse">("typewriter");
  const [closingConfirmed, setClosingConfirmed] = useState(false);

  const [dateInviteEnabled, setDateInviteEnabled] = useState(false);
  const [dateInviteQuestion, setDateInviteQuestion] = useState("Will you go on a date with me? 🌹");
  const [dateInviteDate, setDateInviteDate] = useState("");
  const [dateInviteTime, setDateInviteTime] = useState("");
  const [dateInvitePlace, setDateInvitePlace] = useState("");
  const [dateInviteMapLink, setDateInviteMapLink] = useState("");
  const [dateInviteEmail, setDateInviteEmail] = useState("");
  const [dateInviteConfirmed, setDateInviteConfirmed] = useState(false);

  const [surveyEnabled, setSurveyEnabled] = useState(false);
  const [surveyType, setSurveyType] = useState<"emoji" | "text" | "both">("both");
  const [surveyQuestion, setSurveyQuestion] = useState("How does this letter make you feel?");
  const [surveyConfirmed, setSurveyConfirmed] = useState(false);

  const [sendLaterEnabled, setSendLaterEnabled] = useState(false);
  const [sendLaterDate, setSendLaterDate] = useState("");
  const [sendLaterTime, setSendLaterTime] = useState("");

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioCustomMessage, setAudioCustomMessage] = useState("Listen to my voice... ❤️");
  const [audioConfirmed, setAudioConfirmed] = useState(false);

  const [polaroidsEnabled, setPolaroidsEnabled] = useState(false);
  const [polaroids, setPolaroids] = useState<any[]>([
    { id: 0, url: "", file: null, caption: "" },
    { id: 1, url: "", file: null, caption: "" },
    { id: 2, url: "", file: null, caption: "" }
  ]);
  const [polaroidsConfirmed, setPolaroidsConfirmed] = useState(false);

  const [stepOrder, setStepOrder] = useState<string[]>(["security", "intro", "envelope", "polaroids", "audioMessage", "dateInvite", "closing", "survey"]);

  // Share URL modal state
  const [shareUrl, setShareUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Romantic Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [lastShowModalState, setLastShowModalState] = useState(false);

  // Load existing letter for editing
  useEffect(() => {
    if (!editId || !db || !user) return;
    const loadLetter = async () => {
      try {
        const { doc: firestoreDoc, getDoc } = await import("firebase/firestore");
        const docRef = firestoreDoc(db, "letters", editId);
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
            if (data.polaroids) {
              setPolaroidsEnabled(data.polaroids.enabled || false);
              const loadedPolaroids = [
                { id: 0, url: "", file: null, caption: "" },
                { id: 1, url: "", file: null, caption: "" },
                { id: 2, url: "", file: null, caption: "" }
              ];
              if (data.polaroids.items && Array.isArray(data.polaroids.items)) {
                data.polaroids.items.forEach((item: any, idx: number) => {
                  if (idx < 3) {
                    loadedPolaroids[idx] = {
                      id: idx,
                      url: item.imageUrl || "",
                      file: null,
                      caption: item.caption || ""
                    };
                  }
                });
              }
              setPolaroids(loadedPolaroids);
              setPolaroidsConfirmed(true);
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
              if (!loadedOrder.includes("polaroids")) {
                const envIdx = loadedOrder.indexOf("envelope");
                if (envIdx !== -1) {
                  loadedOrder.splice(envIdx + 1, 0, "polaroids");
                } else {
                  loadedOrder.push("polaroids");
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

  // Derived helpers
  const showRomanticAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setLastShowModalState(showModal);
    if (showModal) setShowModal(false);
    setAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
    if (lastShowModalState) {
      setShowModal(true);
      setLastShowModalState(false);
    }
  };

  const activeSteps = stepOrder.filter((id) => {
    if (id === "envelope") return true;
    if (id === "security" && securityEnabled && securityConfirmed) return true;
    if (id === "intro" && introEnabled && introConfirmed) return true;
    if (id === "polaroids" && polaroidsEnabled && polaroidsConfirmed) return true;
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
      case "polaroids": return "📸 Polaroid Stack";
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
      setEmailError(emailRegex.test(val) ? "" : "Please enter a valid email address.");
    }
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newActive = [...activeSteps];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newActive.length) return;

    const stepId = newActive[index];
    const targetStepId = newActive[targetIdx];

    if (stepId === "intro" && direction === "down" && targetStepId === "envelope") {
      showRomanticAlert("Patience, Sweetheart", "Just as a prologue sets the stage for a grand romance, the introductory statement must whisper its sweet words before the letter envelope is opened.");
      return;
    }
    if (stepId === "envelope" && direction === "up" && targetStepId === "intro") {
      showRomanticAlert("Patience, Sweetheart", "Just as a prologue sets the stage for a grand romance, the introductory statement must whisper its sweet words before the letter envelope is opened.");
      return;
    }
    if (stepId === "closing" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Timing is Everything", "A postscript is like a lingering kiss at the end of a date; it should only be shared after your main letter has been read.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "closing") {
      showRomanticAlert("Timing is Everything", "A postscript is like a lingering kiss at the end of a date; it should only be shared after your main letter has been read.");
      return;
    }
    if (stepId === "dateInvite" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Let Love Unfold", "Let them read of your devotion first, darling. The date invitation is best saved as a sweet surprise after they read your letter.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "dateInvite") {
      showRomanticAlert("Let Love Unfold", "Let them read of your devotion first, darling. The date invitation is best saved as a sweet surprise after they read your letter.");
      return;
    }
    if (stepId === "audioMessage" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Let Love Unfold", "Let them read your letter first, darling. The voice message is best heard after they read your written words.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "audioMessage") {
      showRomanticAlert("Let Love Unfold", "Let them read your letter first, darling. The voice message is best heard after they read your written words.");
      return;
    }
    if (stepId === "polaroids" && direction === "up" && targetStepId === "envelope") {
      showRomanticAlert("Let Love Unfold", "Let them read your devotion first, darling. The polaroid memories are best viewed after they open your letter.");
      return;
    }
    if (stepId === "envelope" && direction === "down" && targetStepId === "polaroids") {
      showRomanticAlert("Let Love Unfold", "Let them read your devotion first, darling. The polaroid memories are best viewed after they open your letter.");
      return;
    }
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

    const disabled = ["security", "intro", "envelope", "polaroids", "audioMessage", "dateInvite", "closing", "survey"].filter(id => !newActive.includes(id));
    setStepOrder([...newActive, ...disabled]);
  };

  const handleInsertEmoji = (emoji: string) => {
    const textarea = document.getElementById("letter-body-textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textarea.value.substring(0, start) + emoji + textarea.value.substring(end);
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
    if (val === undefined || val === null) return null;
    if (Array.isArray(val)) return val.map(sanitizeForFirestore);
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
    if (dateInviteEnabled && dateInviteEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dateInviteEmail.trim())) {
        showRomanticAlert("Where to RSVP?", "To make your date perfect, please enter a valid email address so they can send their sweet RSVP confirmation back to you.");
        return;
      }
    }
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
    if (polaroidsEnabled && !polaroidsConfirmed) {
      showRomanticAlert("Confirm Your Polaroid Stack", "You have enabled the Polaroid Stack. Please press the 'Seal Polaroid Stack' button to lock this customization in before sealing.");
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
      const checkMonth = String(checkNow.getMonth() + 1).padStart(2, "0");
      const checkDay = String(checkNow.getDate()).padStart(2, "0");
      const checkLocalTodayStr = `${checkYear}-${checkMonth}-${checkDay}`;
      if (dateInviteDate < checkLocalTodayStr) {
        showRomanticAlert("Invalid Invitation Date", "The proposed invitation date cannot be in the past. Please choose today or a future date.");
        return;
      }
      const selectedDateTime = new Date(`${dateInviteDate}T${dateInviteTime}`);
      const minAllowedDateTime = new Date(checkNow.getTime() + 60 * 60 * 1000);
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
    if (sendLaterEnabled && (!sendLaterDate || !sendLaterTime)) {
      showRomanticAlert("Timing the Surprise", "To deliver this letter at the perfect moment, please specify both the release date and time.");
      return;
    }

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
      polaroids: polaroidsEnabled ? {
        enabled: true,
        items: polaroids.filter(p => p.url.trim() !== "").map(p => ({
          imageUrl: p.url.startsWith("blob:") ? undefined : p.url,
          caption: p.caption.trim() || undefined
        }))
      } : undefined,
      stepOrder
    };

    const letterDataForEncoding = { ...letterData };
    if (letterDataForEncoding.audioMessage) {
      letterDataForEncoding.audioMessage = { ...letterDataForEncoding.audioMessage, audioUrl: undefined };
    }
    if (letterDataForEncoding.polaroids?.items) {
      letterDataForEncoding.polaroids.items = letterDataForEncoding.polaroids.items.map(item => ({
        ...item,
        imageUrl: item.imageUrl?.startsWith("blob:") ? undefined : item.imageUrl
      }));
    }
    const encoded = encodeLetterData(letterDataForEncoding);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const localGeneratedLink = `${origin}/letter?d=${encoded}`;

    setShareUrl(localGeneratedLink);
    setShowSealingAnimation(true);

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
            if (polaroidsEnabled && sanitizedData.polaroids?.items) {
              const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
              for (let i = 0; i < polaroids.length; i++) {
                const p = polaroids[i];
                if (p.file) {
                  const storageRef = ref(storage, `letters/${editId}/polaroid_${i}`);
                  const snapshot = await uploadBytes(storageRef, p.file);
                  const downloadUrl = await getDownloadURL(snapshot.ref);
                  if (sanitizedData.polaroids.items[i]) {
                    sanitizedData.polaroids.items[i].imageUrl = downloadUrl;
                  }
                }
              }
            }
            await updateDoc(docRef, { senderEmail: user?.email || null, ...sanitizedData });
            finalLink = `${origin}/letter?d=${encoded}&id=${editId}`;
            await updateDoc(docRef, { link: finalLink });
          } else {
            const initialSanitizedData = { ...sanitizedData };
            if (audioEnabled && audioFile && initialSanitizedData.audioMessage) {
              initialSanitizedData.audioMessage.audioUrl = null;
            }
            if (polaroidsEnabled && initialSanitizedData.polaroids?.items) {
              initialSanitizedData.polaroids.items = initialSanitizedData.polaroids.items.map((item: any) => ({
                ...item,
                imageUrl: item.imageUrl || null
              }));
            }
            const docRef = await addDoc(collection(db, "letters"), {
              userId: queryRecipientUid || user?.uid || "",
              senderEmail: user?.email || null,
              isWriteback: isWriteback,
              replyToId: isWriteback ? (queryReplyToId || null) : null,
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
              await updateDoc(docRef, { "audioMessage.audioUrl": finalAudioUrl });
            }
            if (polaroidsEnabled && initialSanitizedData.polaroids?.items) {
              const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
              const updatedItems = [...initialSanitizedData.polaroids.items];
              let hasNewUploads = false;
              for (let i = 0; i < polaroids.length; i++) {
                const p = polaroids[i];
                if (p.file) {
                  const storageRef = ref(storage, `letter/${letterId}/polaroid_${i}`);
                  const snapshot = await uploadBytes(storageRef, p.file);
                  const downloadUrl = await getDownloadURL(snapshot.ref);
                  if (updatedItems[i]) {
                    updatedItems[i].imageUrl = downloadUrl;
                    hasNewUploads = true;
                  }
                }
              }
              if (hasNewUploads) {
                await updateDoc(docRef, { "polaroids.items": updatedItems });
              }
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
        headers: { "Content-Type": "application/json" },
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
        let letterId: string | null = null;
        if (shareUrl && shareUrl.includes("&id=")) {
          letterId = shareUrl.split("&id=")[1]?.split("&")[0];
        }
        if (db && letterId) {
          const docRef = doc(db, "letters", letterId);
          await updateDoc(docRef, { email: emailToSend.trim(), emailSent: true });
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

  return {
    // URL params
    editId, isWriteback, queryTo, queryFrom, queryRecipientUid, queryReplyToId,
    // Preview
    previewMode, setPreviewMode, envelopeResetKey, setEnvelopeResetKey,
    // Email sending
    emailToSend, setEmailToSend, sendingEmail, emailStatus, sendViaEmail, setSendViaEmail,
    // Core form
    recipient, setRecipient, sender, setSender, email, title,
    emailError,
    // Animation/save
    showSealingAnimation, setShowSealingAnimation, savePromise, setSavePromise,
    // Letter content
    content, setContent, theme, setTheme, backdrop, setBackdrop,
    sealSymbol, setSealSymbol, sealColor, setSealColor,
    envelopeStyle, setEnvelopeStyle,
    // Music
    music, setMusic, musicType, setMusicType, musicUrl, setMusicUrl,
    // Text customizations
    greeting, setGreeting, farewell, setFarewell,
    // Security
    securityEnabled, setSecurityEnabled, securityType, setSecurityType,
    securityQuestion, setSecurityQuestion, securityAnswer, setSecurityAnswer,
    securityChoices, setSecurityChoices, securityConfirmed, setSecurityConfirmed,
    // Intro
    introEnabled, setIntroEnabled, introText, setIntroText,
    introAnimation, setIntroAnimation, introConfirmed, setIntroConfirmed,
    // Closing
    closingEnabled, setClosingEnabled, closingText, setClosingText,
    closingAnimation, setClosingAnimation, closingConfirmed, setClosingConfirmed,
    // Date invite
    dateInviteEnabled, setDateInviteEnabled, dateInviteQuestion, setDateInviteQuestion,
    dateInviteDate, setDateInviteDate, dateInviteTime, setDateInviteTime,
    dateInvitePlace, setDateInvitePlace, dateInviteMapLink, setDateInviteMapLink,
    dateInviteEmail, setDateInviteEmail, dateInviteConfirmed, setDateInviteConfirmed,
    // Survey
    surveyEnabled, setSurveyEnabled, surveyType, setSurveyType,
    surveyQuestion, setSurveyQuestion, surveyConfirmed, setSurveyConfirmed,
    // Send later
    sendLaterEnabled, setSendLaterEnabled, sendLaterDate, setSendLaterDate,
    sendLaterTime, setSendLaterTime,
    // Audio
    audioEnabled, setAudioEnabled, audioUrl, setAudioUrl,
    audioFile, setAudioFile, audioCustomMessage, setAudioCustomMessage,
    audioConfirmed, setAudioConfirmed,
    // Polaroids
    polaroidsEnabled, setPolaroidsEnabled,
    polaroids, setPolaroids,
    polaroidsConfirmed, setPolaroidsConfirmed,
    // Step order
    stepOrder, activeSteps, getStepLabel,
    // Share modal
    shareUrl, setShareUrl, showModal, setShowModal, copied,
    // Alert modal
    alertOpen, alertTitle, alertMessage,
    // Auth
    user, recipientProfile, loading,
    // Handlers
    handleCreate, copyToClipboard, handleSendEmail, handleEmailChange,
    moveStep, handleInsertEmoji, showRomanticAlert, handleCloseAlert,
  };
}

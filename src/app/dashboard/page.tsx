"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";
import { db } from "@/utils/firebase";
import { collection, query, where, orderBy, getDocs, deleteDoc, onSnapshot, doc, updateDoc } from "firebase/firestore";
import LetterCard, { SavedLetter } from "@/components/dashboard/LetterCard";
import DashboardModals from "@/components/dashboard/DashboardModals";

export default function DashboardPage() {
  const { user, recipient, loading, logout } = useAuth();
  const router = useRouter();
  const [letters, setLetters] = useState<SavedLetter[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dramaticTransition, setDramaticTransition] = useState(false);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

  const loveQuotes = [
    "\"In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.\" — Maya Angelou",
    "\"I love you not only for what you are, but for what I am when I am with you.\" — Elizabeth Barrett Browning",
    "\"Whatever our souls are made of, his and mine are the same.\" — Emily Brontë",
    "\"I've tried so many times to think of a new way to say it, and it's still I love you.\" — Zelda Fitzgerald",
    "\"If I had a flower for every time I thought of you... I could walk through my garden forever.\" — Alfred Tennyson",
    "\"You are my heart, my life, my one and only thought.\" — Arthur Conan Doyle",
    "\"If you live to be a hundred, I want to live to be a hundred minus one day so I never have to live without you.\" — A.A. Milne",
    "\"My love for you is a journey; starting at forever, and ending at never.\" — Anonymous",
    "\"You are, and always have been, my dream.\" — Nicholas Sparks",
    "\"To love and be loved is to feel the sun from both sides.\" — David Viscott"
  ];

  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * loveQuotes.length));
    const interval = setInterval(() => {
      setQuoteIdx((prev) => {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * loveQuotes.length);
        } while (nextIdx === prev && loveQuotes.length > 1);
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setSelectedLinks([]); }, [activeTab]);

  // Send Email Modal
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendLetterTarget, setSendLetterTarget] = useState<SavedLetter | null>(null);
  const [sendEmailInput, setSendEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendEmailStatus, setSendEmailStatus] = useState("");

  const openSendEmailModal = (letter: SavedLetter) => {
    setSendLetterTarget(letter);
    setSendEmailInput(letter.email || "");
    setSendEmailStatus("");
    setSendModalOpen(true);
  };

  const handleSendEmailFromDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendLetterTarget || !sendEmailInput.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sendEmailInput.trim())) { setSendEmailStatus("Please enter a valid email address."); return; }
    setSendingEmail(true);
    setSendEmailStatus("Sending letter...");
    try {
      const res = await fetch("/api/send-letter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: sendEmailInput.trim(), letterLink: sendLetterTarget.link, senderName: sendLetterTarget.sender || "Yours Truly", recipientName: sendLetterTarget.recipient || "My Love", title: sendLetterTarget.title || "A Love Letter" })
      });
      const data = await res.json();
      if (data.success) {
        setSendEmailStatus("✓ Email sent successfully!");
        if (sendLetterTarget.id) {
          const docRef = doc(db, "letters", sendLetterTarget.id);
          await updateDoc(docRef, { email: sendEmailInput.trim(), emailSent: true });
        }
        setTimeout(() => { setSendModalOpen(false); setSendLetterTarget(null); }, 1500);
      } else {
        setSendEmailStatus("Failed to send email. Please try again.");
      }
    } catch (err) {
      console.error("Failed to send email from dashboard:", err);
      setSendEmailStatus("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Alert & Confirm modals
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmBtnText, setConfirmBtnText] = useState("Confirm 💔");

  const showRomanticAlert = (title: string, message: string) => { setAlertTitle(title); setAlertMessage(message); setAlertOpen(true); };

  const requestDelete = (link: string) => {
    setConfirmTitle("Letting Go..."); setConfirmMessage("Are you sure you want to discard this love letter? Its words and memories will be dissolved into the stars forever.");
    setConfirmBtnText("Discard Letter 💔"); setConfirmAction(() => () => deleteLetter(link)); setConfirmOpen(true);
  };

  const getSenderFirstName = () => {
    if (!user) return "";
    const name = user.displayName || user.email.split("@")[0];
    const cleanName = name.replace(/[._-]/g, " ").trim().replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };
  const getRecipientFirstName = () => {
    if (!recipient) return "";
    const name = recipient.firstName || "";
    const cleanName = name.replace(/[._-]/g, " ").trim().replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };
  const senderFirstName = getSenderFirstName();
  const recipientFirstName = getRecipientFirstName();
  const questionText = `What would you write today for ${recipientFirstName}, ${senderFirstName}?`;

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (!recipient) router.push("/recipient-setup");
    }
  }, [user, recipient, loading, router]);

  useEffect(() => {
    setMounted(true);
    if (!user) return;
    try {
      const q = query(collection(db, "letters"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedList: SavedLetter[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedList.push({ id: doc.id, recipient: data.recipient, sender: data.sender, title: data.title, theme: data.theme, link: data.link, timestamp: data.timestamp, read: data.read || false, readAt: data.readAt || null, sendLaterDate: data.sendLaterDate || null, envelopeStyle: data.envelopeStyle || "vintage-rose", isWriteback: data.isWriteback || false, dateInvite: data.dateInvite || null, email: data.email || null, emailSent: data.emailSent || false });
        });
        fetchedList.sort((a, b) => b.timestamp - a.timestamp);
        setLetters(fetchedList);
      }, (err) => console.error("Real-time letters listener error:", err));
      return () => unsubscribe();
    } catch (err) { console.error("Failed to establish letters subscription:", err); }
  }, [user]);

  const deleteLetter = async (linkToDelete: string) => {
    if (!user) return;
    setLetters(letters.filter((l) => l.link !== linkToDelete));
    try {
      const q = query(collection(db, "letters"), where("userId", "==", user.uid), where("link", "==", linkToDelete));
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    } catch (err) { console.error("Failed to delete letter from Firestore:", err); }
  };

  const deleteSelectedLetters = async () => {
    if (!user || selectedLinks.length === 0) return;
    const linksToRemove = [...selectedLinks];
    setSelectedLinks([]);
    setLetters(letters.filter((l) => !linksToRemove.includes(l.link)));
    try {
      const lettersToDelete = letters.filter((l) => linksToRemove.includes(l.link));
      await Promise.all(lettersToDelete.map(async (letter) => {
        if (letter.id) return deleteDoc(doc(db, "letters", letter.id));
        const q = query(collection(db, "letters"), where("userId", "==", user.uid), where("link", "==", letter.link));
        const snapshot = await getDocs(q);
        return Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
      }));
    } catch (err) { console.error("Failed to delete selected letters:", err); }
  };

  const requestDeleteSelected = () => {
    if (selectedLinks.length === 0) return;
    setConfirmTitle("Dissolving Selected Memories..."); setConfirmMessage(`Are you sure you want to discard the ${selectedLinks.length} selected letter(s)? Their words and memories will be dissolved into the stars forever.`);
    setConfirmBtnText("Discard Selected 💔"); setConfirmAction(() => () => deleteSelectedLetters()); setConfirmOpen(true);
  };

  const handleSelectAll = () => {
    const currentTabLetters = activeTab === "sent" ? sentLetters : receivedLetters;
    const currentLinks = currentTabLetters.map((l) => l.link);
    const allSelected = currentLinks.every((link) => selectedLinks.includes(link));
    if (allSelected) setSelectedLinks(selectedLinks.filter((link) => !currentLinks.includes(link)));
    else setSelectedLinks(Array.from(new Set([...selectedLinks, ...currentLinks])));
  };

  const sentLetters = letters.filter((l) => !l.isWriteback);
  const receivedLetters = letters.filter((l) => l.isWriteback);

  const clearHistory = () => {
    if (!user) return;
    const isSent = activeTab === "sent";
    setConfirmTitle(isSent ? "Clearing Sent Letters..." : "Clearing Received Replies...");
    setConfirmMessage(isSent ? "Are you sure you want to clear your sent letter history? This will dissolve all your sent letters into the stars forever." : "Are you sure you want to clear your received replies? This will dissolve all writebacks you've received into the stars forever.");
    setConfirmBtnText(isSent ? "Clear Sent Letters 💔" : "Clear Replies 💔");
    setConfirmAction(() => async () => {
      const targetCleared = isSent ? sentLetters : receivedLetters;
      setLetters(letters.filter((l) => !targetCleared.some((t) => t.link === l.link)));
      try {
        const q = query(collection(db, "letters"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.filter((d) => { const wb = d.data().isWriteback === true; return isSent ? !wb : wb; }).map((d) => deleteDoc(d.ref)));
      } catch (err) { console.error("Failed to clear letters:", err); }
    });
    setConfirmOpen(true);
  };

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const getThemeBadgeColor = (theme: string) => {
    switch (theme) {
      case "rose": return { bg: "rgba(255, 75, 114, 0.15)", text: "var(--accent-rose)" };
      case "lavender": return { bg: "rgba(123, 44, 191, 0.15)", text: "var(--accent-purple)" };
      case "celestial": return { bg: "rgba(226, 184, 87, 0.15)", text: "var(--accent-gold)" };
      default: return { bg: "rgba(255, 255, 255, 0.08)", text: "var(--text-muted)" };
    }
  };

  if (loading || !user || !recipient) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying session...</div>
      </div>
    );
  }

  const currentTabLetters = activeTab === "sent" ? sentLetters : receivedLetters;

  return (
    <div className="dashboard-page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <FloatingHearts />

      {/* Nav */}
      <header className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, width: "100%", zIndex: 100, borderRadius: "0px", borderLeft: "none", borderRight: "none", borderTop: "none", borderBottom: "1px solid var(--border-card)", background: "rgba(11, 7, 17, 0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="header-nav-container" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", transition: "transform 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <img src="/logo.png" alt="EverAfter Logo" style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 0 10px rgba(255, 75, 114, 0.3)", border: "1.5px solid rgba(255, 255, 255, 0.1)" }} />
            <span style={{ fontSize: "26px", fontWeight: "normal", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", background: "linear-gradient(to right, #ff4b72, #9c6cfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EverAfter</span>
          </Link>
          <div className="header-center-info" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: "6px", textTransform: "capitalize", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive" }}>
              <span>{recipient.firstName}</span><span>💖</span>
            </div>
            <div style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic", letterSpacing: "0.2px", maxWidth: "600px", textAlign: "center" }}>
              "I love you more than words can carry, more than time can measure and more than life itself could've ever imagine"
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/profile" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #ff4b72, #9c6cfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 12px rgba(255, 75, 114, 0.25)", transition: "all 0.2s ease-in-out", border: "2px solid rgba(255, 255, 255, 0.2)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 75, 114, 0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 75, 114, 0.25)"; }}
              title="Profile Settings"
            >{user.email ? user.email[0].toUpperCase() : "👤"}</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "40px", flexGrow: 1 }}>

        {/* Hero section */}
        <section className="glass dashboard-hero" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "28px", marginTop: "20px", padding: "50px 40px", borderRadius: "24px", border: "1px solid var(--border-card)", background: "linear-gradient(135deg, rgba(20, 15, 30, 0.7) 0%, rgba(255, 75, 114, 0.02) 100%)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1.5px", background: "linear-gradient(to right, transparent, var(--accent-rose), var(--accent-purple), transparent)" }} />
          <h1 className="dashboard-hero-title" style={{ fontSize: "52px", fontWeight: "bold", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", color: "#ffffff", textShadow: "0 0 15px rgba(255, 75, 114, 0.45)", lineHeight: "1.4", maxWidth: "800px", margin: "0 auto", display: "block" }}>
            {questionText}
          </h1>
          <p 
            key={quoteIdx}
            className="animate-reveal"
            style={{ fontSize: "16px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: "1.6", maxWidth: "540px", margin: "0 auto", opacity: 0.95, minHeight: "48px" }}
          >
            {loveQuotes[quoteIdx]}
          </p>
          <div style={{ marginTop: "12px" }}>
            <button id="btn-create-letter"
              onClick={(e) => { e.preventDefault(); setDramaticTransition(true); setTimeout(() => router.push("/create"), 1000); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 36px", borderRadius: "30px", backgroundColor: "var(--accent-rose)", backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)", color: "#fff", fontWeight: 600, fontSize: "16px", border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(255, 75, 114, 0.35)", transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 15px 30px rgba(255, 75, 114, 0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 75, 114, 0.35)"; }}
            >
              Write a Love Letter
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </section>

        {/* Letter history section */}
        <section className="glass dashboard-history-section" style={{ padding: "30px", marginTop: "20px", marginBottom: "80px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Tab headers */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border-card)", paddingBottom: "2px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {(["sent", "received"] as const).map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === "sent" ? sentLetters.length : receivedLetters.length;
                const label = tab === "sent" ? "Sent Letters" : "Received Writebacks";
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} className="dashboard-tab-btn"
                    style={{ background: "none", border: "none", fontSize: "15px", fontWeight: 600, color: isActive ? "var(--accent-rose)" : "var(--text-muted)", cursor: "pointer", padding: "8px 16px 14px 16px", position: "relative", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: "10px", color: isActive ? "#fff" : "var(--text-muted)", backgroundColor: isActive ? "rgba(255, 75, 114, 0.2)" : "rgba(255, 255, 255, 0.05)", border: isActive ? "1px solid rgba(255, 75, 114, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)", padding: "1px 6px", borderRadius: "10px" }}>{count}</span>
                    {isActive && <div style={{ position: "absolute", bottom: "-1.5px", left: 0, right: 0, height: "2.5px", backgroundColor: "var(--accent-rose)", borderRadius: "2px" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection/action bar */}
          {mounted && currentTabLetters.length > 0 && (
            <div className="dashboard-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-card)", marginTop: "10px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-muted)", userSelect: "none" }}>
                  <input type="checkbox" checked={currentTabLetters.length > 0 && currentTabLetters.every((l) => selectedLinks.includes(l.link))} onChange={handleSelectAll}
                    style={{ accentColor: "var(--accent-rose)", cursor: "pointer", width: "16px", height: "16px" }}
                  /><span>Select All</span>
                </label>
                {selectedLinks.length > 0 && <span style={{ fontSize: "12px", color: "var(--accent-rose)", fontWeight: 500 }}>{selectedLinks.length} selected</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedLinks.length > 0 ? (
                  <button onClick={requestDeleteSelected}
                    style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "rgba(255, 75, 114, 0.15)", border: "1px solid rgba(255, 75, 114, 0.3)", color: "var(--accent-rose)", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.25)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.15)")}
                  >Delete Selected ({selectedLinks.length}) 💔</button>
                ) : (
                  <button onClick={clearHistory}
                    style={{ background: "none", border: "none", color: "rgba(255,75,114,0.7)", fontSize: "12px", cursor: "pointer", fontWeight: 500, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,75,114,0.7)")}
                  >{activeTab === "sent" ? "Clear Sent Letters" : "Clear Received Writebacks"}</button>
                )}
              </div>
            </div>
          )}

          {/* Letter list */}
          {!mounted ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>Loading history...</div>
          ) : currentTabLetters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", border: "1px dashed var(--border-card)", borderRadius: "12px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "28px" }}>{activeTab === "sent" ? "✉" : "💬"}</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>{activeTab === "sent" ? "No letters written yet" : "No writebacks received yet"}</div>
              <div style={{ fontSize: "12px", opacity: 0.7, maxWidth: "320px", lineHeight: "1.5" }}>
                {activeTab === "sent" ? "Letters you write and seal will show up here, so you can easily access their links again." : "Once your partner clicks 'Write Back' at the end of your letter and sends a reply, it will appear here."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {currentTabLetters.map((letter, idx) => (
                <LetterCard
                  key={letter.timestamp + "-" + idx}
                  letter={letter}
                  isSelected={selectedLinks.includes(letter.link)}
                  onToggleSelect={(link, checked) => { if (checked) setSelectedLinks([...selectedLinks, link]); else setSelectedLinks(selectedLinks.filter((l) => l !== link)); }}
                  onOpenSendEmail={openSendEmailModal}
                  onDelete={requestDelete}
                  onCopyLink={(link) => { navigator.clipboard.writeText(link); showRomanticAlert("Shared with Love", "Your magical love letter link is copied to your clipboard. Send it to your partner to unlock the magic! 💌"); }}
                  formatDate={formatDate}
                  getThemeBadgeColor={getThemeBadgeColor}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={{ marginTop: "auto", textAlign: "center", padding: "40px 20px", fontSize: "14px", color: "var(--text-muted)", borderTop: "1px solid var(--border-card)", background: "rgba(7, 5, 11, 0.95)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", fontFamily: "var(--font-ui)", letterSpacing: "0.5px", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center", alignItems: "center", width: "100%", position: "relative", zIndex: 10 }}>
        <div style={{ color: "var(--text-main)", fontWeight: 500 }}>EverAfter © {new Date().getFullYear()}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><span>Made with love by Elgen for Faith</span></div>
        <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px" }}>A digital love letter creation suite for unforgettable sentiments.</div>
      </footer>

      {/* Dramatic transition overlay */}
      {dramaticTransition && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0b0711", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", animation: "dramatic-slide-up 1.2s cubic-bezier(0.85, 0, 0.15, 1) forwards", pointerEvents: "all" }}>
          <style>{`@keyframes dramatic-slide-up { 0% { transform: translateY(100vh); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }`}</style>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "100px", animation: "heartbeat-survey 0.8s infinite ease-in-out" }}>💖</div>
            <div style={{ fontSize: "28px", fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", color: "var(--accent-rose)", textShadow: "0 0 10px rgba(255, 75, 114, 0.5)" }}>Opening Creator Studio...</div>
          </div>
        </div>
      )}

      {/* All dashboard modals */}
      <DashboardModals
        alertOpen={alertOpen} alertTitle={alertTitle} alertMessage={alertMessage} onCloseAlert={() => setAlertOpen(false)}
        confirmOpen={confirmOpen} confirmTitle={confirmTitle} confirmMessage={confirmMessage} confirmBtnText={confirmBtnText}
        onConfirm={() => { if (confirmAction) confirmAction(); setConfirmOpen(false); }}
        onCancelConfirm={() => setConfirmOpen(false)}
        sendModalOpen={sendModalOpen} sendEmailInput={sendEmailInput} setSendEmailInput={setSendEmailInput}
        sendEmailStatus={sendEmailStatus} sendingEmail={sendingEmail}
        onSubmitSendEmail={handleSendEmailFromDashboard} onCloseSendModal={() => setSendModalOpen(false)}
      />
    </div>
  );
}

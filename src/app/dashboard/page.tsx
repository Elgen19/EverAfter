"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";
import { db, storage } from "@/utils/firebase";
import { collection, query, where, orderBy, getDocs, deleteDoc, onSnapshot, doc, getDoc } from "firebase/firestore";

interface SavedLetter {
  id?: string;
  recipient: string;
  sender: string;
  title: string;
  theme: string;
  link: string;
  timestamp: number;
  read?: boolean;
  readAt?: number | null;
  sendLaterDate?: string | null;
  envelopeStyle?: string | null;
  isWriteback?: boolean;
  dateInvite?: {
    enabled?: boolean;
    rsvpStatus?: "accepted" | "declined" | null;
    rsvpNotes?: string;
    rsvpTimestamp?: number;
  } | null;
}

export default function DashboardPage() {
  const { user, recipient, loading, logout } = useAuth();
  const router = useRouter();
  const [letters, setLetters] = useState<SavedLetter[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dramaticTransition, setDramaticTransition] = useState(false);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);

  useEffect(() => {
    setSelectedLinks([]);
  }, [activeTab]);

  // Romantic Alert Modal state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Romantic Confirmation Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmBtnText, setConfirmBtnText] = useState("Confirm 💔");

  const requestDelete = (link: string) => {
    setConfirmTitle("Letting Go...");
    setConfirmMessage("Are you sure you want to discard this love letter? Its words and memories will be dissolved into the stars forever.");
    setConfirmBtnText("Discard Letter 💔");
    setConfirmAction(() => () => deleteLetter(link));
    setConfirmOpen(true);
  };

  const showRomanticAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const getSenderFirstName = () => {
    if (!user) return "";
    const name = user.displayName || user.email.split("@")[0];
    let cleanName = name.replace(/[._-]/g, " ").trim();
    cleanName = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };

  const senderFirstName = getSenderFirstName();

  const getRecipientFirstName = () => {
    if (!recipient) return "";
    const name = recipient.firstName || "";
    let cleanName = name.replace(/[._-]/g, " ").trim();
    cleanName = cleanName.replace(/([a-z])([A-Z])/g, "$1 $2");
    return cleanName.split(/\s+/)[0] || "";
  };

  const recipientFirstName = getRecipientFirstName();

  const questionText = `What would you write today for ${recipientFirstName}, ${senderFirstName}?`;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!recipient) {
        router.push("/recipient-setup");
      }
    }
  }, [user, recipient, loading, router]);

  useEffect(() => {
    setMounted(true);
    if (!user) return;

    try {
      const q = query(
        collection(db, "letters"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedList: SavedLetter[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedList.push({
            id: doc.id,
            recipient: data.recipient,
            sender: data.sender,
            title: data.title,
            theme: data.theme,
            link: data.link,
            timestamp: data.timestamp,
            read: data.read || false,
            readAt: data.readAt || null,
            sendLaterDate: data.sendLaterDate || null,
            envelopeStyle: data.envelopeStyle || "vintage-rose",
            isWriteback: data.isWriteback || false,
            dateInvite: data.dateInvite || null
          });
        });
        fetchedList.sort((a, b) => b.timestamp - a.timestamp);
        setLetters(fetchedList);
      }, (err) => {
        console.error("Real-time letters listener error:", err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to establish letters subscription:", err);
    }
  }, [user]);

  const deleteLetter = async (linkToDelete: string) => {
    if (!user) return;
    const updated = letters.filter((l) => l.link !== linkToDelete);
    setLetters(updated);
    
    try {
      const q = query(
        collection(db, "letters"),
        where("userId", "==", user.uid),
        where("link", "==", linkToDelete)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to delete letter from Firestore:", err);
    }
  };

  const deleteSelectedLetters = async () => {
    if (!user || selectedLinks.length === 0) return;
    const linksToRemove = [...selectedLinks];
    setSelectedLinks([]);
    
    const updated = letters.filter((l) => !linksToRemove.includes(l.link));
    setLetters(updated);
    
    try {
      const lettersToDelete = letters.filter((l) => linksToRemove.includes(l.link));
      const deletePromises = lettersToDelete.map(async (letter) => {
        if (letter.id) {
          return deleteDoc(doc(db, "letters", letter.id));
        } else {
          const q = query(
            collection(db, "letters"),
            where("userId", "==", user.uid),
            where("link", "==", letter.link)
          );
          const snapshot = await getDocs(q);
          return Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
        }
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Failed to delete selected letters from Firestore:", err);
    }
  };

  const requestDeleteSelected = () => {
    if (selectedLinks.length === 0) return;
    setConfirmTitle("Dissolving Selected Memories...");
    setConfirmMessage(`Are you sure you want to discard the ${selectedLinks.length} selected letter(s)? Their words and memories will be dissolved into the stars forever.`);
    setConfirmBtnText("Discard Selected 💔");
    setConfirmAction(() => () => deleteSelectedLetters());
    setConfirmOpen(true);
  };

  const handleSelectAll = () => {
    const currentTabLetters = activeTab === "sent" ? sentLetters : receivedLetters;
    const currentLinks = currentTabLetters.map((l) => l.link);
    const allSelected = currentLinks.every((link) => selectedLinks.includes(link));
    
    if (allSelected) {
      setSelectedLinks(selectedLinks.filter((link) => !currentLinks.includes(link)));
    } else {
      const newSelection = Array.from(new Set([...selectedLinks, ...currentLinks]));
      setSelectedLinks(newSelection);
    }
  };

  const sentLetters = letters.filter((l) => !l.isWriteback);
  const receivedLetters = letters.filter((l) => l.isWriteback);

  const clearHistory = () => {
    if (!user) return;
    const isSent = activeTab === "sent";
    setConfirmTitle(isSent ? "Clearing Sent Letters..." : "Clearing Received Replies...");
    setConfirmMessage(
      isSent
        ? "Are you sure you want to clear your sent letter history? This will dissolve all your sent letters into the stars forever."
        : "Are you sure you want to clear your received replies? This will dissolve all writebacks you've received into the stars forever."
    );
    setConfirmBtnText(isSent ? "Clear Sent Letters 💔" : "Clear Replies 💔");
    setConfirmAction(() => async () => {
      const targetCleared = isSent ? sentLetters : receivedLetters;
      const updated = letters.filter((l) => !targetCleared.some((t) => t.link === l.link));
      setLetters(updated);
      try {
        const q = query(
          collection(db, "letters"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs
          .filter((doc) => {
            const data = doc.data();
            const letterIsWriteback = data.isWriteback === true;
            return isSent ? !letterIsWriteback : letterIsWriteback;
          })
          .map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error("Failed to clear letters from Firestore:", err);
      }
    });
    setConfirmOpen(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getThemeBadgeColor = (theme: string) => {
    switch (theme) {
      case "rose": return { bg: "rgba(255, 75, 114, 0.15)", text: "var(--accent-rose)" };
      case "lavender": return { bg: "rgba(123, 44, 191, 0.15)", text: "var(--accent-purple)" };
      case "celestial": return { bg: "rgba(226, 184, 87, 0.15)", text: "var(--accent-gold)" };
      case "classic":
      default:
        return { bg: "rgba(255, 255, 255, 0.08)", text: "var(--text-muted)" };
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

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex",
      flexDirection: "column",
      position: "relative", 
      paddingTop: "140px", 
      paddingBottom: "0px", 
      paddingLeft: "0px", 
      paddingRight: "0px" 
    }}>
      {/* Interactive Floating Hearts background */}
      <FloatingHearts />

      {/* Full-width screen-stretching Top Navigation Bar */}
      <header 
        className="glass"
        style={{ 
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 100,
          borderRadius: "0px",
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
          borderBottom: "1px solid var(--border-card)",
          background: "rgba(11, 7, 17, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)"
        }}
      >
        <div 
          style={{ 
            maxWidth: "1200px", 
            margin: "0 auto", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "20px 48px"
          }}
        >
          {/* Top Left: App Name */}
          <Link 
            href="/dashboard"
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <img 
              src="/logo.png" 
              alt="EverAfter Logo" 
              style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "8px", 
                objectFit: "cover",
                boxShadow: "0 0 10px rgba(255, 75, 114, 0.3)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }} 
            />
            <span style={{ 
              fontSize: "36px", 
              fontWeight: "normal", 
              fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", 
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              EverAfter
            </span>
          </Link>

          {/* Top Center: Receiver Name & Small Personalized Subtitle */}
          <div 
            style={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {/* Receiver Name */}
            <div 
              style={{ 
                fontSize: "28px", 
                fontWeight: 700, 
                color: "var(--accent-rose)", 
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "capitalize",
                fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive"
              }}
            >
              <span>{recipient.firstName}</span>
              <span>💖</span>
            </div>
            
            {/* Small Personalized Statement below */}
            <div 
              style={{ 
                fontSize: "14px", 
                color: "var(--text-muted)", 
                fontStyle: "italic",
                letterSpacing: "0.2px",
                maxWidth: "600px",
                textAlign: "center"
              }}
            >
              "I love you more than words can carry, more than time can measure and more than life itself could've ever imagine"
            </div>
          </div>

          {/* Top Right: Profile Image Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff4b72, #9c6cfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "20px",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(255, 75, 114, 0.25)",
                transition: "all 0.2s ease-in-out",
                border: "2px solid rgba(255, 255, 255, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 75, 114, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 75, 114, 0.25)";
              }}
              title="Profile Settings"
            >
              {user.email ? user.email[0].toUpperCase() : "👤"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "40px", flexGrow: 1 }}>
        
        {/* Main Dashboard Hero Section (Glassmorphic Overlay Card) */}
        <section 
          className="glass"
          style={{ 
            textAlign: "center", 
            display: "flex", 
            flexDirection: "column", 
            gap: "28px", 
            marginTop: "20px",
            padding: "50px 40px",
            borderRadius: "24px",
            border: "1px solid var(--border-card)",
            background: "linear-gradient(135deg, rgba(20, 15, 30, 0.7) 0%, rgba(255, 75, 114, 0.02) 100%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            alignItems: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Decorative light leak border at the top of overlay */}
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1.5px", background: "linear-gradient(to right, transparent, var(--accent-rose), var(--accent-purple), transparent)" }} />

          {/* Big Question Statement (Cursive Font & Explicit Fallback list) */}
          <h1 
            style={{
              fontSize: "52px",
              fontWeight: "bold",
              fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
              color: "#ffffff",
              textShadow: "0 0 15px rgba(255, 75, 114, 0.45)",
              lineHeight: "1.4",
              maxWidth: "800px",
              margin: "0 auto",
              display: "block"
            }}
          >
            {questionText}
          </h1>

          {/* Supporting Statement */}
          <p 
            style={{
              fontSize: "16px",
              color: "var(--text-muted)",
              lineHeight: "1.6",
              maxWidth: "540px",
              margin: "0 auto",
              opacity: 0.95
            }}
          >
            Create a custom digital message on EverAfter. Select stationery, write your feelings, set release conditions, play background lo-fi music, and seal it with a realistic wax stamp.
          </p>

          {/* Action button */}
          <div style={{ marginTop: "12px" }}>
            <button
              id="btn-create-letter"
              onClick={(e) => {
                e.preventDefault();
                setDramaticTransition(true);
                setTimeout(() => {
                  router.push("/create");
                }, 1000);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 36px",
                borderRadius: "30px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(255, 75, 114, 0.35)",
                transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(255, 75, 114, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(255, 75, 114, 0.35)";
              }}
            >
              Write a Love Letter
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </section>

        {/* History / Letters list */}
        <section 
          className="glass"
          style={{
            padding: "30px",
            marginTop: "20px",
            marginBottom: "80px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {/* Tab Headers */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border-card)", paddingBottom: "2px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setActiveTab("sent")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: activeTab === "sent" ? "var(--accent-rose)" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: "8px 16px 14px 16px",
                  position: "relative",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>Sent Letters</span>
                <span style={{ 
                  fontSize: "10px", 
                  color: activeTab === "sent" ? "#fff" : "var(--text-muted)", 
                  backgroundColor: activeTab === "sent" ? "rgba(255, 75, 114, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: activeTab === "sent" ? "1px solid rgba(255, 75, 114, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "1px 6px", 
                  borderRadius: "10px" 
                }}>
                  {sentLetters.length}
                </span>
                {activeTab === "sent" && (
                  <div style={{ position: "absolute", bottom: "-1.5px", left: 0, right: 0, height: "2.5px", backgroundColor: "var(--accent-rose)", borderRadius: "2px" }} />
                )}
              </button>
              <button
                onClick={() => setActiveTab("received")}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: activeTab === "received" ? "var(--accent-rose)" : "var(--text-muted)",
                  cursor: "pointer",
                  padding: "8px 16px 14px 16px",
                  position: "relative",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                gap: "6px"
                }}
              >
                <span>Received Writebacks</span>
                <span style={{ 
                  fontSize: "10px", 
                  color: activeTab === "received" ? "#fff" : "var(--text-muted)", 
                  backgroundColor: activeTab === "received" ? "rgba(255, 75, 114, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: activeTab === "received" ? "1px solid rgba(255, 75, 114, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "1px 6px", 
                  borderRadius: "10px" 
                }}>
                  {receivedLetters.length}
                </span>
                {activeTab === "received" && (
                  <div style={{ position: "absolute", bottom: "-1.5px", left: 0, right: 0, height: "2.5px", backgroundColor: "var(--accent-rose)", borderRadius: "2px" }} />
                )}
              </button>
            </div>
          </div>

          {/* Selection & Action Bar */}
          {mounted && (activeTab === "sent" ? sentLetters.length > 0 : receivedLetters.length > 0) && (
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "10px 16px", 
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-card)",
                marginTop: "10px",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-muted)", userSelect: "none" }}>
                  <input 
                    type="checkbox"
                    checked={
                      (activeTab === "sent" ? sentLetters : receivedLetters).length > 0 &&
                      (activeTab === "sent" ? sentLetters : receivedLetters).every((l) => selectedLinks.includes(l.link))
                    }
                    onChange={handleSelectAll}
                    style={{ 
                      accentColor: "var(--accent-rose)",
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                  <span>Select All</span>
                </label>
                {selectedLinks.length > 0 && (
                  <span style={{ fontSize: "12px", color: "var(--accent-rose)", fontWeight: 500 }}>
                    {selectedLinks.length} selected
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedLinks.length > 0 ? (
                  <button
                    onClick={requestDeleteSelected}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255, 75, 114, 0.15)",
                      border: "1px solid rgba(255, 75, 114, 0.3)",
                      color: "var(--accent-rose)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.15)";
                    }}
                  >
                    Delete Selected ({selectedLinks.length}) 💔
                  </button>
                ) : (
                  <button 
                    onClick={clearHistory}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,75,114,0.7)",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,75,114,0.7)")}
                  >
                    {activeTab === "sent" ? "Clear Sent Letters" : "Clear Received Writebacks"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conditional history loading */}
          {!mounted ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>
              Loading history...
            </div>
          ) : (activeTab === "sent" ? sentLetters.length === 0 : receivedLetters.length === 0) ? (
            <div 
              style={{ 
                textAlign: "center", 
                padding: "50px 20px", 
                border: "1px dashed var(--border-card)", 
                borderRadius: "12px", 
                color: "var(--text-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <div style={{ fontSize: "28px" }}>{activeTab === "sent" ? "✉" : "💬"}</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>
                {activeTab === "sent" ? "No letters written yet" : "No writebacks received yet"}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.7, maxWidth: "320px", lineHeight: "1.5" }}>
                {activeTab === "sent" 
                  ? "Letters you write and seal will show up here, so you can easily access their links again."
                  : "Once your partner clicks 'Write Back' at the end of your letter and sends a reply, it will appear here."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(activeTab === "sent" ? sentLetters : receivedLetters).map((letter, idx) => {
                const badge = getThemeBadgeColor(letter.theme);
                return (
                  <div 
                    key={letter.timestamp + "-" + idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-card)",
                      transition: "all 0.2s",
                      gap: "20px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-card)";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                      {/* Checkbox for multiple selection */}
                      <input 
                        type="checkbox"
                        checked={selectedLinks.includes(letter.link)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLinks([...selectedLinks, letter.link]);
                          } else {
                            setSelectedLinks(selectedLinks.filter((link) => link !== letter.link));
                          }
                        }}
                        style={{
                          accentColor: "var(--accent-rose)",
                          cursor: "pointer",
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          flexShrink: 0
                        }}
                      />

                      {/* Letter info */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {letter.isWriteback ? `From: ${letter.sender}` : `To: ${letter.recipient}`}
                          </span>
                          <span 
                            style={{ 
                              fontSize: "10px", 
                              fontWeight: "bold",
                              textTransform: "uppercase", 
                              backgroundColor: badge.bg, 
                              color: badge.text, 
                              padding: "2px 8px", 
                              borderRadius: "10px" 
                            }}
                          >
                            {letter.theme}
                          </span>
                          
                          {/* Envelope style info */}
                          <span 
                            style={{ 
                              fontSize: "10px", 
                              fontWeight: "bold",
                              textTransform: "uppercase", 
                              backgroundColor: "rgba(255, 255, 255, 0.05)", 
                              color: "var(--text-muted)", 
                              padding: "2px 8px", 
                              borderRadius: "10px",
                              border: "1px solid rgba(255, 255, 255, 0.06)"
                            }}
                          >
                            ✉️ {letter.envelopeStyle === "vintage-white" ? "White Linen" : "Vintage Parchment"}
                          </span>

                          {/* Scheduled / Release status info */}
                          {!letter.isWriteback && (
                            letter.sendLaterDate ? (
                              <span 
                                style={{ 
                                  fontSize: "10px", 
                                  fontWeight: "bold",
                                  textTransform: "uppercase", 
                                  backgroundColor: "rgba(226, 184, 87, 0.12)", 
                                  color: "var(--accent-gold)", 
                                  padding: "2px 8px", 
                                  borderRadius: "10px",
                                  border: "1px solid rgba(226, 184, 87, 0.2)"
                                }}
                                title={`Release Date-Time: ${letter.sendLaterDate}`}
                              >
                                ⏰ Scheduled
                              </span>
                            ) : (
                              <span 
                                style={{ 
                                  fontSize: "10px", 
                                  fontWeight: "bold",
                                  textTransform: "uppercase", 
                                  backgroundColor: "rgba(16, 185, 129, 0.08)", 
                                  color: "#10b981", 
                                  padding: "2px 8px", 
                                  borderRadius: "10px",
                                  border: "1px solid rgba(16, 185, 129, 0.15)"
                                }}
                              >
                                ✓ Instant
                              </span>
                            )
                          )}

                          {letter.isWriteback ? (
                            <span 
                              style={{ 
                                fontSize: "10px", 
                                fontWeight: "bold",
                                textTransform: "uppercase", 
                                backgroundColor: "rgba(156, 108, 250, 0.15)", 
                                color: "var(--accent-purple)", 
                                padding: "2px 8px", 
                                borderRadius: "10px",
                                border: "1px solid rgba(156, 108, 250, 0.2)"
                              }}
                            >
                              ✍️ Reply
                            </span>
                          ) : (
                            letter.read ? (
                              <span 
                                style={{ 
                                  fontSize: "10px", 
                                  fontWeight: "bold",
                                  textTransform: "uppercase", 
                                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                                  color: "#10b981",
                                  padding: "2px 8px", 
                                  borderRadius: "10px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                                title={`Opened on ${letter.readAt ? formatDate(letter.readAt) : "unknown date"}`}
                              >
                                ✓✓ Read
                              </span>
                            ) : (
                              <span 
                                style={{ 
                                  fontSize: "10px", 
                                  fontWeight: "bold",
                                  textTransform: "uppercase", 
                                  backgroundColor: "rgba(156, 163, 175, 0.15)",
                                  color: "#9ca3af",
                                  padding: "2px 8px", 
                                  borderRadius: "10px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px"
                                }}
                                title="Not opened yet"
                              >
                                ✓ Sent
                              </span>
                            )
                          )}

                          {letter.dateInvite?.enabled && (
                            <span 
                              style={{ 
                                fontSize: "10px", 
                                fontWeight: "bold",
                                textTransform: "uppercase", 
                                backgroundColor: letter.dateInvite.rsvpStatus === "accepted" 
                                  ? "rgba(16, 185, 129, 0.15)" 
                                  : letter.dateInvite.rsvpStatus === "declined"
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(245, 158, 11, 0.15)",
                                color: letter.dateInvite.rsvpStatus === "accepted" 
                                  ? "#10b981" 
                                  : letter.dateInvite.rsvpStatus === "declined"
                                    ? "#ef4444"
                                    : "#f59e0b",
                                padding: "2px 8px", 
                                borderRadius: "10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                border: letter.dateInvite.rsvpStatus === "accepted"
                                  ? "1px solid rgba(16, 185, 129, 0.2)"
                                  : letter.dateInvite.rsvpStatus === "declined"
                                    ? "1px solid rgba(239, 68, 68, 0.2)"
                                    : "1px solid rgba(245, 158, 11, 0.2)"
                              }}
                              title={
                                letter.dateInvite.rsvpStatus === "accepted" 
                                  ? `Accepted! Notes: "${letter.dateInvite.rsvpNotes || 'None'}"`
                                  : letter.dateInvite.rsvpStatus === "declined"
                                    ? `Declined.`
                                    : "Waiting for response..."
                              }
                            >
                              {letter.dateInvite.rsvpStatus === "accepted" 
                                ? "🌹 RSVP Accepted" 
                                : letter.dateInvite.rsvpStatus === "declined"
                                  ? "💔 RSVP Declined"
                                  : "⏳ RSVP Pending"}
                            </span>
                          )}
                        </div>
                        {letter.title && !letter.title.toLowerCase().includes("secret letter") && (
                          <div style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {letter.title}
                          </div>
                        )}
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                          {formatDate(letter.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {!letter.isWriteback && (
                        <Link 
                          href={`/create?edit=${letter.id}`}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(156, 108, 250, 0.12)",
                            border: "1px solid rgba(156, 108, 250, 0.25)",
                            color: "var(--accent-purple)",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(156, 108, 250, 0.2)";
                            e.currentTarget.style.borderColor = "rgba(156, 108, 250, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(156, 108, 250, 0.12)";
                            e.currentTarget.style.borderColor = "rgba(156, 108, 250, 0.25)";
                          }}
                        >
                          Edit
                        </Link>
                      )}
                      <Link 
                        href={letter.isWriteback ? `/letter?d=${letter.link.split("?d=")[1]}` : `/letter?d=${letter.link.split("?d=")[1]}&preview=true`}
                        target="_blank"
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: "1px solid var(--border-card)",
                          color: "var(--text-main)",
                          fontSize: "12px",
                          fontWeight: 500,
                          textDecoration: "none",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.borderColor = "var(--border-card)";
                        }}
                      >
                        {letter.isWriteback ? "View" : "Preview"}
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(letter.link);
                          showRomanticAlert("Shared with Love", "Your magical love letter link is copied to your clipboard. Send it to your partner to unlock the magic! 💌");
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          background: "none",
                          border: "1px solid var(--border-card)",
                          color: "var(--text-muted)",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--text-main)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-muted)";
                          e.currentTarget.style.borderColor = "var(--border-card)";
                        }}
                        title="Copy Link"
                      >
                        Copy
                      </button>

                      <button
                        onClick={() => requestDelete(letter.link)}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          background: "none",
                          border: "none",
                          color: "rgba(255, 75, 114, 0.4)",
                          cursor: "pointer",
                          transition: "color 0.2s"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 75, 114, 0.4)")}
                        title="Delete from History"
                      >
                        {/* Trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <footer 
        style={{
          marginTop: "auto",
          textAlign: "center",
          padding: "40px 20px",
          fontSize: "14px",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-card)",
          background: "rgba(7, 5, 11, 0.95)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          fontFamily: "var(--font-ui)",
          letterSpacing: "0.5px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          position: "relative",
          zIndex: 10
        }}
      >
        <div style={{ color: "var(--text-main)", fontWeight: 500 }}>
          EverAfter © {new Date().getFullYear()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>Made with love by Elgen for Faith</span>
        </div>
        <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px" }}>
          A digital love letter creation suite for unforgettable sentiments.
        </div>
      </footer>

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

      {confirmOpen && (
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
            <span style={{ fontSize: "40px" }}>💔</span>
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
                {confirmTitle}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                {confirmMessage}
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
              <button
                onClick={() => {
                  if (confirmAction) confirmAction();
                  setConfirmOpen(false);
                }}
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
                {confirmBtnText}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border-card)",
                  color: "var(--text-main)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
              >
                Keep Safe 💖
              </button>
            </div>
          </div>
        </div>
      )}

      {dramaticTransition && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0b0711",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "dramatic-slide-up 1.2s cubic-bezier(0.85, 0, 0.15, 1) forwards",
            pointerEvents: "all"
          }}
        >
          <style>{`
            @keyframes dramatic-slide-up {
              0% { transform: translateY(100vh); opacity: 0; }
              30% { opacity: 1; }
              100% { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "100px", animation: "heartbeat-survey 0.8s infinite ease-in-out" }}>💖</div>
            <div style={{ 
              fontSize: "28px", 
              fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
              color: "var(--accent-rose)",
              textShadow: "0 0 10px rgba(255, 75, 114, 0.5)"
            }}>
              Opening Creator Studio...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

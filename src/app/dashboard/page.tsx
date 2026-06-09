"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";
import { db } from "@/utils/firebase";
import { collection, query, where, orderBy, getDocs, deleteDoc, onSnapshot } from "firebase/firestore";

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
}

export default function DashboardPage() {
  const { user, recipient, loading, logout } = useAuth();
  const router = useRouter();
  const [letters, setLetters] = useState<SavedLetter[]>([]);
  const [mounted, setMounted] = useState(false);

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
            readAt: data.readAt || null
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

  const clearHistory = () => {
    if (!user) return;
    setConfirmTitle("Clearing All Memories...");
    setConfirmMessage("Are you sure you want to clear your letter history? This will dissolve all your sent letters and receipts into the stars forever.");
    setConfirmBtnText("Clear History 💔");
    setConfirmAction(() => async () => {
      setLetters([]);
      try {
        const q = query(
          collection(db, "letters"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
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
                fontSize: "24px", 
                fontWeight: 700, 
                color: "var(--accent-rose)", 
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "capitalize"
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
                fontFamily: "var(--font-cursive)",
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
            <Link
              href="/create"
              id="btn-create-letter"
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
                textDecoration: "none",
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
            </Link>
          </div>
        </section>

        {/* History / Sent Letters list */}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Your Sent Letters</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", backgroundColor: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "10px" }}>
                {letters.length}
              </span>
            </h2>
            {letters.length > 0 && (
              <button 
                onClick={clearHistory}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,75,114,0.7)",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,75,114,0.7)")}
              >
                Clear History
              </button>
            )}
          </div>

          {/* Conditional history loading */}
          {!mounted ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: "14px" }}>
              Loading history...
            </div>
          ) : letters.length === 0 ? (
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
              <div style={{ fontSize: "28px" }}>✉</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>No letters written yet</div>
              <div style={{ fontSize: "12px", opacity: 0.7, maxWidth: "300px", lineHeight: "1.5" }}>
                Letters you write and seal will show up here, so you can easily access their links again.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {letters.map((letter, idx) => {
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
                    {/* Letter info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                          To: {letter.recipient}
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
                        {letter.read ? (
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
                        )}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                        {letter.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                        {formatDate(letter.timestamp)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Link 
                        href={`/letter?d=${letter.link.split("?d=")[1]}&preview=true`}
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
                        Preview
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
    </div>
  );
}

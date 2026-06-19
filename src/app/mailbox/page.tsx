"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/utils/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import FloatingHearts from "@/components/FloatingHearts";

interface MailboxLetter {
  id: string;
  title: string;
  sender: string;
  recipient: string;
  timestamp: number;
  read: boolean;
  theme: string;
  envelopeStyle: string;
  link: string;
  isWriteback?: boolean;
  replyToId?: string;
}

function MailboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refId = searchParams.get("ref") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [letters, setLetters] = useState<MailboxLetter[]>([]);
  const [refLetter, setRefLetter] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isTransitioningToLetter, setIsTransitioningToLetter] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "received" | "sent">("all");

  const displayedLetters = useMemo(() => {
    if (activeTab === "received") {
      return letters.filter((l) => !l.isWriteback);
    }
    if (activeTab === "sent") {
      return letters.filter((l) => l.isWriteback);
    }
    return letters;
  }, [letters, activeTab]);

  // Scroll tracking states & refs
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef(0);

  // Reset active index when changing tabs
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  // Manual non-passive event listeners to successfully preventDefault and block body scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || displayedLetters.length === 0) return;

    const handleWheelPassive = (e: WheelEvent) => {
      e.preventDefault(); // blocks native browser body scrolling!
      const now = Date.now();
      if (now - lastWheelTime.current < 250) return; // 250ms cooldown

      if (e.deltaY > 10) {
        setActiveIndex(prev => Math.min(displayedLetters.length - 1, prev + 1));
        lastWheelTime.current = now;
      } else if (e.deltaY < -10) {
        setActiveIndex(prev => Math.max(0, prev - 1));
        lastWheelTime.current = now;
      }
    };

    const handleTouchMovePassive = (e: TouchEvent) => {
      e.preventDefault(); // blocks mobile bounce/overscroll!
    };

    container.addEventListener("wheel", handleWheelPassive, { passive: false });
    container.addEventListener("touchmove", handleTouchMovePassive, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheelPassive);
      container.removeEventListener("touchmove", handleTouchMovePassive);
    };
  }, [displayedLetters]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (displayedLetters.length === 0) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 40) { // 40px threshold for swipes
      if (diff > 0) {
        setActiveIndex(prev => Math.min(displayedLetters.length - 1, prev + 1));
      } else {
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (displayedLetters.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        setActiveIndex(prev => Math.min(displayedLetters.length - 1, prev + 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setActiveIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayedLetters]);

  useEffect(() => {
    if (!refId) {
      setError("No reference letter found. Please check your link.");
      setLoading(false);
      return;
    }

    const loadMailbox = async () => {
      try {
        if (!db) {
          setError("Database is not initialized.");
          setLoading(false);
          return;
        }

        const docRef = doc(db, "letters", refId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("The reference letter could not be found.");
          setLoading(false);
          return;
        }

        const refData = docSnap.data();
        setRefLetter(refData);

        const isUnlocked = refData.security?.enabled 
          ? sessionStorage.getItem(`unlocked_${refId}`) === "true"
          : true;

        if (!isUnlocked) {
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        setIsAuthorized(true);

        let userId = refData.userId;
        let email = refData.email;

        if (refData.isWriteback) {
          if (refData.replyToId) {
            const parentDocRef = doc(db, "letters", refData.replyToId);
            const parentDocSnap = await getDoc(parentDocRef);
            if (parentDocSnap.exists()) {
              const parentData = parentDocSnap.data();
              userId = parentData.userId || userId;
              email = parentData.email || email;
            }
          } else if (refData.senderEmail) {
            email = refData.senderEmail;
          }
        }

        if (!userId || !email) {
          setError("Incomplete letter metadata. Cannot retrieve letterbox.");
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "letters"),
          where("userId", "==", userId),
          where("email", "==", email)
        );

        const querySnapshot = await getDocs(q);
        const fetchedLetters: MailboxLetter[] = [];
        const letterIds: string[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let isFuture = false;
          if (data.sendLaterDate) {
            if (+new Date(data.sendLaterDate) > Date.now()) {
              isFuture = true;
            }
          }
          
          if (!isFuture) {
            fetchedLetters.push({
              id: docSnap.id,
              title: data.title || "Love Letter",
              sender: data.sender || "Yours Truly",
              recipient: data.recipient || "My Love",
              timestamp: data.timestamp || Date.now(),
              read: data.read || false,
              theme: data.theme || "scroll",
              envelopeStyle: data.envelopeStyle || "vintage-rose",
              link: data.link || `/letter?id=${docSnap.id}`,
              isWriteback: false,
              replyToId: ""
            });
            letterIds.push(docSnap.id);
          }
        });

        // Query for writebacks that reply to any of these letters
        if (letterIds.length > 0) {
          const wbQuery = query(
            collection(db, "letters"),
            where("userId", "==", userId),
            where("isWriteback", "==", true)
          );
          const wbSnapshot = await getDocs(wbQuery);
          wbSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.replyToId && letterIds.includes(data.replyToId)) {
              fetchedLetters.push({
                id: docSnap.id,
                title: data.title || "Write Back",
                sender: data.sender || "My Love",
                recipient: data.recipient || "Yours Truly",
                timestamp: data.timestamp || Date.now(),
                read: data.read || false,
                theme: data.theme || "scroll",
                envelopeStyle: data.envelopeStyle || "vintage-rose",
                link: data.link || `/letter?id=${docSnap.id}`,
                isWriteback: true,
                replyToId: data.replyToId
              });
            }
          });
        }

        fetchedLetters.sort((a, b) => b.timestamp - a.timestamp);
        setLetters(fetchedLetters);
      } catch (err) {
        console.error("Failed to load mailbox:", err);
        setError("An error occurred while loading your letterbox.");
      } finally {
        setLoading(false);
      }
    };

    loadMailbox();
  }, [refId]);

  // Focus the active reference letter on page load
  useEffect(() => {
    if (displayedLetters.length === 0 || !refId) return;
    const index = displayedLetters.findIndex(l => l.id === refId);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [displayedLetters, refId]);

  if (error) {
    return (
      <div className="glass" style={{ maxWidth: "480px", padding: "40px 30px", textAlign: "center", margin: "100px auto", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📬</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Mailbox Error</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "24px" }}>
          {error}
        </p>
        <Link 
          href="/" 
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "var(--accent-rose)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            textDecoration: "none"
          }}
        >
          Go to Home
        </Link>
      </div>
    );
  }

  if (!isAuthorized && !loading) {
    return (
      <div className="glass" style={{ maxWidth: "480px", padding: "40px 30px", textAlign: "center", margin: "100px auto", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔒</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Access Locked</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "24px" }}>
          Please unlock the reference letter first before accessing your letterbox.
        </p>
        <button 
          onClick={() => router.push(`/letter?id=${refId}`)}
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "var(--accent-rose)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Unlock Letter 🔑
        </button>
      </div>
    );
  }

  const recipientName = refLetter?.recipient || "My Love";
  const senderName = refLetter?.sender || "Yours Truly";

  const getEnvelopeIcon = (style: string) => {
    switch (style) {
      case "celestial-blue": return "✨";
      case "vintage-white": return "✉";
      default: return "🌹";
    }
  };

  const getRelativeLink = (absoluteUrl: string) => {
    try {
      const url = new URL(absoluteUrl);
      return url.pathname + url.search;
    } catch (e) {
      return absoluteUrl;
    }
  };

  return (
    <div style={{ 
      height: "100%", 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between", 
      padding: "24px 20px 20px 20px", 
      boxSizing: "border-box",
      position: "relative", 
      zIndex: 10 
    }}>
      {/* Dynamic Dramatic Loading Screen Overlay */}
      <div 
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#100907",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          opacity: loading ? 1 : 0,
          transform: loading ? "scale(1)" : "scale(1.15) translateY(-5vh)",
          visibility: loading ? "visible" : "hidden",
          transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease, visibility 0s linear 1.2s",
          pointerEvents: loading ? "all" : "none"
        }}
      >
        <div style={{
          position: "relative",
          width: "120px",
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px"
        }}>
          {/* Keyhole glowing background rings */}
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "2px solid rgba(226, 184, 87, 0.3)",
            boxShadow: "0 0 30px rgba(226, 184, 87, 0.2), inset 0 0 15px rgba(226, 184, 87, 0.1)",
            animation: "pulse-keyhole 2.5s ease-in-out infinite"
          }} />
          <div style={{
            position: "absolute",
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            border: "1.5px solid rgba(226, 184, 87, 0.5)",
            boxShadow: "0 0 20px rgba(226, 184, 87, 0.3)",
            animation: "pulse-keyhole 2.5s ease-in-out infinite",
            animationDelay: "0.5s"
          }} />
          {/* Center Keyhole SVG */}
          <svg width="40" height="50" viewBox="0 0 24 30" fill="none" style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 0 8px var(--accent-gold))" }}>
            <circle cx="12" cy="9" r="6" fill="var(--accent-gold)" />
            <path d="M7.5 13.5H16.5L18 27H6L7.5 13.5Z" fill="var(--accent-gold)" />
            <path d="M12 9V20" stroke="#100907" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{
          fontFamily: "var(--font-cursive)",
          fontSize: "28px",
          color: "var(--accent-gold)",
          textShadow: "0 2px 10px rgba(226, 184, 87, 0.3)",
          animation: "pulse-text 2s ease-in-out infinite",
          textAlign: "center"
        }}>
          Preparing your Memory Chest...
        </div>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "11px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginTop: "8px",
          opacity: 0.6
        }}>
          Unlocking envelopes
        </div>
      </div>

      {/* Dramatic Page Transition Overlay */}
      {isTransitioningToLetter && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all"
          }}
        >
          {/* Radial Blinding Flare */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #fffcf5 35%, #ffdca8 65%, #100907 100%)",
              animation: "dramatic-bright-flash 1.6s cubic-bezier(0.25, 1, 0.3, 1) forwards",
            }}
          />
          {/* Supernova Expansion Shockwave Ring */}
          <div 
            style={{
              position: "absolute",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "8px solid rgba(255, 255, 255, 0.95)",
              boxShadow: "0 0 80px 40px rgba(226, 184, 87, 0.85), inset 0 0 40px 20px rgba(255, 255, 255, 0.95)",
              animation: "supernova-shockwave 1.6s cubic-bezier(0.1, 0.8, 0.1, 1) forwards",
            }}
          />
          {/* Bursting Sparkling Hearts & Gold Dust Particles */}
          <div style={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}>
            {[...Array(30)].map((_, i) => {
              // Deterministic pseudo-random number generator for react purity rules
              const getPseudoRandom = (idx: number, offset: number) => {
                const seed = idx * 12345.67 + offset * 9876.54;
                const x = Math.sin(seed) * 10000;
                return x - Math.floor(x);
              };
              const angle = (i * 360) / 30 + getPseudoRandom(i, 1) * 15;
              const velocity = 120 + getPseudoRandom(i, 2) * 280;
              const rad = (angle * Math.PI) / 180;
              const tx = `${Math.cos(rad) * velocity}px`;
              const ty = `${Math.sin(rad) * velocity}px`;
              const scale = 0.6 + getPseudoRandom(i, 3) * 1.2;
              const delay = getPseudoRandom(i, 4) * 0.12;
              const isHeart = i % 3 === 0;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) scale(0)",
                    fontSize: isHeart ? `${18 + getPseudoRandom(i, 5) * 18}px` : `${12 + getPseudoRandom(i, 6) * 12}px`,
                    color: isHeart ? "#ff4b72" : "#e2b857",
                    textShadow: "0 0 10px rgba(255,255,255,0.9)",
                    filter: "drop-shadow(0 0 12px rgba(226, 184, 87, 0.85))",
                    animation: "spark-fly 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
                    animationDelay: `${delay}s`,
                    ["--tx" as any]: tx,
                    ["--ty" as any]: ty,
                    ["--scale" as any]: scale,
                  } as React.CSSProperties}
                >
                  {isHeart ? "💖" : "✨"}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        :root {
          --slot-height: 170px;
        }
        @media (max-width: 600px) {
          :root {
            --slot-height: 110px;
          }
        }
        @media (max-width: 400px) {
          :root {
            --slot-height: 85px;
          }
        }
        @keyframes fall-left {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(30px, 105vh, 0) rotate(270deg);
            opacity: 0;
          }
        }
        @keyframes fall-right {
          0% {
            transform: translate3d(0, -20px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          90% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-30px, 105vh, 0) rotate(-270deg);
            opacity: 0;
          }
        }
        @keyframes candle-flicker {
          0%, 100% { opacity: 0.88; }
          18% { opacity: 0.82; }
          22% { opacity: 0.93; }
          43% { opacity: 0.85; }
          45% { opacity: 0.96; }
          70% { opacity: 0.83; }
          78% { opacity: 0.92; }
          82% { opacity: 0.87; }
        }
        @keyframes drift-particle {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 0.45;
          }
          80% {
            opacity: 0.45;
          }
          100% {
            transform: translate3d(var(--drift-x, 40px), var(--drift-y, -120px), 0) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes active-shake {
          0% { transform: scale(0.9) rotate(var(--rotation, 0deg)); }
          25% { transform: scale(1.08) rotate(-2deg); }
          50% { transform: scale(1.08) rotate(2deg); }
          75% { transform: scale(1.08) rotate(-1deg); }
          90% { transform: scale(1.08) rotate(0.5deg); }
          100% { transform: scale(1.08) rotate(0deg); }
        }
        .active-envelope-shake {
          animation: active-shake 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        @keyframes pulse-keyhole {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 40px rgba(226, 184, 87, 0.4), inset 0 0 15px rgba(226, 184, 87, 0.2); }
        }
        @keyframes pulse-text {
          0%, 100% { opacity: 0.7; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes dramatic-bright-flash {
          0% {
            transform: scale(0.3);
            opacity: 0;
            filter: blur(10px);
          }
          15% {
            opacity: 1;
            filter: blur(0);
          }
          75% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes supernova-shockwave {
          0% {
            transform: scale(0.1);
            opacity: 1;
            border-width: 20px;
          }
          50% {
            opacity: 1;
            border-width: 8px;
          }
          100% {
            transform: scale(25);
            opacity: 0;
            border-width: 0.1px;
          }
        }
        @keyframes spark-fly {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Top Left Floating Back Button */}
      <button
        onClick={() => router.push(`/letter?id=${refId}`)}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(20, 15, 30, 0.65)",
          border: "1px solid rgba(226, 184, 87, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 100,
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.borderColor = "var(--accent-gold)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(226,184,87,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = "rgba(226, 184, 87, 0.4)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
        }}
        title="Back to Letter"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Floating Cherry Blossom Petals */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
        {[...Array(8)].map((_, i) => {
          const isLeft = i % 2 === 0;
          const delay = i * 2.2;
          const duration = 8 + (i % 3) * 3;
          const leftPos = isLeft ? (i * 2) % 15 : 85 + (i * 2) % 15;
          const size = 10 + (i % 3) * 6;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "-20px",
                left: `${leftPos}%`,
                width: `${size}px`,
                height: `${size * 0.8}px`,
                backgroundColor: i % 2 === 0 ? "#ffb7c5" : "#ffa3b1",
                borderRadius: "50% 0% 50% 50%",
                opacity: 0,
                animation: `${isLeft ? "fall-left" : "fall-right"} ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                transformOrigin: "center"
              }}
            />
          );
        })}
      </div>

      <header style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{ display: "inline-block", fontSize: "40px", marginBottom: "4px", filter: "drop-shadow(0 2px 6px rgba(226,184,87,0.25))" }}>📬</div>
        <h1 style={{ 
          fontSize: "42px", 
          fontFamily: "var(--font-cursive)", 
          background: "linear-gradient(to right, #ff4b72, #e2b857, #9c6cfa)", 
          WebkitBackgroundClip: "text", 
          WebkitTextFillColor: "transparent", 
          marginBottom: "6px",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)"
        }}>
          My Memory Chest
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic", maxWidth: "600px", margin: "0 auto", lineHeight: "1.4" }}>
          A collection of letters written for <span style={{ color: "#fff", fontWeight: 600 }}>{recipientName}</span> by <span style={{ color: "#fff", fontWeight: 600 }}>{senderName}</span>
        </p>
        <div style={{ width: "80px", height: "1px", background: "linear-gradient(to right, transparent, var(--accent-gold), transparent)", marginTop: "10px" }} />
      </header>

      {/* Tab Selector */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(20, 15, 30, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "30px",
        padding: "4px",
        margin: "16px auto 0 auto",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        zIndex: 50,
        position: "relative",
        flexShrink: 0
      }}>
        {([
          { id: "all", label: "All Messages", icon: "✨" },
          { id: "received", label: `From ${senderName}`, icon: "✉" },
          { id: "sent", label: "My Replies", icon: "✍" }
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "26px",
                border: "none",
                background: isActive 
                  ? "linear-gradient(135deg, rgba(156, 108, 250, 0.8) 0%, rgba(255, 75, 114, 0.8) 100%)" 
                  : "transparent",
                color: isActive ? "#fff" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                boxShadow: isActive ? "0 4px 12px rgba(255, 75, 114, 0.25)" : "none",
                outline: "none"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>


      {/* Letters Stack - Virtual vertically sliding track for centering envelopes without scroll gaps */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="hide-scrollbar" 
        style={{ 
          flexGrow: 1, 
          overflow: "hidden", 
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "0",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(calc(-1 * (${activeIndex} * var(--slot-height) + var(--slot-height) / 2)))`,
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            transformOrigin: "center center",
            willChange: "transform"
          }}
        >
        {displayedLetters.map((letter, index) => {
          const isCurrentRef = letter.id === refId;
          const isActive = index === activeIndex;

          const isVintageWhite = letter.envelopeStyle === "vintage-white";
          const isCelestialBlue = letter.envelopeStyle === "celestial-blue";
          const isVintageRose = !isVintageWhite && !isCelestialBlue;
          const themeClass = `theme-${letter.theme || "scroll"}`;

          const labelColor = isVintageWhite ? "rgba(47, 42, 36, 0.45)" : "rgba(244, 230, 206, 0.5)";
          const textColor = isVintageWhite ? "rgba(47, 42, 36, 0.65)" : "rgba(244, 230, 206, 0.85)";
          const nameColor = isVintageWhite ? "#9c1c2e" : "#e2b857";
          
          // Generate deterministic rotation offsets for authentic pile aesthetic
          const rotations = [-2.2, 1.6, -1.0, 2.0, -0.5, 1.4, -1.6, 1.0];
          const rotation = rotations[index % rotations.length];
          
          return (
            <div
              key={letter.id}
              data-index={index}
              style={{
                height: "var(--slot-height)",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                zIndex: isActive ? 99999 : index + 10,
                overflow: "visible",
                pointerEvents: "none"
              }}
            >
              <div
                onClick={() => {
                  if (isTransitioningToLetter) return;
                  setIsTransitioningToLetter(true);
                  let targetLink = getRelativeLink(letter.link);
                  if (letter.isWriteback) {
                    targetLink += targetLink.includes("?") ? "&preview=true" : "?preview=true";
                  }
                  setTimeout(() => {
                    router.push(targetLink);
                  }, 1200);
                }}
                className={isActive ? "active-envelope-shake" : ""}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  // Compositor-only translate/scale/rotate changes are buttery smooth and GPU accelerated!
                  transform: isActive 
                    ? undefined 
                    : `scale(0.9) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: isActive ? undefined : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  ["--rotation" as any]: `${rotation}deg`
                } as React.CSSProperties}
              >
                {/* Envelope Core from Envelope.tsx */}
                <div className="envelope-container" style={{ transform: "scale(0.85)" }}>
                  <div 
                    className={`envelope-wrapper ${themeClass} vintage-rose-style`}
                    style={{
                      boxShadow: isActive
                        ? "0 25px 50px rgba(0,0,0,0.7), 0 0 25px rgba(226, 184, 87, 0.4)"
                        : isCurrentRef 
                          ? "0 0 20px rgba(226, 184, 87, 0.3), 0 10px 25px rgba(0,0,0,0.45)" 
                          : "0 10px 25px rgba(0,0,0,0.45)",
                      transition: "box-shadow 0.4s ease"
                    }}
                  >
                    <div 
                      className="envelope vintage-rose-style"
                    style={{
                      "--env-bg-image": isCelestialBlue ? "url(/celestial_envelope_open.png)" :
                                        isVintageWhite ? "url(/white_envelope_open.png)" : "url(/vintage_envelope_open.png)",
                      "--env-flap-image": isCelestialBlue ? "url(/celestial_envelope_flap.png)" :
                                          isVintageWhite ? "url(/white_envelope_flap.png)" : "url(/vintage_envelope_flap.png)",
                      "--env-bg-pos": isCelestialBlue ? "-81.7px -278px" :
                                      isVintageWhite ? "-81.7px -278px" : "-81.7px -277.3px",
                      "--env-flap-pos": isCelestialBlue ? "-81.7px -57.2px" :
                                        isVintageWhite ? "-81.7px -32.8px" : "-81.7px -211.9px",
                      border: isCurrentRef ? "2.5px solid var(--accent-gold)" : "none",
                      borderRadius: "12px"
                    } as React.CSSProperties}
                  >
                    {/* Layer 1: Envelope Back */}
                    <div className="vintage-envelope-back" />

                    {/* Layer 2: Envelope Front Pocket */}
                    <div className="vintage-envelope-front-pocket">
                      {/* Sender Address */}
                      <div style={{ 
                        position: "absolute",
                        bottom: "30px",
                        left: "35px",
                        fontFamily: "var(--font-ui)",
                        fontSize: "12px",
                        color: textColor,
                        textAlign: "left",
                        lineHeight: "1.2",
                        zIndex: 7,
                        pointerEvents: "none",
                        maxWidth: "180px",
                      }}>
                        <div style={{ fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px", color: labelColor }}>From:</div>
                        <div style={{ fontWeight: "bold", fontSize: "14px", color: nameColor }}>{letter.sender}</div>
                        <div>123 Romance Avenue</div>
                      </div>

                      {/* Deliver To Address */}
                      <div style={{ 
                        position: "absolute",
                        bottom: "30px",
                        right: "35px",
                        fontFamily: "var(--font-ui)",
                        fontSize: "12px",
                        color: textColor,
                        textAlign: "left",
                        lineHeight: "1.2",
                        zIndex: 7,
                        pointerEvents: "none",
                        maxWidth: "180px",
                      }}>
                        <div style={{ fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px", color: labelColor }}>Deliver To:</div>
                        <div style={{ fontWeight: "bold", fontSize: "14px", color: nameColor }}>{letter.recipient}</div>
                        <div>777 Sweetheart Lane</div>
                      </div>

                      {/* Handwritten Cursive Title Label */}
                      <div style={{
                        position: "absolute",
                        top: "95px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "80%",
                        textAlign: "center",
                        zIndex: 7,
                        fontFamily: "var(--font-cursive)",
                        fontSize: "26px",
                        color: textColor,
                        textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        fontStyle: "italic",
                        pointerEvents: "none"
                      }}>
                        "{letter.title}"
                      </div>

                      {/* Stamp-like Postmark Badge */}
                      <div style={{
                        position: "absolute",
                        top: "28px",
                        right: "36px",
                        background: letter.isWriteback
                          ? (letter.read ? "rgba(156, 108, 250, 0.95)" : "rgba(123, 44, 191, 0.95)")
                          : letter.read 
                            ? "rgba(40, 167, 69, 0.9)" 
                            : "rgba(217, 38, 76, 0.95)",
                        border: isCurrentRef ? "2px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "9px",
                        fontFamily: "var(--font-ui)",
                        fontWeight: "bold",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                        transform: "rotate(6deg)",
                        zIndex: 7,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {letter.isWriteback 
                          ? (letter.read ? "Read 📖" : "Sent Reply ✉")
                          : (letter.read ? "Opened 📖" : "Unread ✉")
                        }
                      </div>
                    </div>
                    
                    {/* Layer 3: Rotating/Folding Flap */}
                    <div 
                      className="vintage-envelope-flap-part" 
                      style={
                        isVintageWhite ? { backgroundPosition: "-81.7px -32.8px" } :
                        isCelestialBlue ? { backgroundPosition: "-81.7px -57.2px" } :
                        undefined
                      }
                    />

                    {/* Wax Seal */}
                    <div 
                      className="wax-seal vintage-rose-style"
                      style={{
                        "--seal-color-main": isVintageRose ? "#b38f36" : isCelestialBlue ? "#b76e79" : "#9c1c2e",
                        "--seal-color-light": isVintageRose ? "#ffd670" : isCelestialBlue ? "#e8b4b8" : "#e2b857",
                        "--seal-color-dark": isVintageRose ? "#7a5c18" : isCelestialBlue ? "#5c2f45" : "#5c0a18",
                        "--seal-bg-image": isCelestialBlue ? "url(/vintage_heart_seal.jpg)" :
                                           isVintageWhite ? "url(/vintage_red_seal.png)" : "url(/vintage_rose_seal.png)",
                        pointerEvents: "none",
                        zIndex: 8,
                        ...(isVintageWhite ? {
                          width: "112px",
                          height: "112px",
                          left: "calc(50% - 56px)",
                          top: "164px"
                        } : {}),
                        ...(isCelestialBlue ? {
                          width: "106px",
                          height: "106px",
                          left: "calc(50% - 53px)",
                          top: "167px"
                        } : {})
                      } as React.CSSProperties}
                    >
                      <div className="wax-seal-quarter top-left" />
                      <div className="wax-seal-quarter top-right" />
                      <div className="wax-seal-quarter bottom-left" />
                      <div className="wax-seal-quarter bottom-right" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}
        </div>

        {displayedLetters.length === 0 && (
          <div 
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              color: "var(--text-muted)",
              gap: "12px",
              padding: "40px",
              textAlign: "center",
              animation: "fade-in-btn 0.5s ease-out forwards",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10
            }}
          >
            <div style={{ fontSize: "48px" }}>🕊️</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#fff" }}>
              {activeTab === "sent" ? "No replies written yet" : "No letters found"}
            </div>
            <div style={{ fontSize: "12px", maxWidth: "320px", lineHeight: "1.4" }}>
              {activeTab === "sent" 
                ? "When you read a letter, click 'Write Back' to seal and send a response!"
                : "This chest is waiting to be filled with memories."}
            </div>
          </div>
        )}
      </div>

      <footer style={{ textAlign: "center", flexShrink: 0, padding: "12px 0 20px 0" }}>
        {displayedLetters[activeIndex] && (
          <div 
            key={displayedLetters[activeIndex].id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              background: "linear-gradient(135deg, rgba(244, 230, 206, 0.08) 0%, rgba(244, 230, 206, 0.03) 100%)",
              border: "1px solid rgba(226, 184, 87, 0.2)",
              borderRadius: "6px",
              padding: "6px 18px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)",
              animation: "fade-in-btn 0.5s ease-out forwards"
            }}
          >
            <div>
              <span style={{ 
                fontFamily: "var(--font-ui)", 
                fontSize: "11px", 
                letterSpacing: "1px", 
                textTransform: "uppercase", 
                color: "rgba(244, 230, 206, 0.85)",
                fontWeight: 600,
                marginRight: "6px"
              }}>
                Sent:
              </span>
              <span style={{ 
                fontFamily: "var(--font-cursive)", 
                fontSize: "18px", 
                color: "var(--accent-gold)",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)"
              }}>
                {new Date(displayedLetters[activeIndex].timestamp).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <div style={{ width: "1px", height: "14px", backgroundColor: "rgba(226, 184, 87, 0.2)" }} />

            <button
              onClick={() => {
                if (isTransitioningToLetter) return;
                setIsTransitioningToLetter(true);
                let targetLink = getRelativeLink(displayedLetters[activeIndex].link);
                if (displayedLetters[activeIndex].isWriteback) {
                  targetLink += targetLink.includes("?") ? "&preview=true" : "?preview=true";
                }
                setTimeout(() => {
                  router.push(targetLink);
                }, 1200);
              }}
              style={{
                background: displayedLetters[activeIndex].isWriteback 
                  ? "linear-gradient(135deg, #9c6cfa 0%, #7b2cbf 100%)" 
                  : "linear-gradient(135deg, #ff4b72 0%, #ff758f 100%)",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
                transition: "all 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = displayedLetters[activeIndex].isWriteback
                  ? "0 6px 20px rgba(156,108,250,0.45)"
                  : "0 6px 20px rgba(255,75,114,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.25)";
              }}
            >
              {displayedLetters[activeIndex].isWriteback ? "View Writeback 🔍" : "Read Letter 📖"}
            </button>

            {displayedLetters[activeIndex].isWriteback && displayedLetters[activeIndex].replyToId && (
              <>
                <div style={{ width: "1px", height: "14px", backgroundColor: "rgba(226, 184, 87, 0.2)", marginLeft: "8px", marginRight: "8px" }} />
                <button
                  onClick={() => {
                    const parentId = displayedLetters[activeIndex].replyToId;
                    if (activeTab !== "all") {
                      setActiveTab("all");
                    }
                    const parentIndex = letters.findIndex((l) => l.id === parentId);
                    if (parentIndex !== -1) {
                      setActiveIndex(parentIndex);
                    }
                  }}
                  style={{
                    background: "rgba(226, 184, 87, 0.15)",
                    border: "1px solid rgba(226, 184, 87, 0.3)",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    color: "var(--accent-gold)",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.background = "rgba(226, 184, 87, 0.25)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(226,184,87,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "rgba(226, 184, 87, 0.15)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                  }}
                  title="Scroll to the original letter this reply references"
                >
                  Original Letter ↩
                </button>
              </>
            )}

          </div>
        )}
      </footer>
    </div>
  );
}

export default function MailboxPage() {
  return (
    <div style={{ 
      height: "100vh", 
      width: "100vw",
      position: "relative",
      backgroundColor: "#100907", // Deep warm charcoal
      backgroundImage: `
        radial-gradient(circle at 50% 30%, rgba(226, 184, 87, 0.08) 0%, transparent 65%),
        url(/memory_chest_bg.png)
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      overflow: "hidden"
    }}>
      {/* Candlelight vignette overlay */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(10, 5, 3, 0.88) 95%)",
        pointerEvents: "none",
        zIndex: 1,
        animation: "candle-flicker 4s ease-in-out infinite"
      }} />

      {/* Floating Gold Dust Motes */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", zIndex: 3 }}>
        {[...Array(12)].map((_, i) => {
          const delay = i * 1.5;
          const duration = 12 + (i % 4) * 4;
          const left = (i * 8 + 4) % 100;
          const top = (i * 9 + 15) % 100;
          const size = 3 + (i % 3) * 3;
          const driftX = (i % 2 === 0 ? 30 : -30) + (i % 3) * 10;
          const driftY = -80 - (i % 2) * 50;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: "50%",
                backgroundColor: "rgba(226, 184, 87, 0.45)",
                filter: "blur(0.5px) drop-shadow(0 0 6px rgba(226, 184, 87, 0.6))",
                opacity: 0,
                animation: `drift-particle ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                ["--drift-x" as any]: `${driftX}px`,
                ["--drift-y" as any]: `${driftY}px`
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      {/* Keyboard Hint (Desktop Only) */}
      <div 
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(10, 5, 3, 0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "6px 12px",
          zIndex: 100,
          pointerEvents: "none",
          backdropFilter: "blur(5px)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
        }}
        className="header-center-info"
      >
        <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>Use</span>
        <div style={{ display: "flex", gap: "3px" }}>
          <kbd style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", padding: "2px 5px", fontSize: "10px", color: "#fff", fontFamily: "monospace" }}>↑</kbd>
          <kbd style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", padding: "2px 5px", fontSize: "10px", color: "#fff", fontFamily: "monospace" }}>↓</kbd>
        </div>
        <span style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>to navigate</span>
      </div>

      <FloatingHearts />
      <Suspense fallback={
        <div style={{ 
          position: "fixed",
          inset: 0,
          backgroundColor: "#100907",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999
        }}>
          <div style={{
            position: "relative",
            width: "120px",
            height: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px"
          }}>
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid rgba(226, 184, 87, 0.3)",
              boxShadow: "0 0 30px rgba(226, 184, 87, 0.2), inset 0 0 15px rgba(226, 184, 87, 0.1)",
              animation: "pulse-keyhole 2.5s ease-in-out infinite"
            }} />
            <svg width="40" height="50" viewBox="0 0 24 30" fill="none" style={{ position: "relative", zIndex: 2, filter: "drop-shadow(0 0 8px var(--accent-gold))" }}>
              <circle cx="12" cy="9" r="6" fill="var(--accent-gold)" />
              <path d="M7.5 13.5H16.5L18 27H6L7.5 13.5Z" fill="var(--accent-gold)" />
              <path d="M12 9V20" stroke="#100907" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{
            fontFamily: "var(--font-cursive)",
            fontSize: "28px",
            color: "var(--accent-gold)",
            textShadow: "0 2px 10px rgba(226, 184, 87, 0.3)",
            animation: "pulse-text 2s ease-in-out infinite",
            textAlign: "center"
          }}>
            Loading Memory Chest...
          </div>
        </div>
      }>
        <MailboxContent />
      </Suspense>
    </div>
  );
}

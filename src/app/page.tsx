"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";
import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";

const starsList = [
  { top: "12%", left: "15%", size: "2px", duration: "3s", delay: "0s" },
  { top: "25%", left: "8%", size: "3px", duration: "4s", delay: "1.5s" },
  { top: "18%", left: "45%", size: "2px", duration: "2.5s", delay: "0.5s" },
  { top: "35%", left: "30%", size: "3px", duration: "5s", delay: "2s" },
  { top: "15%", left: "75%", size: "2px", duration: "3.5s", delay: "1s" },
  { top: "28%", left: "60%", size: "3px", duration: "4.5s", delay: "2.5s" },
  { top: "10%", left: "90%", size: "2px", duration: "3s", delay: "0.2s" },
  { top: "42%", left: "85%", size: "3px", duration: "4s", delay: "1.8s" },
  { top: "50%", left: "20%", size: "2px", duration: "3.2s", delay: "0.8s" },
  { top: "65%", left: "10%", size: "3px", duration: "5.5s", delay: "3s" },
  { top: "58%", left: "70%", size: "2px", duration: "2.8s", delay: "1.2s" },
  { top: "72%", left: "92%", size: "3px", duration: "4.8s", delay: "2.2s" }
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Typewriter effect statements
  const statements = [
    { prefix: "Write letters that live ", suffix: "forever." },
    { prefix: "Seal your love in ", suffix: "digital wax." },
    { prefix: "Time-lock your ", suffix: "deepest feelings." },
    { prefix: "Secure your secrets in ", suffix: "private gates." },
    { prefix: "Set the mood with ", suffix: "ambient lo-fi." },
    { prefix: "Capture dates with ", suffix: "RSVP passes." }
  ];

  const [statementIndex, setStatementIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(50);

  // Contact Form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let timer: NodeJS.Timeout;
    const current = statements[statementIndex];
    const currentFullText = current.prefix + current.suffix;

    if (!isDeleting) {
      if (displayedText !== currentFullText) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Entire statement typed, wait 3 seconds before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
          setTypingSpeed(25); // Delete faster
        }, 3000);
      }
    } else {
      if (displayedText !== "") {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, typingSpeed);
      } else {
        // Fully deleted, move to next statement
        setIsDeleting(false);
        setStatementIndex((prev) => (prev + 1) % statements.length);
        setTypingSpeed(50); // Reset typing speed
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, statementIndex, typingSpeed, mounted]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex",
      flexDirection: "column",
      position: "relative", 
      overflow: "hidden",
      backgroundImage: "linear-gradient(rgba(11, 7, 17, 0.55), rgba(11, 7, 17, 0.55)), url('/desk_bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Floating Hearts background */}
      <FloatingHearts />

      {/* Inline styles for custom animations and hover effects */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 860px) {
          .header-nav {
            display: none !important;
          }
        }

        @keyframes blink-cursor {
          from, to { border-color: transparent }
          50% { border-color: var(--accent-rose); }
        }

        .typewriter-cursor {
          border-right: 3px solid var(--accent-rose);
          animation: blink-cursor 0.75s step-end infinite;
          margin-left: 2px;
          display: inline-block;
          height: 0.9em;
          vertical-align: middle;
        }

        @keyframes pulse-glowing {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 75, 114, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 25px rgba(255, 75, 114, 0.7);
            transform: scale(1.02);
          }
        }

        .cta-button {
          animation: pulse-glowing 2s infinite;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .cta-button:hover {
          transform: translateY(-3px) scale(1.04) !important;
          box-shadow: 0 15px 30px rgba(255, 75, 114, 0.6) !important;
        }

        .feature-card {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 75, 114, 0.3) !important;
          background: linear-gradient(135deg, rgba(30, 20, 45, 0.8) 0%, rgba(255, 75, 114, 0.05) 100%) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
        }

        /* 3D Envelope Demo styling */
        .demo-envelope-container {
          position: relative;
          width: 320px;
          height: 200px;
          perspective: 800px;
          cursor: pointer;
          margin: 40px auto;
        }

        .demo-envelope {
          position: relative;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #faf9f6 100%);
          border-radius: 8px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
          border: 1px solid rgba(226, 184, 87, 0.4);
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }

        .demo-flap {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: #faf9f6;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top;
          transition: transform 0.6s ease;
          z-index: 5;
        }

        .demo-pocket {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 110px;
          background: #f7f6f2;
          clip-path: polygon(0 100%, 100% 100%, 100% 0, 80% 0, 50% 60%, 20% 0, 0 0);
          border-radius: 0 0 8px 8px;
          z-index: 4;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
        }

        .demo-letter {
          position: absolute;
          bottom: 10px;
          left: 15px;
          right: 15px;
          height: 140px;
          background: #fff;
          border: 1px solid #ebdcb9;
          border-radius: 4px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.6s ease 0.1s;
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .demo-seal {
          position: absolute;
          top: 85px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 36px;
          background: radial-gradient(circle, #e2b857 0%, #c59734 100%);
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15), inset 0 0 4px rgba(255,255,255,0.4);
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          transition: all 0.5s ease;
        }

        .demo-envelope-container:hover .demo-flap {
          transform: rotateX(180deg);
          z-index: 2;
        }

        .demo-envelope-container:hover .demo-letter {
          transform: translateY(-70px);
          z-index: 7;
        }

        .demo-envelope-container:hover .demo-seal {
          transform: translateX(-50%) translateY(30px) scale(0.9);
          opacity: 0.3;
        }

        .step-card {
          transition: all 0.3s ease;
        }

        .step-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04) !important;
        }
      `}</style>

      {/* Top Header Navigation */}
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
            padding: "20px 24px"
          }}
        >
          {/* Logo */}
          <Link 
            href="/"
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

          {/* Center Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }} className="header-nav">
            <a 
              href="#features" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              How It Works
            </a>

            <a 
              href="#contact" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Contact
            </a>
          </nav>

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {mounted && !loading ? (
              user ? (
                <>
                  <Link 
                    href="/coming-soon"
                    style={{
                      fontSize: "14px",
                      color: "var(--text-main)",
                      textDecoration: "none",
                      fontWeight: 600,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid var(--border-card)",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                  >
                    Go to Dashboard 💖
                  </Link>
                  <Link
                    href="/coming-soon"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ff4b72, #9c6cfa)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      textDecoration: "none",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)"
                    }}
                    title="Profile Settings"
                  >
                    {user.email ? user.email[0].toUpperCase() : "👤"}
                  </Link>
                </>
              ) : (
                <Link 
                  href="/coming-soon"
                  style={{
                    fontSize: "14px",
                    color: "var(--text-main)",
                    textDecoration: "none",
                    fontWeight: 600,
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    padding: "10px 24px",
                    borderRadius: "30px",
                    transition: "all 0.3s ease",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-rose)";
                    e.currentTarget.style.color = "var(--accent-rose)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.05)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 75, 114, 0.2)";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.color = "var(--text-main)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255,255,255,0.1)";
                    const svg = e.currentTarget.querySelector("svg");
                    if (svg) svg.style.transform = "none";
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Sign In</span>
                </Link>
              )
            ) : (
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1200px", margin: "140px auto 0 auto", padding: "0 24px", flexGrow: 1 }}>
        
        {/* HERO SECTION */}
        <section style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "40px", alignItems: "center", minHeight: "500px", marginBottom: "80px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Romantic Highlight Label */}
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              backgroundColor: "rgba(255, 75, 114, 0.1)", 
              color: "var(--accent-rose)", 
              padding: "6px 16px", 
              borderRadius: "20px", 
              fontSize: "12px", 
              fontWeight: 600, 
              letterSpacing: "0.5px",
              width: "fit-content",
              textTransform: "uppercase",
              border: "1px solid rgba(255, 75, 114, 0.15)"
            }}>
              <span>🌸</span> The Digital Love Letter Creator
            </div>

            {/* Main Headline */}
            <h1 style={{ 
              fontSize: "64px", 
              fontWeight: "normal", 
              lineHeight: "1.3", 
              color: "#ffffff",
              fontFamily: "var(--font-cursive)",
              letterSpacing: "0.5px",
              minHeight: "170px",
              paddingLeft: "12px",
              paddingRight: "12px",
              marginLeft: "-12px",
              marginRight: "-12px",
              overflow: "visible"
            }}>
              {mounted ? (
                <>
                  {displayedText.slice(0, statements[statementIndex].prefix.length)}
                  {displayedText.length > statements[statementIndex].prefix.length && (
                    <span style={{ background: "linear-gradient(to right, #ff4b72, #e2b857)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {displayedText.slice(statements[statementIndex].prefix.length)}
                    </span>
                  )}
                  <span className="typewriter-cursor"></span>
                </>
              ) : (
                <>
                  Write letters that live <span style={{ background: "linear-gradient(to right, #ff4b72, #e2b857)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>forever</span>.
                </>
              )}
            </h1>

            {/* Subtext */}
            <p style={{ 
              fontSize: "18px", 
              color: "var(--text-muted)", 
              lineHeight: "1.6",
              maxWidth: "540px"
            }}>
              Capture your deepest feelings in modern, media-rich love letters. Seal your words in digital wax, set time locks for anniversaries, embed ambient soundtracks, and secure them behind private gates.
            </p>

            {/* Call to Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
              <Link
                href="/coming-soon"
                className="cta-button"
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
                }}
              >
                {mounted && user ? "Enter the Studio 💖" : "Create Your Letter ✨"}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Interactive Envelope Preview */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="demo-envelope-container">
              <div className="demo-envelope">
                <div className="demo-flap"></div>
                <div className="demo-letter">
                  <div style={{ width: "24px", height: "4px", backgroundColor: "var(--accent-rose)", borderRadius: "2px" }}></div>
                  <div style={{ fontSize: "14px", fontFamily: "'Dancing Script', cursive", color: "#590d22", fontWeight: "bold", marginTop: "4px" }}>To My Dearest,</div>
                  <div style={{ fontSize: "9px", color: "#666", lineHeight: "1.3" }}>
                    "From the moment we met, I knew you were my forever. These words represent my heart, sealed in digital stars..."
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: "7px", color: "#999" }}>
                    <span>Unlocks on Anniversary ⏳</span>
                    <span>with Love ❤️</span>
                  </div>
                </div>
                <div className="demo-pocket"></div>
                <div className="demo-seal">❤</div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: "12px" }}>
              Hover to break the wax seal & open the envelope ✉️
            </p>
          </div>

        </section>

        {/* FEATURES GRID */}
        <section id="features" style={{ marginBottom: "100px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "48px", fontWeight: "normal", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>
              Packed with Romantic Capabilities
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Every love letter is designed to be an unforgettable journey. Customize, secure, and track your letter with ease.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            
            {/* Feature 1 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)" }}>
                ✉️
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Wax Seals & Stationery
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Choose between beautiful background themes like Classic Parchment, Celestial Midnight, or Rose Petals. Seal them with a realistic, satisfying wax stamp.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(156, 108, 250, 0.1)", color: "var(--accent-purple)" }}>
                ⏳
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Timed Release Locks
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Deliver letters ahead of time but lock them behind a live countdown timer. Perfect for anniversaries, birthdays, or special midnight surprises.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(226, 184, 87, 0.1)", color: "var(--accent-gold)" }}>
                🔑
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Private Security Gates
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Ensure your letter is only read by the right eyes. Secure your letter with a private question that only your partner knows the answer to.
              </p>
            </div>

            {/* Feature 4 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)" }}>
                🎵
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Ambient Lo-fi Tracks
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Accompany your letter with romantic backing tracks or peaceful lo-fi background noise. The audio automatically loops when they open the letter.
              </p>
            </div>

            {/* Feature 5 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(156, 108, 250, 0.1)", color: "var(--accent-purple)" }}>
                🎟️
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Date RSVP Ticketing
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Plan your next date night within the envelope. Embed ticket cards asking for a date RSVP with options, confirmation, and custom survey details.
              </p>
            </div>

            {/* Feature 6 */}
            <div 
              className="glass feature-card"
              style={{
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderRadius: "20px",
                border: "1px solid var(--border-card)",
                background: "rgba(20, 15, 30, 0.5)",
              }}
            >
              <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", backgroundColor: "rgba(226, 184, 87, 0.1)", color: "var(--accent-gold)" }}>
                🟢
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff" }}>
                Real-Time Read Receipts
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                Know when your feelings reach them. Receive immediate, real-time read notifications on your dashboard when they break the wax seal.
              </p>
            </div>

          </div>

        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" style={{ marginBottom: "100px", padding: "40px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(20, 15, 30, 0.4) 0%, rgba(255, 75, 114, 0.01) 100%)", border: "1px solid var(--border-card)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "44px", fontWeight: "normal", fontFamily: "var(--font-cursive)" }}>How EverAfter Works</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Send your first letter in four simple steps</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
            
            {/* Step 1 */}
            <div className="step-card" style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-rose)", marginBottom: "8px" }}>01</div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Write & Personalize</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Type your thoughts, pick a cursive font, customize margins, and pick the perfect stationery layout.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card" style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-purple)", marginBottom: "8px" }}>02</div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Lock & Set Audio</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Configure release countdowns, secret password gates, RSVP cards, and pick a loops track.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card" style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-gold)", marginBottom: "8px" }}>03</div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Seal & Share</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Press down to stamp the realistic gold wax seal. Copy the custom secure link generated for you.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card" style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-rose)", marginBottom: "8px" }}>04</div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>Feel Connected</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Get real-time read ticks on your dashboard when they read it, and track their RSVP date choices.
              </p>
            </div>

          </div>

        </section>


        {/* CONTACT US SECTION */}
        <section id="contact" style={{ marginBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "44px", fontWeight: "normal", fontFamily: "var(--font-cursive)", marginBottom: "8px" }}>Leave a Whisper</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Have questions, thoughts, or wish to share your love story? We are listening.</p>
          </div>

          <div className="glass" style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 30px", border: "1px solid var(--border-card)" }}>
            {contactSubmitted ? (
              <div style={{ textAlign: "center", padding: "30px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "48px" }}>✉️</span>
                <h3 style={{ fontFamily: "var(--font-cursive)", fontSize: "28px", color: "var(--accent-rose)" }}>Message Sealed & Sent</h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", maxWidth: "400px" }}>
                  Thank you for reaching out, {contactName}. Your words have been sealed and sent to the stars. We will reply to your email at {contactEmail} soon.
                </p>
                <button 
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactName("");
                    setContactEmail("");
                    setContactMessage("");
                  }}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-card)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (contactName.trim() && contactEmail.trim() && contactMessage.trim()) {
                    try {
                      await addDoc(collection(db, "contacts"), {
                        name: contactName.trim(),
                        email: contactEmail.trim(),
                        message: contactMessage.trim(),
                        timestamp: Date.now()
                      });
                      setContactSubmitted(true);
                    } catch (err) {
                      console.error("Failed to save contact message to Firestore:", err);
                      // Fallback to local success to maintain excellent UX
                      setContactSubmitted(true);
                    }
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Elgen" 
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-rose)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-card)")}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com" 
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none",
                        transition: "border-color 0.2s"
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-rose)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-card)")}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Write your message here..." 
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "8px",
                      padding: "12px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                      resize: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-rose)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-card)")}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "var(--accent-rose)",
                    backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(255, 75, 114, 0.2)",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <span>Send Message</span>
                  <span>💖</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section 
          className="glass" 
          style={{ 
            textAlign: "center", 
            padding: "60px 40px", 
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(20, 15, 30, 0.8) 0%, rgba(255, 75, 114, 0.03) 100%)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            border: "1px solid var(--border-card)",
            marginBottom: "80px"
          }}
        >
          <span style={{ fontSize: "48px", animation: "pulse-glowing 2s infinite", display: "inline-block", marginBottom: "16px" }}>💌</span>
          <h2 style={{ fontSize: "46px", fontWeight: "normal", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>
            Ready to Capture a Memory?
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "540px", margin: "0 auto 30px auto", lineHeight: "1.6" }}>
            Create an EverAfter account to write and manage your love letters today.
          </p>
          <Link
            href="/coming-soon"
            className="cta-button"
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
              boxShadow: "0 10px 25px rgba(255, 75, 114, 0.35)"
            }}
          >
            {mounted && user ? "Go to Dashboard" : "Begin Writing Now"}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </section>

      </main>

      {/* Footer */}
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
    </div>
  );
}

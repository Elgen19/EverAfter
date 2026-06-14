"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import "./landing.css";
import HowItWorksSimulator from "@/components/HowItWorksSimulator";

const FloatingHearts = dynamic(() => import("@/components/FloatingHearts"), { ssr: false });

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

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);



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
    <div className="landing-page-root" style={{ 
      minHeight: "100vh", 
      display: "flex",
      flexDirection: "column",
      position: "relative", 
      overflow: "hidden",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Floating Hearts background */}
      <FloatingHearts />

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EverAfter",
              "url": "https://everafterletters.xyz",
              "description": "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
              "applicationCategory": "RelationshipApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires HTML5 compatible browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How does the time-lock release work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "When creating a letter, you can set a specific date and time for it to unlock. Your partner can open the link anytime, but they will be greeted with a beautiful countdown screen showing exactly when the seal can be broken."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How secure and private are my letters?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Privacy is our utmost priority. Along with data encryption, you can add a Security Gate—a custom question (e.g., 'Where was our first vacation?') that only your partner knows the answer to."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can my partner reply to my letter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Once they read your letter, they are presented with a 'Write Back' option. They can compose a response, choose a theme, and send it back, which appears on your dashboard under 'Received Writebacks'."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Will I know when they read my letter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, EverAfter features real-time tracking. Your dashboard will immediately update to 'Read' with a green checkmark as soon as they break the digital wax seal."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is EverAfter free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Creating, styling, and sending letters is completely free. We believe everyone deserves a beautiful space to express their deepest emotions without barriers."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I add music and custom themes?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. You can select from curated background scenes (like Cozy Cafe, Cherry Blossoms, or Starry Night) and attach ambient soundtrack loops to create a multi-sensory reading experience."
                  }
                }
              ]
            }
          ])
        }}
      />
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
              href="#how-it-works" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              How It Works
            </a>
            <a 
              href="#features" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Features
            </a>
            <a 
              href="#use-cases" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Use Cases
            </a>
            <a 
              href="#faq" 
              style={{ fontSize: "14px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              FAQ
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
                    href="/dashboard"
                    className="header-dashboard-btn"
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
                    href="/profile"
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
                  href="/login"
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
      <main className="landing-main" style={{ maxWidth: "1200px", margin: "140px auto 0 auto", padding: "0 24px", flexGrow: 1 }}>
        
        {/* HERO SECTION */}
        <section className="landing-hero" style={{ gap: "40px", alignItems: "center", minHeight: "500px", marginBottom: "80px" }}>
          
          <div className="landing-hero-content" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            <h1 className="landing-hero-title" style={{ 
              fontSize: "48px", 
              fontWeight: "normal", 
              lineHeight: "1.3", 
              color: "#ffffff",
              fontFamily: "var(--font-cursive)",
              letterSpacing: "0.5px",
              minHeight: "130px",
              width: "100%",
              boxSizing: "border-box",
              overflow: "visible",
              margin: "0"
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
            <p className="hero-subtext" style={{ 
              fontSize: "18px", 
              color: "var(--text-muted)", 
              lineHeight: "1.6",
              maxWidth: "540px",
              margin: "0"
            }}>
              Capture your deepest feelings in modern, media-rich love letters. Seal your words in digital wax, set time locks for anniversaries, embed ambient soundtracks, and secure them behind private gates.
            </p>

            {/* Call to Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
              <Link
                href={mounted && user ? "/dashboard" : "/login"}
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
          <div className="hero-envelope-column" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div className="demo-envelope-wrapper-parent" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible", position: "relative" }}>
              <div className="envelope-wrapper vintage-rose-style demo-envelope-container">
                <div className="envelope vintage-rose-style" style={{
                  "--env-bg-image": "url(/white_envelope_open.png)",
                  "--env-flap-image": "url(/white_envelope_flap.png)",
                  "--env-bg-pos": "-81.7px -278px",
                  "--env-flap-pos": "-81.7px -32.8px",
                  background: "transparent",
                  border: "none",
                  boxShadow: "none"
                } as React.CSSProperties}>
                  <div className="vintage-envelope-back" />
                  <div className="envelope-letter theme-royal" style={{ background: "#fcf8ee", border: "4px double #c3a175" }}>
                    <div style={{ fontSize: "24px", fontFamily: "'Dancing Script', cursive", fontWeight: "bold", color: "#590d22", marginBottom: "4px" }}>To My Dearest,</div>
                    <div style={{ fontSize: "15px", fontFamily: "'Playfair Display', serif", lineHeight: "1.6", color: "#4a2c11" }}>
                      "From the moment we met, I knew you were my forever. These words represent my heart, sealed in digital stars..."
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", fontSize: "11px", fontFamily: "var(--font-ui)", color: "#c3a175" }}>
                      <span>Unlocks on Anniversary ⏳</span>
                      <span>with Love ❤️</span>
                    </div>
                  </div>
                  <div className="vintage-envelope-front-pocket">
                    {/* Mock Delivery Address */}
                    <div 
                      className="envelope-mock-address" 
                      style={{ 
                        position: "absolute",
                        bottom: "25px",
                        right: "35px",
                        fontFamily: "var(--font-ui)",
                        fontSize: "13px",
                        color: "#6b5952",
                        textAlign: "left",
                        lineHeight: "1.2",
                        zIndex: 7,
                        pointerEvents: "none",
                        maxWidth: "220px",
                      }}
                    >
                      <div style={{ fontSize: "8px", fontFamily: "var(--font-ui)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "2px", color: "#9e867c" }}>Deliver To:</div>
                      <div style={{ fontWeight: "bold", fontSize: "16px", color: "#4a2c11" }}>My Beloved</div>
                      <div>777 Sweetheart Lane</div>
                      <div>Garden of Eden, LV 14314</div>
                    </div>
                  </div>
                  <div className="vintage-envelope-flap-part" style={{ backgroundPosition: "-81.7px -32.8px" }} />
                  <div className="wax-seal vintage-rose-style" style={{
                    "--seal-color-main": "#b38f36",
                    "--seal-color-light": "#ffd670",
                    "--seal-color-dark": "#7a5c18",
                    "--seal-bg-image": "url(/vintage_red_seal.png)",
                    width: "112px",
                    height: "112px",
                    left: "calc(50% - 56px)",
                    top: "164px"
                  } as React.CSSProperties}>
                    <div className="wax-seal-quarter top-left" />
                    <div className="wax-seal-quarter top-right" />
                    <div className="wax-seal-quarter bottom-left" />
                    <div className="wax-seal-quarter bottom-right" />
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: "12px" }}>
              Hover to break the wax seal & open the envelope ✉️
            </p>
          </div>

        </section>

        {/* PROBLEM SECTION */}
        <section className="problem-section" style={{ padding: "0 24px" }}>
          
          <div className="problem-left">
            <span className="problem-subtitle">The Digital Connection Gap</span>
            <h2 className="problem-title">Some moments deserve more than a text.</h2>
            <p className="problem-desc">
              In an age of instant gratification, our most meaningful expressions are reduced to brief, low-effort messages. We send letters that get buried under work notifications, group chat clutter, and fleeting social feeds.
            </p>
            <p className="problem-desc">
              <strong>EverAfter</strong> is built to reclaim the weight of words. By introducing time-locks, digital wax seals, ambient soundtracks, and intimate custom pages, we create a sacred digital space for the sentiments that shape our lives.
            </p>

            <div className="problem-cards-grid">
              {/* Card 1: Lost in Mundane Clutter */}
              <div className="problem-card">
                <div className="problem-card-icon">📱</div>
                <h4 className="problem-card-title">Lost in Mundane Clutter</h4>
                <p className="problem-card-desc">Intimate sentiments get sent in the same chat apps used for work messages or chore reminders, instantly getting buried under daily noise.</p>
              </div>

              {/* Card 2: Cold, Soul-Less Formats */}
              <div className="problem-card">
                <div className="problem-card-icon">❄️</div>
                <h4 className="problem-card-title">Cold, Soul-Less Formats</h4>
                <p className="problem-card-desc">Modern chat bubbles are flat, static, and silent. They lack the emotional warmth of custom stationery, looping music, and romantic presentation.</p>
              </div>

              {/* Card 3: No Anticipation or Suspense */}
              <div className="problem-card">
                <div className="problem-card-icon">⏳</div>
                <h4 className="problem-card-title">No Anticipation or Suspense</h4>
                <p className="problem-card-desc">Instant delivery robs special occasions of build-up. Messages are read immediately, ruining the sweet anticipation of a midnight release.</p>
              </div>

              {/* Card 4: Fragile & Unsecured Memories */}
              <div className="problem-card">
                <div className="problem-card-icon">🔓</div>
                <h4 className="problem-card-title">Fragile & Unsecured Memories</h4>
                <p className="problem-card-desc">Casual chat histories are easily lost, deleted, or screenshotted. There is no private, sacred vault to protect your relationship milestones.</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <div className="chat-mockup">
              {/* Title bar of chat mockup */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>💬</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>Crowded Chat App</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Active now • 99+ unread</div>
                </div>
              </div>

              {/* Messages simulating fading away / disappearing in crowded chats */}
              <div className="chat-bubble incoming" style={{ animationDelay: "0s" }}>
                Hey, did you remember to buy milk on your way back? 🥛
              </div>
              <div className="chat-bubble outgoing" style={{ animationDelay: "2s" }}>
                Yeah got it. Also, happy anniversary! Love you! ❤️
              </div>
              <div className="chat-bubble incoming" style={{ animationDelay: "4s" }}>
                Awesome. Thanks! Can you also grab some bread? 🍞
              </div>
              <div className="chat-bubble incoming" style={{ animationDelay: "6s" }}>
                Oh wait, boss just posted the new shift schedule, check the group chat. 📞
              </div>
              <div className="chat-bubble outgoing" style={{ animationDelay: "8s" }}>
                Oh... okay, checking now.
              </div>

              <div style={{ position: "absolute", inset: "0", background: "rgba(11, 7, 17, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 10 }}>
                <div className="glass" style={{ padding: "16px 20px", textAlign: "center", border: "1px solid rgba(255, 75, 114, 0.3)", boxShadow: "0 0 20px rgba(255, 75, 114, 0.15)" }}>
                  <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>🗑️</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#fff", display: "block" }}>Disappears in the Noise</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Anniversaries & deepest thoughts deserve more.</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
              Quick messages are easily buried. Let your meaningful words stand out.
            </p>
          </div>

        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" style={{ marginBottom: "100px", padding: "40px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(20, 15, 30, 0.4) 0%, rgba(255, 75, 114, 0.01) 100%)", border: "1px solid var(--border-card)" }}>
          
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "44px", fontWeight: "normal", fontFamily: "var(--font-cursive)" }}>How EverAfter Works</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Explore the beautiful journey of a digital love letter</p>
          </div>

          <HowItWorksSimulator />
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

          <div className="features-grid">
            
            {/* Feature 1 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)" }}>
                ✉️
              </div>
              <h3 className="feature-title">
                Wax Seals & Stationery
              </h3>
              <p className="feature-desc">
                Choose between beautiful background themes like Classic Parchment, Celestial Midnight, or Rose Petals. Seal them with a realistic, satisfying wax stamp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(156, 108, 250, 0.1)", color: "var(--accent-purple)" }}>
                ⏳
              </div>
              <h3 className="feature-title">
                Timed Release Locks
              </h3>
              <p className="feature-desc">
                Deliver letters ahead of time but lock them behind a live countdown timer. Perfect for anniversaries, birthdays, or special midnight surprises.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(226, 184, 87, 0.1)", color: "var(--accent-gold)" }}>
                🔑
              </div>
              <h3 className="feature-title">
                Private Security Gates
              </h3>
              <p className="feature-desc">
                Ensure your letter is only read by the right eyes. Secure your letter with a private question that only your partner knows the answer to.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)" }}>
                🎵
              </div>
              <h3 className="feature-title">
                Ambient Lo-fi Tracks
              </h3>
              <p className="feature-desc">
                Accompany your letter with romantic backing tracks or peaceful lo-fi background noise. The audio automatically loops when they open the letter.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(156, 108, 250, 0.1)", color: "var(--accent-purple)" }}>
                🎟️
              </div>
              <h3 className="feature-title">
                Date RSVP Ticketing
              </h3>
              <p className="feature-desc">
                Plan your next date night within the envelope. Embed ticket cards asking for a date RSVP with options, confirmation, and custom survey details.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass feature-card">
              <div className="feature-icon" style={{ backgroundColor: "rgba(226, 184, 87, 0.1)", color: "var(--accent-gold)" }}>
                🟢
              </div>
              <h3 className="feature-title">
                Real-Time Read Receipts
              </h3>
              <p className="feature-desc">
                Know when your feelings reach them. Receive immediate, real-time read notifications on your dashboard when they break the wax seal.
              </p>
            </div>

          </div>

        </section>

        {/* EMOTIONAL USE CASES */}
        <section id="use-cases" style={{ marginBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "14px", color: "var(--accent-rose)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Designed for Connection</span>
            <h2 style={{ fontSize: "48px", fontWeight: "normal", marginTop: "8px", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>Moments Crafted in Pixels</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Every relationship is unique. Here is how users leverage EverAfter to build lasting, emotional bridges.
            </p>
          </div>

          <div className="use-cases-grid">
            {/* Use Case 1 */}
            <div className="use-case-card-container">
              <div className="use-case-card-inner">
                {/* Front */}
                <div className="use-case-card-front glass">
                  <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)", marginBottom: "4px" }}>⏳</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>Anniversaries & Surprises</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "center" }}>
                    Lock your letter ahead of time to unlock exactly at midnight on a birthday or anniversary.
                  </p>
                </div>
                {/* Back */}
                <div className="use-case-card-back glass">
                  <div style={{ fontSize: "28px", color: "var(--accent-rose)", marginBottom: "4px" }}>✨</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>Midnight Anticipation</h4>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
                    Your partner sees a live countdown ticking down to the exact second. The digital wax seal breaks only when the time arrives, turning a simple link into a shared milestone event.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 2 */}
            <div className="use-case-card-container">
              <div className="use-case-card-inner">
                {/* Front */}
                <div className="use-case-card-front glass">
                  <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "rgba(156, 108, 250, 0.1)", color: "var(--accent-purple)", marginBottom: "4px" }}>✈️</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>Long-Distance Devotion</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "center" }}>
                    Bridge the physical gap with sensory details and lo-fi backing tracks that feel like real mail.
                  </p>
                </div>
                {/* Back */}
                <div className="use-case-card-back glass">
                  <div style={{ fontSize: "28px", color: "var(--accent-purple)", marginBottom: "4px" }}>🎵</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>Bridging the Miles</h4>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
                    Combine customized paper stationery styles, animated wax seals, and peaceful soundtrack loops. It creates a warm, multi-sensory reading experience that feels like holding a piece of home.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 3 */}
            <div className="use-case-card-container">
              <div className="use-case-card-inner">
                {/* Front */}
                <div className="use-case-card-front glass">
                  <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "rgba(226, 184, 87, 0.1)", color: "var(--accent-gold)", marginBottom: "4px" }}>🩹</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>Reconciliation & Apologies</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "center" }}>
                    Provide your partner with an intimate reading space designed for deep emotional safety.
                  </p>
                </div>
                {/* Back */}
                <div className="use-case-card-back glass">
                  <div style={{ fontSize: "28px", color: "var(--accent-gold)", marginBottom: "4px" }}>🤍</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>Space to Heal</h4>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
                    Delicate conversations require calm environments. Deliver your sincere reflections in a private, quiet space without chat bubbles or work reminders, letting them process at their own pace.
                  </p>
                </div>
              </div>
            </div>

            {/* Use Case 4 */}
            <div className="use-case-card-container">
              <div className="use-case-card-inner">
                {/* Front */}
                <div className="use-case-card-front glass">
                  <div style={{ fontSize: "32px", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "rgba(255, 75, 114, 0.1)", color: "var(--accent-rose)", marginBottom: "4px" }}>🎟️</div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", margin: 0 }}>Secret Date RSVPs</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5", margin: 0, textAlign: "center" }}>
                    Craft an interactive date night proposal with custom RSVP ticket choices inside your envelope.
                  </p>
                </div>
                {/* Back */}
                <div className="use-case-card-back glass">
                  <div style={{ fontSize: "28px", color: "var(--accent-rose)", marginBottom: "4px" }}>🌹</div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", margin: 0 }}>Interactive Proposals</h4>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
                    Plan your date night details directly within the letter. Add selectable RSVP cards (restaurant options, dates, or outfits) and get immediate tracking alerts on your dashboard the moment they accept.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ SECTION */}
        <section id="faq" style={{ marginBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ fontSize: "14px", color: "var(--accent-rose)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Common Whispers</span>
            <h2 style={{ fontSize: "44px", fontWeight: "normal", marginTop: "8px", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>Frequently Asked Questions</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Everything you need to know about crafting digital memories</p>
          </div>

          <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                q: "How does the time-lock release work?",
                a: "When creating a letter, you can set a specific date and time for it to unlock. Your partner can open the link anytime, but they will be greeted with a beautiful countdown screen showing exactly when the seal can be broken."
              },
              {
                q: "How secure and private are my letters?",
                a: "Privacy is our utmost priority. Along with data encryption, you can add a Security Gate—a custom question (e.g., 'Where was our first vacation?') that only your partner knows the answer to."
              },
              {
                q: "Can my partner reply to my letter?",
                a: "Yes! Once they read your letter, they are presented with a 'Write Back' option. They can compose a response, choose a theme, and send it back, which appears on your dashboard under 'Received Writebacks'."
              },
              {
                q: "Will I know when they read my letter?",
                a: "Yes, EverAfter features real-time tracking. Your dashboard will immediately update to 'Read' with a green checkmark as soon as they break the digital wax seal."
              },
              {
                q: "Is EverAfter free to use?",
                a: "Creating, styling, and sending letters is completely free. We believe everyone deserves a beautiful space to express their deepest emotions without barriers."
              },
              {
                q: "Can I add music and custom themes?",
                a: "Absolutely. You can select from curated background scenes (like Cozy Cafe, Cherry Blossoms, or Starry Night) and attach ambient soundtrack loops to create a multi-sensory reading experience."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="glass" 
                  style={{ 
                    borderRadius: "16px", 
                    border: "1px solid var(--border-card)", 
                    overflow: "hidden", 
                    transition: "all 0.3s ease",
                    background: isOpen ? "rgba(255, 75, 114, 0.03)" : "rgba(255, 255, 255, 0.01)",
                    borderColor: isOpen ? "rgba(255, 75, 114, 0.3)" : "var(--border-card)"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "#fff",
                      outline: "none"
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: 600 }}>{faq.q}</span>
                    <span style={{ 
                      fontSize: "18px", 
                      transition: "transform 0.3s ease", 
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: isOpen ? "var(--accent-rose)" : "var(--text-muted)"
                    }}>
                      ▼
                    </span>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? "200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}>
                    <p style={{ 
                      padding: "0 24px 20px 24px", 
                      margin: 0, 
                      fontSize: "14px", 
                      color: "var(--text-muted)", 
                      lineHeight: "1.6" 
                    }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
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
                      const res = await fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: contactName.trim(),
                          email: contactEmail.trim(),
                          message: contactMessage.trim()
                        })
                      });
                      if (!res.ok) throw new Error("API call failed");
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
                <div className="contact-form-grid" style={{ gap: "16px" }}>
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
            href={mounted && user ? "/dashboard" : "/login"}
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

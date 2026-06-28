"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import "./landing.css";
import HowItWorksSimulator from "@/components/HowItWorksSimulator";
import { usePagePerformanceLogger, logPerformanceMetric } from "@/utils/performance";

const FloatingHearts = dynamic(() => import("@/components/FloatingHearts"), { ssr: false });
const InteractiveDemoLetter = dynamic(() => import("@/components/InteractiveDemoLetter"), { ssr: false });

const backgrounds = [
  { id: "hero", url: "/letter_desk_hero.png", overlay: "rgba(9, 6, 14, 0.65)" },
  { id: "story", url: "/once_upon_a_time.png", overlay: "rgba(9, 6, 14, 0.78)" },
  { id: "how-it-works", url: "/morphing_stationery.png", overlay: "rgba(9, 6, 14, 0.75)" },
  { id: "demo", url: "/crimson_gold_rose_bg.jpg", overlay: "rgba(9, 6, 14, 0.76)" },
  { id: "features", url: "/rich_features.png", overlay: "rgba(9, 6, 14, 0.75)" },
  { id: "use-cases", url: "/memory_chest_bg.png", overlay: "rgba(9, 6, 14, 0.78)" },
  { id: "faq-contact", url: "/glowing_envelopes.png", overlay: "rgba(9, 6, 14, 0.82)" }
];

const featuresData = [
  {
    id: 1,
    title: "Wax Seals & Stationery",
    desc: "Choose between Classic Parchment, Celestial Midnight, or Rose Petals. Seal them with a realistic, satisfying wax stamp.",
    icon: "✉️",
    gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    rotate: "-3deg",
    offsetX: "-5px",
    offsetY: "-5px"
  },
  {
    id: 2,
    title: "Timed Release Locks",
    desc: "Deliver letters ahead of time but lock them behind a live countdown timer. Perfect for midnight surprises.",
    icon: "⏳",
    gradient: "linear-gradient(135deg, #8ec5fc 0%, #e0c3fc 100%)",
    rotate: "4deg",
    offsetX: "8px",
    offsetY: "-2px"
  },
  {
    id: 3,
    title: "Private Security Gates",
    desc: "Ensure your letter is only read by the right eyes. Secure your letter with a private question only your partner knows.",
    icon: "🔑",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    rotate: "-2deg",
    offsetX: "-8px",
    offsetY: "6px"
  },
  {
    id: 4,
    title: "Ambient Lo-fi Tracks",
    desc: "Accompany your letter with romantic backing tracks or peaceful lo-fi background noise that loop automatically.",
    icon: "🎵",
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    rotate: "3deg",
    offsetX: "6px",
    offsetY: "8px"
  },
  {
    id: 5,
    title: "Polaroid Photo Albums",
    desc: "Attach personal Polaroid picture frames with titles and captions to share your favorite memories visually.",
    icon: "📸",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    rotate: "-4deg",
    offsetX: "-4px",
    offsetY: "-8px"
  },
  {
    id: 6,
    title: "Interactive Love Quizzes",
    desc: "Challenge your partner with multiple-choice relationship trivia questions that they must answer correctly to unlock.",
    icon: "🧩",
    gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    rotate: "2deg",
    offsetX: "4px",
    offsetY: "-4px"
  },
  {
    id: 7,
    title: "Audio Voice Messages",
    desc: "Record directly from your microphone or upload audio files to embed vocal greetings or sweet whispers.",
    icon: "🎙️",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    rotate: "-3deg",
    offsetX: "-6px",
    offsetY: "4px"
  },
  {
    id: 8,
    title: "Date RSVP Ticketing",
    desc: "Plan your next date night within the envelope. Embed ticket cards asking for a date RSVP with options.",
    icon: "🎟️",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    rotate: "4deg",
    offsetX: "8px",
    offsetY: "2px"
  },
  {
    id: 9,
    title: "Write-Back Responses",
    desc: "Allow your recipient to immediately compose and send back a digital reply note, which appears on your dashboard.",
    icon: "✍️",
    gradient: "linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)",
    rotate: "-1deg",
    offsetX: "-2px",
    offsetY: "6px"
  },
  {
    id: 10,
    title: "Real-Time Read Receipts",
    desc: "Know when your feelings reach them. Receive immediate read notifications on your dashboard when they break the seal.",
    icon: "🟢",
    gradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    rotate: "3deg",
    offsetX: "6px",
    offsetY: "-6px"
  }
];

const useCasesData = [
  {
    icon: "⏳",
    tabTitle: "Anniversaries",
    badge: "Anniversary Milestones",
    title: "Ticking Down to Midnight",
    desc: "Plan the perfect surprise by locking your letter until a specific moment. Your partner gets a live countdown to the exact second. The digital wax seal breaks only when the clock strikes midnight, creating a shared, memorable event.",
    mock: (
      <div className="use-cases-mock-display">
        <div style={{ fontSize: "14px", color: "var(--accent-rose)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold", marginBottom: "12px" }}>Countdown to Unlock</div>
        <div style={{ display: "flex", gap: "10px", fontSize: "24px", color: "#fff", fontFamily: "monospace", padding: "10px 20px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span>00d</span> : <span>12h</span> : <span>34m</span> : <span>05s</span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>🔒 Sealed under wax stamp</span>
      </div>
    )
  },
  {
    icon: "✈️",
    tabTitle: "Long-Distance",
    badge: "Long-Distance Love",
    title: "Close the Distance",
    desc: "Bridge the physical gap with custom paper stationery, ambient lo-fi music loops, and polaroid memories. It turns a digital message into a multi-sensory keepsake that feels like a physical letter.",
    mock: (
      <div className="use-cases-mock-display" style={{ flexDirection: "row", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ width: "100px", height: "120px", background: "#fff", padding: "8px 8px 18px 8px", borderRadius: "4px", boxShadow: "0 8px 16px rgba(0,0,0,0.3)", transform: "rotate(-4deg)" }}>
          <div style={{ width: "100%", height: "80px", background: "linear-gradient(to bottom, #fda085, #f6d365)", borderRadius: "2px" }} />
          <div style={{ color: "#2d2036", fontFamily: "var(--font-cursive)", fontSize: "12px", marginTop: "4px", textAlign: "center" }}>Paris 2026 ✈️</div>
        </div>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <div style={{ fontSize: "13px", color: "#fff", fontStyle: "italic", marginBottom: "8px", textAlign: "center" }}>"No matter the distance..."</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", justifyContent: "center" }}>
            <span style={{ color: "var(--accent-rose)" }}>🎵</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Playing: Cozy Campfire.mp3</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: "🩹",
    tabTitle: "Apologies",
    badge: "Quiet Reflections",
    title: "Space to Heal",
    desc: "Delicate conversations require calm, quiet environments. Deliver your reflections in a private reading space free from the noise of messaging apps and work notifications, letting your partner read and react at their own pace.",
    mock: (
      <div className="use-cases-mock-display">
        <div style={{ borderLeft: "2px solid var(--accent-rose)", paddingLeft: "14px", maxWidth: "380px" }}>
          <p style={{ fontSize: "13px", color: "#fff", fontStyle: "italic", margin: "0 0 8px 0", lineHeight: "1.5" }}>
            "I want to make things right. I wrote this private letter because you deserve space and time to read my words..."
          </p>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>🤍 Safe Space Environment</span>
        </div>
      </div>
    )
  },
  {
    icon: "🎟️",
    tabTitle: "Date RSVPs",
    badge: "Romantic Proposals",
    title: "An Invitation to Adventure",
    desc: "Craft an interactive date night proposal with custom RSVP options. Let them select their preferred restaurant, outfit, or weekend date inside the envelope, and get instant notifications on your dashboard.",
    mock: (
      <div className="use-cases-mock-display">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "340px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "center" }}>Select Your RSVP choice:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ border: "1px solid rgba(255, 75, 114, 0.4)", background: "rgba(255, 75, 114, 0.08)", padding: "10px 14px", borderRadius: "10px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#fff" }}>🌹 Candlelit Italian Dinner</span>
              <span style={{ color: "var(--accent-rose)" }}>✓ Selected</span>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "10px", display: "flex", justifyContent: "space-between", fontSize: "13px", opacity: 0.6 }}>
              <span style={{ color: "var(--text-muted)" }}>🍿 Drive-in Cinema</span>
              <span>—</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: "🧩",
    tabTitle: "Game Nights",
    badge: "Playful Suspense",
    title: "The Trivia-Locked Letter",
    desc: "Add suspense to your message by locking it behind a relationship quiz. Ask questions about your first date, favorite song, or inside jokes. The letter remains sealed until they solve it.",
    mock: (
      <div className="use-cases-mock-display">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "360px" }}>
          <div style={{ fontSize: "13px", color: "#fff", fontWeight: 600, textAlign: "center" }}>🧩 Question: What did we order on our first date?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", textAlign: "center", color: "var(--text-muted)" }}>Pineapple Pizza</div>
            <div style={{ background: "rgba(156, 108, 250, 0.08)", border: "1px solid rgba(156, 108, 250, 0.4)", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", textAlign: "center", color: "var(--accent-purple)" }}>Spicy Sushi Rolls</div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", textAlign: "center", color: "var(--text-muted)" }}>Street Tacos</div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", textAlign: "center", color: "var(--text-muted)" }}>Burgers & Fries</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: "🎙️",
    tabTitle: "Whispers",
    badge: "Audio Memories",
    title: "Sound of Your Presence",
    desc: "Sometimes written words are not enough. Record a vocal message, read a poem, or sing a song directly from the creator studio. Your partner plays it inside the letter, keeping your voice close to them.",
    mock: (
      <div className="use-cases-mock-display">
        <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", borderRadius: "20px", width: "100%", maxWidth: "340px" }}>
          <span style={{ fontSize: "28px", color: "var(--accent-gold)" }}>🎙️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600, marginBottom: "4px" }}>Voice Whisper from Jordan</div>
            <div style={{ display: "flex", gap: "2px", alignItems: "center", height: "16px" }}>
              {[30, 45, 15, 60, 40, 25, 55, 30, 45, 15, 50, 35, 20].map((h, idx) => (
                <div key={idx} style={{ flex: 1, height: `${h}%`, backgroundColor: "var(--accent-gold)", borderRadius: "1px" }} />
              ))}
            </div>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>0:43</span>
        </div>
      </div>
    )
  }
];

export default function LandingClientPage() {
  usePagePerformanceLogger("landing");
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [polaroidStack, setPolaroidStack] = useState([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  const [slidingCardIndex, setSlidingCardIndex] = useState<number | null>(null);
  const [activeUseCaseTab, setActiveUseCaseTab] = useState(0);

  const cyclePolaroid = () => {
    if (slidingCardIndex !== null) return;
    const topCardIndex = polaroidStack[polaroidStack.length - 1];
    setSlidingCardIndex(topCardIndex);

    setTimeout(() => {
      setPolaroidStack(prev => {
        const nextStack = [...prev];
        const top = nextStack.pop();
        if (top !== undefined) {
          nextStack.unshift(top);
        }
        return nextStack;
      });
      setSlidingCardIndex(null);
    }, 450);
  };

  // Typewriter effect statements based on the latest features
  const statements = [
    { prefix: "Write letters that live ", suffix: "forever." },
    { prefix: "Seal your love in ", suffix: "digital wax." },
    { prefix: "Attach memories as ", suffix: "Polaroid photos." },
    { prefix: "Secure your secrets in ", suffix: "private gates." },
    { prefix: "Play games with interactive ", suffix: "Love Quizzes." },
    { prefix: "Whisper feelings via ", suffix: "Audio Messages." },
    { prefix: "Capture dates with ", suffix: "RSVP tickets." }
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

  // Parallax scroll states
  const [scrollY, setScrollY] = useState(0);
  const [bgOpacities, setBgOpacities] = useState<number[]>([1, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);

          const viewportMid = currentScrollY + window.innerHeight / 2;
          const heroEl = document.querySelector(".landing-hero");
          const storyEl = document.getElementById("story");
          const howItWorksEl = document.getElementById("how-it-works");
          const demoEl = document.getElementById("demo");
          const featuresEl = document.getElementById("features");
          const useCasesEl = document.getElementById("use-cases");
          const faqEl = document.getElementById("faq");

          const elements = [heroEl, storyEl, howItWorksEl, demoEl, featuresEl, useCasesEl, faqEl];
          
          // Calculate midpoint coordinates relative to document
          const midpoints = elements.map((el) => {
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            return rect.top + currentScrollY + rect.height / 2;
          });

          const newOpacities = new Array(elements.length).fill(0);

          if (viewportMid <= midpoints[0]) {
            newOpacities[0] = 1;
          } else if (viewportMid >= midpoints[midpoints.length - 1]) {
            newOpacities[newOpacities.length - 1] = 1;
          } else {
            for (let i = 0; i < midpoints.length - 1; i++) {
              const m1 = midpoints[i];
              const m2 = midpoints[i + 1];
              if (viewportMid >= m1 && viewportMid <= m2) {
                const ratio = (viewportMid - m1) / (m2 - m1);
                // Cosine interpolation for organic ease-in-out crossfade
                const smoothRatio = (1 - Math.cos(ratio * Math.PI)) / 2;
                newOpacities[i] = 1 - smoothRatio;
                newOpacities[i + 1] = smoothRatio;
                break;
              }
            }
          }
          setBgOpacities(newOpacities);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const targets = document.querySelectorAll(".reveal-on-scroll");
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, [mounted]);

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
      overflow: "hidden"
    }}>
      {/* Parallax varying backgrounds */}
      <div className="fixed-parallax-bg-container">
        {backgrounds.map((bg, idx) => {
          const opacity = bgOpacities[idx] ?? 0;
          const translation = Math.max(-50, Math.min(50, scrollY * -0.035));
          return (
            <div
              key={bg.id}
              className="parallax-bg-layer"
              style={{
                backgroundImage: `linear-gradient(${bg.overlay}, ${bg.overlay}), url(${bg.url})`,
                opacity: opacity,
                transform: `translateY(${translation}px) scale(1.15)`,
              }}
            />
          );
        })}
      </div>

      {/* Floating Hearts background */}
      <FloatingHearts />

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
            className="header-logo-container"
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
              className="header-logo-img"
              style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "8px", 
                objectFit: "cover",
                boxShadow: "0 0 10px rgba(255, 75, 114, 0.3)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)"
              }} 
            />
            <span 
              className="header-logo-text"
              style={{ 
                fontSize: "36px", 
                fontWeight: "normal", 
                fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive", 
                background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
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
                  <span className="dashboard-text-full">Go to Dashboard 💖</span>
                  <span className="dashboard-text-short">Dashboard 💖</span>
                </Link>
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
            {/* Tagline of the App */}
            <div style={{ 
              display: "inline-flex", 
              flexWrap: "wrap",
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
              maxWidth: "100%",
              boxSizing: "border-box",
              textTransform: "uppercase",
              border: "1px solid rgba(255, 75, 114, 0.15)"
            }}>
              <span>🌸</span> Create and Send Interactive Digital Love Letters
            </div>

            {/* Typewriter H1 Headline */}
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
                  Write letters that live <span style={{ background: "linear-gradient(to right, #ff4b72, #e2b857)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>forever.</span>
                </>
              )}
            </h1>

            {/* Subtext */}
            <p className="hero-subtext" style={{ 
              fontSize: "16px", 
              color: "var(--text-muted)", 
              lineHeight: "1.6",
              maxWidth: "540px",
              width: "100%",
              margin: "0"
            }}>
              Express your heart in a private, media-rich letter experience. Design envelopes with digital wax seals, lock content for special dates, attach Polaroid photo frames, test your partner with love quizzes, and embed voice recordings.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
              <Link
                href={mounted && user ? "/dashboard" : "/create"}
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
          <div 
            className="hero-envelope-column parallax-element" 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "100%",
              transform: `translateY(${Math.max(-40, Math.min(40, scrollY * 0.05))}px)`
            }}
          >
            <div style={{ animation: "gentle-float 6s ease-in-out infinite", width: "100%", display: "flex", justifyContent: "center" }}>
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
                    width: "106px",
                    height: "106px",
                    left: "calc(50% - 53px)",
                    top: "167px"
                  } as React.CSSProperties}>
                    <div className="wax-seal-quarter top-left" />
                    <div className="wax-seal-quarter top-right" />
                    <div className="wax-seal-quarter bottom-left" />
                    <div className="wax-seal-quarter bottom-right" />
                  </div>
                </div>
              </div>
            </div>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: "12px" }}>
              Hover to break the wax seal & open the envelope ✉️
            </p>
          </div>

        </section>

        {/* STORYTELLING SECTION */}
        <section className="story-section" id="story">
          <h2 className="story-section-title reveal-on-scroll">A Love Story Through Time</h2>

          {/* Scene 1: Once upon a time... */}
          <div className="story-scene reveal-on-scroll">
            <div 
              className="story-scene-visual parallax-element"
              style={{
                transform: `translateY(${(scrollY - 900) * 0.04}px)`
              }}
            >
              <Image 
                src="/once_upon_a_time.png" 
                alt="Nostalgic handwritten love letter under soft candlelight" 
                width={420}
                height={280}
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "420px",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  border: "1.5px solid rgba(255, 255, 255, 0.05)"
                }}
              />
            </div>
            <div 
              className="story-scene-text parallax-element"
              style={{
                transform: `translateY(${(scrollY - 900) * -0.02}px)`
              }}
            >
              <h3>Once upon a time...</h3>
              <p className="story-lead">
                There was something magical about receiving a handwritten letter.
              </p>
              <p>
                Every word was chosen with care.<br />
                Every envelope carried anticipation.<br />
                Every letter became a keepsake worth saving.
              </p>
              <p>
                Love wasn't just communicated.<br />
                It was carefully crafted.
              </p>
            </div>
          </div>

          {/* Scene 2: Today... */}
          <div className="story-scene reveal-on-scroll">
            <div 
              className="story-scene-text parallax-element"
              style={{
                transform: `translateY(${(scrollY - 1500) * -0.02}px)`
              }}
            >
              <h3>Today...</h3>
              <p className="story-lead">
                Our deepest feelings are often shared through the same conversations we use for daily life.
              </p>
              <p>
                Beautiful words quickly disappear beneath new notifications, reminders, and everyday chats.
              </p>
              <p>
                Not because they matter less—but because they were never designed to become keepsakes.
              </p>
            </div>
            <div 
              className="story-scene-visual parallax-element"
              style={{
                transform: `translateY(${(scrollY - 1500) * 0.04}px)`
              }}
            >
              {/* CSS Smartphone Mockup */}
              <div className="smartphone-mockup">
                <div className="smartphone-header">
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>9:41 AM</span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>📶 🔋</span>
                </div>
                
                <div className="smartphone-chat-bubble left">
                  Hey, do you mind picking up some milk on your way home? 🥛
                </div>
                <div className="smartphone-chat-bubble left">
                  Also the meeting was rescheduled to 3 PM today.
                </div>
                <div className="smartphone-chat-bubble right important">
                  I love you so much. Happy anniversary, my heart. I'm so lucky to have you. ❤️
                </div>
                <div className="smartphone-chat-bubble left">
                  Got it, see you later ❤️
                </div>
                <div className="smartphone-chat-bubble left">
                  Don't forget to walk the dog! 🐶
                </div>

                <div className="smartphone-input-bar">
                  Type a message...
                </div>
              </div>
            </div>
          </div>

          {/* Scene 3: What if... */}
          <div className="story-scene reveal-on-scroll">
            <div 
              className="story-scene-visual parallax-element"
              style={{
                transform: `translateY(${(scrollY - 2100) * 0.04}px)`
              }}
            >
              {/* CSS EverAfter Showcase Card Vault */}
              <div className="everafter-showcase">
                {/* Central Mock Letter Canvas representing Elegant Stationery */}
                <div className="mock-letter-canvas">
                  <div className="mock-letter-paper">
                    <div className="mock-letter-header">
                      <span className="mock-letter-title">My Dearest...</span>
                      {/* Background music indicator */}
                      <span className="mock-music-badge">
                        <span className="music-icon">🎵</span>
                        <span className="music-text">Lofi Romance</span>
                        <span className="music-waves">
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                        </span>
                      </span>
                    </div>
                    
                    <div className="mock-letter-body">
                      <p>Some moments deserve more than a simple text message. They deserve to become keepsakes...</p>
                    </div>

                    {/* Widgets representing Voice note, Date invitation */}
                    <div className="mock-letter-widgets">
                      <div className="mock-voice-note">
                        <span className="voice-icon">🎙️</span>
                        <div className="voice-waveform">
                          <span className="voice-bar"></span>
                          <span className="voice-bar"></span>
                          <span className="voice-bar"></span>
                          <span className="voice-bar"></span>
                          <span className="voice-bar"></span>
                        </div>
                        <span className="voice-duration">0:24</span>
                      </div>
                      
                      <div className="mock-date-invitation">
                        <span className="invitation-icon">📅</span>
                        <div className="invitation-details">
                          <div className="invitation-title">Dinner & Stargazing</div>
                          <div className="invitation-time">Tomorrow, 7:00 PM</div>
                        </div>
                        <span className="rsvp-badge">RSVP</span>
                      </div>
                    </div>
                  </div>

                  {/* Overlapping Polaroid Photo */}
                  <div className="mock-polaroid">
                    <div className="polaroid-image">
                      <span className="polaroid-heart">🌅</span>
                    </div>
                    <div className="polaroid-caption">Summer 2026</div>
                  </div>
                </div>

                {/* Floating Envelope Badge */}
                <div className="showcase-floating-card showcase-card-envelope">
                  <span>✉️</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#fff" }}>Interactive Envelope</div>
                    <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>With Wax Seal</div>
                  </div>
                </div>

                {/* Floating Memory Chest Badge */}
                <div className="showcase-floating-card showcase-card-chest">
                  <span>💖</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#fff" }}>Memory Chest</div>
                    <div style={{ fontSize: "8px", color: "var(--text-muted)" }}>Permanent Vault</div>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="story-scene-text parallax-element"
              style={{
                transform: `translateY(${(scrollY - 2100) * -0.02}px)`
              }}
            >
              <h3>What if...</h3>
              <p className="story-lead">
                What if expressing love digitally could feel as thoughtful and meaningful as receiving a handwritten letter?
              </p>
              <p>
                Ever After Letters brings the romance of handwritten letters into the digital world.
              </p>
              <p>Every letter becomes an experience.</p>
              <p>Every memory becomes a keepsake.</p>
              <p>Every story has a place to be remembered.</p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="story-closing reveal-on-scroll">
            <h3 className="story-closing-title">
              Some moments deserve more than a message.<br />
              <span className="keepsake-gradient">
                They deserve to become keepsakes.
              </span>
            </h3>
            
            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
              <Link
                href={mounted && user ? "/dashboard" : "/create"}
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
                Create Your First Letter ❤️
              </Link>
            </div>
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

        {/* INTERACTIVE DEMO PLAYGROUND SECTION */}
        <section id="demo" style={{ marginBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ fontSize: "12px", color: "var(--accent-rose)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "2px" }}>Live Playground</span>
            <h2 style={{ fontSize: "46px", fontWeight: "normal", fontFamily: "var(--font-cursive)", marginTop: "8px" }}>Experience an EverAfter Letter</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "600px", margin: "8px auto 0 auto" }}>
              See exactly what your partner will experience when they receive your keepsake. Break the wax seal, answer the gate security check, and play with all our features.
            </p>
          </div>

          <InteractiveDemoLetter />
        </section>

        {/* FEATURES STACK */}
        <section id="features" style={{ marginBottom: "100px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "48px", fontWeight: "normal", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>
              Packed with Romantic Capabilities
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Every love letter is designed to be an unforgettable journey. Customize, secure, and enrich your letter with beautiful assets.
            </p>
          </div>

          <div className="features-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", padding: "0 20px", boxSizing: "border-box" }}>
            {/* Centered Polaroid Stack */}
            <div className="features-stack-column" style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="polaroid-stack-container" style={{ position: "relative", width: "320px", height: "420px" }}>
                {polaroidStack.map((cardIndex, zIndex) => {
                  const card = featuresData[cardIndex];
                  const isTop = zIndex === polaroidStack.length - 1;
                  const isSliding = slidingCardIndex === cardIndex;

                  const organicRotate = card.rotate;
                  const organicX = card.offsetX;
                  const organicY = card.offsetY;

                  const transform = isSliding
                    ? "" // slide-out CSS takes over
                    : `rotate(${organicRotate}) translate(${organicX}, ${organicY}) scale(${isTop ? 1 : 0.95})`;

                  return (
                    <div
                      key={card.id}
                      className={`polaroid-card ${isSliding ? "slide-out" : ""}`}
                      onClick={cyclePolaroid}
                      style={{
                        zIndex: zIndex,
                        transform: transform,
                        opacity: isTop || isSliding ? 1 : 0.85
                      }}
                    >
                      <div className="polaroid-photo-area" style={{ background: card.gradient }}>
                        <span>{card.icon}</span>
                      </div>
                      <div className="polaroid-caption-area">
                        <h3 className="polaroid-card-title">{card.title}</h3>
                        <p className="polaroid-card-desc">{card.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "-10px", fontStyle: "italic", textAlign: "center" }}>
                📸 Click the Polaroid photo to cycle through features!
              </p>
            </div>
          </div>

        </section>

        {/* EMOTIONAL USE CASES SHOWCASE */}
        <section id="use-cases" style={{ marginBottom: "100px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span style={{ fontSize: "14px", color: "var(--accent-rose)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Designed for Connection</span>
            <h2 style={{ fontSize: "48px", fontWeight: "normal", marginTop: "8px", marginBottom: "12px", fontFamily: "var(--font-cursive)" }}>Moments Crafted in Pixels</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Every relationship is unique. Here is how users leverage EverAfter to build lasting, emotional bridges.
            </p>
          </div>

          <div className="use-cases-showcase-container">
            {/* Left Side Tabs */}
            <div className="use-cases-tabs-list">
              {useCasesData.map((uc, idx) => {
                const isActive = activeUseCaseTab === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`use-cases-tab-button ${isActive ? "active" : ""}`}
                    onClick={() => setActiveUseCaseTab(idx)}
                  >
                    <span style={{ fontSize: "20px" }}>{uc.icon}</span>
                    <span style={{ fontSize: "15px", fontWeight: isActive ? 600 : 500 }}>{uc.tabTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Content Showcase */}
            {(() => {
              const activeData = useCasesData[activeUseCaseTab];
              return (
                <div className="use-cases-showcase-content">
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--accent-rose)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1.5px", display: "inline-block", marginBottom: "10px" }}>
                      💝 {activeData.badge}
                    </span>
                    <h3 style={{ fontSize: "36px", fontWeight: "normal", fontFamily: "var(--font-cursive)", color: "#fff", margin: "0 0 16px 0", lineHeight: "1.2" }}>
                      {activeData.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
                      {activeData.desc}
                    </p>
                  </div>
                  {activeData.mock}
                </div>
              );
            })()}
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
              },
              {
                q: "Can I attach photos or images to my love letters?",
                a: "Yes! You can attach personal Polaroid photo albums with custom captions directly to your letter, sharing your favorite memories side-by-side with your writing."
              },
              {
                q: "What is the Love Quiz feature?",
                a: "The Love Quiz lets you insert multiple-choice trivia questions that your partner must answer correctly to unlock or proceed through the letter. It's a playful, interactive way to test how well they know your shared moments!"
              },
              {
                q: "Can I record a voice message in my digital letter?",
                a: "Absolutely. With our Audio Voice Messages feature, you can record or upload a custom voice message (like a vocal whisper or romantic greeting) that your partner can play directly from the letter."
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
                onSubmit={(e) => {
                  e.preventDefault();
                  if (contactName.trim() && contactEmail.trim() && contactMessage.trim()) {
                    // Instantly trigger UI success state (optimistic update)
                    setContactSubmitted(true);
                    
                    const start = performance.now();
                    fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: contactName.trim(),
                        email: contactEmail.trim(),
                        message: contactMessage.trim()
                      })
                    }).then((res) => {
                      const latency = performance.now() - start;
                      logPerformanceMetric("api_contact", latency, res.ok ? "success" : "error");
                    }).catch((err) => {
                      const latency = performance.now() - start;
                      logPerformanceMetric("api_contact", latency, "error", { error: err.message || err });
                      console.error("Async background contact save failed:", err);
                    });
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
            href={mounted && user ? "/dashboard" : "/create"}
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
          Create and send digital love letters for unforgettable sentiments.
        </div>
      </footer>
    </div>
  );
}

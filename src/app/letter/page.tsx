"use client";

import React, { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { decodeLetterData } from "@/utils/encoding";
import FloatingHearts from "@/components/FloatingHearts";
import AudioPlayer from "@/components/AudioPlayer";
import Envelope from "@/components/Envelope";
import Link from "next/link";
import { db } from "@/utils/firebase";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { usePagePerformanceLogger } from "@/utils/performance";

// Import modular reader components
import CountdownLock from "@/components/reader/CountdownLock";
import SecurityGate from "@/components/reader/SecurityGate";
import IntroStatement from "@/components/reader/IntroStatement";
import ClosingStatement from "@/components/reader/ClosingStatement";
import DateInvitation from "@/components/reader/DateInvitation";
import SurveyFeedback from "@/components/reader/SurveyFeedback";
import AudioMessage from "@/components/reader/AudioMessage";
import LoveQuizReader from "@/components/reader/LoveQuizReader";
import PolaroidsReader from "@/components/reader/PolaroidsReader";
import ThankYou from "@/components/reader/ThankYou";
import CoverScreen from "@/components/reader/CoverScreen";

const BACKDROP_IMAGES: Record<string, string> = {
  campfire: "/campfire_letter.png",
  ocean_sunset: "/ocean_sunset.png",
  cozy_cafe: "/cozy_cafe.png",
  cherry_blossoms: "/cherry_blossoms.png",
  vintage_library: "/vintage_library.png",
};

const getBackdropOverlay = (theme: string) => {
  switch (theme) {
    case "celestial":
      return "rgba(9, 14, 36, 0.78)";
    case "royal":
      return "rgba(20, 15, 12, 0.78)";
    case "scroll":
      return "rgba(18, 14, 10, 0.78)";
    case "blush":
      return "rgba(20, 12, 14, 0.78)";
    case "lavender":
      return "rgba(26, 5, 10, 0.85)";
    default:
      return "rgba(10, 7, 18, 0.78)";
  }
};

function LetterReader() {
  usePagePerformanceLogger("letter");
  const searchParams = useSearchParams();
  const d = searchParams.get("d") || "";
  const id = searchParams.get("id") || "";
  const preview = searchParams.get("preview") === "true";

  // Decode letter data using useMemo to comply with React Hook guidelines
  const decodedData = useMemo(() => {
    return d ? decodeLetterData(d) : null;
  }, [d]);

  const [dbData, setDbData] = useState<any>(null);
  const [fetchingDb, setFetchingDb] = useState(!!id);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchFromDb = async () => {
      if (!id) return;
      setFetchingDb(true);
      try {
        if (db) {
          const docRef = doc(db, "letters", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDbData(docSnap.data());
          }
        }
      } catch (err) {
        console.error("Failed to fetch letter from Firestore:", err);
      } finally {
        setFetchingDb(false);
      }
    };
    fetchFromDb();
  }, [id]);

  const data = dbData || decodedData;

  const [isGuestExpired, setIsGuestExpired] = useState(false);

  useEffect(() => {
    if (!id && decodedData?.timestamp) {
      setIsGuestExpired(Date.now() - decodedData.timestamp > 24 * 60 * 60 * 1000);
    } else {
      setIsGuestExpired(false);
    }
  }, [id, decodedData]);

  // Scheduled Send Lock state
  const [isLocked, setIsLocked] = useState(false);

  // Check if letter is locked until a scheduled time
  useEffect(() => {
    if (data?.sendLaterDate) {
      const releaseTime = +new Date(data.sendLaterDate);
      const now = +new Date();
      if (now < releaseTime) {
        setIsLocked(true);
      }
    }
  }, [data]);

  const [showMailboxButton, setShowMailboxButton] = useState(false);

  useEffect(() => {
    if (!id || !dbData) return;
    
    // Set unlock in sessionStorage if no security gate is enabled
    if (!dbData.security?.enabled) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`unlocked_${id}`, "true");
      }
    }

    const checkMailbox = async () => {
      try {
        if (db && dbData.userId && dbData.email) {
          const q = query(
            collection(db, "letters"),
            where("userId", "==", dbData.userId),
            where("email", "==", dbData.email)
          );
          const snap = await getDocs(q);
          if (snap.size > 1) {
            setShowMailboxButton(true);
          }
        }
      } catch (err) {
        console.error("Error checking mailbox size:", err);
      }
    };
    checkMailbox();
  }, [id, dbData]);

  // Mark the letter as read when opened (ignoring preview links)
  useEffect(() => {
    const markAsRead = async () => {
      if (!id || preview) return;

      try {
        if (db) {
          const docRef = doc(db, "letters", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && !docSnap.data()?.read) {
            await updateDoc(docRef, {
              read: true,
              readAt: Date.now()
            });
          }
        }
      } catch (err) {
        console.error("Failed to mark letter as read in Firestore:", err);
      }
    };

    markAsRead();
  }, [id, preview]);

  // Prevent scroll on the recipient page to fit everything on one page on desktop viewports
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 992) {
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100vh";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    }
    return () => {
      if (typeof window !== "undefined") {
        document.documentElement.style.overflow = "";
        document.documentElement.style.height = "";
        document.body.style.overflow = "";
        document.body.style.height = "";
      }
    };
  }, []);

  // Active steps calculation based on enabled modifications
  const activeSteps = useMemo<string[]>(() => {
    if (!data) return ["envelope"];
    let rawOrder = data.stepOrder || ["security", "intro", "envelope", "polaroids", "audioMessage", "loveQuiz", "dateInvite", "closing", "survey"];
    if (data.audioMessage?.enabled && !rawOrder.includes("audioMessage")) {
      rawOrder = [...rawOrder];
      const envIdx = rawOrder.indexOf("envelope");
      if (envIdx !== -1) {
        rawOrder.splice(envIdx + 1, 0, "audioMessage");
      } else {
        rawOrder.push("audioMessage");
      }
    }
    if (data.polaroids?.enabled && !rawOrder.includes("polaroids")) {
      rawOrder = [...rawOrder];
      const envIdx = rawOrder.indexOf("envelope");
      if (envIdx !== -1) {
        rawOrder.splice(envIdx + 1, 0, "polaroids");
      } else {
        rawOrder.push("polaroids");
      }
    }
    if (data.loveQuiz?.enabled && !rawOrder.includes("loveQuiz")) {
      rawOrder = [...rawOrder];
      const envIdx = rawOrder.indexOf("envelope");
      if (envIdx !== -1) {
        rawOrder.splice(envIdx + 1, 0, "loveQuiz");
      } else {
        rawOrder.push("loveQuiz");
      }
    }
    const steps = rawOrder.filter((stepId: string) => {
      if (stepId === "envelope") return true;
      if (stepId === "security" && data.security?.enabled) return true;
      if (stepId === "intro" && data.intro?.enabled) return true;
      if (stepId === "polaroids" && data.polaroids?.enabled) return true;
      if (stepId === "audioMessage" && data.audioMessage?.enabled) return true;
      if (stepId === "loveQuiz" && data.loveQuiz?.enabled) return true;
      if (stepId === "dateInvite" && data.dateInvite?.enabled) return true;
      if (stepId === "closing" && data.closing?.enabled) return true;
      if (stepId === "survey" && data.survey?.enabled) return true;
      return false;
    });
    // Cover screen starts immediately after the preparing/decrypting loader animation
    steps.unshift("cover");

    steps.push("thankYou");
    return steps;
  }, [data]);

  // Check if envelope and polaroids are adjacent steps in the wizard
  const envelopeAdjacency = useMemo(() => {
    if (!data?.polaroids?.enabled) return { isAdjacent: false, polaroidsFirst: false };
    const stepsWithoutCover = activeSteps.filter(step => step !== "cover");
    const envIdx = stepsWithoutCover.indexOf("envelope");
    const polIdx = stepsWithoutCover.indexOf("polaroids");
    if (envIdx === -1 || polIdx === -1) return { isAdjacent: false, polaroidsFirst: false };
    const isAdjacent = Math.abs(envIdx - polIdx) === 1;
    const polaroidsFirst = polIdx < envIdx;
    return { isAdjacent, polaroidsFirst };
  }, [activeSteps, data]);

  // Wizard transitions and step tracking
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [isVoiceMessagePlaying, setIsVoiceMessagePlaying] = useState(false);

  const currentStep = activeSteps[visibleStepIndex];
  const [isMusicForcePaused, setIsMusicForcePaused] = useState(false);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (prevStepRef.current === "audioMessage" && currentStep !== "audioMessage") {
      setIsMusicForcePaused(true);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Automatically reset the blinding flash after it triggers
  useEffect(() => {
    if (triggerFlash) {
      const timer = setTimeout(() => {
        setTriggerFlash(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [triggerFlash]);

  if (fetchingDb) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        width: "100vw",
        flexDirection: "column", 
        gap: "24px",
        background: "#100907",
        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(226, 184, 87, 0.08) 0%, transparent 65%)",
        position: "fixed",
        inset: 0,
        zIndex: 99999
      }}>
        {/* Pulsing golden wax seal/heart lock */}
        <div style={{
          position: "relative",
          width: "100px",
          height: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "3px solid rgba(226, 184, 87, 0.6)",
            boxShadow: "0 0 30px rgba(226, 184, 87, 0.55), inset 0 0 15px rgba(226, 184, 87, 0.35)",
            animation: "pulse-keyhole 1.5s ease-in-out infinite"
          }} />
          <span style={{ fontSize: "36px", zIndex: 2, filter: "drop-shadow(0 0 8px rgba(226, 184, 87, 0.65))" }}>💖</span>
        </div>
        <div style={{ 
          color: "var(--accent-gold)", 
          fontSize: "18px", 
          fontWeight: 600,
          fontFamily: "var(--font-cursive)",
          textShadow: "0 2px 10px rgba(226, 184, 87, 0.3)"
        }}>
          {preview ? "Preparing your letter..." : "Decrypting letter..."}
        </div>
      </div>
    );
  }

  if (!d && !id) {
    return (
      <div className="glass" style={{ maxWidth: "480px", padding: "40px 30px", textAlign: "center", margin: "100px auto", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>No Letter Found</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "24px" }}>
          It looks like there is no letter attached to this link. Make sure you have copied the complete URL.
        </p>
        <Link 
          href="/create" 
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
          Create a Love Letter
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass" style={{ maxWidth: "480px", padding: "40px 30px", textAlign: "center", margin: "100px auto", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "48px", marginBottom: "20px", color: "var(--accent-rose)" }}>💔</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>Unable to Decrypt Letter</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "24px" }}>
          This link appears to be corrupted or formatted incorrectly. Please ask your loved one to resend the link.
        </p>
        <Link 
          href="/" 
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "8px",
            background: "var(--accent-purple)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            textDecoration: "none"
          }}
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  // Check if guest link is expired (>24 hours)
  if (isGuestExpired) {
    const upgradeUrl = `/login?redirect=/create&d=${d}`;
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        padding: "20px",
        background: "#100907",
        backgroundImage: "radial-gradient(circle at 50% 30%, rgba(255, 75, 114, 0.08) 0%, transparent 65%)",
        position: "fixed",
        inset: 0,
        zIndex: 99999
      }}>
        <FloatingHearts />
        <main
          className="glass animate-reveal"
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "40px 30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            borderRadius: "16px",
            position: "relative",
            zIndex: 10
          }}
        >
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 75, 114, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            boxShadow: "0 0 20px rgba(255, 75, 114, 0.25)",
            border: "1.5px solid rgba(255, 75, 114, 0.15)",
            animation: "pulse-keyhole 2s ease-in-out infinite"
          }}>
            ⏳
          </div>

          <div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "var(--font-cursive, serif)",
              letterSpacing: "0.5px"
            }}>
              A Fleeting Memory...
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginTop: "12px" }}>
              Guest love letters are like whispers in the wind—they expire after 24 hours to protect their intimacy. This letter has faded.
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", opacity: 0.8, lineHeight: "1.5", marginTop: "8px" }}>
              Are you the creator of this letter? Create a free EverAfter account to restore, save, and keep your love letters forever!
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <Link
              href={upgradeUrl}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(255, 75, 114, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              Sign Up to Restore & Save
            </Link>
            <Link
              href={`${upgradeUrl}&login=true`}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-card)",
                color: "var(--text-muted)",
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Log In to Account
            </Link>
            <Link
              href="/create"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "rgba(156, 108, 250, 0.1)",
                border: "1.5px dashed rgba(156, 108, 250, 0.3)",
                color: "var(--accent-purple)",
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Write a New Letter
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Handle advancing wizard steps with transitions and blinding flash before envelope
  const handleNextStep = () => {
    if (visibleStepIndex < activeSteps.length - 1) {
      const nextVisibleIndex = visibleStepIndex + 1;
      const unlockingNewStep = nextVisibleIndex > currentStepIndex;
      const nextStepId = activeSteps[nextVisibleIndex];

      const isEnvPolTransition = envelopeAdjacency.isAdjacent && (
        (currentStep === "envelope" && nextStepId === "polaroids") ||
        (currentStep === "polaroids" && nextStepId === "envelope")
      );

      if (nextStepId === "envelope" && unlockingNewStep && !isEnvPolTransition) {
        setTriggerFlash(true);
      }

      if (isEnvPolTransition) {
        if (unlockingNewStep) {
          setCurrentStepIndex(nextVisibleIndex);
        }
        setVisibleStepIndex(nextVisibleIndex);
      } else {
        setIsTransitioning(true);
        setTimeout(() => {
          if (unlockingNewStep) {
            setCurrentStepIndex(nextVisibleIndex);
          }
          setVisibleStepIndex(nextVisibleIndex);
          setIsTransitioning(false);
        }, 700);
      }
    }
  };

  const hasTimeline = activeSteps.filter(id => id !== "thankYou").length > 1 && currentStep !== "thankYou";

  // If letter is locked under Send Later scheduler, render lock screen countdown
  if (isLocked && data.sendLaterDate) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <CountdownLock 
          sendLaterDate={data.sendLaterDate} 
          onUnlock={() => setIsLocked(false)} 
        />
      </div>
    );
  }

      // Determine backdrop image path
      const backdropUrl = data.backdrop && data.backdrop !== "none"
        ? BACKDROP_IMAGES[data.backdrop]
        : "";

      return (
        <div 
          className={`letter-reader-container ${!hasTimeline ? "no-timeline" : ""}`}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            minHeight: "100vh", 
            width: "100%",
            padding: hasTimeline ? "var(--page-padding-top, 120px) 20px 20px 20px" : "20px", 
            position: "relative", 
            zIndex: 10,
          }}
        >
          {/* Fixed Full Screen Page Backdrop to prevent any resizing/stretching distortion */}
          {backdropUrl && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${backdropUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                zIndex: -1,
                pointerEvents: "none"
              }}
            >
              {/* Overlay wash to dim/soften high-contrast background areas for readability */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: getBackdropOverlay(data.theme || ""),
                  transition: "background-color 0.8s ease"
                }}
              />
            </div>
          )}
      <FloatingHearts />
      
      {/* Background music autoplay enabled for preview/view */}
      {data.music && (
        <AudioPlayer 
          autoplay={true} 
          musicType={data.musicType} 
          musicUrl={data.musicUrl} 
          isForcePaused={isVoiceMessagePlaying || isMusicForcePaused}
          onTogglePlayback={(playing) => {
            if (playing) {
              setIsMusicForcePaused(false);
            }
          }}
          visible={currentStep !== "cover"}
        />
      )}

      {/* Progress timeline navigation dots */}
      {mounted && activeSteps.filter(id => id !== "thankYou" && id !== "cover").length > 1 && currentStep !== "thankYou" && currentStep !== "cover" && createPortal(
        <div 
          className="letter-timeline-container"
          style={{ 
            position: "fixed", 
            top: "20px", 
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "calc(100% - 40px)", 
            maxWidth: "440px", 
            zIndex: 150,
            padding: "14px 24px 22px 24px",
            background: "transparent",
            border: "none",
            borderRadius: "32px",
            boxShadow: "none"
          }}
        >
          {/* Timeline connecting line */}
          <div 
            style={{
              position: "absolute",
              left: "var(--timeline-line-offset, 41px)",
              right: "var(--timeline-line-offset, 41px)",
              top: "var(--timeline-line-top, 30px)",
              height: "2px",
              background: `linear-gradient(to right, 
                var(--accent-purple) ${(() => {
                  const filteredList = activeSteps.filter(id => id !== "thankYou" && id !== "cover");
                  const furthestStepId = activeSteps[currentStepIndex];
                  const furthestFilteredIdx = filteredList.indexOf(furthestStepId);
                  return filteredList.length > 1 ? (Math.max(0, furthestFilteredIdx) / (filteredList.length - 1)) * 100 : 0;
                })()}%, 
                rgba(255, 255, 255, 0.3) ${(() => {
                  const filteredList = activeSteps.filter(id => id !== "thankYou" && id !== "cover");
                  const furthestStepId = activeSteps[currentStepIndex];
                  const furthestFilteredIdx = filteredList.indexOf(furthestStepId);
                  return filteredList.length > 1 ? (Math.max(0, furthestFilteredIdx) / (filteredList.length - 1)) * 100 : 0;
                })()}%
              )`,
              zIndex: 1,
              transition: "all 0.5s ease"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", zIndex: 2 }}>
            {activeSteps.filter(id => id !== "thankYou" && id !== "cover").map((stepId, idx) => {
              const filteredList = activeSteps.filter(id => id !== "thankYou" && id !== "cover");
              const currentFilteredIdx = filteredList.indexOf(currentStep);
              const visibleFilteredIdx = filteredList.indexOf(activeSteps[visibleStepIndex]);
              const furthestFilteredIdx = filteredList.indexOf(activeSteps[currentStepIndex]);

              const isCompleted = idx < currentFilteredIdx;
              const isActive = idx === visibleFilteredIdx;
              const isClickable = idx <= furthestFilteredIdx;
              
              let stepIcon = "⚫";
              let stepTitle = "Step";
              if (stepId === "security") { stepIcon = "🔒"; stepTitle = "Lock"; }
              else if (stepId === "intro") { stepIcon = "✨"; stepTitle = "Intro"; }
              else if (stepId === "envelope") { stepIcon = "✉"; stepTitle = "Letter"; }
              else if (stepId === "polaroids") { stepIcon = "📸"; stepTitle = "Photos"; }
              else if (stepId === "audioMessage") { stepIcon = "🎤"; stepTitle = "Voice"; }
              else if (stepId === "loveQuiz") { stepIcon = "🎮"; stepTitle = "Quiz"; }
              else if (stepId === "dateInvite") { stepIcon = "🌹"; stepTitle = "Date"; }
              else if (stepId === "closing") { stepIcon = "✍"; stepTitle = "Closing"; }
              else if (stepId === "survey") { stepIcon = "📊"; stepTitle = "Survey"; }

              return (
                <div 
                  key={stepId} 
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
                  title={stepTitle}
                >
                  <button
                    onClick={() => {
                      if (isClickable && !isTransitioning) {
                        const targetIdxInActive = activeSteps.indexOf(stepId);
                        if (targetIdxInActive !== -1) {
                          const isEnvPolTransition = envelopeAdjacency.isAdjacent && (
                             (currentStep === "envelope" && stepId === "polaroids") ||
                             (currentStep === "polaroids" && stepId === "envelope")
                          );

                          if (isEnvPolTransition) {
                            setVisibleStepIndex(targetIdxInActive);
                          } else {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setVisibleStepIndex(targetIdxInActive);
                              setIsTransitioning(false);
                            }, 700);
                          }
                        }
                      }
                    }}
                    style={{
                      width: "var(--timeline-btn-size, 34px)",
                      height: "var(--timeline-btn-size, 34px)",
                      borderRadius: "50%",
                      backgroundColor: isActive 
                        ? "var(--accent-rose)" 
                        : isCompleted 
                          ? "var(--accent-purple)" 
                          : "rgba(20, 15, 30, 0.85)",
                      border: isActive 
                        ? "2px solid #fff" 
                        : isCompleted 
                          ? "1.5px solid var(--accent-purple)" 
                          : "1.5px solid var(--border-card)",
                      boxShadow: isActive 
                        ? "0 0 15px var(--accent-rose), inset 0 2px 4px rgba(255,255,255,0.2)" 
                        : isCompleted 
                          ? "0 0 8px rgba(156, 108, 250, 0.25)" 
                          : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      cursor: isClickable ? "pointer" : "default",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isActive ? "scale(1.15)" : "scale(1)",
                      color: isActive || isCompleted ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {stepIcon}
                  </button>
                  <span 
                    style={{ 
                      fontSize: "var(--timeline-label-size, 9px)", 
                      color: "#fff",
                      fontWeight: "bold",
                      marginTop: "6px",
                      position: "absolute",
                      top: "var(--timeline-label-top, 38px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      backgroundColor: isActive 
                        ? "rgba(255, 75, 114, 0.85)" 
                        : isCompleted 
                          ? "rgba(156, 108, 250, 0.5)" 
                          : "rgba(11, 7, 17, 0.55)",
                      border: isActive
                        ? "1px solid rgba(255, 255, 255, 0.25)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      boxShadow: isActive
                        ? "0 2px 10px rgba(255, 75, 114, 0.4)"
                        : "0 2px 6px rgba(0, 0, 0, 0.3)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      opacity: isActive ? 1 : isCompleted ? 0.9 : 0.65,
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                      transition: "all 0.4s ease"
                    }}
                  >
                    {stepTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )}

      {/* Step Transition Frame */}
      <div 
        className={isTransitioning ? "step-card-transition-exit" : "step-card-transition-active"}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: triggerFlash ? 0 : 1,
          transform: triggerFlash ? "scale(0.98) translateY(10px)" : "scale(1) translateY(0)",
          transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: triggerFlash ? "none" : "auto"
        }}
      >
        {/* Step: Security Lock Gate */}
        {currentStep === "security" && data.security && (
          <SecurityGate 
            securityData={data.security} 
            onSuccess={() => {
              if (typeof window !== "undefined") {
                const key = id ? `unlocked_${id}` : (d ? `unlocked_${d.slice(0, 10)}` : "unlocked_temp");
                sessionStorage.setItem(key, "true");
              }
              handleNextStep();
            }} 
          />
        )}

        {/* Step: Cover Splash Screen */}
        {currentStep === "cover" && (
          <CoverScreen 
            sender={data.sender}
            recipient={data.recipient}
            onComplete={handleNextStep}
          />
        )}

        {/* Step: Introductory Statement */}
        {currentStep === "intro" && data.intro && (
          <IntroStatement 
            text={data.intro.text} 
            animation={data.intro.animation} 
            onComplete={handleNextStep} 
          />
        )}

        {/* Step: Unified Envelope / Polaroid Stack (Adjacent) or Envelope (Non-Adjacent) */}
        {(currentStep === "envelope" || (currentStep === "polaroids" && envelopeAdjacency.isAdjacent)) && (
          <Envelope
            recipient={data.recipient}
            sender={data.sender}
            content={data.content}
            theme={data.theme}
            sealSymbol={data.sealSymbol}
            sealColor={data.sealColor}
            envelopeStyle={data.envelopeStyle}
            greeting={data.greeting}
            farewell={data.farewell}
            backdrop={data.backdrop}
            isOnlyStep={activeSteps.length === 1}
            polaroids={data.polaroids?.items}
            polaroidsLayout={data.polaroids?.layout}
            polaroidsCollageStyle={data.polaroids?.collageStyle}
            polaroidsCollageBgPosition={data.polaroids?.collageBgPosition}
            polaroidsCollageBgZoom={data.polaroids?.collageBgZoom}
            polaroidsTitle={data.polaroids?.title}
            polaroidsShowHearts={data.polaroids?.showHearts}
            activeStep={currentStep}
            onStepComplete={handleNextStep}
            isAdjacentToPolaroids={envelopeAdjacency.isAdjacent}
            polaroidsFirst={envelopeAdjacency.polaroidsFirst}
            onClose={() => {
              handleNextStep();
            }}
            narration={data.narration}
          />
        )}

        {/* Step: Polaroid Photo Stack - Non-adjacent fallback */}
        {!envelopeAdjacency.isAdjacent && currentStep === "polaroids" && data.polaroids && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              animation: "float-up-intro 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <PolaroidsReader
              polaroids={data.polaroids.items}
              theme={data.theme}
              onComplete={handleNextStep}
              isSheetExpanded={true} // Always expanded in standalone mode
              isStandalone={true}
              layout={data.polaroids.layout}
              collageStyle={data.polaroids.collageStyle}
              collageBgPosition={data.polaroids.collageBgPosition}
              collageBgZoom={data.polaroids.collageBgZoom}
              title={data.polaroids.title}
              showHearts={data.polaroids.showHearts}
              sender={data.sender}
            />
          </div>
        )}

        {/* Step: Audio Message */}
        {currentStep === "audioMessage" && data.audioMessage && (
          <AudioMessage
            audioMessage={data.audioMessage}
            theme={data.theme}
            onComplete={handleNextStep}
            onPlayStateChange={setIsVoiceMessagePlaying}
          />
        )}

        {/* Step: Love Quiz Game */}
        {currentStep === "loveQuiz" && data.loveQuiz && (
          <LoveQuizReader
            loveQuiz={data.loveQuiz}
            sender={data.sender}
            recipient={data.recipient}
            letterKey={d || id || "preview"}
            letterId={id}
            senderEmail={dbData?.senderEmail || ""}
            recipientEmail={dbData?.email || data?.email || ""}
            preview={preview}
            onComplete={handleNextStep}
          />
        )}

        {/* Step: Date Invitation ticket pass */}
        {currentStep === "dateInvite" && data.dateInvite && (
          <DateInvitation 
            dateInvite={data.dateInvite}
            sender={data.sender}
            recipient={data.recipient}
            letterKey={d}
            letterId={id}
            senderEmail={dbData?.senderEmail || ""}
            preview={preview}
            onComplete={handleNextStep}
          />
        )}

        {/* Step: Closing Statement */}
        {currentStep === "closing" && data.closing && (
          <ClosingStatement 
            text={data.closing.text} 
            animation={data.closing.animation} 
            isLastStep={visibleStepIndex === activeSteps.length - 1} 
            onComplete={handleNextStep} 
          />
        )}

        {/* Step: Post-Letter Survey */}
        {currentStep === "survey" && data.survey && (
          <SurveyFeedback 
            survey={data.survey}
            sender={data.sender}
            recipient={data.recipient}
            letterKey={d}
            letterId={id}
            preview={preview}
            onComplete={handleNextStep}
          />
        )}

        {/* Step: Thank You Screen (hidden step) */}
        {currentStep === "thankYou" && (
          <ThankYou
            sender={data.sender}
            recipient={data.recipient}
            content={data.content}
            theme={data.theme}
            isWriteback={data.isWriteback || false}
            parentLetterId={id}
            recipientUid={dbData?.userId || ""}
            showMailboxButton={showMailboxButton}
            mailboxLink={`/mailbox?ref=${dbData?.replyToId || id}`}
            replyToId={dbData?.replyToId || ""}
            onReplay={() => {
              setCurrentStepIndex(0);
              setVisibleStepIndex(0);
            }}
            onExit={() => {
              if (typeof window !== "undefined") {
                window.close();
                setTimeout(() => {
                  window.location.href = "/";
                }, 150);
              }
            }}
          />
        )}
      </div>

      {triggerFlash && <div className="blinding-flash-active" />}
    </div>
  );
}

function LetterReaderWrapper() {
  const searchParams = useSearchParams();
  const d = searchParams.get("d") || "";
  const id = searchParams.get("id") || "";
  const keyPart = `${id}_${d ? d.slice(0, 12) : ""}`;
  return <LetterReader key={keyPart} />;
}

export default function LetterPage() {
  return (
    <div style={{ height: "100vh", padding: "0px", overflow: "hidden" }}>
      <Suspense fallback={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100vh", 
          width: "100vw",
          flexDirection: "column", 
          gap: "24px",
          background: "#100907",
          backgroundImage: "radial-gradient(circle at 50% 30%, rgba(226, 184, 87, 0.08) 0%, transparent 65%)",
          position: "fixed",
          inset: 0,
          zIndex: 99999
        }}>
          <div style={{
            position: "relative",
            width: "100px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "3px solid rgba(226, 184, 87, 0.6)",
              boxShadow: "0 0 30px rgba(226, 184, 87, 0.55), inset 0 0 15px rgba(226, 184, 87, 0.35)",
              animation: "pulse-keyhole 1.5s ease-in-out infinite"
            }} />
            <span style={{ fontSize: "36px", zIndex: 2, filter: "drop-shadow(0 0 8px rgba(226, 184, 87, 0.65))" }}>💖</span>
          </div>
          <div style={{ 
            color: "var(--accent-gold)", 
            fontSize: "18px", 
            fontWeight: 600,
            fontFamily: "var(--font-cursive)",
            textShadow: "0 2px 10px rgba(226, 184, 87, 0.3)"
          }}>
            Decrypting letter...
          </div>
        </div>
      }>
        <LetterReaderWrapper />
      </Suspense>
    </div>
  );
}

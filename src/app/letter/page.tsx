"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { decodeLetterData } from "@/utils/encoding";
import FloatingHearts from "@/components/FloatingHearts";
import AudioPlayer from "@/components/AudioPlayer";
import Envelope from "@/components/Envelope";
import Link from "next/link";
import { db } from "@/utils/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// Import modular reader components
import CountdownLock from "@/components/reader/CountdownLock";
import SecurityGate from "@/components/reader/SecurityGate";
import IntroStatement from "@/components/reader/IntroStatement";
import ClosingStatement from "@/components/reader/ClosingStatement";
import DateInvitation from "@/components/reader/DateInvitation";
import SurveyFeedback from "@/components/reader/SurveyFeedback";

function LetterReader() {
  const searchParams = useSearchParams();
  const d = searchParams.get("d") || "";
  const id = searchParams.get("id") || "";
  const preview = searchParams.get("preview") === "true";

  // Decode letter data using useMemo to comply with React Hook guidelines
  const decodedData = useMemo(() => {
    return d ? decodeLetterData(d) : null;
  }, [d]);

  const [dbData, setDbData] = useState<any>(null);
  const [fetchingDb, setFetchingDb] = useState(false);

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

  // Active steps calculation based on enabled modifications
  const activeSteps = useMemo<string[]>(() => {
    if (!data) return ["envelope"];
    return (data.stepOrder || ["security", "intro", "envelope", "dateInvite", "closing", "survey"]).filter((stepId: string) => {
      if (stepId === "envelope") return true;
      if (stepId === "security" && data.security?.enabled) return true;
      if (stepId === "intro" && data.intro?.enabled) return true;
      if (stepId === "dateInvite" && data.dateInvite?.enabled) return true;
      if (stepId === "closing" && data.closing?.enabled) return true;
      if (stepId === "survey" && data.survey?.enabled) return true;
      return false;
    });
  }, [data]);

  // Wizard transitions and step tracking
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);
  const [triggerFlash, setTriggerFlash] = useState(false);

  if (fetchingDb) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading letter...</div>
      </div>
    );
  }

  if (!d) {
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

  // Handle advancing wizard steps with transitions and blinding flash before envelope
  const handleNextStep = () => {
    if (visibleStepIndex < activeSteps.length - 1) {
      const nextVisibleIndex = visibleStepIndex + 1;
      const unlockingNewStep = nextVisibleIndex > currentStepIndex;
      const nextStepId = activeSteps[nextVisibleIndex];

      if (nextStepId === "envelope" && unlockingNewStep) {
        setTriggerFlash(true);
        setTimeout(() => {
          setTriggerFlash(false);
        }, 2200);
      }

      setIsTransitioning(true);
      setTimeout(() => {
        if (unlockingNewStep) {
          setCurrentStepIndex(nextVisibleIndex);
        }
        setVisibleStepIndex(nextVisibleIndex);
        setIsTransitioning(false);
      }, 700);
    }
  };

  const currentStep = activeSteps[visibleStepIndex];

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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "85vh", padding: activeSteps.length > 1 ? "100px 20px 20px 20px" : "20px", position: "relative", zIndex: 10 }}>
      <FloatingHearts />
      
      {/* Background music is normally off, requiring recipient click to play */}
      {data.music && (
        <AudioPlayer 
          autoplay={false} 
          musicType={data.musicType} 
          musicUrl={data.musicUrl} 
        />
      )}

      {/* Progress timeline navigation dots */}
      {activeSteps.length > 1 && (
        <div 
          style={{ 
            position: "fixed", 
            top: "24px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "100%", 
            maxWidth: "420px", 
            margin: "0 auto",
            zIndex: 50,
            padding: "0 20px"
          }}
        >
          {/* Timeline connecting line */}
          <div 
            style={{
              position: "absolute",
              left: "40px",
              right: "40px",
              height: "2px",
              background: `linear-gradient(to right, 
                var(--accent-purple) ${(currentStepIndex / (activeSteps.length - 1)) * 100}%, 
                rgba(255, 255, 255, 0.1) ${(currentStepIndex / (activeSteps.length - 1)) * 100}%
              )`,
              zIndex: -1,
              transition: "all 0.5s ease"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            {activeSteps.map((stepId, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === visibleStepIndex;
              const isClickable = idx <= currentStepIndex;
              
              let stepIcon = "⚫";
              let stepTitle = "Step";
              if (stepId === "security") { stepIcon = "🔒"; stepTitle = "Lock"; }
              else if (stepId === "intro") { stepIcon = "✨"; stepTitle = "Intro"; }
              else if (stepId === "envelope") { stepIcon = "✉"; stepTitle = "Letter"; }
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
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setVisibleStepIndex(idx);
                          setIsTransitioning(false);
                        }, 700);
                      }
                    }}
                    style={{
                      width: "34px",
                      height: "34px",
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
                      fontSize: "9px", 
                      color: isActive 
                        ? "var(--accent-rose)" 
                        : isCompleted 
                          ? "var(--accent-purple)" 
                          : "var(--text-muted)",
                      fontWeight: isActive ? "bold" : "500",
                      marginTop: "6px",
                      position: "absolute",
                      top: "36px",
                      whiteSpace: "nowrap",
                      opacity: isActive ? 1 : 0.65,
                      transition: "all 0.4s ease"
                    }}
                  >
                    {stepTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
          transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Step: Security Lock Gate */}
        {currentStep === "security" && data.security && (
          <SecurityGate 
            securityData={data.security} 
            onSuccess={handleNextStep} 
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

        {/* Step: Envelope (Core) */}
        {currentStep === "envelope" && (
          <Envelope
            recipient={data.recipient}
            sender={data.sender}
            content={data.content}
            theme={data.theme}
            sealSymbol={data.sealSymbol}
            sealColor={data.sealColor}
            greeting={data.greeting}
            farewell={data.farewell}
            onClose={() => {
              setTimeout(() => {
                handleNextStep();
              }, 2400); // 800ms close + 1500ms retract + buffer
            }}
          />
        )}

        {/* Step: Date Invitation ticket pass */}
        {currentStep === "dateInvite" && data.dateInvite && (
          <DateInvitation 
            dateInvite={data.dateInvite}
            sender={data.sender}
            recipient={data.recipient}
            letterKey={d}
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
          />
        )}
      </div>

      {triggerFlash && <div className="blinding-flash-active" />}
    </div>
  );
}

export default function LetterPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <Suspense fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Decrypting letter...</div>
        </div>
      }>
        <LetterReader />
      </Suspense>
    </div>
  );
}

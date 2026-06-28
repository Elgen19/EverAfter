"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import SecurityGate from "@/components/reader/SecurityGate";
import IntroStatement from "@/components/reader/IntroStatement";
import ClosingStatement from "@/components/reader/ClosingStatement";
import DateInvitation from "@/components/reader/DateInvitation";
import SurveyFeedback from "@/components/reader/SurveyFeedback";
import AudioMessage from "@/components/reader/AudioMessage";
import LoveQuizReader from "@/components/reader/LoveQuizReader";
import PolaroidsReader from "@/components/reader/PolaroidsReader";
import ThankYou from "@/components/reader/ThankYou";
import Envelope from "@/components/Envelope";
import AudioPlayer from "@/components/AudioPlayer";

const mockData = {
  recipient: "Avery",
  sender: "Jordan",
  theme: "royal",
  sealSymbol: "heart",
  sealColor: "#a1183c",
  envelopeStyle: "vintage",
  greeting: "To My Dearest,",
  farewell: "With all my love,",
  backdrop: "campfire",
  content: "I wanted to write you something that lives forever—not a quick message that gets swept away by daily group chat notifications, but a keepsake you can open and read whenever you want.\n\nFrom that cozy forest cabin coffee trip where we got lost, to every stargazing night, you make my life magical. These details are our keepsakes.",
  isWriteback: true,
  security: {
    enabled: true,
    type: "choice" as const,
    question: "Where was our first vacation trip together?",
    answer: "B",
    choices: [
      "A) Ocean Beach Shore resort 🏖️",
      "B) Cozy mountain cafe & forest cabins ☕",
      "C) Busy downtown shopping city 🌆"
    ]
  },
  intro: {
    enabled: true,
    text: "You make every single day feel like spring, and every night feel like home...",
    animation: "fade-float" as const
  },
  polaroids: {
    enabled: true,
    items: [
      { 
        imageUrl: "/keepsake_cafe.png", 
        caption: "Our Favorite Coffee Shop Corner ☕", 
        backText: "Remember when we got lost in the rain looking for this café? We ended up staying for hours drinking hot cocoa... ☕" 
      },
      { 
        imageUrl: "/keepsake_stargazing.png", 
        caption: "Stargazing under the stars 🌌", 
        backText: "You pointed out the Orion constellation and I was just looking at you. You are my favorite star... 🌌" 
      },
      { 
        imageUrl: "/keepsake_beach.png", 
        caption: "Sunset Walk Along the Shore 🌅", 
        backText: "The water was freezing but you still wanted to walk barefoot. I'd walk anywhere with you... 🌅" 
      }
    ],
    layout: "collage" as const,
    collageStyle: "sunset" as const,
    collageBgPosition: "center" as const,
    collageBgZoom: 1.15,
    title: "Our Polaroid Memories",
    showHearts: true
  },
  audioMessage: {
    enabled: true,
    audioUrl: "/jordan_voice_over.mp3",
    audioDuration: 18,
    label: "Anniversary Voice Whisper 🎙️"
  },
  loveQuiz: {
    enabled: true,
    prizeTitle: "Golden Ticket Date Pass 🎟️",
    prizeDesc: "This ticket entitles you to one uninterrupted night of lo-fi music, gourmet ramen, and stargazing.",
    strictness: "hearts" as const,
    questions: [
      {
        question: "What is my absolute favorite comfort food we eat together?",
        correctAnswer: "Sushi 🍣",
        incorrectAnswers: ["Tacos 🌮", "Pizza 🍕"],
        hint: "We had it on our second anniversary at that hidden basement restaurant."
      },
      {
        question: "Which season do I think suits our relationship best?",
        correctAnswer: "Autumn 🍂",
        incorrectAnswers: ["Summer ☀️", "Spring 🌸"],
        hint: "Think about crunchy leaves and hot apple cider walks."
      },
      {
        question: "Where was our very first coffee date together?",
        correctAnswer: "The Greenhouse Café 🌿",
        incorrectAnswers: ["Downtown Roasters ☕", "Corner Bakery 🥐"],
        hint: "The place with all the hanging vines and glass ceilings."
      }
    ]
  },
  dateInvite: {
    enabled: true,
    question: "Would you go on a lofi coffee & stargazing date with me?",
    activity: "Lofi Coffee & Stargazing Date",
    date: "2026-07-04",
    time: "20:00",
    place: "The Cliffside Outlook",
    mapLink: "https://maps.google.com"
  },
  closing: {
    enabled: true,
    text: "Meeting you was like finding the last missing piece of my puzzle. Let's write the rest of our stories together...",
    animation: "typewriter" as const
  },
  survey: {
    enabled: true,
    question: "How did this letter make you feel?",
    type: "both" as const
  }
};

export default function InteractiveDemoLetter() {
  const [mounted, setMounted] = useState(false);
  
  // Step transition states
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);
  const [triggerFlash, setTriggerFlash] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isVoiceMessagePlaying, setIsVoiceMessagePlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);



  const getStepHint = (step: string) => {
    switch (step) {
      case "cover":
        return "Tapping anywhere on the screen starts the romantic love letter experience!";
      case "security":
        return "Answer the Security Gate. Hint: Choose choice 'B) Cozy mountain cafe & forest cabins ☕' to unlock the letter!";
      case "intro":
        return "Read Jordan's opening statement, then click 'Open Letter ✉️' to view the envelope.";
      case "envelope":
        return "Tap the wax seal in the middle of the envelope to break it and open the letter!";
      case "polaroids":
        return "Click the Polaroid photos to flip them and read the custom memory notes. Click 'Continue Journey ➔' when done.";
      case "audioMessage":
        return "Listen to Jordan's voice recording by playing the audio waveform. Click 'Continue Journey ➔' to proceed.";
      case "loveQuiz":
        return "Play the Millionaire Quiz! Answer all 3 questions correctly to win the Golden Ticket prize date pass.";
      case "dateInvite":
        return "Confirm your RSVP for the dinner date ticket. You can also view the map destination!";
      case "closing":
        return "Read the handwritten closing statement, then click 'Proceed to Survey ➔' to give your feedback.";
      case "survey":
        return "Select your choices and submit the survey to finish the love letter demo experience!";
      case "thankYou":
        return "You have finished! You can replay the walkthrough or close the preview.";
      default:
        return "Follow the on-screen prompts to explore the digital keepsake experience!";
    }
  };

  const activeSteps = useMemo(() => {
    return [
      "security",
      "intro",
      "envelope",
      "polaroids",
      "audioMessage",
      "loveQuiz",
      "dateInvite",
      "closing",
      "survey",
      "thankYou"
    ];
  }, []);

  const currentStep = activeSteps[visibleStepIndex];
  const [isMusicForcePaused, setIsMusicForcePaused] = useState(false);
  const prevStepRef = useRef(currentStep);

  // Reset showHint when step changes, and detect transition away from audioMessage to pause bg music
  useEffect(() => {
    setShowHint(true);
    if (prevStepRef.current === "audioMessage" && currentStep !== "audioMessage") {
      setIsMusicForcePaused(true);
    }
    prevStepRef.current = currentStep;
  }, [currentStep, showCover]);

  // Determine adjacency of envelope and polaroids
  const envelopeAdjacency = useMemo(() => {
    const envIdx = activeSteps.indexOf("envelope");
    const polIdx = activeSteps.indexOf("polaroids");
    const isAdjacent = Math.abs(envIdx - polIdx) === 1;
    const polaroidsFirst = polIdx < envIdx;
    return { isAdjacent, polaroidsFirst };
  }, [activeSteps]);

  // Reset/Flash animations
  useEffect(() => {
    if (triggerFlash) {
      const timer = setTimeout(() => {
        setTriggerFlash(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [triggerFlash]);

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

  return (
    <div 
      className="glass interactive-demo-box" 
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "860px",
        minHeight: "680px",
        borderRadius: "24px",
        border: "1px solid var(--border-card)",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "30px 20px",
        margin: "0 auto"
      }}
    >
      {/* Embedded Simulated Backdrop Scenery */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(/campfire_letter.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />
      
      {/* Semi-transparent dark wash for contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 10, 25, 0.78)",
          zIndex: 2,
          pointerEvents: "none"
        }}
      />

      {/* Interactive Letter Experience Container */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
        
        {showCover ? (
          <div 
            onClick={() => {
              setHasInteracted(true);
              setShowCover(false);
            }}
            style={{
              width: "100%",
              minHeight: "520px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div style={{ animation: "float-up-intro 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
              <span style={{ fontSize: "14px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "3px", display: "block", marginBottom: "15px" }}>
                💌 An EverAfter Keepsake
              </span>
              
              <div 
                style={{ 
                  fontFamily: "'Dancing Script', 'Great Vibes', 'Allura', cursive", 
                  fontSize: "58px", 
                  color: "#fff",
                  lineHeight: "1.2",
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.5)",
                  margin: "24px 0"
                }}
              >
                From Jordan <br />
                <span style={{ fontSize: "28px", fontFamily: "var(--font-ui)", fontStyle: "italic", opacity: 0.8, display: "block", margin: "10px 0" }}>to</span> 
                Avery
              </div>
              
              <div 
                style={{ 
                  fontSize: "14px", 
                  color: "var(--text-muted)", 
                  marginTop: "50px", 
                  animation: "pulse-keyhole 2s infinite ease-in-out",
                  letterSpacing: "1px",
                  fontWeight: "600"
                }}
              >
                Press anywhere to open ➔
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Timeline Header (Rendered inline inside the section instead of createPortal) */}
            {mounted && currentStep !== "thankYou" && (
              <div 
                className="letter-timeline-container"
            style={{ 
              position: "relative",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "100%", 
              maxWidth: "480px", 
              zIndex: 150,
              padding: "10px 20px 24px 20px",
              background: "transparent",
              border: "none",
              boxShadow: "none",
              margin: "0 auto 20px auto"
            }}
          >
            {/* Timeline connecting line */}
            <div 
              style={{
                position: "absolute",
                left: "25px",
                right: "25px",
                top: "27px",
                height: "2px",
                background: `linear-gradient(to right, 
                  var(--accent-purple) ${(currentStepIndex / (activeSteps.filter(id => id !== "thankYou").length - 1)) * 100}%, 
                  rgba(255, 255, 255, 0.2) ${(currentStepIndex / (activeSteps.filter(id => id !== "thankYou").length - 1)) * 100}%
                )`,
                zIndex: 1,
                transition: "all 0.5s ease"
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", zIndex: 2 }}>
              {activeSteps.filter(id => id !== "thankYou").map((stepId, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isActive = idx === visibleStepIndex;
                const isClickable = idx <= currentStepIndex;
                
                let stepIcon = "⚫";
                let stepTitle = "Step";
                if (stepId === "security") { stepIcon = "🔒"; stepTitle = "Lock"; }
                else if (stepId === "intro") { stepIcon = "✨"; stepTitle = "Intro"; }
                else if (stepId === "envelope") { stepIcon = "✉"; stepTitle = "Letter"; }
                else if (stepId === "polaroids") { stepIcon = "📸"; stepTitle = "Photos"; }
                else if (stepId === "audioMessage") { stepIcon = "🎤"; stepTitle = "Voice"; }
                else if (stepId === "loveQuiz") { stepIcon = "🧩"; stepTitle = "Quiz"; }
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
                      type="button"
                      onClick={() => {
                        if (isClickable && !isTransitioning) {
                          const targetStepId = activeSteps[idx];
                          const isEnvPolTransition = envelopeAdjacency.isAdjacent && (
                             (currentStep === "envelope" && targetStepId === "polaroids") ||
                             (currentStep === "polaroids" && targetStepId === "envelope")
                          );

                          if (isEnvPolTransition) {
                            setVisibleStepIndex(idx);
                          } else {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setVisibleStepIndex(idx);
                              setIsTransitioning(false);
                            }, 700);
                          }
                        }
                      }}
                      style={{
                        width: "30px",
                        height: "30px",
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
                          ? "0 0 12px var(--accent-rose), inset 0 2px 4px rgba(255,255,255,0.2)" 
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        cursor: isClickable ? "pointer" : "default",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                        color: isActive || isCompleted ? "#fff" : "var(--text-muted)",
                        outline: "none"
                      }}
                    >
                      {stepIcon}
                    </button>
                    <span 
                      style={{ 
                        fontSize: "8px", 
                        color: "#fff",
                        fontWeight: "bold",
                        marginTop: "4px",
                        position: "absolute",
                        top: "32px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        padding: "1px 5px",
                        borderRadius: "8px",
                        backgroundColor: isActive 
                          ? "rgba(255, 75, 114, 0.85)" 
                          : isCompleted 
                            ? "rgba(156, 108, 250, 0.5)" 
                            : "rgba(11, 7, 17, 0.55)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(4px)",
                        opacity: isActive ? 1 : isCompleted ? 0.9 : 0.6,
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
            opacity: triggerFlash ? 0 : 1,
            transform: triggerFlash ? "scale(0.98) translateY(10px)" : "scale(1) translateY(0)",
            transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: triggerFlash ? "none" : "auto"
          }}
        >
          {/* Step 1: Security Lock Gate */}
          {currentStep === "security" && mockData.security && (
            <SecurityGate 
              securityData={mockData.security} 
              onSuccess={handleNextStep} 
              preview={true}
            />
          )}

          {/* Step 2: Introductory Statement */}
          {currentStep === "intro" && mockData.intro && (
            <IntroStatement 
              text={mockData.intro.text} 
              animation={mockData.intro.animation} 
              onComplete={handleNextStep} 
              preview={true}
            />
          )}

          {/* Step 3: Unified Envelope / Polaroid Stack */}
          {(currentStep === "envelope" || (currentStep === "polaroids" && envelopeAdjacency.isAdjacent)) && (
            <Envelope
              recipient={mockData.recipient}
              sender={mockData.sender}
              content={mockData.content}
              theme={mockData.theme}
              sealSymbol={mockData.sealSymbol}
              sealColor={mockData.sealColor}
              envelopeStyle={mockData.envelopeStyle}
              greeting={mockData.greeting}
              farewell={mockData.farewell}
              backdrop={mockData.backdrop}
              isOnlyStep={false}
              polaroids={mockData.polaroids?.items}
              polaroidsLayout={mockData.polaroids?.layout}
              polaroidsCollageStyle={mockData.polaroids?.collageStyle}
              polaroidsCollageBgPosition={mockData.polaroids?.collageBgPosition}
              polaroidsCollageBgZoom={mockData.polaroids?.collageBgZoom}
              polaroidsTitle={mockData.polaroids?.title}
              polaroidsShowHearts={mockData.polaroids?.showHearts}
              activeStep={currentStep}
              onStepComplete={handleNextStep}
              isAdjacentToPolaroids={envelopeAdjacency.isAdjacent}
              polaroidsFirst={envelopeAdjacency.polaroidsFirst}
              onClose={handleNextStep}
              preview={true}
            />
          )}

          {/* Step 4: Standalone Polaroids fallback (if not adjacent, but adjacent here) */}
          {!envelopeAdjacency.isAdjacent && currentStep === "polaroids" && mockData.polaroids && (
            <PolaroidsReader
              polaroids={mockData.polaroids.items}
              theme={mockData.theme}
              onComplete={handleNextStep}
              isSheetExpanded={true}
              isStandalone={true}
              layout={mockData.polaroids.layout}
              collageStyle={mockData.polaroids.collageStyle}
              collageBgPosition={mockData.polaroids.collageBgPosition}
              collageBgZoom={mockData.polaroids.collageBgZoom}
              title={mockData.polaroids.title}
              showHearts={mockData.polaroids.showHearts}
              sender={mockData.sender}
            />
          )}

          {/* Step 5: Audio Message */}
          {currentStep === "audioMessage" && mockData.audioMessage && (
            <AudioMessage
              audioMessage={mockData.audioMessage}
              theme={mockData.theme}
              onComplete={handleNextStep}
              onPlayStateChange={setIsVoiceMessagePlaying}
            />
          )}

          {/* Step 6: Love Quiz Game */}
          {currentStep === "loveQuiz" && mockData.loveQuiz && (
            <LoveQuizReader
              loveQuiz={mockData.loveQuiz}
              sender={mockData.sender}
              recipient={mockData.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          )}

          {/* Step 7: Date Invitation ticket pass */}
          {currentStep === "dateInvite" && mockData.dateInvite && (
            <DateInvitation 
              dateInvite={mockData.dateInvite}
              sender={mockData.sender}
              recipient={mockData.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          )}

          {/* Step 8: Closing Statement */}
          {currentStep === "closing" && mockData.closing && (
            <ClosingStatement 
              text={mockData.closing.text} 
              animation={mockData.closing.animation} 
              isLastStep={false} 
              onComplete={handleNextStep} 
              preview={true}
            />
          )}

          {/* Step 9: Post-Letter Survey */}
          {currentStep === "survey" && mockData.survey && (
            <SurveyFeedback 
              survey={mockData.survey}
              sender={mockData.sender}
              recipient={mockData.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          )}

          {/* Step 10: Thank You Screen */}
          {currentStep === "thankYou" && (
            <ThankYou
              sender={mockData.sender}
              recipient={mockData.recipient}
              content={mockData.content}
              theme={mockData.theme}
              isWriteback={mockData.isWriteback}
              preview={true}
              onReplay={() => {
                setCurrentStepIndex(0);
                setVisibleStepIndex(0);
                setShowCover(true);
                setHasInteracted(false);
              }}
              onExit={() => {
                setCurrentStepIndex(0);
                setVisibleStepIndex(0);
                setShowCover(true);
                setHasInteracted(false);
              }}
            />
          )}
        </div>
        </>
        )}

      </div>

      {/* Floating Hint Overlay inside the preview box */}
      {showHint && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "380px",
            backgroundColor: "rgba(22, 12, 34, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 75, 114, 0.35)",
            boxShadow: "0 8px 32px rgba(255, 75, 114, 0.15), inset 0 1px 1px rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "12px 16px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            animation: "float-hint-entry 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <span style={{ fontSize: "20px", animation: "bounce-hint 2s infinite ease-in-out", display: "inline-block" }}>💡</span>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px", color: "var(--accent-gold)" }}>Demo Walkthrough Tip</span>
              <span style={{ fontSize: "12.5px", color: "#fff", lineHeight: "1.4", fontWeight: "500" }}>
                {getStepHint(showCover ? "cover" : currentStep)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHint(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px",
              transition: "color 0.2s",
              outline: "none",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes float-hint-entry {
          0% { opacity: 0; transform: translate(-50%, 15px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes bounce-hint {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <AudioPlayer 
        autoplay={hasInteracted}
        musicType="url"
        musicUrl="/cant_help_falling_in_love.mp3"
        preview={true}
        isForcePaused={isVoiceMessagePlaying || isMusicForcePaused}
        onTogglePlayback={(playing) => {
          if (playing) {
            setIsMusicForcePaused(false);
          }
        }}
      />

      {triggerFlash && <div className="blinding-flash-active" />}
    </div>
  );
}

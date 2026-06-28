"use client";

import React, { useState, useEffect, useMemo } from "react";
import SecurityGate from "@/components/reader/SecurityGate";
import IntroStatement from "@/components/reader/IntroStatement";
import Envelope from "@/components/Envelope";
import PolaroidsReader from "@/components/reader/PolaroidsReader";
import AudioMessage from "@/components/reader/AudioMessage";
import LoveQuizReader from "@/components/reader/LoveQuizReader";
import DateInvitation from "@/components/reader/DateInvitation";
import ClosingStatement from "@/components/reader/ClosingStatement";
import SurveyFeedback from "@/components/reader/SurveyFeedback";
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

interface SequencePreviewProps {
  form: any;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SequencePreview({ form, isMobile = false, onClose }: SequencePreviewProps) {
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Active steps calculation based on hook values + final Thank You
  const activeSteps = useMemo(() => {
    const steps = [...form.activeSteps];
    steps.unshift("cover");
    steps.push("thankYou");
    return steps;
  }, [form.activeSteps]);

  // Ensure index remains in bounds if step list changes dynamically in form
  useEffect(() => {
    if (visibleStepIndex >= activeSteps.length) {
      setVisibleStepIndex(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps, visibleStepIndex]);

  const currentStep = activeSteps[visibleStepIndex] || "envelope";

  // Check if envelope and polaroids are adjacent steps
  const envelopeAdjacency = useMemo(() => {
    if (!form.polaroidsEnabled) return { isAdjacent: false, polaroidsFirst: false };
    const stepsWithoutCover = form.activeSteps.filter((s: string) => s !== "cover");
    const envIdx = stepsWithoutCover.indexOf("envelope");
    const polIdx = stepsWithoutCover.indexOf("polaroids");
    if (envIdx === -1 || polIdx === -1) return { isAdjacent: false, polaroidsFirst: false };
    const isAdjacent = Math.abs(envIdx - polIdx) === 1;
    const polaroidsFirst = polIdx < envIdx;
    return { isAdjacent, polaroidsFirst };
  }, [form.activeSteps, form.polaroidsEnabled]);

  const handleNextStep = () => {
    if (visibleStepIndex < activeSteps.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setVisibleStepIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrevStep = () => {
    if (visibleStepIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setVisibleStepIndex((prev) => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleJumpToStep = (index: number) => {
    if (index >= 0 && index < activeSteps.length && index !== visibleStepIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setVisibleStepIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const getStepIcon = (id: string) => {
    switch (id) {
      case "cover": return "💌";
      case "security": return "🔒";
      case "intro": return "✨";
      case "envelope": return "✉️";
      case "polaroids": return "📸";
      case "audioMessage": return "🎤";
      case "loveQuiz": return "🎮";
      case "dateInvite": return "🌹";
      case "closing": return "✍️";
      case "survey": return "📊";
      case "thankYou": return "🏆";
      default: return "⚫";
    }
  };

  const getStepLabel = (id: string) => {
    switch (id) {
      case "cover": return "Cover Screen";
      case "security": return "Security Lock";
      case "intro": return "Introduction";
      case "envelope": return "Envelope & Letter";
      case "polaroids": return "Polaroid Photos";
      case "audioMessage": return "Voice Message";
      case "loveQuiz": return "Love Quiz Game";
      case "dateInvite": return "Date Invitation";
      case "closing": return "Closing P.S.";
      case "survey": return "Feedback Survey";
      case "thankYou": return "Thank You Screen";
      default: return id;
    }
  };

  const backdropUrl = form.backdrop && form.backdrop !== "none"
    ? BACKDROP_IMAGES[form.backdrop]
    : "";

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 80,
    backgroundColor: backdropUrl ? "transparent" : "#100907",
    transition: "all 0.5s ease"
  };

  const polaroidsMapped = useMemo(() => {
    return form.polaroids
      .filter((p: any) => p.url && p.url.trim() !== "")
      .map((p: any) => ({ imageUrl: p.url, caption: p.caption || "" }));
  }, [form.polaroids]);

  const topPadding = isMobile ? "75px" : "110px";
  const bottomPadding = isMobile ? "65px" : "80px";

  return (
    <div className="sequence-preview-overlay" style={containerStyle}>
      {/* Fixed Full Screen Page Backdrop */}
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
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: getBackdropOverlay(form.theme || ""),
              transition: "background-color 0.8s ease"
            }}
          />
        </div>
      )}

      {/* ── Top Sticky Timeline Header ── */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: isMobile ? "12px 16px 8px 16px" : "16px 20px 12px 20px",
        background: "rgba(11, 7, 17, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "6px" : "10px",
        alignItems: "center"
      }}>
        {/* Timeline dots connecting progress line */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: isMobile ? "290px" : "360px",
          padding: "0 10px"
        }}>
          <div style={{
            position: "absolute",
            left: "20px",
            right: "20px",
            top: isMobile ? "12px" : "14px",
            height: "2px",
            background: `linear-gradient(to right, var(--accent-rose) ${(() => {
              const filteredList = activeSteps.filter(s => s !== "cover" && s !== "thankYou");
              const currentFilteredIdx = filteredList.indexOf(currentStep);
              return filteredList.length > 1 ? (Math.max(0, currentFilteredIdx) / (filteredList.length - 1)) * 100 : 0;
            })()}%, rgba(255,255,255,0.15) ${(() => {
              const filteredList = activeSteps.filter(s => s !== "cover" && s !== "thankYou");
              const currentFilteredIdx = filteredList.indexOf(currentStep);
              return filteredList.length > 1 ? (Math.max(0, currentFilteredIdx) / (filteredList.length - 1)) * 100 : 0;
            })()}%)`,
            zIndex: 1,
            transition: "all 0.3s ease"
          }} />

          {activeSteps.filter(s => s !== "cover" && s !== "thankYou").map((stepId, idx) => {
            const filteredList = activeSteps.filter(s => s !== "cover" && s !== "thankYou");
            const currentFilteredIdx = filteredList.indexOf(currentStep);
            
            const isActive = stepId === currentStep;
            const isCompleted = idx < currentFilteredIdx;
            return (
              <button
                key={`${stepId}_${idx}`}
                type="button"
                onClick={() => {
                  const targetIdx = activeSteps.indexOf(stepId);
                  if (targetIdx !== -1) {
                    handleJumpToStep(targetIdx);
                  }
                }}
                title={getStepLabel(stepId)}
                style={{
                  width: isMobile ? "24px" : "28px",
                  height: isMobile ? "24px" : "28px",
                  borderRadius: "50%",
                  backgroundColor: isActive 
                    ? "var(--accent-rose)" 
                    : isCompleted 
                      ? "var(--accent-purple)" 
                      : "rgba(20, 15, 30, 0.9)",
                  border: isActive 
                    ? "2px solid #fff" 
                    : "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: isActive ? "0 0 10px var(--accent-rose)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#fff",
                  cursor: "pointer",
                  zIndex: 2,
                  transition: "all 0.2s ease"
                }}
              >
                {getStepIcon(stepId)}
              </button>
            );
          })}
        </div>

        {/* Current step description label */}
        <span style={{
          fontSize: isMobile ? "10px" : "11px",
          fontWeight: 600,
          color: "var(--accent-rose)",
          letterSpacing: "0.5px",
          background: "rgba(255, 75, 114, 0.08)",
          padding: isMobile ? "2px 8px" : "3px 10px",
          borderRadius: "12px",
          border: "1px solid rgba(255, 75, 114, 0.2)"
        }}>
          Step {visibleStepIndex + 1} of {activeSteps.length}: {getStepLabel(currentStep)}
        </span>
      </div>

      {/* ── Main Content Area with Fade/Slide Transition ── */}
      <div 
        className="hide-scrollbar"
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowY: "auto",
          padding: `${topPadding} 16px ${bottomPadding} 16px`,
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "scale(0.98)" : "scale(1)",
          transition: "opacity 0.25s ease, transform 0.25s ease"
        }}
      >
        {/* Step: Cover Splash Screen */}
        {currentStep === "cover" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <CoverScreen
              sender={form.sender}
              recipient={form.recipient}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Security Gate */}
        {currentStep === "security" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <SecurityGate
              securityData={{
                type: form.securityType,
                question: form.securityQuestion,
                answer: form.securityAnswer,
                choices: form.securityChoices
              }}
              onSuccess={handleNextStep}
            />
          </div>
        )}

        {/* Step: Intro Statement */}
        {currentStep === "intro" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <IntroStatement
              text={form.introText}
              animation={form.introAnimation}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Envelope / Adjacent Polaroids */}
        {(currentStep === "envelope" || (currentStep === "polaroids" && envelopeAdjacency.isAdjacent)) && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", margin: "auto 0", padding: "12px 0" }}>
            <Envelope
              recipient={form.recipient}
              sender={form.sender}
              content={form.content}
              theme={form.theme}
              sealSymbol={form.sealSymbol}
              sealColor={form.sealColor}
              envelopeStyle={form.envelopeStyle}
              greeting={form.greeting}
              farewell={form.farewell}
              backdrop={form.backdrop}
              isOnlyStep={activeSteps.length === 2 /* letter + thankYou */}
              polaroids={polaroidsMapped}
              polaroidsLayout={form.polaroidsLayout}
              polaroidsCollageStyle={form.polaroidsCollageStyle}
              polaroidsCollageBgPosition={form.polaroidsCollageBgPosition}
              polaroidsCollageBgZoom={form.polaroidsCollageBgZoom}
              polaroidsTitle={form.polaroidsTitle}
              polaroidsShowHearts={form.polaroidsShowHearts}
              activeStep={currentStep}
              onStepComplete={handleNextStep}
              isAdjacentToPolaroids={envelopeAdjacency.isAdjacent}
              polaroidsFirst={envelopeAdjacency.polaroidsFirst}
              onClose={handleNextStep}
              narration={form.narrationEnabled ? { enabled: true, audioUrl: form.narrationUrl, syncData: form.narrationSyncData } : undefined}
            />
          </div>
        )}

        {/* Step: Standalone Polaroids Reader (Non-adjacent layout) */}
        {!envelopeAdjacency.isAdjacent && currentStep === "polaroids" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <PolaroidsReader
              polaroids={polaroidsMapped}
              theme={form.theme}
              onComplete={handleNextStep}
              isSheetExpanded={true}
              isStandalone={true}
              layout={form.polaroidsLayout}
              collageStyle={form.polaroidsCollageStyle}
              collageBgPosition={form.polaroidsCollageBgPosition}
              collageBgZoom={form.polaroidsCollageBgZoom}
              title={form.polaroidsTitle}
              showHearts={form.polaroidsShowHearts}
              sender={form.sender}
            />
          </div>
        )}

        {/* Step: Audio Message */}
        {currentStep === "audioMessage" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <AudioMessage
              audioMessage={{
                enabled: form.audioEnabled,
                audioUrl: form.audioUrl,
                customMessage: form.audioCustomMessage
              }}
              theme={form.theme}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Love Quiz Game */}
        {currentStep === "loveQuiz" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <LoveQuizReader
              loveQuiz={{
                prizeTitle: form.quizPrizeTitle,
                prizeDesc: form.quizPrizeDesc,
                gameOverMsg: form.quizGameOverMsg,
                strictness: form.quizStrictness,
                questions: form.quizQuestions
              }}
              sender={form.sender}
              recipient={form.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Date Invitation */}
        {currentStep === "dateInvite" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <DateInvitation
              dateInvite={{
                question: form.dateInviteQuestion,
                date: form.dateInviteDate,
                time: form.dateInviteTime,
                place: form.dateInvitePlace,
                mapLink: form.dateInviteMapLink,
                email: form.dateInviteEmail
              }}
              sender={form.sender}
              recipient={form.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Closing Statement */}
        {currentStep === "closing" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <ClosingStatement
              text={form.closingText}
              animation={form.closingAnimation}
              isLastStep={visibleStepIndex === activeSteps.length - 2}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Feedback Survey */}
        {currentStep === "survey" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <SurveyFeedback
              survey={{
                question: form.surveyQuestion,
                type: form.surveyType
              }}
              sender={form.sender}
              recipient={form.recipient}
              letterKey="preview"
              preview={true}
              onComplete={handleNextStep}
            />
          </div>
        )}

        {/* Step: Thank You Screen */}
        {currentStep === "thankYou" && (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", margin: "auto 0", padding: "12px 0" }}>
            <ThankYou
              sender={form.sender}
              recipient={form.recipient}
              content={form.content}
              theme={form.theme}
              isWriteback={form.isWriteback || false}
              onReplay={() => handleJumpToStep(0)}
              onExit={() => {}}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Navigation Controls ── */}
      <div style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        padding: isMobile ? "10px 16px" : "12px 20px",
        background: "rgba(11, 7, 17, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 60
      }}>
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={visibleStepIndex === 0}
          style={{
            padding: isMobile ? "5px 10px" : "6px 12px",
            borderRadius: "6px",
            fontSize: isMobile ? "10px" : "11px",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            cursor: visibleStepIndex === 0 ? "not-allowed" : "pointer",
            opacity: visibleStepIndex === 0 ? 0.3 : 1,
            transition: "all 0.2s"
          }}
        >
          ◀ Prev
        </button>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: isMobile ? "5px 14px" : "6px 16px",
              borderRadius: "6px",
              fontSize: isMobile ? "10px" : "11px",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 75, 114, 0.15)",
              border: "1px solid rgba(255, 75, 114, 0.25)",
              color: "var(--accent-rose)",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            ✕ Close Preview
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleJumpToStep(0)}
            style={{
              fontSize: isMobile ? "9px" : "10px",
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.8
            }}
          >
            🔄 Restart Sequence
          </button>
        )}

        <button
          type="button"
          onClick={handleNextStep}
          disabled={visibleStepIndex === activeSteps.length - 1}
          style={{
            padding: isMobile ? "5px 10px" : "6px 12px",
            borderRadius: "6px",
            fontSize: isMobile ? "10px" : "11px",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            cursor: visibleStepIndex === activeSteps.length - 1 ? "not-allowed" : "pointer",
            opacity: visibleStepIndex === activeSteps.length - 1 ? 0.3 : 1,
            transition: "all 0.2s"
          }}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

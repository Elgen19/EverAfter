"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/utils/firebase";

interface SurveyFeedbackProps {
  survey: {
    question: string;
    type: "emoji" | "text" | "both";
    responseEmoji?: string;
    responseFeedback?: string;
    responseTimestamp?: number;
  };
  sender: string;
  recipient: string;
  letterKey: string;
  letterId?: string;
  preview?: boolean;
  onComplete?: () => void;
}

export default function SurveyFeedback({ survey, sender, recipient, letterKey, letterId, preview = false, onComplete }: SurveyFeedbackProps) {
  const [actualSurveyType, setActualSurveyType] = useState<"emoji" | "text" | "both">(survey.type);
  const [surveyEmoji, setSurveyEmoji] = useState(survey.responseEmoji || "");
  const [surveyText, setSurveyText] = useState(survey.responseFeedback || "");
  const [surveySubmitted, setSurveySubmitted] = useState(!!survey.responseTimestamp);

  const getSurveyKey = () => {
    if (letterId) return letterId;
    if (letterKey && letterKey !== "preview") {
      let hash = 0;
      for (let i = 0; i < letterKey.length; i++) {
        hash = (hash << 5) - hash + letterKey.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    }
    return "preview";
  };

  React.useEffect(() => {
    if (preview) {
      setSurveyEmoji("");
      setSurveyText("");
      setSurveySubmitted(false);
      return;
    }

    if (survey.responseTimestamp) {
      setSurveyEmoji(survey.responseEmoji || "");
      setSurveyText(survey.responseFeedback || "");
      setSurveySubmitted(true);
      return;
    }
    const keyPart = getSurveyKey();
    const cachedSurveyStr = localStorage.getItem(`survey_response_${keyPart}`);
    if (cachedSurveyStr) {
      try {
        const cached = JSON.parse(cachedSurveyStr);
        setSurveyEmoji(cached.emoji || "");
        setSurveyText(cached.feedback || "");
        setSurveySubmitted(true);
        return;
      } catch (e) {
        console.error("Failed to parse cached survey response:", e);
      }
    }

    // Reset state if not completed and not cached
    setSurveyEmoji("");
    setSurveyText("");
    setSurveySubmitted(false);
  }, [letterKey, letterId, survey.responseEmoji, survey.responseFeedback, survey.responseTimestamp]);

  const submitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySubmitted(true);

    try {
      const timestamp = Date.now();
      const surveyResult = {
        recipient,
        sender,
        emoji: surveyEmoji,
        feedback: surveyText,
        timestamp
      };
      const keyPart = getSurveyKey();
      if (!preview) {
        localStorage.setItem(`survey_response_${keyPart}`, JSON.stringify(surveyResult));
      }

      if (letterId && db && !preview) {
        const { doc, updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "letters", letterId);
        await updateDoc(docRef, {
          "survey.responseEmoji": surveyEmoji,
          "survey.responseFeedback": surveyText,
          "survey.responseTimestamp": timestamp
        });
      }
    } catch (err) {
      console.error("Failed to save survey result:", err);
    }
  };

  const isSubmitDisabled = (() => {
    if (actualSurveyType === "text") {
      return !surveyText.trim();
    }
    if (actualSurveyType === "emoji") {
      return !surveyEmoji;
    }
    if (actualSurveyType === "both") {
      return !surveyEmoji && !surveyText.trim();
    }
    return false;
  })();

  return (
    <div 
      className="animate-reveal hide-scrollbar"
      style={{
        width: "100%",
        maxWidth: "460px",
        padding: "24px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        animation: "float-up-intro 0.6s ease",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "rgba(25, 12, 22, 0.95)",
        border: "1.5px solid var(--accent-gold)",
        borderRadius: "20px",
        boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)"
      }}
    >
      {surveySubmitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <div 
            style={{ 
              fontSize: "48px", 
              animation: "heartbeat-survey 1.5s infinite ease-in-out" 
            }}
          >
            💖
          </div>
          <h2 
            style={{ 
              fontSize: "28px", 
              fontWeight: "normal", 
              fontFamily: "'Allura', 'Sacramento', 'Great Vibes', 'Dancing Script', cursive",
              color: "var(--accent-rose)"
            }}
          >
            Response Sealed!
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.5" }}>
            Your feelings have been captured and saved in my heart. Thank you for sharing this moment.
          </p>
          <div style={{ marginTop: "8px" }}>
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete();
                } else if (typeof window !== "undefined") {
                  window.close();
                  setTimeout(() => {
                    window.location.href = "/dashboard";
                  }, 150);
                }
              }}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: "6px",
                border: "1.5px solid var(--accent-rose)",
                background: "var(--accent-rose)",
                color: "#fff",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 10px rgba(255, 75, 114, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              {onComplete ? "Continue 💖" : "Back to Dashboard"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submitSurvey} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{ fontSize: "40px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>📊</div>
            <div 
              style={{ 
                fontSize: "26px", 
                fontWeight: "normal",
                color: "#fff",
                lineHeight: "1.3",
                textAlign: "center",
                fontFamily: "'Allura', 'Sacramento', 'Great Vibes', 'Dancing Script', cursive"
              }}
            >
              {survey.question}
            </div>
          </div>

          {/* Tab Selector Switches */}
          {survey.type === "both" && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "0px" }}>
              {[
                { id: "emoji", name: "Emoji" },
                { id: "text", name: "Text" },
                { id: "both", name: "Both" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActualSurveyType(opt.id as "emoji" | "text" | "both")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: actualSurveyType === opt.id ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid " + (actualSurveyType === opt.id ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.1)"),
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          )}

          {/* Emoji selector */}
          {(actualSurveyType === "emoji" || actualSurveyType === "both") && (
            <div className="survey-emoji-grid" style={{ margin: "8px 0" }}>
              {[
                { char: "🥹", label: "Touched" },
                { char: "🥰", label: "Loved" },
                { char: "😊", label: "Happy" },
                { char: "😭", label: "Crying" },
                { char: "💖", label: "Adored" }
              ].map((emoji) => (
                <button
                  key={emoji.char}
                  type="button"
                  onClick={() => setSurveyEmoji(emoji.char)}
                  className={`survey-emoji-box ${surveyEmoji === emoji.char ? "selected" : ""}`}
                  title={emoji.label}
                  style={{ width: "52px", height: "52px", fontSize: "26px" }}
                >
                  {emoji.char}
                </button>
              ))}
            </div>
          )}

          {/* Text feedback box */}
          {(actualSurveyType === "text" || actualSurveyType === "both") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left", animation: "float-up-intro 0.3s ease" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Your Feelings / Message</label>
              <textarea
                value={surveyText}
                onChange={(e) => setSurveyText(e.target.value)}
                placeholder="Write how you feel or a response message..."
                rows={3}
                required={actualSurveyType === "text"}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  lineHeight: "1.4",
                  outline: "none",
                  resize: "none"
                }}
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              opacity: isSubmitDisabled ? 0.5 : 1,
              transition: "opacity 0.2s"
            }}
          >
            Send Response
          </button>
        </form>
      )}
    </div>
  );
}

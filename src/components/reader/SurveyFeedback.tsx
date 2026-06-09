"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SurveyFeedbackProps {
  survey: {
    question: string;
    type: "emoji" | "text" | "both";
  };
  sender: string;
  recipient: string;
  letterKey: string;
}

export default function SurveyFeedback({ survey, sender, recipient, letterKey }: SurveyFeedbackProps) {
  const [actualSurveyType, setActualSurveyType] = useState<"emoji" | "text" | "both">(survey.type);
  const [surveyEmoji, setSurveyEmoji] = useState("");
  const [surveyText, setSurveyText] = useState("");
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const submitSurvey = (e: React.FormEvent) => {
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
      localStorage.setItem(`survey_response_${letterKey.slice(0, 10)}`, JSON.stringify(surveyResult));
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
      className="glass animate-reveal"
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        animation: "float-up-intro 0.6s ease"
      }}
    >
      {surveySubmitted ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px 0" }}>
          <div 
            style={{ 
              fontSize: "56px", 
              animation: "heartbeat-survey 1.5s infinite ease-in-out" 
            }}
          >
            💖
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Response Sealed!</h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            Your feelings have been captured and saved in my heart. Thank you for sharing this moment.
          </p>
          <div style={{ marginTop: "12px" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: "6px",
                border: "1px solid var(--border-card)",
                background: "rgba(255,255,255,0.03)",
                color: "var(--text-muted)",
                fontSize: "13px",
                textDecoration: "none",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submitSurvey} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div 
            style={{ 
              fontSize: "18px", 
              fontWeight: 600,
              color: "#fff",
              marginBottom: "6px",
              lineHeight: "1.5",
              textAlign: "center"
            }}
          >
            {survey.question}
          </div>

          {/* Tab Selector Switches */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
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

          {/* Emoji selector */}
          {(actualSurveyType === "emoji" || actualSurveyType === "both") && (
            <div className="survey-emoji-grid">
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
                >
                  {emoji.char}
                </button>
              ))}
            </div>
          )}

          {/* Text feedback box */}
          {(actualSurveyType === "text" || actualSurveyType === "both") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left", animation: "float-up-intro 0.3s ease" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Your Feelings / Message</label>
              <textarea
                value={surveyText}
                onChange={(e) => setSurveyText(e.target.value)}
                placeholder="Write how you feel or a response message..."
                rows={4}
                required={actualSurveyType === "text"}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "13px",
                  lineHeight: "1.5",
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
              padding: "14px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
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

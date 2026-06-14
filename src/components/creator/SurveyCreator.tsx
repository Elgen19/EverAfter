"use client";

import React, { useState } from "react";

interface SurveyCreatorProps {
  surveyEnabled: boolean;
  setSurveyEnabled: (val: boolean) => void;
  surveyQuestion: string;
  setSurveyQuestion: (val: string) => void;
  surveyType: "emoji" | "text" | "both";
  setSurveyType: (val: "emoji" | "text" | "both") => void;
  surveyConfirmed: boolean;
  setSurveyConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function SurveyCreator({
  surveyEnabled,
  setSurveyEnabled,
  surveyQuestion,
  setSurveyQuestion,
  surveyType,
  setSurveyType,
  surveyConfirmed,
  setSurveyConfirmed,
  showAlert
}: SurveyCreatorProps) {
  const [previewSurveyEmoji, setPreviewSurveyEmoji] = useState("");

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={surveyEnabled} 
            onChange={(e) => {
              setSurveyEnabled(e.target.checked);
              if (!e.target.checked) setSurveyConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          📊 Add Survey
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Collect reader feelings</span>
      </div>

      {surveyEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingLeft: "20px", borderLeft: "2px solid var(--accent-rose)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Survey Question</label>
            <input 
              type="text"
              disabled={surveyConfirmed}
              value={surveyQuestion}
              onChange={(e) => setSurveyQuestion(e.target.value)}
              placeholder="How does this letter make you feel?"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: surveyConfirmed ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Response Form Type</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "emoji", name: "Emoji Rating" },
                { id: "text", name: "Text Feedback" },
                { id: "both", name: "Both Options" }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  disabled={surveyConfirmed}
                  onClick={() => setSurveyType(type.id as "emoji" | "text" | "both")}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    cursor: surveyConfirmed ? "not-allowed" : "pointer",
                    background: surveyType === type.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#fff",
                    opacity: surveyConfirmed ? 0.6 : 1
                  }}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Survey Preview Card */}
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>SURVEY PREVIEW</span>
            <div 
              className="glass" 
              style={{ 
                padding: "16px", 
                marginTop: "8px", 
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,0.15)",
                border: "1px solid var(--border-card)",
                borderRadius: "8px"
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>📊 Survey Preview</div>
              <div 
                style={{ 
                  fontSize: "20px", 
                  fontWeight: "normal", 
                  margin: "6px 0", 
                  color: "#fff",
                  fontFamily: "'Allura', 'Sacramento', 'Great Vibes', 'Dancing Script', cursive"
                }}
              >
                {surveyQuestion || "How does this letter make you feel?"}
              </div>
              
              {(surveyType === "emoji" || surveyType === "both") && (
                <div style={{ display: "flex", justifyContent: "space-around", margin: "10px 0" }}>
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
                      onClick={() => setPreviewSurveyEmoji(emoji.char)}
                      className={`survey-emoji-btn ${previewSurveyEmoji === emoji.char ? "selected" : ""}`}
                      style={{ fontSize: "24px" }}
                      title={emoji.label}
                    >
                      {emoji.char}
                    </button>
                  ))}
                </div>
              )}

              {(surveyType === "text" || surveyType === "both") && (
                <textarea
                  placeholder="Test typing a response here..."
                  rows={2}
                  readOnly
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#fff",
                    fontSize: "12px",
                    outline: "none",
                    resize: "none"
                  }}
                />
              )}
            </div>
          </div>

          {/* Confirm survey lock button */}
          <button
            type="button"
            onClick={() => {
              if (!surveyQuestion.trim()) {
                if (showAlert) {
                  showAlert("Survey Question Required", "Please specify a survey question so your partner can express how they feel after opening your letter.");
                } else {
                  alert("Please fill in the survey question before confirming.");
                }
                return;
              }
              setSurveyConfirmed(!surveyConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: surveyConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {surveyConfirmed ? "✓ Survey Confirmed! (Click to Edit)" : "Confirm Survey 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

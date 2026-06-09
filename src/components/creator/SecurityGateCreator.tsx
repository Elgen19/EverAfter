"use client";

import React, { useState } from "react";

interface SecurityGateCreatorProps {
  securityEnabled: boolean;
  setSecurityEnabled: (val: boolean) => void;
  securityType: "date" | "boolean" | "choice";
  setSecurityType: (val: "date" | "boolean" | "choice") => void;
  securityQuestion: string;
  setSecurityQuestion: (val: string) => void;
  securityAnswer: string;
  setSecurityAnswer: (val: string) => void;
  securityChoices: string[];
  setSecurityChoices: (val: string[]) => void;
  securityConfirmed: boolean;
  setSecurityConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function SecurityGateCreator({
  securityEnabled,
  setSecurityEnabled,
  securityType,
  setSecurityType,
  securityQuestion,
  setSecurityQuestion,
  securityAnswer,
  setSecurityAnswer,
  securityChoices,
  setSecurityChoices,
  securityConfirmed,
  setSecurityConfirmed,
  showAlert
}: SecurityGateCreatorProps) {
  // Local preview states
  const [previewSwipeOffset, setPreviewSwipeOffset] = useState(0);
  const [isPreviewSwiping, setIsPreviewSwiping] = useState(false);
  const [previewStartX, setPreviewStartX] = useState(0);

  const [previewDialMonth, setPreviewDialMonth] = useState(6);
  const [previewDialDay, setPreviewDialDay] = useState(8);
  const [previewDialYear, setPreviewDialYear] = useState(2026);

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={securityEnabled} 
            onChange={(e) => {
              setSecurityEnabled(e.target.checked);
              if (!e.target.checked) setSecurityConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          🔒 Add Security Question
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recipient answer check</span>
      </div>

      {securityEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingLeft: "20px", borderLeft: "2px solid var(--accent-rose)" }}>
          
          {/* Mode selector */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { id: "boolean", name: "Secret Yes/No Gate" },
              { id: "date", name: "Anniversary Date Lock" },
              { id: "choice", name: "Love Trivia Quiz" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={securityConfirmed}
                onClick={() => {
                  setSecurityType(item.id as "date" | "boolean" | "choice");
                  setSecurityAnswer("");
                }}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: "11px",
                  borderRadius: "6px",
                  cursor: securityConfirmed ? "not-allowed" : "pointer",
                  background: securityType === item.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "#fff",
                  fontWeight: 500,
                  opacity: securityConfirmed ? 0.6 : 1
                }}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Question Prompt</label>
            <input 
              type="text"
              disabled={securityConfirmed}
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder={
                securityType === "boolean" ? "e.g. Is our cat's name Ming?" :
                securityType === "date" ? "e.g. When was our first date?" :
                "e.g. What is my absolute favorite dessert?"
              }
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: securityConfirmed ? 0.6 : 1
              }}
            />
          </div>

          {/* Answer Inputs based on type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Correct Answer</label>
            
            {securityType === "boolean" && (
              <div style={{ display: "flex", gap: "8px" }}>
                {["yes", "no"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={securityConfirmed}
                    onClick={() => setSecurityAnswer(val)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      fontSize: "12px",
                      cursor: securityConfirmed ? "not-allowed" : "pointer",
                      borderRadius: "6px",
                      border: securityAnswer === val ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                      background: securityAnswer === val ? "rgba(255, 75, 114, 0.1)" : "transparent",
                      color: "#fff",
                      opacity: securityConfirmed ? 0.6 : 1
                    }}
                  >
                    {val === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
            )}

            {securityType === "date" && (
              <input 
                type="date"
                disabled={securityConfirmed}
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  opacity: securityConfirmed ? 0.6 : 1
                }}
              />
            )}

            {securityType === "choice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { idx: 0, placeholder: "Option 1 (e.g. Chocolate Cake)" },
                  { idx: 1, placeholder: "Option 2 (e.g. Red Velvet Cupcake)" },
                  { idx: 2, placeholder: "Option 3 (e.g. Strawberry Ice Cream)" }
                ].map((item) => (
                  <div key={item.idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="radio" 
                      name="correctChoice"
                      disabled={securityConfirmed || !securityChoices[item.idx]}
                      checked={securityAnswer === securityChoices[item.idx] && securityChoices[item.idx] !== ""}
                      onChange={() => setSecurityAnswer(securityChoices[item.idx])}
                      style={{ accentColor: "var(--accent-rose)", cursor: securityConfirmed ? "not-allowed" : "pointer" }}
                    />
                    <input 
                      type="text"
                      disabled={securityConfirmed}
                      value={securityChoices[item.idx]}
                      onChange={(e) => {
                        const newChoices = [...securityChoices];
                        newChoices[item.idx] = e.target.value;
                        setSecurityChoices(newChoices);
                      }}
                      placeholder={item.placeholder}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "#fff",
                        fontSize: "12px",
                        outline: "none",
                        opacity: securityConfirmed ? 0.6 : 1
                      }}
                    />
                  </div>
                ))}
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  * Fill options, then select the radio button next to the correct answer.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Question Preview */}
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>GATE PREVIEW</span>
            <div 
              style={{ 
                padding: "24px 16px", 
                marginTop: "8px", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div 
                style={{ 
                  fontSize: "32px",
                  fontFamily: "var(--font-cursive)",
                  fontWeight: "normal",
                  color: "#fff",
                  lineHeight: "1.4",
                  margin: "8px 0 0 0"
                }}
              >
                {securityQuestion || "Question prompt will appear here..."}
              </div>

              {/* Interactive YES/NO slider */}
              {securityType === "boolean" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <div 
                    className="swipe-track"
                    onMouseMove={(e) => {
                      if (!isPreviewSwiping) return;
                      const clientX = e.clientX;
                      let offset = clientX - previewStartX;
                      offset = Math.max(-90, Math.min(90, offset));
                      setPreviewSwipeOffset(offset);
                    }}
                    onMouseUp={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    onMouseLeave={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    onTouchMove={(e) => {
                      if (!isPreviewSwiping) return;
                      const clientX = e.touches[0].clientX;
                      let offset = clientX - previewStartX;
                      offset = Math.max(-90, Math.min(90, offset));
                      setPreviewSwipeOffset(offset);
                    }}
                    onTouchEnd={() => {
                      if (!isPreviewSwiping) return;
                      setIsPreviewSwiping(false);
                      setPreviewSwipeOffset(0);
                    }}
                    style={{ margin: "10px auto" }}
                  >
                    <span className="swipe-label" style={{ opacity: previewSwipeOffset <= -40 ? 1 : 0.4, color: previewSwipeOffset <= -40 ? "var(--accent-rose)" : "inherit" }}>
                      👈 No
                    </span>
                    
                    <div
                      className="swipe-handle"
                      onMouseDown={(e) => {
                        setIsPreviewSwiping(true);
                        setPreviewStartX(e.clientX - previewSwipeOffset);
                      }}
                      onTouchStart={(e) => {
                        setIsPreviewSwiping(true);
                        setPreviewStartX(e.touches[0].clientX - previewSwipeOffset);
                      }}
                      style={{
                        transform: `translateX(${previewSwipeOffset}px)`,
                        transition: isPreviewSwiping ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      }}
                    >
                      <span style={{ fontSize: "18px", userSelect: "none" }}>❤️</span>
                    </div>
                    
                    <span className="swipe-label" style={{ opacity: previewSwipeOffset >= 40 ? 1 : 0.4, color: previewSwipeOffset >= 40 ? "#2ec4b6" : "inherit" }}>
                      Yes 👉
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Drag the heart slider to preview
                  </p>
                </div>
              )}

              {/* Interactive date combo dial lock */}
              {securityType === "date" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="date-lock-container" style={{ margin: "10px auto", padding: "16px 12px", scale: "0.9" }}>
                    <div className="dial-column">
                      <button 
                        type="button" 
                        className="dial-btn"
                        onClick={() => setPreviewDialMonth(prev => prev === 12 ? 1 : prev + 1)}
                      >
                        ▲
                      </button>
                      <div className="dial-window">{previewDialMonth.toString().padStart(2, "0")}</div>
                      <button 
                        type="button" 
                        className="dial-btn down"
                        onClick={() => setPreviewDialMonth(prev => prev === 1 ? 12 : prev - 1)}
                      >
                        ▼
                      </button>
                      <span className="dial-label">Month</span>
                    </div>

                    <div className="dial-column">
                      <button 
                        type="button" 
                        className="dial-btn"
                        onClick={() => setPreviewDialDay(prev => prev === 31 ? 1 : prev + 1)}
                      >
                        ▲
                      </button>
                      <div className="dial-window">{previewDialDay.toString().padStart(2, "0")}</div>
                      <button 
                        type="button" 
                        className="dial-btn down"
                        onClick={() => setPreviewDialDay(prev => prev === 1 ? 31 : prev - 1)}
                      >
                        ▼
                      </button>
                      <span className="dial-label">Day</span>
                    </div>

                    <div className="dial-column">
                      <button 
                        type="button" 
                        className="dial-btn"
                        onClick={() => setPreviewDialYear(prev => prev + 1)}
                      >
                        ▲
                      </button>
                      <div className="dial-window">{previewDialYear}</div>
                      <button 
                        type="button" 
                        className="dial-btn down"
                        onClick={() => setPreviewDialYear(prev => prev - 1)}
                      >
                        ▼
                      </button>
                      <span className="dial-label">Year</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "8px" }}>
                    Click arrows to test spinning dials
                  </p>
                </div>
              )}

              {/* Interactive quiz choices */}
              {securityType === "choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  {securityChoices.map((choice, i) => {
                    const optionLetter = String.fromCharCode(65 + i);
                    return (
                      <button 
                        key={i} 
                        type="button" 
                        className="glass" 
                        style={{ 
                          width: "100%", 
                          padding: "12px 16px", 
                          fontSize: "13px", 
                          border: "1px solid var(--border-card)", 
                          borderRadius: "8px", 
                          color: "#fff", 
                          background: "rgba(255,255,255,0.02)", 
                          textAlign: "left", 
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer"
                        }}
                      >
                        <span className="quiz-option-badge">{optionLetter}</span>
                        <span>{choice || `Option ${i + 1}`}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Confirm Question lock button */}
          <button
            type="button"
            onClick={() => {
              if (!securityQuestion.trim() || !securityAnswer.trim()) {
                if (showAlert) {
                  showAlert("Security Configuration Incomplete", "To protect your secret letter, please provide both a question and the correct answer before confirming.");
                } else {
                  alert("Please fill in question prompt and correct answer before confirming.");
                }
                return;
              }
              setSecurityConfirmed(!securityConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: securityConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: securityConfirmed ? "0 0 10px rgba(46, 196, 182, 0.2)" : "none",
              transition: "all 0.2s"
            }}
          >
            {securityConfirmed ? "✓ Question Confirmed! (Click to Edit)" : "Confirm Question 💖"}
          </button>

        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";

interface QuestionItem {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[]; // 3 items
  hint?: string;
}

interface LoveQuizCreatorProps {
  quizEnabled: boolean;
  setQuizEnabled: (val: boolean) => void;
  quizPrizeTitle: string;
  setQuizPrizeTitle: (val: string) => void;
  quizPrizeDesc: string;
  setQuizPrizeDesc: (val: string) => void;
  quizGameOverMsg: string;
  setQuizGameOverMsg: (val: string) => void;
  quizQuestions: QuestionItem[];
  setQuizQuestions: (val: QuestionItem[]) => void;
  quizStrictness: "restart" | "hearts";
  setQuizStrictness: (val: "restart" | "hearts") => void;
  quizConfirmed: boolean;
  setQuizConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function LoveQuizCreator({
  quizEnabled,
  setQuizEnabled,
  quizPrizeTitle,
  setQuizPrizeTitle,
  quizPrizeDesc,
  setQuizPrizeDesc,
  quizGameOverMsg,
  setQuizGameOverMsg,
  quizQuestions,
  setQuizQuestions,
  quizStrictness,
  setQuizStrictness,
  quizConfirmed,
  setQuizConfirmed,
  showAlert
}: LoveQuizCreatorProps) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  
  // Local test play states for the previewer
  const [previewActiveIdx, setPreviewActiveIdx] = useState(0);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<string | null>(null);
  const [previewAnswerState, setPreviewAnswerState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [previewHearts, setPreviewHearts] = useState(3);
  const [previewGameOver, setPreviewGameOver] = useState(false);
  const [previewWon, setPreviewWon] = useState(false);

  // Aligned preview lifeline states
  const [previewUsedFiftyFifty, setPreviewUsedFiftyFifty] = useState(false);
  const [previewUsedHint, setPreviewUsedHint] = useState(false);
  const [previewUsedSkip, setPreviewUsedSkip] = useState(false);
  const [previewShowHintClue, setPreviewShowHintClue] = useState(false);
  const [previewActiveLifelines, setPreviewActiveLifelines] = useState({ FiftyFifty: false, Hint: false, Skip: false });

  // Reset active lifeline visual effects on question change in preview
  useEffect(() => {
    setPreviewShowHintClue(false);
    setPreviewActiveLifelines({ FiftyFifty: false, Hint: false, Skip: false });
  }, [previewActiveIdx]);

  // Helper to handle question edits
  const handleUpdateQuestion = (index: number, field: string, val: string, optionIdx?: number) => {
    const updated = quizQuestions.map((q, idx) => {
      if (idx !== index) return q;
      if (field === "question") return { ...q, question: val };
      if (field === "correctAnswer") return { ...q, correctAnswer: val };
      if (field === "hint") return { ...q, hint: val };
      if (field === "incorrectAnswers" && typeof optionIdx === "number") {
        const newIncorrects = [...q.incorrectAnswers];
        newIncorrects[optionIdx] = val;
        return { ...q, incorrectAnswers: newIncorrects };
      }
      return q;
    });
    setQuizQuestions(updated);
  };

  // Add question
  const handleAddQuestion = () => {
    if (quizQuestions.length >= 11) {
      if (showAlert) showAlert("Max Questions", "You can add a maximum of 11 questions.");
      return;
    }
    const newQ: QuestionItem = {
      question: "",
      correctAnswer: "",
      incorrectAnswers: ["", "", ""],
      hint: ""
    };
    setQuizQuestions([...quizQuestions, newQ]);
    setActiveQuestionIdx(quizQuestions.length);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    if (quizQuestions.length <= 6) {
      if (showAlert) showAlert("Min Questions", "You must have at least 6 questions to allow room for the Skip lifeline.");
      return;
    }
    const filtered = quizQuestions.filter((_, idx) => idx !== index);
    setQuizQuestions(filtered);
    setActiveQuestionIdx(Math.max(0, index - 1));
  };

  // Reset Preview Game State
  const handleResetPreview = () => {
    setPreviewActiveIdx(0);
    setPreviewSelectedOption(null);
    setPreviewAnswerState("idle");
    setPreviewHearts(3);
    setPreviewGameOver(false);
    setPreviewWon(false);
    setPreviewUsedFiftyFifty(false);
    setPreviewUsedHint(false);
    setPreviewUsedSkip(false);
    setPreviewShowHintClue(false);
    setPreviewActiveLifelines({ FiftyFifty: false, Hint: false, Skip: false });
  };

  // Handle preview play click
  const handlePreviewOptionClick = (option: string, correct: string) => {
    if (previewAnswerState !== "idle" || previewGameOver || previewWon) return;
    setPreviewSelectedOption(option);
    
    if (option === correct) {
      setPreviewAnswerState("correct");
      setTimeout(() => {
        const nextIdx = previewActiveIdx + 1;
        if (nextIdx >= quizQuestions.length) {
          setPreviewWon(true);
        } else {
          setPreviewActiveIdx(nextIdx);
          setPreviewSelectedOption(null);
          setPreviewAnswerState("idle");
        }
      }, 1200);
    } else {
      setPreviewAnswerState("incorrect");
      setTimeout(() => {
        const lifelinesExhausted = previewUsedFiftyFifty && previewUsedHint && previewUsedSkip;
        if (lifelinesExhausted) {
          setPreviewGameOver(true);
        } else if (quizStrictness === "hearts") {
          const nextHearts = previewHearts - 1;
          setPreviewHearts(nextHearts);
          if (nextHearts <= 0) {
            setPreviewGameOver(true);
          } else {
            setPreviewSelectedOption(null);
            setPreviewAnswerState("idle");
          }
        } else {
          setPreviewGameOver(true);
        }
      }, 1200);
    }
  };

  // Handle FiftyFifty in preview
  const handlePreviewFiftyFifty = () => {
    if (previewUsedFiftyFifty || previewAnswerState !== "idle" || previewGameOver || previewWon) return;
    setPreviewActiveLifelines(prev => ({ ...prev, FiftyFifty: true }));
    setPreviewUsedFiftyFifty(true);
  };

  // Handle Hint in preview
  const handlePreviewHint = () => {
    if (previewUsedHint || previewAnswerState !== "idle" || previewGameOver || previewWon || !quizQuestions[previewActiveIdx]?.hint) return;
    setPreviewActiveLifelines(prev => ({ ...prev, Hint: true }));
    setPreviewUsedHint(true);
    setPreviewShowHintClue(true);
  };

  // Handle Skip lifeline in preview
  const handlePreviewSkip = () => {
    if (previewUsedSkip || previewGameOver || previewWon || previewActiveIdx === quizQuestions.length - 1) return;
    setPreviewActiveLifelines(prev => ({ ...prev, Skip: true }));
    setPreviewUsedSkip(true);
    const nextIdx = previewActiveIdx + 1;
    if (nextIdx >= quizQuestions.length) {
      setPreviewWon(true);
    } else {
      setPreviewActiveIdx(nextIdx);
      setPreviewSelectedOption(null);
      setPreviewAnswerState("idle");
    }
  };

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={quizEnabled} 
            onChange={(e) => {
              setQuizEnabled(e.target.checked);
              if (!e.target.checked) setQuizConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          🎮 Add Love Quiz
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Millionaire-style relationship game</span>
      </div>

      {quizEnabled && (
        <div className="creator-accordion-content">
          
          {/* Prize Configuration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>🏆 Grand Prize Title</label>
              <input 
                type="text" 
                disabled={quizConfirmed}
                value={quizPrizeTitle}
                onChange={(e) => setQuizPrizeTitle(e.target.value)}
                placeholder="e.g. A Romantic Spa Day"
                style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>💔 Encouragement Message (Wrong Answer)</label>
              <input 
                type="text" 
                disabled={quizConfirmed}
                value={quizGameOverMsg}
                onChange={(e) => setQuizGameOverMsg(e.target.value)}
                placeholder="e.g. Try again my love! 😘"
                style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>🏆 Prize Description</label>
            <textarea 
              disabled={quizConfirmed}
              value={quizPrizeDesc}
              onChange={(e) => setQuizPrizeDesc(e.target.value)}
              placeholder="Describe the romantic coupon prize in detail..."
              rows={2}
              style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", resize: "none", opacity: quizConfirmed ? 0.6 : 1 }}
            />
          </div>

          {/* Game strictness settings */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>💔 Wrong Answer Penalty (Game Strictness)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { id: "restart", label: "High Stakes (Restart)", desc: "Wrong answer resets game to Level 1." },
                { id: "hearts", label: "3 Hearts (Lives)", desc: "Recipient gets 3 hearts. Game over on 3 mistakes." }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={quizConfirmed}
                  onClick={() => setQuizStrictness(item.id as "restart" | "hearts")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: quizConfirmed ? "not-allowed" : "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                    background: quizStrictness === item.id ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                    color: "#fff",
                    opacity: quizConfirmed ? 0.6 : 1
                  }}
                  title={item.desc}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Builder List */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>QUESTION SET ({quizQuestions.length} / 11)</span>
              {!quizConfirmed && (
                <button 
                  type="button" 
                  onClick={handleAddQuestion}
                  style={{ background: "rgba(156, 108, 250, 0.2)", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", color: "var(--accent-purple)", cursor: "pointer", fontWeight: "bold" }}
                >
                  + Add Question
                </button>
              )}
            </div>

            {/* Question Selector Tabs */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
              {quizQuestions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIdx(idx)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                    background: activeQuestionIdx === idx ? "var(--accent-rose)" : "rgba(255,255,255,0.05)",
                    color: "#fff"
                  }}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            {/* Question Fields */}
            {quizQuestions[activeQuestionIdx] && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(0,0,0,0.1)", borderRadius: "8px", padding: "14px", border: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "var(--accent-rose)", fontWeight: "bold" }}>Question #{activeQuestionIdx + 1} Editor</span>
                  {!quizConfirmed && quizQuestions.length > 6 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(activeQuestionIdx)}
                      style={{ background: "none", border: "none", color: "var(--accent-rose)", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Delete Q{activeQuestionIdx + 1} 🗑️
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Question Text</label>
                  <input
                    type="text"
                    disabled={quizConfirmed}
                    value={quizQuestions[activeQuestionIdx].question}
                    onChange={(e) => handleUpdateQuestion(activeQuestionIdx, "question", e.target.value)}
                    placeholder="e.g. Where did we have our first date?"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>💚 Correct Answer Option</label>
                    <input
                      type="text"
                      disabled={quizConfirmed}
                      value={quizQuestions[activeQuestionIdx].correctAnswer}
                      onChange={(e) => handleUpdateQuestion(activeQuestionIdx, "correctAnswer", e.target.value)}
                      placeholder="Enter correct choice..."
                      style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1.5px solid rgba(46, 196, 182, 0.4)", borderRadius: "6px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>💡 Sweet Clue / Hint (Optional)</label>
                    <input
                      type="text"
                      disabled={quizConfirmed}
                      value={quizQuestions[activeQuestionIdx].hint || ""}
                      onChange={(e) => handleUpdateQuestion(activeQuestionIdx, "hint", e.target.value)}
                      placeholder="Write a helpful clue..."
                      style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Decoy Answers (3 Incorrect Choices)</label>
                  {quizQuestions[activeQuestionIdx].incorrectAnswers.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      disabled={quizConfirmed}
                      value={opt}
                      onChange={(e) => handleUpdateQuestion(activeQuestionIdx, "incorrectAnswers", e.target.value, oIdx)}
                      placeholder={`Decoy Choice #${oIdx + 1}...`}
                      style={{ backgroundColor: "rgba(0,0,0,0.2)", border: "1.5px solid rgba(217, 38, 76, 0.2)", borderRadius: "6px", padding: "6px 10px", color: "#fff", fontSize: "12px", outline: "none", opacity: quizConfirmed ? 0.6 : 1 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Playable Preview */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>TEST PLAY PREVIEW</span>
              <button 
                type="button" 
                onClick={handleResetPreview} 
                style={{ background: "none", border: "none", color: "var(--accent-rose)", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}
              >
                🔄 Restart Demo
              </button>
            </div>

            <div 
              className="glass" 
              style={{ 
                padding: "20px", 
                borderRadius: "10px", 
                backgroundColor: "rgba(10, 5, 15, 0.8)", 
                border: "1.5px solid var(--accent-purple)", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              {previewGameOver ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                  <div style={{ fontSize: "36px" }}>💔</div>
                  <div style={{ color: "var(--accent-rose)", fontWeight: "bold", fontSize: "14px" }}>GAME OVER</div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: "0 auto", maxWidth: "80%" }}>
                    "{quizGameOverMsg || "Don't worry! Try again."}"
                  </p>
                  <button 
                    type="button" 
                    onClick={handleResetPreview}
                    style={{ background: "var(--accent-rose)", border: "none", color: "#fff", borderRadius: "6px", padding: "8px 16px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", margin: "10px auto 0 auto" }}
                  >
                    Mend My Heart & Retry
                  </button>
                </div>
              ) : previewWon ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px 0" }}>
                  <div style={{ fontSize: "36px", animation: "bounce 1s infinite" }}>🏆</div>
                  <div style={{ color: "#2ec4b6", fontWeight: "bold", fontSize: "14px" }}>YOU WON!</div>
                  
                  {/* Prize Coupon design */}
                  <div 
                    style={{ 
                      border: "2px double var(--accent-gold, #C9A227)", 
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(0,0,0,0.6))", 
                      borderRadius: "8px", 
                      padding: "16px",
                      margin: "8px auto",
                      maxWidth: "280px",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#fff" }}>{quizPrizeTitle || "A Sweet Reward"}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>{quizPrizeDesc || "Your prize details will be displayed here."}</div>
                    <div style={{ fontSize: "9px", color: "var(--accent-rose)", textTransform: "uppercase", marginTop: "10px", letterSpacing: "1px", fontWeight: "bold" }}>🎟️ Code: LOVE-MILLIONAIRE</div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleResetPreview}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-card)", color: "var(--text-muted)", borderRadius: "6px", padding: "6px 12px", fontSize: "10px", cursor: "pointer", margin: "4px auto 0 auto" }}
                  >
                    Replay Demo
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      Stage {previewActiveIdx + 1} of {quizQuestions.length}
                      {quizStrictness === "hearts" && (
                        <span style={{ marginLeft: "10px", color: "var(--accent-rose)" }}>
                          {"❤️".repeat(previewHearts)}
                        </span>
                      )}
                    </span>
                    <span style={{ background: "rgba(156, 108, 250, 0.2)", color: "var(--accent-purple)", padding: "2px 6px", borderRadius: "4px" }}>
                      Quiz Demo
                    </span>
                  </div>

                  {/* Question Title */}
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff", padding: "10px 0" }}>
                    {quizQuestions[previewActiveIdx]?.question || "Unconfigured Question"}
                  </div>

                  {/* Answers Grid */}
                  {(() => {
                    const currentQ = quizQuestions[previewActiveIdx];
                    if (!currentQ) return null;
                    
                    const options = [currentQ.correctAnswer, ...currentQ.incorrectAnswers]
                      .filter(Boolean);
                    
                    const processedOptions = (previewUsedFiftyFifty && previewActiveLifelines.FiftyFifty)
                      ? [currentQ.correctAnswer, currentQ.incorrectAnswers[0]].filter(Boolean)
                      : options;

                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {processedOptions.map((opt, oIdx) => {
                          const isSelected = previewSelectedOption === opt;
                          
                          let bg = "rgba(255,255,255,0.04)";
                          let border = "1px solid var(--border-card)";
                          
                          if (isSelected) {
                            if (previewAnswerState === "correct") {
                              bg = "rgba(46, 196, 182, 0.2)";
                              border = "1.5px solid #2ec4b6";
                            } else if (previewAnswerState === "incorrect") {
                              bg = "rgba(217, 38, 76, 0.2)";
                              border = "1.5px solid var(--accent-rose)";
                            } else {
                              bg = "rgba(156, 108, 250, 0.15)";
                              border = "1.5px solid var(--accent-purple)";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handlePreviewOptionClick(opt, currentQ.correctAnswer)}
                              style={{
                                padding: "10px 8px",
                                borderRadius: "8px",
                                background: bg,
                                border: border,
                                color: "#fff",
                                fontSize: "11px",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {opt || `Option ${oIdx + 1}`}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Clue Hint display if hint used */}
                  {previewShowHintClue && quizQuestions[previewActiveIdx]?.hint && (
                    <div style={{ background: "rgba(201, 162, 39, 0.08)", border: "1px solid rgba(201, 162, 39, 0.3)", borderRadius: "6px", padding: "8px", fontSize: "11px", color: "var(--accent-gold)", fontStyle: "italic" }}>
                      🔑 Clue: "{quizQuestions[previewActiveIdx].hint}"
                    </div>
                  )}

                  {/* Lifeline Buttons */}
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "4px" }}>
                    <button
                      type="button"
                      disabled={previewUsedFiftyFifty || previewAnswerState !== "idle"}
                      onClick={handlePreviewFiftyFifty}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "9px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: previewUsedFiftyFifty ? "rgba(255,255,255,0.03)" : "rgba(156, 108, 250, 0.15)",
                        color: previewUsedFiftyFifty ? "var(--text-muted)" : "var(--accent-purple)"
                      }}
                    >
                      50:50
                    </button>
                    <button
                      type="button"
                      disabled={previewUsedHint || previewAnswerState !== "idle" || !quizQuestions[previewActiveIdx]?.hint}
                      onClick={handlePreviewHint}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "9px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: (previewUsedHint || !quizQuestions[previewActiveIdx]?.hint) ? "rgba(255,255,255,0.03)" : "rgba(201, 162, 39, 0.15)",
                        color: (previewUsedHint || !quizQuestions[previewActiveIdx]?.hint) ? "var(--text-muted)" : "var(--accent-gold)"
                      }}
                    >
                      Clue 🔑
                    </button>
                    <button
                      type="button"
                      disabled={previewUsedSkip || previewAnswerState !== "idle" || previewActiveIdx === quizQuestions.length - 1}
                      onClick={handlePreviewSkip}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "none",
                        fontSize: "9px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: (previewUsedSkip || previewActiveIdx === quizQuestions.length - 1) ? "rgba(255,255,255,0.03)" : "rgba(46, 196, 182, 0.15)",
                        color: (previewUsedSkip || previewActiveIdx === quizQuestions.length - 1) ? "var(--text-muted)" : "#2ec4b6",
                        opacity: (previewActiveIdx === quizQuestions.length - 1) ? 0.35 : 1
                      }}
                      title={previewActiveIdx === quizQuestions.length - 1 ? "Cannot skip the final question!" : "Skip current question"}
                    >
                      Skip ⏩
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Confirm lock button */}
          <button
            type="button"
            onClick={() => {
              if (quizQuestions.length < 6) {
                if (showAlert) showAlert("Min Questions Required", "You must write at least 6 questions (up to 11 questions).");
                return;
              }
              for (let i = 0; i < quizQuestions.length; i++) {
                const q = quizQuestions[i];
                if (!q.question.trim() || !q.correctAnswer.trim()) {
                  if (showAlert) showAlert("Incomplete Question", `Question #${i + 1} is missing the question text or the correct answer.`);
                  setActiveQuestionIdx(i);
                  return;
                }
                for (let j = 0; j < q.incorrectAnswers.length; j++) {
                  if (!q.incorrectAnswers[j].trim()) {
                    if (showAlert) showAlert("Incomplete Choice", `Question #${i + 1} is missing decoy choice #${j + 1}.`);
                    setActiveQuestionIdx(i);
                    return;
                  }
                }
              }
              if (!quizPrizeTitle.trim()) {
                if (showAlert) showAlert("Grand Prize Required", "Please specify the name of the prize coupon they will win!");
                return;
              }
              setQuizConfirmed(!quizConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: quizConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {quizConfirmed ? "🔒 Quiz Confirmed (Click to Unlock)" : "🔓 Confirm & Seal Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}

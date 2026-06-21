"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/utils/firebase";

interface QuestionItem {
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  hint?: string;
}

interface LoveQuizReaderProps {
  loveQuiz: {
    prizeTitle: string;
    prizeDesc: string;
    gameOverMsg?: string;
    strictness?: "restart" | "hearts";
    questions: QuestionItem[];
  };
  sender: string;
  recipient: string;
  letterKey: string;
  letterId?: string;
  senderEmail?: string;
  recipientEmail?: string;
  onComplete: () => void;
}

// Cute relationship stage names mapped to question levels
const LEVEL_NAMES = [
  "Crush 🌱",
  "Spark ✨",
  "Coffee Date ☕",
  "Movie Night 🎬",
  "Sweethearts 💋",
  "Hand Holding 🤝",
  "Partners 🏡",
  "Lovers 🥂",
  "Soulmates 💞",
  "Ever After 🏆",
  "Ultimate Love 👑"
];

export default function LoveQuizReader({
  loveQuiz,
  sender,
  recipient,
  letterKey,
  letterId,
  senderEmail,
  recipientEmail,
  onComplete
}: LoveQuizReaderProps) {
  const { questions, prizeTitle, prizeDesc, gameOverMsg } = loveQuiz;
  
  // Game states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<"idle" | "verifying" | "correct" | "incorrect">("idle");
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [prizeRedeemed, setPrizeRedeemed] = useState(false);

  // New features states
  const [gameStarted, setGameStarted] = useState(false);
  const [isAnimatingStart, setIsAnimatingStart] = useState(false);
  const [tempReplaying, setTempReplaying] = useState(false);
  
  // Lifeline states
  const [lifelines, setLifelines] = useState({
    FiftyFifty: false,
    Hint: false,
    Skip: false
  });
  
  // Lifeline usage tracking (whether they used it in the *current* game run)
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [usedSkip, setUsedSkip] = useState(false);
  const [showHintClue, setShowHintClue] = useState(false);

  // Aligned drama animation states
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showLoseAnimation, setShowLoseAnimation] = useState(false);

  // We want to shuffle the answers for each question once when the question index changes, 
  // so that options are randomized but don't re-shuffle every render.
  const shuffledOptions = useMemo(() => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return [];
    
    const allOptions = [currentQ.correctAnswer, ...currentQ.incorrectAnswers].filter(Boolean);
    // Fisher-Yates shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    return allOptions;
  }, [currentIdx, questions]);

  // If 50:50 is activated, we filter out 2 incorrect options
  const visibleOptions = useMemo(() => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return [];
    if (usedFiftyFifty && lifelines.FiftyFifty) {
      // Find correct answer and the first incorrect option
      const correct = currentQ.correctAnswer;
      const oneIncorrect = currentQ.incorrectAnswers.find(Boolean) || "";
      // Keep only these two, preserving their original shuffled order
      return shuffledOptions.filter(opt => opt === correct || opt === oneIncorrect);
    }
    return shuffledOptions;
  }, [shuffledOptions, currentIdx, questions, usedFiftyFifty, lifelines.FiftyFifty]);

  // Load redeemed state from local storage if previously claimed
  useEffect(() => {
    const keyPart = (letterKey || "default").slice(0, 10);
    const claimed = localStorage.getItem(`love_quiz_claimed_${keyPart}`);
    if (claimed === "true") {
      setGameWon(true);
      setPrizeRedeemed(true);
    }
  }, [letterKey]);

  // Clear wrong selections and clue display on question change
  useEffect(() => {
    setWrongOptions([]);
    setShowHintClue(false);
    setLifelines(prev => ({ ...prev, FiftyFifty: false, Hint: false, Skip: false }));
  }, [currentIdx]);

  // Sync game won status to Firestore
  useEffect(() => {
    if (gameWon && letterId && db) {
      const saveWinToDb = async () => {
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          const docRef = doc(db, "letters", letterId);
          await updateDoc(docRef, {
            "loveQuiz.won": true,
            "loveQuiz.wonTimestamp": Date.now()
          });
        } catch (err) {
          console.error("Failed to save quiz win to Firestore:", err);
        }
      };
      saveWinToDb();
    }
  }, [gameWon, letterId]);

  // Execute answer reveal process after choice selection (and potential final confirmation)
  const executeAnswerReveal = (option: string) => {
    setSelectedOption(option);
    setAnswerState("verifying");
    
    const correct = questions[currentIdx].correctAnswer;
    const strictness = loveQuiz.strictness || "restart";
    
    setTimeout(() => {
      if (option === correct) {
        setAnswerState("correct");
        setTimeout(() => {
          const nextIdx = currentIdx + 1;
          if (nextIdx >= questions.length) {
            // Trigger spectacular winning animation!
            setShowWinAnimation(true);
            setTimeout(() => {
              setGameWon(true);
              setShowWinAnimation(false);
            }, 3000); // 3 seconds of animation
          } else {
            setCurrentIdx(nextIdx);
            setSelectedOption(null);
            setAnswerState("idle");
          }
        }, 1000);
      } else {
        setAnswerState("incorrect");
        setTimeout(() => {
          // Rule: If all lifelines/helplines are exhausted, mistake is fatal!
          const lifelinesExhausted = usedFiftyFifty && usedHint && usedSkip;
          
          // Trigger lose animation overlay before showing game over state
          setShowLoseAnimation(true);
          setTimeout(() => {
            setShowLoseAnimation(false);
            if (lifelinesExhausted) {
              setGameOver(true);
            } else if (strictness === "hearts") {
              const nextHearts = hearts - 1;
              setHearts(nextHearts);
              if (nextHearts <= 0) {
                setGameOver(true);
              } else {
                setWrongOptions(prev => [...prev, option]);
                setSelectedOption(null);
                setAnswerState("idle");
              }
            } else {
              // strictness === "restart"
              setGameOver(true);
            }
          }, 2500); // 2.5 seconds of dramatic losing animation
        }, 1000);
      }
    }, 1200); // Suspense delay
  };

  // Handle choice selection
  const handleSelectOption = (option: string) => {
    if (answerState !== "idle" || gameOver || gameWon || wrongOptions.includes(option)) return;
    
    // If this is the final question, add confirmation modal first!
    if (currentIdx === questions.length - 1) {
      setPendingOption(option);
      setShowFinalConfirmation(true);
    } else {
      executeAnswerReveal(option);
    }
  };

  const handleConfirmFinalAnswer = () => {
    if (!pendingOption) return;
    setShowFinalConfirmation(false);
    executeAnswerReveal(pendingOption);
    setPendingOption(null);
  };

  const handleCancelFinalAnswer = () => {
    setShowFinalConfirmation(false);
    setPendingOption(null);
  };

  // Lifeline Actions
  const handleFiftyFifty = () => {
    if (usedFiftyFifty || answerState !== "idle") return;
    setLifelines(prev => ({ ...prev, FiftyFifty: true }));
    setUsedFiftyFifty(true);
  };

  const handleHint = () => {
    if (usedHint || answerState !== "idle") return;
    setLifelines(prev => ({ ...prev, Hint: true }));
    setUsedHint(true);
    setShowHintClue(true);
  };

  const handleSkip = () => {
    // Skip is blocked on the final question
    if (usedSkip || answerState !== "idle" || currentIdx === questions.length - 1) return;
    setLifelines(prev => ({ ...prev, Skip: true }));
    setUsedSkip(true);
    
    setAnswerState("verifying");
    setTimeout(() => {
      setAnswerState("correct");
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= questions.length) {
          setGameWon(true);
        } else {
          setCurrentIdx(nextIdx);
          setSelectedOption(null);
          setAnswerState("idle");
        }
      }, 800);
    }, 800);
  };

  // Restart after game over
  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswerState("idle");
    setWrongOptions([]);
    setHearts(3);
    setGameOver(false);
    setShowHintClue(false);
    // Reset used lifelines
    setUsedFiftyFifty(false);
    setUsedHint(false);
    setUsedSkip(false);
    setLifelines({ FiftyFifty: false, Hint: false, Skip: false });
  };

  // Claim Prize Action
  const handleRedeem = async () => {
    setPrizeRedeemed(true);
    const keyPart = (letterKey || "default").slice(0, 10);
    localStorage.setItem(`love_quiz_claimed_${keyPart}`, "true");

    // Save claim status to Firestore
    if (letterId && db) {
      try {
        const { doc, updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "letters", letterId);
        await updateDoc(docRef, {
          "loveQuiz.claimed": true,
          "loveQuiz.claimedTimestamp": Date.now()
        });
      } catch (err) {
        console.error("Failed to save quiz claim status to Firestore:", err);
      }
    }

    // Trigger API email notification to sender if emails are provided
    if (senderEmail || recipientEmail) {
      try {
        await fetch("/api/send-prize-claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            senderEmail,
            recipientEmail,
            senderName: sender,
            recipientName: recipient,
            prizeTitle,
            prizeDesc
          })
        });
      } catch (err) {
        console.error("Failed to notify sender of prize claim:", err);
      }
    }
  };

  // Begin game animation trigger
  const handleBeginGame = () => {
    setIsAnimatingStart(true);
    setTimeout(() => {
      setGameStarted(true);
      setIsAnimatingStart(false);
    }, 500);
  };

  // Replay from confirmatory won screen
  const handleReplayForFun = () => {
    handleRestart();
    setGameWon(false);
    setTempReplaying(true);
    setGameStarted(true);
  };

  const handleExitReplay = () => {
    setTempReplaying(false);
    setGameWon(true);
    setPrizeRedeemed(true);
  };

  return (
    <>
      {/* WIN ANIMATION OVERLAY */}
      {showWinAnimation && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10000,
          background: "rgba(10, 5, 15, 0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 2 + Math.random() * 2;
            const emojis = ["💖", "✨", "🎉", "💘", "🌹", "👑"];
            const emoji = emojis[i % emojis.length];
            return (
              <span 
                key={i} 
                className="particle-win" 
                style={{ 
                  left: `${left}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  fontSize: `${16 + Math.random() * 24}px`
                }}
              >
                {emoji}
              </span>
            );
          })}
          <div style={{ fontSize: "84px", marginBottom: "16px" }}>🏆</div>
          <h1 style={{ color: "var(--accent-gold)", fontSize: "32px", fontWeight: "bold", textAlign: "center", margin: "16px 20px", textShadow: "0 0 20px rgba(201, 162, 39, 0.6)", letterSpacing: "1px" }}>
            CORRECT!
          </h1>
          <p style={{ color: "#fff", fontSize: "16px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            You are a Love Millionaire! 👑
          </p>
        </div>
      )}

      {/* LOSE ANIMATION OVERLAY */}
      {showLoseAnimation && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10000,
          background: "rgba(10, 5, 15, 0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 1.5;
            const duration = 1.5 + Math.random() * 1.5;
            const emojis = ["💧", "🥺", "💔", "😭"];
            const emoji = emojis[i % emojis.length];
            return (
              <span 
                key={i} 
                className="particle-lose" 
                style={{ 
                  left: `${left}%`, 
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  fontSize: `${14 + Math.random() * 20}px`
                }}
              >
                {emoji}
              </span>
            );
          })}
          <div style={{ fontSize: "96px", display: "flex", justifyContent: "center" }}>
            <span className="heart-half-left" style={{ color: "var(--accent-rose)" }}>💔</span>
            <span className="heart-half-right" style={{ color: "var(--accent-rose)", marginLeft: "-24px" }}>💔</span>
          </div>
          <h1 style={{ color: "var(--accent-rose)", fontSize: "28px", fontWeight: "bold", textAlign: "center", margin: "16px 20px" }}>
            Incorrect...
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", maxWidth: "80%", textAlign: "center", margin: 0 }}>
            "A minor setback in a lifetime of love..."
          </p>
        </div>
      )}

      {/* FINAL QUESTION CONFIRMATION MODAL */}
      {showFinalConfirmation && (
        <div 
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 5, 15, 0.8)",
            backdropFilter: "blur(8px)",
            padding: "20px"
          }}
        >
          <div 
            style={{
              background: "rgba(22, 12, 30, 0.98)",
              border: "2px solid var(--accent-rose, #ff4b72)",
              borderRadius: "24px",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)"
            }}
          >
            <div style={{ fontSize: "52px" }}>🤔❓</div>
            <h2 style={{ fontSize: "20px", color: "var(--accent-rose)", fontWeight: "bold", margin: 0 }}>Is that your final answer?</h2>
            <p style={{ fontSize: "13px", color: "#fff", lineHeight: "1.5", margin: 0 }}>
              This is the **final milestone** to win the Grand Prize. A mistake here could be fatal!
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                type="button" 
                onClick={handleCancelFinalAnswer}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--text-muted)",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                No, Rethink 💭
              </button>
              <button 
                type="button" 
                onClick={handleConfirmFinalAnswer}
                style={{
                  flex: 1,
                  background: "var(--accent-rose)",
                  backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Lock it in! 🔒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATORY WON MODAL */}
      {prizeRedeemed && !tempReplaying && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            backdropFilter: "blur(5px)",
            padding: "20px",
            overflow: "hidden"
          }}
        >
          <div 
            className="animate-reveal"
            style={{
              background: "rgba(22, 12, 30, 0.98)",
              border: "2.5px solid var(--accent-gold, #C9A227)",
              borderRadius: "24px",
              padding: "24px",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85)",
              animation: "game-fade-in 0.5s ease-out forwards",
              maxHeight: "95vh",
              overflow: "hidden"
            }}
          >
            <div style={{ fontSize: "48px", lineHeight: 1 }}>🏆</div>
            <h2 style={{ fontSize: "20px", color: "var(--accent-gold)", fontWeight: "bold", margin: 0 }}>A Match Sealed in Gold!</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "90%", margin: "0 auto", lineHeight: "1.4" }}>
              You have already successfully conquered the Love Quiz and claimed your reward certificate:
            </p>

            {/* Golden Love Coupon Card */}
            <div 
              className="coupon-glow"
              style={{ 
                border: "3px double var(--accent-gold, #C9A227)", 
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.12), rgba(0,0,0,0.85))", 
                borderRadius: "16px", 
                padding: "16px 14px",
                width: "100%",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "56px", opacity: 0.08, pointerEvents: "none" }}>🎟️</div>
              <div style={{ position: "absolute", bottom: "-10px", left: "-10px", fontSize: "56px", opacity: 0.08, pointerEvents: "none" }}>💖</div>
              
              <span style={{ fontSize: "8px", letterSpacing: "2px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                EverAfter Love Certificate
              </span>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", margin: "2px 0" }}>{prizeTitle || "A Romantic Surprise"}</h3>
              
              <div style={{ width: "30px", height: "1px", background: "var(--accent-gold)", margin: "8px auto" }} />
              
              <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", padding: "0 4px", margin: 0 }}>{prizeDesc || "This certificate entitles you to one custom romantic reward."}</p>
              
              <div style={{ marginTop: "10px", fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>
                Presented by <strong style={{ color: "#fff" }}>{sender}</strong> to <strong style={{ color: "#fff" }}>{recipient}</strong>
              </div>

              <div style={{ fontSize: "9px", fontWeight: "bold", color: "#2ec4b6", textTransform: "uppercase", marginTop: "10px", letterSpacing: "1px", background: "rgba(46, 196, 182, 0.1)", padding: "4px", borderRadius: "6px" }}>
                ✓ REDEEMED & CLAIMED! 🎉
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <button 
                type="button" 
                onClick={onComplete}
                style={{
                  background: "var(--accent-purple)",
                  backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "12px 24px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(156, 108, 250, 0.3)",
                  transition: "transform 0.1s"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Continue Journey ➔
              </button>
              <button 
                type="button" 
                onClick={handleReplayForFun}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--text-muted)",
                  borderRadius: "12px",
                  padding: "8px 16px",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
              >
                Replay Quiz (For Fun) 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="animate-reveal hide-scrollbar"
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "30px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          animation: "float-up-intro 0.6s ease",
          maxHeight: "calc(100vh - 120px)",
          overflowY: gameWon ? "hidden" : "auto",
          background: "rgba(22, 12, 30, 0.96)",
          border: "1.5px solid var(--accent-purple)",
          borderRadius: "24px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          position: "relative"
        }}
      >
        <style>{`
          .quiz-choice-btn {
            position: relative;
            padding: 14px 20px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            text-align: left;
          }
          .quiz-choice-btn:hover:not(:disabled) {
            background: rgba(156, 108, 250, 0.08);
            border-color: rgba(156, 108, 250, 0.3);
            transform: translateY(-2px);
          }
          .quiz-choice-btn.verifying {
            background: rgba(201, 162, 39, 0.15);
            border-color: var(--accent-gold, #C9A227);
            animation: pulse-yellow 0.6s infinite alternate;
          }
          .quiz-choice-btn.correct {
            background: rgba(46, 196, 182, 0.25) !important;
            border-color: #2ec4b6 !important;
            color: #fff !important;
            box-shadow: 0 0 15px rgba(46, 196, 182, 0.2);
          }
          .quiz-choice-btn.incorrect {
            background: rgba(217, 38, 76, 0.25) !important;
            border-color: var(--accent-rose) !important;
            color: #fff !important;
            box-shadow: 0 0 15px rgba(217, 38, 76, 0.2);
          }
          .quiz-lifeline-btn {
            flex: 1;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
          }
          @keyframes pulse-yellow {
            from { opacity: 0.8; }
            to { opacity: 1; box-shadow: 0 0 12px rgba(201, 162, 39, 0.4); }
          }
          .coupon-glow {
            box-shadow: 0 0 25px rgba(201, 162, 39, 0.3);
            animation: coupon-float 3s infinite ease-in-out;
          }
          @keyframes coupon-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); box-shadow: 0 0 35px rgba(201, 162, 39, 0.45); }
          }
          .fade-out-intro {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
            filter: blur(8px);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .fade-in-game {
            opacity: 0;
            animation: game-fade-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes game-fade-in {
            from { opacity: 0; transform: scale(0.95) translateY(15px); filter: blur(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          }
          @keyframes split-left {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(-40px, 30px) rotate(-25deg); opacity: 0; }
          }
          @keyframes split-right {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(40px, 30px) rotate(25deg); opacity: 0; }
          }
          .heart-half-left {
            display: inline-block;
            animation: split-left 2.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
          }
          .heart-half-right {
            display: inline-block;
            animation: split-right 2.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
          }
          @keyframes float-up-particle {
            0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-20vh) scale(1.2) rotate(360deg); opacity: 0; }
          }
          .particle-win {
            position: absolute;
            bottom: 0;
            animation: float-up-particle 3s linear infinite;
            pointer-events: none;
            user-select: none;
          }
          @keyframes fall-down-particle {
            0% { transform: translateY(-20vh) scale(0.8); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(110vh) scale(1.2); opacity: 0; }
          }
          .particle-lose {
            position: absolute;
            top: 0;
            animation: fall-down-particle 2.5s linear infinite;
            pointer-events: none;
            user-select: none;
          }
        `}</style>

        {!gameStarted ? (
        /* INTRO RULES STATEMENT SCREEN */
        <div 
          className={isAnimatingStart ? "fade-out-intro" : ""}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "24px", 
            padding: "20px 10px", 
            textAlign: "center",
            transition: "opacity 0.5s ease, transform 0.5s ease" 
          }}
        >
          <div style={{ fontSize: "64px" }}>🎮</div>
          <h2 style={{ fontSize: "26px", fontWeight: "bold", background: "linear-gradient(to right, #ff4b72, #9c6cfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Love Millionaire Quiz
          </h2>
          
          <p style={{ fontSize: "14px", color: "#fff", lineHeight: "1.6" }}>
            Welcome to the relationship quiz! Senders configure a series of questions about your relationship milestones, inside jokes, and special memories. Play to unlock your romantic grand prize coupon!
          </p>

          <div style={{ background: "rgba(0, 0, 0, 0.15)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px", padding: "20px", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "6px" }}>
              📝 Game Rules & Penalty setting:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span>🛡️</span>
                <span>
                  {loveQuiz.strictness === "hearts" 
                    ? <strong>3 Hearts (Lives) Mode: You have 3 lives. Game over on 3 mistakes.</strong> 
                    : <strong>High Stakes (Restart) Mode: A single wrong answer will restart the quiz from Level 1!</strong>
                  }
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span>⚡</span>
                <span>You have 3 lifelines: <strong>50:50</strong>, <strong>Clue 🔑</strong>, and <strong>Skip ⏩</strong>.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span>⚠️</span>
                <span><strong>The Skip lifeline cannot be used on the final question!</strong></span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span>🔥</span>
                <span><strong>If all lifelines are exhausted, any subsequent mistake is immediately fatal (instant Game Over), regardless of hearts!</strong></span>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleBeginGame}
            style={{
              background: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              border: "none",
              color: "#fff",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(255, 75, 114, 0.3)",
              margin: "10px auto 0 auto",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Begin Game 🎮
          </button>
        </div>
      ) : (
        /* GAMEPLAY INTERFACE */
        <div className="fade-in-game">
          {gameOver ? (
            /* GAME OVER SCREEN */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "30px 10px", textAlign: "center" }}>
              <div style={{ fontSize: "64px", animation: "bounce 2s infinite" }}>💔</div>
              <h2 style={{ fontSize: "24px", color: "var(--accent-rose)", fontWeight: "bold" }}>Game Over</h2>
              <p style={{ fontSize: "14px", color: "#fff", lineHeight: "1.6", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px", fontStyle: "italic", margin: "0 auto", maxWidth: "85%" }}>
                "{gameOverMsg || `Don't worry, my love! A true romantic never gives up. Let's try again! 😘`}"
              </p>
              <button 
                type="button" 
                onClick={handleRestart}
                style={{
                  background: "var(--accent-rose)",
                  backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "14px 28px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(255, 75, 114, 0.3)",
                  margin: "12px auto 0 auto",
                  transition: "transform 0.1s"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Mend My Heart & Restart 🔓
              </button>
            </div>
          ) : gameWon ? (
            /* VICTORY & REWARD CARD SCREEN - COMPACT & NO SCROLL */
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "10px 5px", textAlign: "center", overflow: "hidden" }}>
              <div style={{ fontSize: "48px", lineHeight: 1 }}>🏆</div>
              <h2 style={{ fontSize: "20px", color: "#2ec4b6", fontWeight: "bold", margin: 0 }}>Love Millionaire Winner!</h2>
              
              <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "85%", margin: "0 auto", lineHeight: "1.4" }}>
                Congratulations! You've navigated through all relationship milestones perfectly. Here is your romantic grand prize coupon:
              </p>

              {/* Golden Love Coupon Card */}
              <div 
                className="coupon-glow"
                style={{ 
                  border: "3px double var(--accent-gold, #C9A227)", 
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.12), rgba(0,0,0,0.85))", 
                  borderRadius: "16px", 
                  padding: "16px 14px",
                  margin: "4px auto",
                  maxWidth: "360px",
                  width: "100%",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <div style={{ position: "absolute", top: "-10px", right: "-10px", fontSize: "56px", opacity: 0.08, pointerEvents: "none" }}>🎟️</div>
                <div style={{ position: "absolute", bottom: "-10px", left: "-10px", fontSize: "56px", opacity: 0.08, pointerEvents: "none" }}>💖</div>
                
                <span style={{ fontSize: "8px", letterSpacing: "2px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                  EverAfter Love Certificate
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#fff", margin: "2px 0" }}>{prizeTitle || "A Romantic Surprise"}</h3>
                
                <div style={{ width: "30px", height: "1px", background: "var(--accent-gold)", margin: "8px auto" }} />
                
                <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4", padding: "0 4px", margin: 0 }}>{prizeDesc || "This certificate entitles you to one custom romantic reward."}</p>
                
                <div style={{ marginTop: "10px", fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>
                  Presented by <strong style={{ color: "#fff" }}>{sender}</strong> to <strong style={{ color: "#fff" }}>{recipient}</strong>
                </div>

                {(prizeRedeemed || tempReplaying) && (
                  <div style={{ fontSize: "9px", fontWeight: "bold", color: "#2ec4b6", textTransform: "uppercase", marginTop: "10px", letterSpacing: "1px", background: "rgba(46, 196, 182, 0.1)", padding: "4px", borderRadius: "6px" }}>
                    ✓ REDEEMED & CLAIMED! 🎉
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                {!prizeRedeemed && !tempReplaying ? (
                  <button 
                    type="button" 
                    onClick={handleRedeem}
                    style={{
                      background: "var(--accent-gold, #C9A227)",
                      border: "none",
                      color: "#160c1e",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(201, 162, 39, 0.35)",
                      margin: "0 auto",
                      transition: "transform 0.1s"
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Redeem Grand Prize 🎟️
                  </button>
                ) : tempReplaying ? (
                  <button 
                    type="button" 
                    onClick={handleExitReplay}
                    style={{
                      background: "var(--accent-purple)",
                      backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(156, 108, 250, 0.3)",
                      margin: "0 auto",
                      transition: "transform 0.1s"
                    }}
                  >
                    Back to Saved Prize ➔
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={onComplete}
                    style={{
                      background: "var(--accent-purple)",
                      backgroundImage: "linear-gradient(135deg, #9c6cfa, #7c4bf5)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(156, 108, 250, 0.3)",
                      margin: "0 auto",
                      transition: "transform 0.1s"
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Continue Journey ➔
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* CORE GAMEPLAY INTERFACE */
            <>
              {/* Header Progress Stage */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Current Milestone
                    {loveQuiz.strictness === "hearts" && (
                      <span style={{ marginLeft: "8px", color: "var(--accent-rose)" }}>
                        {"❤️".repeat(hearts)}
                      </span>
                    )}
                  </span>
                  <strong style={{ color: "var(--accent-purple)", fontSize: "14px" }}>
                    {LEVEL_NAMES[currentIdx] || LEVEL_NAMES[LEVEL_NAMES.length - 1]}
                  </strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block" }}>Progress</span>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#fff" }}>
                    Level {currentIdx + 1} of {questions.length}
                  </span>
                </div>
              </div>

              {/* Progress Visual Bar */}
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${((currentIdx) / questions.length) * 100}%`, 
                    background: "linear-gradient(to right, var(--accent-rose), var(--accent-purple))",
                    transition: "width 0.4s ease-out" 
                  }} 
                />
              </div>

              {/* Question Text block */}
              <div 
                style={{ 
                  padding: "24px 16px", 
                  textAlign: "center", 
                  background: "rgba(0,0,0,0.2)", 
                  border: "1px solid rgba(255,255,255,0.03)", 
                  borderRadius: "16px",
                  marginTop: "4px"
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", lineHeight: "1.5" }}>
                  {questions[currentIdx]?.question}
                </h3>
              </div>

              {/* Multiple Choices Grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                {visibleOptions.map((opt, oIdx) => {
                  const isSelected = selectedOption === opt;
                  const isWrong = wrongOptions.includes(opt);
                  
                  let classes = "quiz-choice-btn";
                  if (isSelected) {
                    if (answerState === "verifying") classes += " verifying";
                    else if (answerState === "correct") classes += " correct";
                    else if (answerState === "incorrect") classes += " incorrect";
                  } else if (isWrong) {
                    classes += " incorrect";
                  }

                  // Visual alphabetical prefixes (A, B, C, D)
                  const prefix = ["A", "B", "C", "D"][oIdx] || "";

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={answerState !== "idle" || isWrong}
                      onClick={() => handleSelectOption(opt)}
                      className={classes}
                    >
                      <span style={{ color: "var(--accent-gold, #C9A227)", fontWeight: "bold", marginRight: "10px" }}>{prefix}:</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Clue Text revealed by lifeline */}
              {showHintClue && questions[currentIdx]?.hint && (
                <div 
                  className="animate-reveal"
                  style={{ 
                    background: "rgba(201, 162, 39, 0.08)", 
                    border: "1.5px solid rgba(201, 162, 39, 0.25)", 
                    borderRadius: "12px", 
                    padding: "12px 16px", 
                    fontSize: "13px", 
                    color: "var(--accent-gold)", 
                    fontStyle: "italic", 
                    lineHeight: "1.4",
                    textAlign: "center"
                  }}
                >
                  🔑 Clue from {sender}: "{questions[currentIdx].hint}"
                </div>
              )}

              {/* Lifelines Section */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "8px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center" }}>
                  Active Lifelines
                </span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    disabled={usedFiftyFifty || answerState !== "idle"}
                    onClick={handleFiftyFifty}
                    className="quiz-lifeline-btn"
                    style={{
                      background: usedFiftyFifty ? "rgba(255,255,255,0.02)" : "rgba(156, 108, 250, 0.15)",
                      color: usedFiftyFifty ? "rgba(255,255,255,0.2)" : "var(--accent-purple)",
                      border: usedFiftyFifty ? "1px solid rgba(255,255,255,0.02)" : "1px solid rgba(156, 108, 250, 0.25)"
                    }}
                  >
                    50:50
                  </button>
                  <button
                    type="button"
                    disabled={usedHint || answerState !== "idle" || !questions[currentIdx]?.hint}
                    onClick={handleHint}
                    className="quiz-lifeline-btn"
                    style={{
                      background: (usedHint || !questions[currentIdx]?.hint) ? "rgba(255,255,255,0.02)" : "rgba(201, 162, 39, 0.15)",
                      color: (usedHint || !questions[currentIdx]?.hint) ? "rgba(255,255,255,0.2)" : "var(--accent-gold)",
                      border: (usedHint || !questions[currentIdx]?.hint) ? "1px solid rgba(255,255,255,0.02)" : "1px solid rgba(201, 162, 39, 0.25)"
                    }}
                  >
                    Clue 🔑
                  </button>
                  <button
                    type="button"
                    disabled={usedSkip || answerState !== "idle" || currentIdx === questions.length - 1}
                    onClick={handleSkip}
                    className="quiz-lifeline-btn"
                    style={{
                      background: (usedSkip || currentIdx === questions.length - 1) ? "rgba(255,255,255,0.02)" : "rgba(46, 196, 182, 0.15)",
                      color: (usedSkip || currentIdx === questions.length - 1) ? "rgba(255,255,255,0.2)" : "#2ec4b6",
                      border: (usedSkip || currentIdx === questions.length - 1) ? "1px solid rgba(255,255,255,0.02)" : "1px solid rgba(46, 196, 182, 0.25)",
                      opacity: (currentIdx === questions.length - 1) ? 0.35 : 1
                    }}
                    title={currentIdx === questions.length - 1 ? "Cannot skip the final question!" : "Skip current question"}
                  >
                    Skip ⏩
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  </>
  );
}

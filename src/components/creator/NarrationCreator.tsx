"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

interface SyncItem {
  text: string;
  time: number;
}

interface NarrationCreatorProps {
  content: string;
  narrationEnabled: boolean;
  setNarrationEnabled: (val: boolean) => void;
  narrationUrl: string;
  setNarrationUrl: (val: string) => void;
  narrationFile: File | null;
  setNarrationFile: (file: File | null) => void;
  narrationSyncData: SyncItem[];
  setNarrationSyncData: (data: SyncItem[]) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function NarrationCreator({
  content,
  narrationEnabled,
  setNarrationEnabled,
  narrationUrl,
  setNarrationUrl,
  narrationFile,
  setNarrationFile,
  narrationSyncData,
  setNarrationSyncData,
  showAlert
}: NarrationCreatorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Tap sync helpers
  const [syncActive, setSyncActive] = useState(false);
  const [activeSyncIndex, setActiveSyncIndex] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Split letter content into sentences
  const sentences = useMemo(() => {
    if (!content.trim()) return [];
    return content
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [content]);

  // If sentences change, check if sync data is still valid or notify
  useEffect(() => {
    if (narrationSyncData.length > 0 && narrationSyncData.length !== sentences.length) {
      // Auto-adapt or reset if mismatch is significant
      const adapted = sentences.map((s, i) => {
        const existing = narrationSyncData[i];
        return {
          text: s,
          time: existing && existing.text === s ? existing.time : -1
        };
      });
      setNarrationSyncData(adapted);
    }
  }, [sentences]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Audio Playback Events
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Playback failed:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);

      // If playing in Sync Mode, auto-highlight matching sentences
      if (syncActive) {
        // Find if current time matches next sentences
        const nextIdx = narrationSyncData.findIndex((item) => item.time > time);
        if (nextIdx !== -1) {
          setActiveSyncIndex(Math.max(0, nextIdx - 1));
        } else {
          setActiveSyncIndex(narrationSyncData.length - 1);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setSyncActive(false);
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        const file = new File([audioBlob], `narration_${Date.now()}.mp3`, { type: "audio/mp3" });
        const objectUrl = URL.createObjectURL(file);

        setNarrationUrl(objectUrl);
        setNarrationFile(file);
        
        // Initialize default sync timings (-1 means not set)
        setNarrationSyncData(sentences.map(s => ({ text: s, time: -1 })));

        // Stop all media tracks to release hardware
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access failed:", err);
      if (showAlert) {
        showAlert("Microphone Access Required", "Please allow microphone access to record your voice narration, sweetheart.");
      } else {
        alert("Failed to access microphone.");
      }
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Custom File Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      if (showAlert) {
        showAlert("Invalid File Type", "Please upload a valid audio file (e.g. mp3, wav, m4a).");
      } else {
        alert("Please select an audio file.");
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setNarrationUrl(objectUrl);
    setNarrationFile(file);
    setNarrationSyncData(sentences.map(s => ({ text: s, time: -1 })));
  };

  const handleClear = () => {
    if (narrationUrl && narrationUrl.startsWith("blob:")) {
      URL.revokeObjectURL(narrationUrl);
    }
    setNarrationUrl("");
    setNarrationFile(null);
    setNarrationSyncData([]);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setSyncActive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Tap-Along Alignment logic
  const handleStartTapSync = () => {
    if (!audioRef.current) return;
    setSyncActive(true);
    setActiveSyncIndex(0);
    
    // Reset timings to -1
    setNarrationSyncData(sentences.map(s => ({ text: s, time: -1 })));

    // Seek to 0 and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    });
  };

  const handleTapMark = () => {
    if (!audioRef.current || !syncActive) return;

    const currentAudioTime = audioRef.current.currentTime;
    
    // Assign timestamp to active sentence
    const updated = [...narrationSyncData];
    if (updated[activeSyncIndex]) {
      updated[activeSyncIndex] = {
        ...updated[activeSyncIndex],
        time: Number(currentAudioTime.toFixed(2))
      };
      setNarrationSyncData(updated);
    }

    // Advance index
    if (activeSyncIndex < sentences.length - 1) {
      setActiveSyncIndex(prev => prev + 1);
    } else {
      // Completed syncing all sentences!
      setSyncActive(false);
      if (showAlert) {
        showAlert("Text Sync Complete! 💖", "All sentences have been successfully mapped to your voice narration. You are ready to seal the letter!");
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "--:--";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-card)", borderRadius: "12px", padding: "20px", marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: "#fff" }}>
          <input 
            type="checkbox" 
            checked={narrationEnabled} 
            onChange={(e) => {
              setNarrationEnabled(e.target.checked);
              if (!e.target.checked) handleClear();
            }}
            style={{ accentColor: "var(--accent-rose)", width: "16px", height: "16px" }}
          />
          🎙️ Add Voice Narration
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>Perfect karaoke-style text highlighting</span>
      </div>

      {narrationEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fade-in-btn 0.3s ease-out" }}>
          
          {/* Helpful Guide Card */}
          <div style={{ 
            background: "rgba(255, 75, 114, 0.03)", 
            border: "1px solid rgba(255, 75, 114, 0.12)", 
            borderRadius: "10px", 
            padding: "14px", 
            fontSize: "12.5px", 
            color: "var(--text-muted)", 
            lineHeight: "1.6" 
          }}>
            <div style={{ fontWeight: "bold", color: "#fff", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              ✨ Quick Guide: How to Sync Your Voice
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>✍️ <strong>Step 1:</strong> Make sure you have finished writing your letter in the body input above.</li>
              <li>🎙️ <strong>Step 2:</strong> Record a fresh voice message below or upload an audio file.</li>
              <li>⏱️ <strong>Step 3:</strong> Click <strong>Start Tap-Sync</strong>, listen to your playback, and tap the heart button as you hear yourself say the start of each sentence!</li>
            </ul>
          </div>
          
          {/* Step 1: Voice input source */}
          {!narrationUrl ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              
              {/* Microphone Recorder Card */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 16px",
                  borderRadius: "10px",
                  border: isRecording ? "1px solid var(--accent-rose)" : "1px dashed var(--border-card)",
                  background: isRecording ? "rgba(255, 75, 114, 0.1)" : "rgba(255, 255, 255, 0.01)",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px", animation: isRecording ? "pulse 1.2s infinite" : "none" }}>
                  {isRecording ? "🛑" : "🎙️"}
                </div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  {isRecording ? "Stop Recording" : "Record Your Voice"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {isRecording ? `${recordingSeconds}s elapsed` : "Direct mic recording"}
                </div>
              </button>

              {/* Upload Card */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "24px 16px",
                  borderRadius: "10px",
                  border: "1px dashed var(--border-card)",
                  background: "rgba(255, 255, 255, 0.01)",
                  cursor: "pointer",
                  color: "#fff",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📁</div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>Upload Audio File</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>MP3, WAV, M4A</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </button>
            </div>
          ) : (
            
            /* Step 2: Audio loaded preview + Sync dashboard */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Media Controller Header */}
              <div style={{ background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  type="button"
                  onClick={handlePlayPause}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-rose)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
                      <polygon points="5 3 19 12 5 21" />
                    </svg>
                  )}
                </button>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#fff", fontWeight: 600 }}>
                    <span>Voice Narration Loaded</span>
                    <button type="button" onClick={handleClear} style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", fontSize: "11px" }}>
                      Clear ❌
                    </button>
                  </div>
                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", backgroundColor: "var(--accent-rose)", width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)" }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={narrationUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  style={{ display: "none" }}
                />
              </div>

              {/* Step 3: Interactive Tap-Along Timings Sync */}
              {sentences.length === 0 ? (
                <div style={{ fontSize: "11px", color: "var(--accent-rose)", textAlign: "center", fontStyle: "italic" }}>
                  Please write some text in the Letter Body first before syncing narration! ✍️
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#fff", fontWeight: "bold" }}>Sentence Alignment Dashboard</span>
                    {!syncActive ? (
                      <button
                        type="button"
                        onClick={handleStartTapSync}
                        style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-card)", color: "#fff", fontSize: "11px", cursor: "pointer" }}
                      >
                        ⏱️ Start Tap-Sync
                      </button>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--accent-rose)", fontWeight: "bold", animation: "pulse 1s infinite" }}>
                        ● Syncing Active
                      </span>
                    )}
                  </div>

                  {/* Sync Timeline List Container */}
                  <div className="hide-scrollbar" style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid var(--border-card)", borderRadius: "8px", background: "rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
                    {sentences.map((sentence, idx) => {
                      const syncItem = narrationSyncData[idx];
                      const timeVal = syncItem ? syncItem.time : -1;
                      const isCompleted = timeVal !== -1;
                      const isCurrent = syncActive && idx === activeSyncIndex;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            borderBottom: "1px solid rgba(255,255,255,0.03)",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: "10px",
                            backgroundColor: isCurrent ? "rgba(226, 184, 87, 0.08)" : "transparent",
                            color: isCurrent ? "var(--accent-gold)" : (isCompleted ? "#fff" : "rgba(255,255,255,0.4)"),
                            transition: "all 0.2s"
                          }}
                        >
                          <span style={{ flex: 1, textAlign: "left", lineHeight: "1.4" }}>
                            {idx + 1}. {sentence}
                          </span>
                          <span style={{ fontSize: "10px", fontWeight: "bold", fontFamily: "monospace", color: isCompleted ? "var(--accent-gold)" : "rgba(255,255,255,0.2)" }}>
                            {isCompleted ? formatTime(timeVal) : "--:--"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Gigantic Tap trigger heart button */}
                  {syncActive && (
                    <button
                      type="button"
                      onClick={handleTapMark}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "var(--accent-rose)",
                        backgroundImage: "linear-gradient(135deg, #ff4b72, #ff758f)",
                        border: "none",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(255, 75, 114, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        animation: "active-envelope-glow 2s infinite"
                      }}
                    >
                      💖 Tap to mark: "{sentences[activeSyncIndex]?.substring(0, 32)}..."
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

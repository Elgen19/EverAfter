"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioMessageCreatorProps {
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  audioUrl: string;
  setAudioUrl: (val: string) => void;
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  audioCustomMessage: string;
  setAudioCustomMessage: (val: string) => void;
  audioConfirmed: boolean;
  setAudioConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function AudioMessageCreator({
  audioEnabled,
  setAudioEnabled,
  audioUrl,
  setAudioUrl,
  audioFile,
  setAudioFile,
  audioCustomMessage,
  setAudioCustomMessage,
  audioConfirmed,
  setAudioConfirmed,
  showAlert
}: AudioMessageCreatorProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Parse filename from dataUrl or keep track locally if loaded
  useEffect(() => {
    if (audioUrl) {
      if (audioUrl.startsWith("blob:")) {
        if (audioFile) {
          setFileName(audioFile.name);
        } else {
          setFileName("Voice Recording (New)");
        }
      } else if (audioUrl.startsWith("data:audio")) {
        setFileName("Voice Recording.mp3");
      } else {
        const decodedUrl = decodeURIComponent(audioUrl);
        const urlWithoutParams = decodedUrl.split("?")[0];
        const parts = urlWithoutParams.split("/");
        setFileName(parts[parts.length - 1] || "Uploaded Audio");
      }
    } else {
      setFileName("");
    }
  }, [audioUrl, audioFile]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Audio preview playback handlers
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
      setCurrentTime(audioRef.current.currentTime);
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size or basic type
    if (!file.type.startsWith("audio/")) {
      if (showAlert) {
        showAlert("Invalid File Type", "Please select a valid audio file (e.g. mp3, wav, m4a, ogg).");
      } else {
        alert("Please select an audio file.");
      }
      return;
    }

    // Set temporary object URL to check duration
    const objectUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objectUrl);
    
    tempAudio.onloadedmetadata = () => {
      const audioDuration = tempAudio.duration;

      // Check for 5 minutes limit (300 seconds)
      if (audioDuration > 300) {
        URL.revokeObjectURL(objectUrl);
        if (showAlert) {
          showAlert("Recording Too Long", "Your voice message duration exceeds the 5 minutes limit (300 seconds). Please upload a shorter audio.");
        } else {
          alert("Audio file is too long. Maximum duration allowed is 5 minutes.");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setAudioUrl(objectUrl);
      setAudioFile(file);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    tempAudio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (showAlert) {
        showAlert("Corrupted File", "Unable to read the audio file metadata. The file may be corrupted or unsupported.");
      } else {
        alert("Failed to load audio file.");
      }
    };
  };

  const handleRemoveAudio = () => {
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    setAudioFile(null);
    setFileName("");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={audioEnabled} 
            onChange={(e) => {
              setAudioEnabled(e.target.checked);
              if (!e.target.checked) {
                setAudioConfirmed(false);
                handleRemoveAudio();
              }
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          🎤 Audio Message
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Embed voice recording</span>
      </div>

      {audioEnabled && (
        <div className="creator-accordion-content">
          
          {/* Custom Message Title Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "var(--text-muted)" }}>Custom Message Prefix (Optional)</span>
              <span style={{ color: "var(--text-muted)" }}>{audioCustomMessage.length}/100</span>
            </div>
            <input
              type="text"
              value={audioCustomMessage}
              disabled={audioConfirmed}
              onChange={(e) => setAudioCustomMessage(e.target.value.slice(0, 100))}
              placeholder="e.g. Listen to my voice when you miss me... ❤️"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: audioConfirmed ? 0.6 : 1
              }}
            />
          </div>

          {/* File Upload Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Voice Audio File (Max 5 mins)</label>
            
            {!audioUrl ? (
              <div
                onClick={() => !audioConfirmed && fileInputRef.current?.click()}
                style={{
                  border: "1px dashed var(--border-card)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: audioConfirmed ? "not-allowed" : "pointer",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  transition: "all 0.2s ease",
                  opacity: audioConfirmed ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!audioConfirmed) {
                    e.currentTarget.style.borderColor = "var(--accent-rose)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!audioConfirmed) {
                    e.currentTarget.style.borderColor = "var(--border-card)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                  }
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>📁</div>
                <div style={{ fontSize: "12px", color: "var(--text-main)", fontWeight: "bold" }}>Import or Upload Audio</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>MP3, WAV, M4A up to 5 minutes</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              /* Playback Preview Box */
              <div 
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>🎵</span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {fileName}
                    </span>
                  </div>
                  {!audioConfirmed && (
                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-rose)",
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: "2px 6px"
                      }}
                      title="Remove audio message"
                    >
                      ❌ Clear
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-rose)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {isPlaying ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "1.5px" }}>
                        <polygon points="5 3 19 12 5 21" />
                      </svg>
                    )}
                  </button>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    {/* Fake Seekbar Progress */}
                    <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          backgroundColor: "var(--accent-rose)", 
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          transition: "width 0.1s linear"
                        }} 
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-muted)" }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Hidden Audio Player */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                  style={{ display: "none" }}
                />
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => {
              if (!audioUrl) {
                if (showAlert) {
                  showAlert("Audio Message Required", "Please upload or import a voice audio recording before confirming, sweetheart.");
                } else {
                  alert("Please upload an audio file first.");
                }
                return;
              }
              setAudioConfirmed(!audioConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "4px",
              borderRadius: "8px",
              border: "none",
              background: audioConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {audioConfirmed ? "✓ Audio Message Sealed! (Click to Edit)" : "Seal Audio Message 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

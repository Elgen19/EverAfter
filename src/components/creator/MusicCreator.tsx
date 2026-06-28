"use client";

import React, { useState, useEffect, useRef } from "react";
import GuestFeatureLockout from "./GuestFeatureLockout";

interface MusicCreatorProps {
  music: boolean;
  setMusic: (val: boolean) => void;
  musicType: "synth" | "url";
  setMusicType: (val: "synth" | "url") => void;
  musicUrl: string;
  setMusicUrl: (val: string) => void;
  musicFile: File | null;
  setMusicFile: (val: File | null) => void;
  musicFileName: string;
  setMusicFileName: (val: string) => void;
  user: any;
  encodedData: string;
}

export default function MusicCreator({
  music,
  setMusic,
  musicType,
  setMusicType,
  musicUrl,
  setMusicUrl,
  musicFile,
  setMusicFile,
  musicFileName,
  setMusicFileName,
  user,
  encodedData
}: MusicCreatorProps) {
  const isUploaded = !!(musicFile || musicFileName || (musicUrl && musicUrl.trim() !== "" && musicUrl !== "/cant_help_falling_in_love.mp3"));
  const [selectionMode, setSelectionMode] = useState<"system" | "custom">(isUploaded ? "custom" : "system");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Automatically set type to url when music is enabled
  useEffect(() => {
    if (music && musicType !== "url") {
      setMusicType("url");
    }
    // Set default system music URL on load if no custom file exists and URL is empty
    if (music && selectionMode === "system" && !musicUrl) {
      setMusicUrl("/cant_help_falling_in_love.mp3");
    }
  }, [music, musicType, setMusicType, selectionMode, musicUrl, setMusicUrl]);

  const startPreview = (url: string) => {
    stopPreview();
    if (!url) return;

    try {
      const audio = new Audio(url);
      audio.volume = 0.35;
      audioRef.current = audio;
      setIsPlayingPreview(true);

      audio.play().then(() => {
        // Auto stop after 20 seconds
        previewTimerRef.current = setTimeout(() => {
          stopPreview();
        }, 20000);
      }).catch(err => {
        console.error("Preview play failed:", err);
        stopPreview();
      });

      audio.addEventListener("ended", () => {
        stopPreview();
      });
    } catch (err) {
      console.error("Failed to play preview:", err);
      stopPreview();
    }
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsPlayingPreview(false);
  };

  const togglePreview = () => {
    if (isPlayingPreview) {
      stopPreview();
    } else {
      let previewUrl = "";
      if (selectionMode === "system") {
        previewUrl = "/cant_help_falling_in_love.mp3";
      } else {
        if (musicFile) {
          const objUrl = URL.createObjectURL(musicFile);
          objectUrlRef.current = objUrl;
          previewUrl = objUrl;
        } else if (musicUrl) {
          previewUrl = musicUrl;
        }
      }
      if (previewUrl) {
        startPreview(previewUrl);
      }
    }
  };

  const handleSelectionModeChange = (mode: "system" | "custom") => {
    stopPreview();
    setSelectionMode(mode);
    if (mode === "system") {
      setMusicFile(null);
      setMusicFileName("");
      setMusicUrl("/cant_help_falling_in_love.mp3");
    } else {
      // If switching to custom, only clear musicUrl if they haven't uploaded an audio file already
      const hasUpload = !!(musicFile || musicFileName || (musicUrl && musicUrl.includes("firebasestorage.googleapis.com")));
      if (!hasUpload) {
        setMusicUrl("");
      }
    }
  };

  const handleRemoveFile = () => {
    setMusicFile(null);
    setMusicFileName("");
    setMusicUrl("");
    stopPreview();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size <= 10 * 1024 * 1024) {
        setMusicFile(file);
        setMusicFileName(file.name);
        setMusicType("url");
        if (musicUrl && !musicUrl.includes("firebasestorage.googleapis.com")) {
          setMusicUrl("");
        }
      } else {
        alert("File size exceeds 10MB limit.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("audio/")) {
        if (file.size <= 10 * 1024 * 1024) {
          setMusicFile(file);
          setMusicFileName(file.name);
          setMusicType("url");
          if (musicUrl && !musicUrl.includes("firebasestorage.googleapis.com")) {
            setMusicUrl("");
          }
        } else {
          alert("File size exceeds 10MB limit.");
        }
      } else {
        alert("Please upload an audio file (MP3, WAV, OGG).");
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getDisplayFileName = () => {
    if (musicFileName) return musicFileName;
    if (musicFile) return musicFile.name;
    if (musicUrl && musicUrl.includes("firebasestorage.googleapis.com")) {
      try {
        const decodedUrl = decodeURIComponent(musicUrl);
        const parts = decodedUrl.split("/");
        const lastPart = parts[parts.length - 1];
        const nameWithParams = lastPart.split("?")[0];
        const filename = nameWithParams.split("background_music")[1] || nameWithParams;
        return filename.startsWith("_") ? filename.substring(1) : "background_music.mp3";
      } catch {
        return "Uploaded Background Music.mp3";
      }
    }
    if (musicUrl) {
      if (musicUrl.includes("youtube.com") || musicUrl.includes("youtu.be")) {
        return "YouTube Track 🎵";
      }
      if (musicUrl.includes("spotify.com")) {
        return "Spotify Track 🟢";
      }
      return "Direct Audio Link 🔗";
    }
    return "Uploaded Audio";
  };

  const hasUploadedFile = !!(musicFile || musicFileName || (musicUrl && musicUrl.trim() !== "" && musicUrl !== "/cant_help_falling_in_love.mp3"));

  // Stop preview on unmount or if music toggled off
  useEffect(() => {
    if (!music) {
      stopPreview();
    }
  }, [music]);

  useEffect(() => {
    return () => stopPreview();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "rgba(255,255,255,0.02)",
        padding: "16px",
        borderRadius: "10px",
        border: "1px solid var(--border-card)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "bold" }}>Background Music</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Romantic soundtrack playing for the recipient (Normally Off)</div>
        </div>
        <button
          type="button"
          onClick={() => setMusic(!music)}
          style={{
            width: "44px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: music ? "var(--accent-rose)" : "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              position: "absolute",
              top: "3px",
              left: music ? "23px" : "3px",
              transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>

      {music && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>Select Soundtrack</label>
            
            {/* System Soundtrack Option Card */}
            <div
              onClick={() => handleSelectionModeChange("system")}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: selectionMode === "system" ? "rgba(255, 75, 114, 0.06)" : "rgba(255, 255, 255, 0.01)",
                border: selectionMode === "system" ? "1px solid var(--accent-rose)" : "1px solid var(--border-card)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🎹</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                      Can't Help Falling in Love (Piano)
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      Classic romantic melody fallback
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="selectionMode"
                  checked={selectionMode === "system"}
                  onChange={() => {}} // handled by click on parent div
                  style={{ cursor: "pointer" }}
                />
              </div>
              
              {selectionMode === "system" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview();
                  }}
                  style={{
                    alignSelf: "flex-start",
                    marginTop: "4px",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: isPlayingPreview ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isPlayingPreview ? "⏹ Stop Preview" : "▶ Play Preview"}
                </button>
              )}
            </div>

            {/* Custom Upload Option Card */}
            <div
              onClick={() => handleSelectionModeChange("custom")}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: selectionMode === "custom" ? "rgba(255, 75, 114, 0.06)" : "rgba(255, 255, 255, 0.01)",
                border: selectionMode === "custom" ? "1px solid var(--accent-rose)" : "1px solid var(--border-card)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>📤</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                      Upload Custom Soundtrack
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      Upload your own MP3, WAV, or OGG file
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="selectionMode"
                  checked={selectionMode === "custom"}
                  onChange={() => {}} // handled by click on parent div
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {selectionMode === "custom" && (
            <div style={{ marginTop: "4px" }}>
              {!user ? (
                <GuestFeatureLockout
                  featureName="Background Music Upload"
                  featureIcon="🎵"
                  featureDesc="Upload your own custom MP3, WAV, or OGG tracks to set the perfect romantic atmosphere when they open your letter."
                  encodedData={encodedData}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {hasUploadedFile ? (
                    // Display uploaded file info
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255, 75, 114, 0.06)",
                        border: "1px solid rgba(255, 75, 114, 0.2)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>🎵</span>
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#fff",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1
                          }}
                        >
                          {getDisplayFileName()}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePreview();
                          }}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: isPlayingPreview ? "var(--accent-rose)" : "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                        >
                          {isPlayingPreview ? "⏹ Stop Preview" : "▶ Play Preview"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(220, 38, 38, 0.15)",
                            border: "1px solid rgba(220, 38, 38, 0.3)",
                            color: "#f87171",
                            fontSize: "12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Drag and drop zone + Link Input
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="audio/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                      <div
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px 16px",
                          borderRadius: "8px",
                          border: isDragOver ? "1.5px dashed var(--accent-rose)" : "1px dashed rgba(255, 255, 255, 0.15)",
                          backgroundColor: isDragOver ? "rgba(255, 75, 114, 0.04)" : "rgba(255, 255, 255, 0.01)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "center",
                          gap: "8px"
                        }}
                      >
                        <div style={{ fontSize: "24px" }}>📤</div>
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "600", color: "#fff" }}>
                            Click to browse or drag file here
                          </div>
                          <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Supports MP3, WAV, or OGG (Max 10MB)
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
                        <hr style={{ flex: 1, border: "none", borderTop: "1px dashed rgba(255,255,255,0.12)" }} />
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "bold" }}>OR</span>
                        <hr style={{ flex: 1, border: "none", borderTop: "1px dashed rgba(255,255,255,0.12)" }} />
                      </div>

                      {/* Paste Link Input */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>
                          Paste Audio Link (YouTube, Spotify, or direct MP3)
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input
                            type="text"
                            placeholder="e.g., https://www.youtube.com/watch?v=..."
                            value={musicUrl && musicUrl !== "/cant_help_falling_in_love.mp3" ? musicUrl : ""}
                            onChange={(e) => {
                              setMusicUrl(e.target.value);
                              setMusicType("url");
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: "rgba(0,0,0,0.25)",
                              border: "1px solid var(--border-card)",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              color: "#fff",
                              fontSize: "12px",
                              outline: "none"
                            }}
                          />
                        </div>
                      </div>
                    </div>
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

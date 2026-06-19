"use client";

import React, { useState, useRef, useEffect } from "react";

export interface PolaroidCreatorItem {
  id: number;
  url: string;
  file: File | null;
  caption: string;
}

interface PolaroidsCreatorProps {
  polaroidsEnabled: boolean;
  setPolaroidsEnabled: (val: boolean) => void;
  polaroids: PolaroidCreatorItem[];
  setPolaroids: (items: PolaroidCreatorItem[]) => void;
  polaroidsConfirmed: boolean;
  setPolaroidsConfirmed: (val: boolean) => void;
  showAlert?: (title: string, message: string) => void;
}

export default function PolaroidsCreator({
  polaroidsEnabled,
  setPolaroidsEnabled,
  polaroids,
  setPolaroids,
  polaroidsConfirmed,
  setPolaroidsConfirmed,
  showAlert,
}: PolaroidsCreatorProps) {
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      polaroids.forEach((p) => {
        if (p.url && p.url.startsWith("blob:")) {
          URL.revokeObjectURL(p.url);
        }
      });
    };
  }, []);

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (showAlert) {
        showAlert("Invalid File Type", "Please select a valid image file (JPEG, PNG, WEBP, etc.).");
      } else {
        alert("Please select an image file.");
      }
      return;
    }

    // Limit file size to 3MB
    if (file.size > 3 * 1024 * 1024) {
      if (showAlert) {
        showAlert("File Too Large", "To ensure smooth loading for your recipient, please choose an image smaller than 3MB.");
      } else {
        alert("Image file must be under 3MB.");
      }
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const updated = [...polaroids];
    
    // Revoke previous blob url if existed
    if (updated[index].url && updated[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].url);
    }

    updated[index] = {
      ...updated[index],
      file: file,
      url: objectUrl,
    };
    setPolaroids(updated);
  };

  const handleUrlChange = (index: number, url: string) => {
    const updated = [...polaroids];
    
    // Revoke previous blob url if existed
    if (updated[index].url && updated[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].url);
    }

    updated[index] = {
      ...updated[index],
      file: null,
      url: url,
    };
    setPolaroids(updated);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...polaroids];
    updated[index] = {
      ...updated[index],
      caption: caption.slice(0, 80), // 80 character limit
    };
    setPolaroids(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...polaroids];
    if (updated[index].url && updated[index].url.startsWith("blob:")) {
      URL.revokeObjectURL(updated[index].url);
    }
    updated[index] = {
      id: index,
      url: "",
      file: null,
      caption: "",
    };
    setPolaroids(updated);
    
    const fileInput = fileInputRefs[index].current;
    if (fileInput) fileInput.value = "";
  };

  const handleCardClick = (index: number) => {
    if (activePreviewIndex === index) {
      // Flip the active card on click
      setFlippedIndex(flippedIndex === index ? null : index);
    } else {
      // Bring card to front
      setActivePreviewIndex(index);
      setFlippedIndex(null);
    }
  };

  // Get active items with images filled in
  const activePolaroids = polaroids.filter((p) => p.url.trim() !== "");

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px", marginTop: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input
            type="checkbox"
            checked={polaroidsEnabled}
            onChange={(e) => {
              setPolaroidsEnabled(e.target.checked);
              if (!e.target.checked) {
                setPolaroidsConfirmed(false);
                // Clear all polaroid assets on toggle off
                polaroids.forEach((_, idx) => handleRemoveItem(idx));
              }
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          📸 Polaroid Photo Stack
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Embed photos inside the letter flow</span>
      </div>

      {polaroidsEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
          
          {/* Card list */}
          {[0, 1, 2].map((idx) => {
            const item = polaroids[idx];
            return (
              <div 
                key={idx} 
                style={{ 
                  background: "rgba(0,0,0,0.15)", 
                  border: "1px solid var(--border-card)", 
                  borderRadius: "8px", 
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-rose)" }}>Photo #{idx + 1}</span>
                  {item.url && !polaroidsConfirmed && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: "none", border: "none", color: "var(--accent-rose)", fontSize: "11px", cursor: "pointer" }}
                    >
                      ❌ Clear
                    </button>
                  )}
                </div>

                {!item.url ? (
                  /* Photo Uploader Selector */
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div
                      onClick={() => !polaroidsConfirmed && fileInputRefs[idx].current?.click()}
                      style={{
                        border: "1px dashed var(--border-card)",
                        borderRadius: "6px",
                        padding: "14px",
                        textAlign: "center",
                        cursor: polaroidsConfirmed ? "not-allowed" : "pointer",
                        backgroundColor: "rgba(255, 255, 255, 0.01)",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!polaroidsConfirmed) {
                          e.currentTarget.style.borderColor = "var(--accent-rose)";
                          e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.02)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!polaroidsConfirmed) {
                          e.currentTarget.style.borderColor = "var(--border-card)";
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.01)";
                        }
                      }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>📸</div>
                      <div style={{ fontSize: "11px", color: "var(--text-main)", fontWeight: "bold" }}>Upload Image File</div>
                      <div style={{ fontSize: "9px", color: "var(--text-muted)", marginTop: "2px" }}>PNG, JPG, WEBP up to 3MB</div>
                      <input
                        type="file"
                        ref={fileInputRefs[idx]}
                        accept="image/*"
                        onChange={(e) => handleFileChange(idx, e)}
                        style={{ display: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", color: "var(--text-muted)", justifyContent: "center" }}>
                      <span>— OR —</span>
                    </div>

                    <input
                      type="text"
                      disabled={polaroidsConfirmed}
                      placeholder="Paste Image URL directly..."
                      value={item.url.startsWith("blob:") ? "" : item.url}
                      onChange={(e) => handleUrlChange(idx, e.target.value)}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.2)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        color: "#fff",
                        fontSize: "12px",
                        outline: "none"
                      }}
                    />
                  </div>
                ) : (
                  /* Photo added + caption */
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div 
                        style={{ 
                          width: "50px", 
                          height: "50px", 
                          borderRadius: "4px", 
                          backgroundImage: `url(${item.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: "1.5px solid #fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                        }} 
                      />
                      <div style={{ flex: 1, fontSize: "11px", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {item.file ? `Uploaded: ${item.file.name}` : `Linked: ${item.url}`}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)" }}>
                        <span>Handwritten note on the back</span>
                        <span>{item.caption.length}/80</span>
                      </div>
                      <input
                        type="text"
                        disabled={polaroidsConfirmed}
                        value={item.caption}
                        onChange={(e) => handleCaptionChange(idx, e.target.value)}
                        placeholder="e.g. Remember our summer trip? ☀️"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.2)",
                          border: "1px solid var(--border-card)",
                          borderRadius: "6px",
                          padding: "8px 10px",
                          color: "#fff",
                          fontSize: "12px",
                          outline: "none",
                          fontFamily: "var(--font-cursive)"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Interactive Stack Preview (Only shows if at least 1 image is set) */}
          {activePolaroids.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", borderTop: "1px solid var(--border-card)", paddingTop: "16px", minHeight: "230px" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-rose)", fontWeight: "bold" }}>Interactive Preview (Hover to flip, Click to reorder)</span>
              
              <div 
                style={{ 
                  position: "relative", 
                  width: "150px", 
                  height: "170px", 
                  marginTop: "16px",
                  perspective: "800px"
                }}
              >
                {activePolaroids.map((item, index) => {
                  // Determine stacked position styling
                  const isActive = activePreviewIndex === index || (activePreviewIndex === null && index === activePolaroids.length - 1);
                  const isFlipped = flippedIndex === index && isActive;
                  
                  // Static staggered layout offset
                  let rotation = "-4deg";
                  let offsetX = "-10px";
                  let offsetY = "0px";
                  if (index === 1) {
                    rotation = "4deg";
                    offsetX = "10px";
                    offsetY = "-6px";
                  } else if (index === 2) {
                    rotation = "-1deg";
                    offsetX = "0px";
                    offsetY = "6px";
                  }

                  // If active, bring to center and stand out
                  const cardStyle: React.CSSProperties = {
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    padding: "8px 8px 24px 8px",
                    boxShadow: isActive ? "0 10px 24px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.25)",
                    transformStyle: "preserve-3d",
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    zIndex: isActive ? 20 : 10 + index,
                    transform: isFlipped
                      ? "rotateY(180deg) scale(1.05)"
                      : isActive 
                        ? "rotateY(0deg) scale(1.05) translate(0px, 0px)"
                        : `rotateY(0deg) rotate(${rotation}) translate(${offsetX}, ${offsetY})`,
                  };

                  return (
                    <div 
                      key={item.id} 
                      style={cardStyle}
                      onClick={() => handleCardClick(index)}
                      title={isActive ? "Click to flip card" : "Click to view photo"}
                    >
                      {/* Front: Polaroid Image */}
                      <div 
                        style={{ 
                          height: "115px", 
                          backgroundColor: "#f0f0f0",
                          backgroundImage: `url(${item.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "3px",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          right: "8px",
                        }} 
                      />
                      
                      {/* Front caption area */}
                      <div 
                        style={{ 
                          position: "absolute",
                          bottom: "4px",
                          left: "8px",
                          right: "8px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        <span style={{ fontSize: "8px", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-cursive)" }}>
                          {item.caption || "Click me"}
                        </span>
                      </div>

                      {/* Back: Caption note */}
                      <div 
                        style={{ 
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "#fcf8ee",
                          borderRadius: "6px",
                          padding: "16px 12px",
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          textAlign: "center",
                          boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)"
                        }}
                      >
                        <div style={{ borderBottom: "1px dashed rgba(255, 75, 114, 0.2)", width: "100%", paddingBottom: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "10px", color: "var(--accent-rose)", fontWeight: "bold" }}>Memory Note ✍</span>
                        </div>
                        <p style={{ fontSize: "10px", color: "#444", fontStyle: "italic", lineHeight: "1.4", margin: 0, fontFamily: "var(--font-cursive)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>
                          {item.caption || "No caption added..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm Lock Button */}
          <button
            type="button"
            onClick={() => {
              if (activePolaroids.length === 0) {
                if (showAlert) {
                  showAlert("Photos Required", "Please upload at least one photo or paste a URL for your Polaroid stack, darling.");
                } else {
                  alert("Please add at least one polaroid photo.");
                }
                return;
              }
              setPolaroidsConfirmed(!polaroidsConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "4px",
              borderRadius: "8px",
              border: "none",
              background: polaroidsConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {polaroidsConfirmed ? "✓ Polaroid Stack Sealed! (Click to Edit)" : "Seal Polaroid Stack 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

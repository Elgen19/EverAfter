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
  polaroidsLayout: "stack" | "collage";
  setPolaroidsLayout: (val: "stack" | "collage") => void;
  polaroidsCollageStyle: "simple" | "forever" | "sunset";
  setPolaroidsCollageStyle: (val: "simple" | "forever" | "sunset") => void;
  polaroidsCollageBgPosition: "top" | "center" | "bottom";
  setPolaroidsCollageBgPosition: (val: "top" | "center" | "bottom") => void;
  polaroidsCollageBgZoom: number;
  setPolaroidsCollageBgZoom: (val: number) => void;
  polaroidsTitle: string;
  setPolaroidsTitle: (val: string) => void;
  polaroidsShowHearts: boolean;
  setPolaroidsShowHearts: (val: boolean) => void;
}

export default function PolaroidsCreator({
  polaroidsEnabled,
  setPolaroidsEnabled,
  polaroids,
  setPolaroids,
  polaroidsConfirmed,
  setPolaroidsConfirmed,
  showAlert,
  polaroidsLayout,
  setPolaroidsLayout,
  polaroidsCollageStyle,
  setPolaroidsCollageStyle,
  polaroidsCollageBgPosition,
  setPolaroidsCollageBgPosition,
  polaroidsCollageBgZoom,
  setPolaroidsCollageBgZoom,
  polaroidsTitle,
  setPolaroidsTitle,
  polaroidsShowHearts,
  setPolaroidsShowHearts,
}: PolaroidsCreatorProps) {
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const fileInputRef0 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const active = polaroids.filter((p) => p.url && p.url.trim() !== "");
    const bgImageUrl = active[0]?.url || "/ocean_sunset.png";
    if (bgImageUrl) {
      const img = new Image();
      img.src = bgImageUrl;
      img.onload = () => {
        setIsPortrait(img.width < img.height);
      };
    }
  }, [polaroids]);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const getFileInputRef = (index: number) => {
    if (index === 0) return fileInputRef0;
    if (index === 1) return fileInputRef1;
    return fileInputRef2;
  };

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

  // Correct layout if the number of active photos is not exactly 3
  useEffect(() => {
    const activeCount = polaroids.filter((p) => p.url && p.url.trim() !== "").length;
    if (activeCount !== 3 && polaroidsLayout === "collage") {
      setPolaroidsLayout("stack");
    }
  }, [polaroids, polaroidsLayout, setPolaroidsLayout]);

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
    
    const fileInput = getFileInputRef(index).current;
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
          {/* Customization Options - Only visible if exactly 3 photos are uploaded */}
          {activePolaroids.length === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-rose)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Display Layout Settings</div>
              
              {/* Layout Toggle Tabs */}
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  disabled={polaroidsConfirmed}
                  onClick={() => setPolaroidsLayout("stack")}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid " + (polaroidsLayout === "stack" ? "var(--accent-rose)" : "var(--border-card)"),
                    background: polaroidsLayout === "stack" ? "rgba(255, 75, 114, 0.15)" : "rgba(0,0,0,0.1)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: polaroidsConfirmed ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  📦 Diagonal Cascade
                </button>
                <button
                  type="button"
                  disabled={polaroidsConfirmed}
                  onClick={() => {
                    setPolaroidsLayout("collage");
                    setPolaroidsCollageStyle("simple");
                    setPolaroidsCollageBgPosition("center");
                    setPolaroidsCollageBgZoom(100);
                    setPolaroidsTitle("Captured Memories");
                    setPolaroidsShowHearts(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid " + (polaroidsLayout === "collage" ? "var(--accent-rose)" : "var(--border-card)"),
                    background: polaroidsLayout === "collage" ? "rgba(255, 75, 114, 0.15)" : "rgba(0,0,0,0.1)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: polaroidsConfirmed ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  🖼️ Polaroid Scatter Board
                </button>
              </div>
            </div>
          )}

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
                      onClick={() => !polaroidsConfirmed && getFileInputRef(idx).current?.click()}
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
                        ref={getFileInputRef(idx)}
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

          {/* Interactive Preview */}
          {activePolaroids.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", borderTop: "1px solid var(--border-card)", paddingTop: "16px", minHeight: "230px", width: "100%" }}>
              <span style={{ fontSize: "11px", color: "var(--accent-rose)", fontWeight: "bold" }}>
                {activePolaroids.length === 3
                  ? (polaroidsLayout === "stack" ? "Interactive Diagonal Cascade (Click cards to flip)" : "Interactive Polaroid Scatter (Click cards to flip)")
                  : "Interactive Preview (Click top card to flip, background cards to cycle)"}
              </span>
              
              {polaroidsLayout === "stack" ? (
                activePolaroids.length === 3 ? (
                  /* Diagonal Cascade Preview */
                  <div 
                    style={{ 
                      position: "relative", 
                      width: "100%", 
                      maxWidth: "340px", 
                      height: "240px", 
                      marginTop: "16px",
                      perspective: "1000px",
                    }}
                  >
                    {activePolaroids.map((item, index) => {
                      const isFlipped = flippedIndex === index;
                      
                      let left = "10%";
                      let top = "15px";
                      let rotation = "-4deg";
                      if (index === 1) {
                        left = "34%";
                        top = "50px";
                        rotation = "3deg";
                      } else if (index === 2) {
                        left = "58%";
                        top = "85px";
                        rotation = "-2deg";
                      }

                      const cardStyle: React.CSSProperties = {
                        position: "absolute",
                        left: left,
                        top: top,
                        width: "100px",
                        height: "130px",
                        backgroundColor: "#fff",
                        borderRadius: "4px",
                        padding: "6px 6px 16px 6px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        transformStyle: "preserve-3d",
                        transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        cursor: "pointer",
                        zIndex: 10 + index,
                        transform: isFlipped ? "rotateY(180deg)" : `rotate(${rotation})`,
                      };

                      return (
                        <div 
                          key={item.id} 
                          style={cardStyle}
                          onClick={() => setFlippedIndex(isFlipped ? null : index)}
                          title="Click to flip card"
                        >
                          <div 
                            style={{ 
                              height: "94px", 
                              backgroundColor: "#f0f0f0",
                              backgroundImage: `url(${item.url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "2px",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              position: "absolute",
                              top: "6px",
                              left: "6px",
                              right: "6px",
                            }} 
                          />
                          <div 
                            style={{ 
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "#fcf8ee",
                              borderRadius: "4px",
                              padding: "10px 6px",
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                              boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)"
                            }}
                          >
                            <span style={{ fontSize: "5px", color: "var(--accent-rose)", fontWeight: "bold", borderBottom: "1px dashed rgba(255, 75, 114, 0.2)", paddingBottom: "2px", width: "100%", marginBottom: "2px" }}>Note ✍</span>
                            <p style={{ fontSize: "6px", color: "#444", fontStyle: "italic", lineHeight: "1.2", margin: 0, fontFamily: "var(--font-cursive)", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {item.caption || "No caption added..."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard Swipable Stack Preview */
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
                      const isActive = activePreviewIndex === index || (activePreviewIndex === null && index === activePolaroids.length - 1);
                      const isFlipped = flippedIndex === index && isActive;
                      
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

                      const cardStyle: React.CSSProperties = {
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        padding: "8px 8px 20px 8px",
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
                          <div 
                            style={{ 
                              height: "142px", 
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
                            <span style={{ fontSize: "7px", color: "var(--accent-rose)", fontWeight: "bold", borderBottom: "1px dashed rgba(255, 75, 114, 0.2)", paddingBottom: "2px", width: "100%", marginBottom: "4px" }}>Note ✍</span>
                            <p style={{ fontSize: "8px", color: "#444", fontStyle: "italic", lineHeight: "1.3", margin: 0, fontFamily: "var(--font-cursive)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {item.caption || "No caption added..."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Polaroid Scatter Board Preview (Exactly 3 photos scattered on dark background) */
                <div 
                  style={{ 
                    position: "relative", 
                    width: "100%", 
                    maxWidth: "340px", 
                    height: "240px", 
                    marginTop: "16px",
                    perspective: "1000px",
                  }}
                >
                  {activePolaroids.map((item, index) => {
                    const isFlipped = flippedIndex === index;
                    
                    let left = "10%";
                    let top = "15px";
                    let rotation = "-6deg";
                    let zIndex = 10;
                    
                    if (index === 0) { // Photo 1 (left)
                      left = "10%";
                      top = "15px";
                      rotation = "-6deg";
                      zIndex = 10;
                    } else if (index === 2) { // Photo 3 (right)
                      left = "54%";
                      top = "25px";
                      rotation = "7deg";
                      zIndex = 11;
                    } else if (index === 1) { // Photo 2 (center-bottom, overlaps both)
                      left = "30%";
                      top = "65px";
                      rotation = "-4deg";
                      zIndex = 12;
                    }

                    const cardStyle: React.CSSProperties = {
                      position: "absolute",
                      left: left,
                      top: top,
                      width: "100px",
                      height: "130px",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      padding: "6px 6px 16px 6px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      transformStyle: "preserve-3d",
                      transition: "all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      cursor: "pointer",
                      zIndex: zIndex,
                      transform: isFlipped ? "rotateY(180deg)" : `rotate(${rotation})`,
                    };

                    return (
                      <div 
                        key={item.id} 
                        style={cardStyle}
                        onClick={() => setFlippedIndex(isFlipped ? null : index)}
                        title="Click to flip card"
                      >
                        <div 
                          style={{ 
                            height: "94px", 
                            backgroundColor: "#f0f0f0",
                            backgroundImage: `url(${item.url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "2px",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            position: "absolute",
                            top: "6px",
                            left: "6px",
                            right: "6px",
                          }} 
                        />
                        <div 
                          style={{ 
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "#fcf8ee",
                            borderRadius: "4px",
                            padding: "10px 6px",
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)"
                          }}
                        >
                          <span style={{ fontSize: "5px", color: "var(--accent-rose)", fontWeight: "bold", borderBottom: "1px dashed rgba(255, 75, 114, 0.2)", paddingBottom: "2px", width: "100%", marginBottom: "2px" }}>Note ✍</span>
                          <p style={{ fontSize: "6px", color: "#444", fontStyle: "italic", lineHeight: "1.2", margin: 0, fontFamily: "var(--font-cursive)", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.caption || "No caption added..."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

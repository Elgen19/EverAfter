"use client";

import React, { useState } from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    id: "love",
    name: "❤️ Love",
    emojis: ["❤️", "💖", "🥰", "🌹", "✨", "😊", "😘", "🌸", "💕", "🧸", "💋", "💌", "💝", "💘", "💍", "👩‍❤️‍💋‍👨", "💑", "🫶", "😍", "👰"]
  },
  {
    id: "faces",
    name: "😀 Smileys",
    emojis: ["😊", "🥰", "😍", "😘", "🥹", "😂", "🤫", "🤩", "🤪", "🥳", "🥺", "😇", "😌", "🤤", "🤭", "🤠", "😎", "🤗", "😭", "😤"]
  },
  {
    id: "nature",
    name: "🌸 Nature",
    emojis: ["🌸", "🌺", "🌻", "🌼", "🌷", "🍀", "🍂", "🍁", "🍄", "🌾", "🌱", "🌴", "🌲", "🍃", "🌟", "✨", "🌙", "🌍", "🌈", "🦋"]
  },
  {
    id: "food",
    name: "🍓 Food",
    emojis: ["🍓", "🍫", "🥂", "🍷", "🍰", "🧁", "🍪", "🍒", "🍕", "🍿", "🍬", "🍩", "🥞", "🍯", "🍇", "🍉", "🍍", "🍔", "🍦", "🍹"]
  },
  {
    id: "party",
    name: "🎉 Party",
    emojis: ["🎉", "🎁", "🎈", "🔮", "👍", "🤝", "🙌", "🫶", "👏", "🔔", "🎀", "🪄", "💌", "💎", "🔥", "👑", "🦄", "🕊️", "🐾", "🎸"]
  }
];

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("love");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCat = EMOJI_CATEGORIES.find(c => c.id === activeCategory) || EMOJI_CATEGORIES[0];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid var(--border-card)",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "#fff",
          fontSize: "13px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
      >
        <span>😊</span>
        <span>More Emojis</span>
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
              background: "transparent"
            }}
          />
          <div
            className="glass"
            style={{
              position: "absolute",
              bottom: "40px",
              right: 0,
              width: "320px",
              padding: "16px",
              borderRadius: "12px",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
              animation: "fadeInSecurityInputs 0.2s ease"
            }}
          >
            {/* Category selection bar */}
            <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    backgroundColor: activeCategory === cat.id ? "var(--accent-rose)" : "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Emojis Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
                maxHeight: "150px",
                overflowY: "auto",
                paddingRight: "4px"
              }}
            >
              {selectedCat.emojis.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "22px",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.1s, transform 0.1s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";

interface DateInvitationProps {
  dateInvite: {
    question: string;
    activity?: string;
    dateTime?: string;
    date?: string;
    time?: string;
    place?: string;
    mapLink?: string;
    email?: string;
  };
  sender: string;
  recipient: string;
  letterKey: string;
  onComplete: () => void;
}

function formatDateInvite(dateStr?: string, timeStr?: string) {
  if (!dateStr && !timeStr) return "";
  let formattedDate = "";
  if (dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = months[monthIndex] || "";
      formattedDate = `${monthName} ${day}, ${year}`;
    } else {
      formattedDate = dateStr;
    }
  }

  let formattedTime = "";
  if (timeStr) {
    const timeParts = timeStr.split(":");
    if (timeParts.length >= 2) {
      let hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes.padStart(2, "0");
      formattedTime = `${hours}:${minutesStr} ${ampm}`;
    } else {
      formattedTime = timeStr;
    }
  }

  let result = "";
  if (formattedDate) {
    result += formattedDate;
  }
  if (formattedTime) {
    result += (result ? " at " : "") + formattedTime;
  }
  return result;
}

export default function DateInvitation({
  dateInvite,
  sender,
  recipient,
  letterKey,
  onComplete
}: DateInvitationProps) {
  const [dateRsvpSelected, setDateRsvpSelected] = useState<"yes" | null>(null);
  const [dateNotes, setDateNotes] = useState("");
  const [showRsvpSuccessModal, setShowRsvpSuccessModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [dateStatusMessage, setDateStatusMessage] = useState("");
  const [dateInviteHearts, setDateInviteHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);

  const handleDeclineConfirm = async () => {
    try {
      const timestamp = Date.now();
      const rsvpResult = {
        recipient,
        sender,
        accepted: false,
        notes: "Recipient declined the date invitation.",
        date: dateInvite.date,
        time: dateInvite.time,
        place: dateInvite.place,
        timestamp
      };
      localStorage.setItem(`date_rsvp_${letterKey.slice(0, 10)}`, JSON.stringify(rsvpResult));
      
      if (dateInvite.email) {
        await fetch("/api/send-rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipientEmail: dateInvite.email,
            senderName: sender,
            recipientName: recipient,
            date: dateInvite.date,
            time: dateInvite.time,
            place: dateInvite.place,
            mapLink: dateInvite.mapLink,
            accepted: false,
            notes: "Decline invitation selection confirmed."
          })
        }).catch(err => console.error("Simulated decline email send failed:", err));
      }
    } catch (err) {
      console.error("Failed to save or send RSVP decline:", err);
    }
    setShowDeclineModal(false);
    onComplete();
  };

  const handleRsvpConfirm = async () => {
    try {
      const timestamp = Date.now();
      const rsvpResult = {
        recipient,
        sender,
        accepted: true,
        notes: dateNotes.trim(),
        date: dateInvite.date,
        time: dateInvite.time,
        place: dateInvite.place,
        mapLink: dateInvite.mapLink,
        timestamp
      };
      localStorage.setItem(`date_rsvp_${letterKey.slice(0, 10)}`, JSON.stringify(rsvpResult));

      if (dateInvite.email) {
        setDateStatusMessage("Simulating email confirmation dispatch...");
        await fetch("/api/send-rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipientEmail: dateInvite.email,
            senderName: sender,
            recipientName: recipient,
            date: dateInvite.date,
            time: dateInvite.time,
            place: dateInvite.place,
            mapLink: dateInvite.mapLink,
            accepted: true,
            notes: dateNotes.trim()
          })
        }).catch(err => console.error("Simulated accept email send failed:", err));
      }
    } catch (err) {
      console.error("Failed to save or send RSVP accept:", err);
    }
    setShowRsvpSuccessModal(true);
  };

  const triggerHeartsBurst = () => {
    const heartsList = ["❤️", "💖", "💝", "💕", "✨", "🌸"];
    const newBursts = [];
    for (let i = 0; i < 22; i++) {
      const char = heartsList[Math.floor(Math.random() * heartsList.length)];
      const tx = `${(Math.random() - 0.5) * 320}px`;
      const ty = `${-80 - Math.random() * 200}px`;
      const scale = Math.random() * 0.9 + 0.6;
      const rot = `${(Math.random() - 0.5) * 180}deg`;
      newBursts.push({
        id: i,
        char,
        tx,
        ty,
        scale,
        rot
      });
    }
    setDateInviteHearts(newBursts);
    setDateRsvpSelected("yes");
  };

  return (
    <div 
      className="glass animate-reveal"
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        position: "relative",
        animation: "float-up-intro 0.6s ease"
      }}
    >
      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 7, 17, 0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
            zIndex: 100,
            animation: "float-up-intro 0.3s ease"
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🥺</div>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#fff", marginBottom: "12px" }}>Decline Date Invitation?</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "24px", maxWidth: "320px" }}>
            Are you absolutely sure you want to decline this lovely date invitation from {sender}? 💔
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "240px" }}>
            <button
              type="button"
              onClick={handleDeclineConfirm}
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 75, 114, 0.15)",
                border: "1px solid var(--accent-rose)",
                color: "var(--accent-rose)",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.15)")}
            >
              Yes, Decline 💔
            </button>
            <button
              type="button"
              onClick={() => setShowDeclineModal(false)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border-card)",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
            >
              Nevermind, Take Me Back 💖
            </button>
          </div>
        </div>
      )}

      {/* RSVP Success Modal */}
      {showRsvpSuccessModal && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(11, 7, 17, 0.95)",
            backdropFilter: "blur(8px)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
            zIndex: 100,
            animation: "float-up-intro 0.3s ease"
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>🎟️</div>
          <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#fff", marginBottom: "12px", textAlign: "center" }}>RSVP Confirmed!</h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "24px", maxWidth: "340px", textAlign: "center" }}>
            Your RSVP details have been confirmed and sent to your email address: <strong>{dateInvite.email || "your email address"}</strong>! 💖
          </p>
          <button
            type="button"
            onClick={() => {
              setShowRsvpSuccessModal(false);
              onComplete();
            }}
            style={{
              width: "100%",
              maxWidth: "200px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 75, 114, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 75, 114, 0.3)";
            }}
          >
            Continue 💖
          </button>
        </div>
      )}

      {/* Romantic heart burst */}
      {dateInviteHearts.map((h) => (
        <span
          key={h.id}
          className="burst-heart"
          style={{
            "--tx": h.tx,
            "--ty": h.ty,
            "--scale": h.scale,
            "--rot": h.rot,
            position: "absolute",
            color: "var(--accent-rose)",
            fontSize: "24px",
            pointerEvents: "none"
          } as any}
        >
          {h.char}
        </span>
      ))}

      {dateRsvpSelected === "yes" ? (
        // Ticket Pass
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            position: "relative",
            backgroundColor: "rgba(255, 75, 114, 0.03)",
            border: "1.5px solid rgba(226, 184, 87, 0.3)", // gold border
            borderRadius: "16px",
            padding: "24px 20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
          }}
        >
          <div style={{ position: "absolute", left: "-10px", top: "45%", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#140f1e", borderRight: "1.5px solid rgba(226, 184, 87, 0.3)", zIndex: 10 }} />
          <div style={{ position: "absolute", right: "-10px", top: "45%", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#140f1e", borderLeft: "1.5px solid rgba(226, 184, 87, 0.3)", zIndex: 10 }} />

          {/* Header */}
          <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "10px", marginBottom: "14px", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "var(--accent-gold)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
              🎫 Ticket Pass - Admit Two 🎫
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", marginTop: "4px", lineHeight: "1.4" }}>
              Thank you for going out on a date with me
            </h2>
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", fontSize: "13px", padding: "0 6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Host</span>
                <strong style={{ color: "#fff" }}>{sender}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Guest</span>
                <strong style={{ color: "#fff" }}>{recipient}</strong>
              </div>
            </div>

            {dateInvite.place && (
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Place / Location</span>
                <strong style={{ color: "var(--accent-gold)", fontSize: "14px", display: "inline-block" }}>📍 {dateInvite.place}</strong>
              </div>
            )}

            {(dateInvite.date || dateInvite.time) && (
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Proposed Date & Time</span>
                <strong style={{ color: "var(--accent-rose)", fontSize: "14px" }}>
                  ⏰ {formatDateInvite(dateInvite.date, dateInvite.time)}
                </strong>
              </div>
            )}

            {dateInvite.mapLink && (
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <a 
                  href={dateInvite.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(226, 184, 87, 0.1)",
                    border: "1px dashed var(--accent-gold)",
                    color: "var(--accent-gold)",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    letterSpacing: "1px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.25)";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(226, 184, 87, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  🗺️ VIEW PLACE
                </a>
              </div>
            )}
          </div>

          <div style={{ borderTop: "2px dashed rgba(226, 184, 87, 0.3)", margin: "16px 0 12px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              <label style={{ fontSize: "10px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: 700 }}>Add a ticket message...</label>
              <textarea
                value={dateNotes}
                onChange={(e) => setDateNotes(e.target.value)}
                placeholder="e.g. Can't wait! I'll wear that outfit you love... 😘"
                rows={2}
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#fff",
                  fontSize: "12px",
                  lineHeight: "1.4",
                  outline: "none",
                  resize: "none"
                }}
              />
            </div>

            {dateStatusMessage && (
              <p style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 600, animation: "float-up-intro 0.2s ease" }}>
                {dateStatusMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleRsvpConfirm}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
                transition: "all 0.2s"
              }}
            >
              Confirm RSVP & Seal Pass 🎟️
            </button>
          </div>
        </div>
      ) : (
        // Choices YES / NO
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "56px" }}>🌹</div>
          <div 
            style={{ 
              fontSize: "24px", 
              fontFamily: "var(--font-cursive)", 
              color: "#fff", 
              lineHeight: "1.4",
              margin: "10px 0"
            }}
          >
            {dateInvite.question}
          </div>

          <div 
            style={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "10px"
            }}
          >
            <button
              type="button"
              onClick={triggerHeartsBurst}
              style={{
                padding: "12px 36px",
                borderRadius: "30px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(255, 75, 114, 0.4)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Yes! 😍
            </button>

            <button
              type="button"
              onClick={() => setShowDeclineModal(true)}
              style={{
                padding: "12px 36px",
                borderRadius: "30px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-card)",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              No 😢
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

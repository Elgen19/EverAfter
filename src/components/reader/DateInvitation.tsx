"use client";

import React, { useState } from "react";
import { db } from "@/utils/firebase";

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
    rsvpStatus?: string;
    rsvpNotes?: string;
  };
  sender: string;
  recipient: string;
  letterKey: string;
  letterId?: string;
  senderEmail?: string;
  preview?: boolean;
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
  letterId,
  senderEmail,
  preview = false,
  onComplete
}: DateInvitationProps) {
  const [dateRsvpSelected, setDateRsvpSelected] = useState<"yes" | null>(null);
  const [dateNotes, setDateNotes] = useState("");
  const [showRsvpSuccessModal, setShowRsvpSuccessModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineFeedbackModal, setShowDeclineFeedbackModal] = useState(false);
  const [dateStatusMessage, setDateStatusMessage] = useState("");
  const [dateInviteHearts, setDateInviteHearts] = useState<{ id: number; char: string; tx: string; ty: string; scale: number; rot: string }[]>([]);
  const [isSealing, setIsSealing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const getDateKey = () => {
    if (letterId) return letterId;
    if (letterKey && letterKey !== "preview") {
      let hash = 0;
      for (let i = 0; i < letterKey.length; i++) {
        hash = (hash << 5) - hash + letterKey.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    }
    return "preview";
  };

  React.useEffect(() => {
    if (preview) {
      setDateRsvpSelected(null);
      setDateNotes("");
      setIsConfirmed(false);
      setShowDeclineFeedbackModal(false);
      setShowDeclineModal(false);
      setShowRsvpSuccessModal(false);
      return;
    }

    if (dateInvite.rsvpStatus) {
      if (dateInvite.rsvpStatus === "accepted") {
        setDateRsvpSelected("yes");
        setDateNotes(dateInvite.rsvpNotes || "");
        setIsConfirmed(true);
        setShowDeclineFeedbackModal(false);
      } else if (dateInvite.rsvpStatus === "declined") {
        setDateRsvpSelected(null);
        setDateNotes("");
        setIsConfirmed(false);
        setShowDeclineFeedbackModal(true);
      }
      return;
    }

    const keyPart = getDateKey();
    const cachedRsvpStr = localStorage.getItem(`date_rsvp_${keyPart}`);
    if (cachedRsvpStr) {
      try {
        const cached = JSON.parse(cachedRsvpStr);
        if (cached.accepted) {
          setDateRsvpSelected("yes");
          setDateNotes(cached.notes || "");
          setIsConfirmed(true);
          setShowDeclineFeedbackModal(false);
        } else {
          setDateRsvpSelected(null);
          setDateNotes("");
          setIsConfirmed(false);
          setShowDeclineFeedbackModal(true);
        }
        return;
      } catch (e) {
        console.error("Failed to parse cached RSVP:", e);
      }
    }

    // Reset state if not RSVP'd in database and not cached
    setDateRsvpSelected(null);
    setDateNotes("");
    setIsConfirmed(false);
    setShowDeclineFeedbackModal(false);
    setShowDeclineModal(false);
    setShowRsvpSuccessModal(false);
  }, [letterKey, letterId, dateInvite.rsvpStatus, dateInvite.rsvpNotes]);


  const buildGoogleCalendarUrl = () => {
    if (!dateInvite.date || !dateInvite.time) return "";
    try {
      const [yr, mo, dy] = dateInvite.date.split("-").map(Number);
      const [hr, mn] = dateInvite.time.split(":").map(Number);
      const startDate = new Date(yr, mo - 1, dy, hr, mn);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

      const formatGCalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const s = "00";
        return `${y}${m}${day}T${h}${min}${s}`;
      };

      const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
      const text = encodeURIComponent(`🌹 Date with ${sender || "my love"} 🌹`);
      const dates = encodeURIComponent(datesParam);
      const details = encodeURIComponent(
        `Looking forward to our romantic date! 🥰\n\nNotes from RSVP: ${dateNotes.trim() || "None"}\n\nGenerated via Digital Love Letter.`
      );
      const locationParam = encodeURIComponent(dateInvite.place || "");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${locationParam}`;
    } catch (err) {
      console.error("Error building GCal URL:", err);
      return "";
    }
  };

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
      if (!preview) {
        localStorage.setItem(`date_rsvp_${getDateKey()}`, JSON.stringify(rsvpResult));
      }
      
      if (letterId && db && !preview) {
        const { doc, updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "letters", letterId);
        await updateDoc(docRef, {
          "dateInvite.rsvpStatus": "declined",
          "dateInvite.rsvpNotes": "Recipient declined the date invitation.",
          "dateInvite.rsvpTimestamp": timestamp
        });
      }

      if (dateInvite.email && !preview) {
        await fetch("/api/send-rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipientEmail: dateInvite.email,
            senderEmail: senderEmail || null,
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
    setShowDeclineFeedbackModal(true);
  };

  const handleRsvpConfirm = async () => {
    setIsSealing(true);
    try {
      // eslint-disable-next-line react-hooks/purity
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
      if (!preview) {
        localStorage.setItem(`date_rsvp_${getDateKey()}`, JSON.stringify(rsvpResult));
      }

      if (letterId && db && !preview) {
        const { doc, updateDoc } = await import("firebase/firestore");
        const docRef = doc(db, "letters", letterId);
        await updateDoc(docRef, {
          "dateInvite.rsvpStatus": "accepted",
          "dateInvite.rsvpNotes": dateNotes.trim(),
          "dateInvite.rsvpTimestamp": timestamp
        });
      }

      if (dateInvite.email && !preview) {
        setDateStatusMessage("Simulating email confirmation dispatch...");
        fetch("/api/send-rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recipientEmail: dateInvite.email,
            senderEmail: senderEmail || null,
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
      } else if (preview) {
        setDateStatusMessage("Preview mode: RSVP email dispatch bypassed.");
      }
    } catch (err) {
      console.error("Failed to save or send RSVP accept:", err);
    }
    
    // Smooth peak duration for flash transition
    setTimeout(() => {
      triggerHeartsBurst();
      setShowRsvpSuccessModal(true);
      setIsConfirmed(true);
    }, 250);

    setTimeout(() => {
      setIsSealing(false);
    }, 800);
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

  const isTicketView = dateRsvpSelected === "yes" && !showRsvpSuccessModal;

  return (
    <div 
      className="animate-reveal hide-scrollbar"
      style={{
        width: "100%",
        maxWidth: "500px",
        padding: isTicketView ? "0" : "40px 30px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        position: "relative",
        animation: "float-up-intro 0.6s ease",
        maxHeight: isTicketView ? "calc(100vh - 120px)" : "calc(100vh - 160px)",
        overflowY: isTicketView ? "hidden" : "auto",
        border: isTicketView ? "none" : "1.5px solid var(--accent-gold)",
        borderRadius: isTicketView ? undefined : "20px",
        background: isTicketView ? "transparent" : "rgba(25, 12, 22, 0.95)",
        boxShadow: isTicketView ? "none" : "0 15px 40px rgba(0, 0, 0, 0.5)",
        marginTop: isTicketView ? (preview ? "16px" : "-55px") : undefined
      }}
    >
      {/* Sealing transition flash overlay */}
      {isSealing && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: isTicketView ? "16px" : "20px",
            zIndex: 200,
            animation: "sealing-flash 0.8s ease-out forwards",
            pointerEvents: "none"
          }}
        />
      )}
      {/* Decline Confirmation Modal is handled inline below inside the conditional flow */}

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

      {showRsvpSuccessModal ? (
        // RSVP Success Confirmation (centered inside wrapper!)
        <div 
          className="animate-stamp"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "10px 0" }}
        >
          <div style={{ fontSize: "56px", marginBottom: "8px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>🎟️</div>
          <h3 style={{ 
            fontSize: "36px", 
            fontWeight: "normal", 
            fontFamily: "var(--font-cursive)",
            color: "var(--accent-rose)", 
            margin: 0, 
            textAlign: "center" 
          }}>
            RSVP Confirmed!
          </h3>
          <p style={{ 
            fontSize: "14px", 
            color: "var(--text-muted)", 
            lineHeight: "1.6", 
            margin: 0, 
            maxWidth: "340px", 
            textAlign: "center"
          }}>
            💖 A beautiful promise is sealed! You have confirmed a romantic date with <strong>{sender || "your partner"}</strong>. Let the anticipation of sweet memories warm your heart.
          </p>
          {dateInvite.email && (
            <p style={{ fontSize: "11px", color: "var(--text-muted)", opacity: 0.8, margin: "-10px 0 0 0" }}>
              A confirmation ticket copy has been sent to <strong>{dateInvite.email}</strong>.
            </p>
          )}

          {!preview && buildGoogleCalendarUrl() && (
            <a
              href={buildGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                maxWidth: "240px",
                padding: "12px",
                borderRadius: "8px",
                border: "1.5px solid var(--accent-gold)",
                backgroundColor: "rgba(226, 184, 87, 0.1)",
                color: "var(--accent-gold)",
                fontWeight: "bold",
                fontSize: "14px",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 4px 15px rgba(226, 184, 87, 0.15)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.25)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(226, 184, 87, 0.35)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(226, 184, 87, 0.15)";
                e.currentTarget.style.transform = "none";
              }}
            >
              📅 Add to Google Calendar
            </a>
          )}

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
          >
            Continue 💖
          </button>
        </div>
      ) : showDeclineFeedbackModal ? (
        // Decline Feedback Confirmation (centered inside glass card wrapper!)
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
          <div style={{ fontSize: "56px", marginBottom: "8px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>💖</div>
          <h3 style={{ 
            fontSize: "36px", 
            fontWeight: "normal", 
            fontFamily: "var(--font-cursive)",
            color: "#fff", 
            margin: 0, 
            textAlign: "center" 
          }}>
            I Understand...
          </h3>
          <p style={{ 
            fontSize: "14px", 
            color: "var(--text-muted)", 
            lineHeight: "1.6", 
            margin: 0, 
            maxWidth: "340px", 
            textAlign: "center"
          }}>
            No worries, darling. I hope we can make it happen someday soon! I completely understand. 💖
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {
                setShowDeclineFeedbackModal(false);
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
            >
              Continue 💖
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeclineFeedbackModal(false);
                setDateRsvpSelected(null);
                setIsConfirmed(false);
                if (!preview) {
                  localStorage.removeItem(`date_rsvp_${getDateKey()}`);
                }
                if (letterId && db && !preview) {
                  import("firebase/firestore").then(({ doc, updateDoc }) => {
                    const docRef = doc(db, "letters", letterId);
                    updateDoc(docRef, {
                      "dateInvite.rsvpStatus": "",
                      "dateInvite.rsvpNotes": "",
                      "dateInvite.rsvpTimestamp": null
                    });
                  }).catch(err => console.error("Failed to reset Firestore RSVP:", err));
                }
              }}
              style={{
                background: "none",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "var(--text-muted)",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer",
                marginTop: "4px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Change Response ↩
            </button>
          </div>
        </div>
      ) : showDeclineModal ? (
        // Decline Confirmation Modal (rendered in normal flow!)
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
          <div style={{ fontSize: "56px", marginBottom: "8px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>🥺</div>
          <h3 style={{ 
            fontSize: "36px", 
            fontWeight: "normal", 
            fontFamily: "var(--font-cursive)",
            color: "var(--accent-rose)", 
            margin: 0, 
            textAlign: "center" 
          }}>
            Decline Date Invitation?
          </h3>
          <p style={{ 
            fontSize: "14px", 
            color: "var(--text-muted)", 
            lineHeight: "1.6", 
            margin: 0, 
            maxWidth: "340px", 
            textAlign: "center" 
          }}>
            Are you absolutely sure you want to decline this lovely date invitation from <strong>{sender}</strong>? 💔
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "240px", marginTop: "10px" }}>
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
      ) : dateRsvpSelected === "yes" ? (
        // Ticket Pass
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            position: "relative",
            backgroundColor: "rgba(25, 12, 22, 0.95)",
            border: "1.5px solid var(--accent-gold)", // gold border
            borderRadius: "16px",
            padding: "16px 20px 20px 20px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
            width: "100%",
            height: "100%",
            maxHeight: "530px",
            minHeight: "450px",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Top Section */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: "1 1 auto" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--accent-gold)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
                🎫 Ticket Pass - Admit Two 🎫
              </span>
              <h2 style={{ 
                fontSize: "28px", 
                fontWeight: "normal", 
                color: "#fff", 
                marginTop: "2px", 
                lineHeight: "1.2",
                fontFamily: "var(--font-cursive)"
              }}>
                Thank you for going on a date with me
              </h2>
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left", fontSize: "13px", padding: "0 6px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
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
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Place / Location</span>
                  <strong style={{ color: "var(--accent-gold)", fontSize: "13px", display: "inline-block" }}>📍 {dateInvite.place}</strong>
                </div>
              )}

              {(dateInvite.date || dateInvite.time) && (
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Proposed Date & Time</span>
                  <strong style={{ color: "var(--accent-rose)", fontSize: "13px" }}>
                    ⏰ {formatDateInvite(dateInvite.date, dateInvite.time)}
                  </strong>
                </div>
              )}

              {dateInvite.mapLink && (
                <div style={{ textAlign: "center", marginTop: "2px" }}>
                  <a 
                    href={dateInvite.mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(226, 184, 87, 0.1)",
                      border: "1px dashed var(--accent-gold)",
                      color: "var(--accent-gold)",
                      fontSize: "11px",
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
          </div>

          {/* Perforation Line divider with punch holes */}
          <div style={{ position: "relative", width: "100%", margin: "14px 0" }}>
            {/* Left punch hole */}
            <div style={{ 
              position: "absolute", 
              left: "-30px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              width: "18px", 
              height: "18px", 
              borderRadius: "50%", 
              backgroundColor: "var(--bg-studio, #0b0711)", 
              borderRight: "1.5px solid var(--accent-gold)", 
              zIndex: 10 
            }} />
            {/* Right punch hole */}
            <div style={{ 
              position: "absolute", 
              right: "-30px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              width: "18px", 
              height: "18px", 
              borderRadius: "50%", 
              backgroundColor: "var(--bg-studio, #0b0711)", 
              borderLeft: "1.5px solid var(--accent-gold)", 
              zIndex: 10 
            }} />
            {/* Dashed line */}
            <div style={{ borderTop: "2px dashed rgba(226, 184, 87, 0.7)" }} />
          </div>

          {/* Bottom Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
              <label style={{ fontSize: "10px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: 700 }}>Add a ticket message...</label>
              <textarea
                value={dateNotes}
                disabled={isConfirmed}
                onChange={(e) => setDateNotes(e.target.value)}
                placeholder="e.g. Can't wait! I'll wear that outfit you love... 😘"
                rows={2}
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  color: "#fff",
                  fontSize: "12px",
                  lineHeight: "1.4",
                  outline: "none",
                  resize: "none",
                  height: "44px"
                }}
              />
            </div>

            {dateStatusMessage && (
              <p style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: 600, animation: "float-up-intro 0.2s ease", margin: 0 }}>
                {dateStatusMessage}
              </p>
            )}

            {isConfirmed ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                {!preview && buildGoogleCalendarUrl() && (
                  <a
                    href={buildGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1.5px solid var(--accent-gold)",
                      backgroundColor: "rgba(226, 184, 87, 0.1)",
                      color: "var(--accent-gold)",
                      fontWeight: "bold",
                      fontSize: "13px",
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 15px rgba(226, 184, 87, 0.15)",
                      boxSizing: "border-box"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.25)";
                      e.currentTarget.style.transform = "scale(1.01)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(226, 184, 87, 0.1)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    📅 Sync to Google Calendar
                  </a>
                )}
                <button
                  type="button"
                  onClick={onComplete}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#2ec4b6",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(46, 196, 182, 0.25)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  ✓ RSVP Sealed! Continue ➔
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRsvpConfirm}
                style={{
                  width: "100%",
                  padding: "10px",
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
            )}
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

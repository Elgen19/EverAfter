"use client";

import React, { useState } from "react";

interface DateInviteCreatorProps {
  dateInviteEnabled: boolean;
  setDateInviteEnabled: (val: boolean) => void;
  dateInviteQuestion: string;
  setDateInviteQuestion: (val: string) => void;
  dateInviteDate: string;
  setDateInviteDate: (val: string) => void;
  dateInviteTime: string;
  setDateInviteTime: (val: string) => void;
  dateInvitePlace: string;
  setDateInvitePlace: (val: string) => void;
  dateInviteMapLink: string;
  setDateInviteMapLink: (val: string) => void;
  dateInviteEmail: string;
  setDateInviteEmail: (val: string) => void;
  dateInviteConfirmed: boolean;
  setDateInviteConfirmed: (val: boolean) => void;
  sender: string;
  recipient: string;
  showAlert?: (title: string, message: string) => void;
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
        "June", "July", "August", "September", "October", "November", "December",
        "January", "February", "March", "April", "May"
      ];
      // Note: standard JS month names mapping (making it robust for formatting preview)
      const standardMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = standardMonths[monthIndex] || "";
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

export default function DateInviteCreator({
  dateInviteEnabled,
  setDateInviteEnabled,
  dateInviteQuestion,
  setDateInviteQuestion,
  dateInviteDate,
  setDateInviteDate,
  dateInviteTime,
  setDateInviteTime,
  dateInvitePlace,
  setDateInvitePlace,
  dateInviteMapLink,
  setDateInviteMapLink,
  dateInviteEmail,
  setDateInviteEmail,
  dateInviteConfirmed,
  setDateInviteConfirmed,
  sender,
  recipient,
  showAlert
}: DateInviteCreatorProps) {
  const [showMapsHelpModal, setShowMapsHelpModal] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;

  const validateDateAndTime = (date: string, time: string) => {
    if (!date) {
      setDateTimeError("");
      return true;
    }

    if (date < localTodayStr) {
      setDateTimeError("The invitation date cannot be in the past.");
      return false;
    }

    if (time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const minAllowedDateTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      if (selectedDateTime < minAllowedDateTime) {
        if (date === localTodayStr) {
          setDateTimeError("The proposed time must be at least 1 hour in the future to allow ample preparation time.");
        } else {
          setDateTimeError("The proposed date and time must be at least 1 hour in the future.");
        }
        return false;
      }
    }

    setDateTimeError("");
    return true;
  };

  const handleDateChange = (val: string) => {
    setDateInviteDate(val);
    validateDateAndTime(val, dateInviteTime);
  };

  const handleTimeChange = (val: string) => {
    setDateInviteTime(val);
    validateDateAndTime(dateInviteDate, val);
  };

  const handleEmailChange = (val: string) => {
    setDateInviteEmail(val);
    if (!val) {
      setEmailError("");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  };

  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={dateInviteEnabled} 
            onChange={(e) => {
              setDateInviteEnabled(e.target.checked);
              if (!e.target.checked) setDateInviteConfirmed(false);
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          🌹 Add Date Invitation
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ask them out dynamically</span>
      </div>

      {dateInviteEnabled && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px", paddingLeft: "20px", borderLeft: "2px solid var(--accent-rose)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Invitation Prompt</label>
            <input 
              type="text"
              disabled={dateInviteConfirmed}
              value={dateInviteQuestion}
              onChange={(e) => setDateInviteQuestion(e.target.value)}
              placeholder="e.g. Will you go on a date with me? 🌹"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: dateInviteConfirmed ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Proposed Date</label>
              <input 
                type="date"
                disabled={dateInviteConfirmed}
                value={dateInviteDate}
                min={localTodayStr}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  opacity: dateInviteConfirmed ? 0.6 : 1
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Proposed Time</label>
              <input 
                type="time"
                disabled={dateInviteConfirmed}
                value={dateInviteTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  opacity: dateInviteConfirmed ? 0.6 : 1
                }}
              />
            </div>
          </div>

          {dateTimeError && (
            <div style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>
              ⚠️ {dateTimeError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Proposed Place / Location</label>
            <input 
              type="text"
              disabled={dateInviteConfirmed}
              value={dateInvitePlace}
              onChange={(e) => setDateInvitePlace(e.target.value)}
              placeholder="e.g. Secret Garden Cafe"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: dateInviteConfirmed ? 0.6 : 1
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Google Maps Link</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="url"
                disabled={dateInviteConfirmed}
                value={dateInviteMapLink}
                onChange={(e) => setDateInviteMapLink(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  opacity: dateInviteConfirmed ? 0.6 : 1
                }}
              />
              <button
                type="button"
                disabled={dateInviteConfirmed}
                onClick={() => {
                  if (!dateInvitePlace.trim()) {
                    if (showAlert) {
                      showAlert("Location Required", "Please specify a Proposed Place / Location so we can help you find and link it on Google Maps.");
                    } else {
                      alert("Please fill in the Proposed Place / Location first so we can search for it!");
                    }
                    return;
                  }
                  setShowMapsHelpModal(true);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "var(--accent-purple)",
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  opacity: dateInviteConfirmed ? 0.6 : 1,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🗺️ Search & Link
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recipient Email Address (for RSVP copy)</label>
            <input 
              type="email"
              disabled={dateInviteConfirmed}
              value={dateInviteEmail}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="beloved@example.com"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: emailError ? "1.5px solid var(--accent-rose)" : "1px solid var(--border-card)",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                opacity: dateInviteConfirmed ? 0.6 : 1
              }}
            />
            <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", lineHeight: "1.4" }}>
              💡 Providing the recipient's email address sends them a copy of the RSVP and automatically sets up a Google Calendar reminder if they use Gmail.
            </span>
            {emailError && (
              <span style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>
                ⚠️ {emailError}
              </span>
            )}
          </div>

          {/* Preview inside the accordion */}
          <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "bold" }}>INVITATION PREVIEW</span>
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
                overflow: "hidden",
                marginTop: "8px"
              }}
            >
              {/* Top Section */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: "1 1 auto" }}>
                {/* Ticket Header */}
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
                    fontFamily: "'Allura', 'Sacramento', 'Great Vibes', 'Dancing Script', cursive"
                  }}>
                    Thank you for going on a date with me
                  </h2>
                </div>

                {/* Ticket Body / Proposal Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left", fontSize: "13px", padding: "0 6px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Host</span>
                      <strong style={{ color: "#fff" }}>{sender || "Sender Name"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block" }}>Guest</span>
                      <strong style={{ color: "#fff" }}>{recipient || "Recipient Name"}</strong>
                    </div>
                  </div>

                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Place / Location</span>
                    <strong style={{ color: "var(--accent-gold)", fontSize: "13px", display: "inline-block" }}>
                      📍 {dateInvitePlace || "Proposed Place"}
                    </strong>
                  </div>

                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>Proposed Date & Time</span>
                    <strong style={{ color: "var(--accent-rose)", fontSize: "13px" }}>
                      ⏰ {formatDateInvite(dateInviteDate, dateInviteTime) || "Proposed Date & Time"}
                    </strong>
                  </div>

                  {dateInviteMapLink && (
                    <div style={{ textAlign: "center", marginTop: "2px" }}>
                      <span
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
                          letterSpacing: "1px"
                        }}
                      >
                        🗺️ VIEW PLACE
                      </span>
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

              {/* Bottom Ticket Stub: Notes & Action */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "0 0 auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                  <label style={{ fontSize: "10px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: 700 }}>Add a ticket message...</label>
                  <textarea
                    disabled
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
                      height: "44px",
                      cursor: "not-allowed"
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled
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
                    cursor: "not-allowed",
                    opacity: 0.8
                  }}
                >
                  Confirm RSVP & Seal Pass 🎟️
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!dateInviteQuestion.trim()) {
                if (showAlert) {
                  showAlert("Invitation Prompt Required", "Don't be shy, sweetheart! Please write a question to invite them on your dream date.");
                } else {
                  alert("Please fill in invitation prompt before confirming.");
                }
                return;
              }
              if (!dateInviteDate) {
                if (showAlert) {
                  showAlert("Proposed Date Required", "Please specify a date for your invitation before confirming.");
                } else {
                  alert("Please select a proposed date.");
                }
                return;
              }
              if (!dateInviteTime) {
                if (showAlert) {
                  showAlert("Proposed Time Required", "Please specify a time for your invitation before confirming.");
                } else {
                  alert("Please select a proposed time.");
                }
                return;
              }

              // Re-run validation checks synchronously
              const isDateTimeValid = validateDateAndTime(dateInviteDate, dateInviteTime);
              if (!isDateTimeValid) {
                let currentError = "";
                if (dateInviteDate < localTodayStr) {
                  currentError = "The invitation date cannot be in the past.";
                } else {
                  const selectedDateTime = new Date(`${dateInviteDate}T${dateInviteTime}`);
                  const minAllowedDateTime = new Date(now.getTime() + 60 * 60 * 1000);
                  if (selectedDateTime < minAllowedDateTime) {
                    if (dateInviteDate === localTodayStr) {
                      currentError = "The proposed time must be at least 1 hour in the future to allow ample preparation time.";
                    } else {
                      currentError = "The proposed date and time must be at least 1 hour in the future.";
                    }
                  }
                }

                if (showAlert) {
                  showAlert("Invalid Date or Time", currentError || "Please verify your proposed date and time details.");
                } else {
                  alert(currentError || "Please verify your proposed date and time details.");
                }
                return;
              }

              if (emailError) {
                if (showAlert) {
                  showAlert("Valid Email Required", "Please resolve the recipient email address validation error before confirming your invitation.");
                } else {
                  alert("Please resolve recipient email validation error first.");
                }
                return;
              }
              setDateInviteConfirmed(!dateInviteConfirmed);
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: dateInviteConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {dateInviteConfirmed ? "✓ Invitation Confirmed! (Click to Edit)" : "Confirm Invitation 💖"}
          </button>
        </div>
      )}

      {/* Google Maps Link Assistant Modal */}
      {showMapsHelpModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: "rgba(11, 7, 17, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="glass animate-reveal"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "40px 30px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setShowMapsHelpModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                opacity: 0.6,
                transition: "opacity 0.2s, background-color 0.2s",
              }}
              title="Close Modal"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>🗺️</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Google Maps Link Assistant</h2>
            </div>
            
            <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: "1.6" }}>
              Follow these simple steps to find and link the location <strong style={{ color: "var(--accent-gold)" }}>"{dateInvitePlace}"</strong> on Google Maps:
            </p>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ backgroundColor: "var(--accent-purple)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, marginTop: "2px" }}>1</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Click the **Search on Google Maps** button below. We will open the search page in a new tab.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
                <span style={{ backgroundColor: "var(--accent-purple)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, marginTop: "2px" }}>2</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>In the new tab, select your location, then click the **Share** button on its detail panel.</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
                <span style={{ backgroundColor: "var(--accent-purple)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, marginTop: "2px" }}>3</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Under "Send a link", click **Copy link** (looks like `https://maps.app.goo.gl/...` or `https://goo.gl/...`).</span>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "10px" }}>
                <span style={{ backgroundColor: "var(--accent-purple)", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0, marginTop: "2px" }}>4</span>
                <span style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5" }}>Return here and paste the copied link in the **Google Maps Link** field.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dateInvitePlace)}`;
                window.open(searchUrl, "_blank");
                setShowMapsHelpModal(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: "var(--accent-rose)",
                backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "center",
                boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.01)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 75, 114, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 75, 114, 0.3)";
              }}
            >
              Search on Google Maps 🗺️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

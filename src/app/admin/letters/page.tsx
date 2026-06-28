"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, logFirebaseEvent } from "@/utils/firebase";

export default function LettersMonitor() {
  const [letters, setLetters] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Selected letter for detail modal
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);

  // Fetch all letters
  const fetchLetters = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "letters"));
      const lettersList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setLetters(lettersList);
    } catch (err) {
      console.error("Error fetching letters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // Delete letters
  const handleDeleteLetter = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this letter? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "letters", id));
      logFirebaseEvent("admin_delete_letter", { letterId: id });
      setLetters((prev) => prev.filter((letter) => letter.id !== id));
      setSelectedLetter(null);
    } catch (err) {
      console.error("Error deleting letter:", err);
    }
  };

  // Analytics helper calculations
  const totalLetters = letters.length;
  const totalOpened = letters.filter((l) => l.isOpened).length;
  const totalSealed = totalLetters - totalOpened;

  // Find most popular theme
  const getPopularTheme = () => {
    if (letters.length === 0) return "N/A";
    const themes: Record<string, number> = {};
    letters.forEach((l) => {
      const style = l.letterStyle || "default";
      themes[style] = (themes[style] || 0) + 1;
    });
    let popular = "default";
    let max = 0;
    Object.entries(themes).forEach(([name, count]) => {
      if (count > max) {
        max = count;
        popular = name;
      }
    });
    return popular;
  };

  // Filter letters list
  const filteredLetters = letters.filter((letter) => {
    const term = searchQuery.toLowerCase();
    const title = (letter.title || "").toLowerCase();
    const recipient = (letter.recipientEmail || "").toLowerCase();
    const userEmail = (letter.userEmail || "").toLowerCase();
    const userId = (letter.userId || "").toLowerCase();
    
    const matchesSearch = title.includes(term) || recipient.includes(term) || userEmail.includes(term) || userId.includes(term);
    const matchesTheme = themeFilter === "all" || letter.letterStyle === themeFilter;
    
    let matchesStatus = true;
    if (statusFilter === "opened") matchesStatus = letter.isOpened === true;
    else if (statusFilter === "sealed") matchesStatus = letter.isOpened !== true;
    else if (statusFilter === "timelocked") matchesStatus = letter.isTimeLocked === true;

    return matchesSearch && matchesTheme && matchesStatus;
  });

  // Extract unique themes from database
  const uniqueThemes = Array.from(new Set(letters.map((l) => l.letterStyle || "default")));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0 }}>
          Letters Monitor
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Monitor love letters generation velocity, themes distribution, and security.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        <div style={statCardStyle("linear-gradient(135deg, rgba(100, 31, 63, 0.4), rgba(40, 15, 30, 0.4))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Letters Generated</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#fff" }}>{totalLetters}</h2>
        </div>
        <div style={statCardStyle("linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(10, 80, 50, 0.15))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Opened Letters</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#10b981" }}>{totalOpened}</h2>
        </div>
        <div style={statCardStyle("linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(100, 20, 20, 0.12))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Sealed Letters</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#ef4444" }}>{totalSealed}</h2>
        </div>
        <div style={statCardStyle("linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(50, 30, 100, 0.15))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Popular Theme</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#8b5cf6", textTransform: "capitalize" }}>
            {getPopularTheme()}
          </h2>
        </div>
      </div>

      {/* Directory Filters */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "rgba(25, 12, 22, 0.4)",
        border: "1px solid rgba(255, 75, 114, 0.15)"
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search by title, sender email or recipient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={inputStyle}
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Theme Filter */}
          <select 
            value={themeFilter} 
            onChange={(e) => setThemeFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Themes</option>
            {uniqueThemes.map((theme) => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Statuses</option>
            <option value="opened">Opened</option>
            <option value="sealed">Sealed</option>
            <option value="timelocked">Time Locked</option>
          </select>
        </div>
      </div>

      {/* Letters Table */}
      <div style={{
        backgroundColor: "rgba(25, 12, 22, 0.4)",
        border: "1px solid rgba(255, 75, 114, 0.15)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }}>
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            Retrieving letter index databases...
          </div>
        ) : filteredLetters.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            No letters matched the filtered selection.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(255, 75, 114, 0.05)", borderBottom: "1px solid rgba(255, 75, 114, 0.15)" }}>
                  <th style={{ padding: "16px 20px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Letter Title</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Sender (Email/UID)</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Recipient</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Theme</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Features</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "16px 20px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "#fff" }}>
                      {letter.title || "Untitled Love Letter"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-muted)" }}>
                      {letter.userEmail || letter.userId || "Guest"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-muted)" }}>
                      {letter.recipientEmail || "Unspecified"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{ textTransform: "capitalize", color: "var(--accent-rose)" }}>
                        {letter.letterStyle || "Default"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {letter.isTimeLocked && <span title="Time Locked" style={{ fontSize: "14px" }}>⏰</span>}
                        {letter.quizQuestions && letter.quizQuestions.length > 0 && <span title="Has Quiz" style={{ fontSize: "14px" }}>❓</span>}
                        {letter.polaroids && letter.polaroids.length > 0 && <span title="Has Photos" style={{ fontSize: "14px" }}>🖼️</span>}
                        {letter.hasAudio && <span title="Has Voice Recording" style={{ fontSize: "14px" }}>🎙️</span>}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontWeight: 600,
                        backgroundColor: letter.isOpened ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
                        color: letter.isOpened ? "#10b981" : "#ef4444"
                      }}>
                        {letter.isOpened ? "Opened" : "Sealed"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button 
                        onClick={() => setSelectedLetter(letter)}
                        style={btnSecondaryStyle}
                      >
                        Inspect 🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Letter Detail Modal */}
      {selectedLetter && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(5px)",
          padding: "20px"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "600px",
            backgroundColor: "rgba(25, 12, 22, 0.95)",
            border: "1.5px solid rgba(255, 75, 114, 0.25)",
            borderRadius: "20px",
            padding: "32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            color: "#fff"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
                  {selectedLetter.title || "Untitled Love Letter"}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>ID: {selectedLetter.id}</span>
              </div>
              <button 
                onClick={() => setSelectedLetter(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {/* Letter Metadata */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.03)"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>SENDER UID</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedLetter.userId || "Guest Link"}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>RECIPIENT EMAIL</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedLetter.recipientEmail || "Not Specified"}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CREATION TIME</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedLetter.createdAt ? new Date(selectedLetter.createdAt).toLocaleString() : "Unknown"}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>VISUAL THEME</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0", textTransform: "capitalize", color: "var(--accent-rose)", fontWeight: 600 }}>
                  {selectedLetter.letterStyle || "Default"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>MUSIC TRACK</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedLetter.musicTrack || "None attached"}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>SEAL COLOR / WAX</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedLetter.sealColor || "#bf1515"}</p>
              </div>
            </div>

            {/* Configured Features checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Active Core Components</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={badgeItemStyle(!!selectedLetter.isTimeLocked)}>
                  <span>⏰ Time-Lock Release</span>
                  <span>{selectedLetter.isTimeLocked ? "ON" : "OFF"}</span>
                </div>
                <div style={badgeItemStyle(!!(selectedLetter.quizQuestions && selectedLetter.quizQuestions.length > 0))}>
                  <span>❓ Interactive Quiz</span>
                  <span>{selectedLetter.quizQuestions && selectedLetter.quizQuestions.length > 0 ? "ON" : "OFF"}</span>
                </div>
                <div style={badgeItemStyle(!!(selectedLetter.polaroids && selectedLetter.polaroids.length > 0))}>
                  <span>🖼️ Polaroid Album</span>
                  <span>{selectedLetter.polaroids && selectedLetter.polaroids.length > 0 ? "ON" : "OFF"}</span>
                </div>
                <div style={badgeItemStyle(!!selectedLetter.hasAudio)}>
                  <span>🎙️ Voice Message</span>
                  <span>{selectedLetter.hasAudio ? "ON" : "OFF"}</span>
                </div>
              </div>
              
              {selectedLetter.isTimeLocked && selectedLetter.unlockDate && (
                <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(255, 75, 114, 0.05)", border: "1px solid rgba(255, 75, 114, 0.15)", fontSize: "12px", marginTop: "4px" }}>
                  🔓 Scheduled to unlock on: <span style={{ color: "var(--accent-rose)", fontWeight: 600 }}>{new Date(selectedLetter.unlockDate).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "20px"
            }}>
              {/* Copy URL */}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/letter?code=${selectedLetter.link}`;
                  navigator.clipboard.writeText(url);
                  alert("Letter url copied to clipboard!");
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Copy Link 🔗
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDeleteLetter(selectedLetter.id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                Delete Letter 🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const statCardStyle = (gradient: string) => ({
  background: gradient,
  borderRadius: "12px",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  padding: "16px 20px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
} as React.CSSProperties);

const inputStyle = {
  minWidth: "300px",
  padding: "12px 16px",
  borderRadius: "8px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1.5px solid rgba(255, 75, 114, 0.15)",
  color: "#fff",
  fontSize: "14px",
  outline: "none"
} as React.CSSProperties;

const selectStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  backgroundColor: "rgba(25, 12, 22, 0.9)",
  border: "1.5px solid rgba(255, 75, 114, 0.15)",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
  cursor: "pointer"
} as React.CSSProperties;

const btnSecondaryStyle = {
  padding: "6px 14px",
  borderRadius: "6px",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s"
} as React.CSSProperties;

const badgeItemStyle = (active: boolean) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: "6px",
  backgroundColor: active ? "rgba(255, 75, 114, 0.1)" : "rgba(255, 255, 255, 0.02)",
  border: active ? "1.5px solid rgba(255, 75, 114, 0.2)" : "1px solid rgba(255, 255, 255, 0.04)",
  fontSize: "12px",
  fontWeight: 600,
  color: active ? "#fff" : "rgba(255, 255, 255, 0.4)"
} as React.CSSProperties);

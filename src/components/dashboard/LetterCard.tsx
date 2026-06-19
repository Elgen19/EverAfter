"use client";

import React from "react";
import Link from "next/link";

export interface SavedLetter {
  id?: string;
  recipient: string;
  sender: string;
  title: string;
  theme: string;
  link: string;
  timestamp: number;
  read?: boolean;
  readAt?: number | null;
  sendLaterDate?: string | null;
  envelopeStyle?: string | null;
  isWriteback?: boolean;
  dateInvite?: {
    enabled?: boolean;
    rsvpStatus?: "accepted" | "declined" | null;
    rsvpNotes?: string;
    rsvpTimestamp?: number;
  } | null;
  email?: string | null;
  emailSent?: boolean;
}

interface LetterCardProps {
  letter: SavedLetter;
  isSelected: boolean;
  onToggleSelect: (link: string, checked: boolean) => void;
  onOpenSendEmail: (letter: SavedLetter) => void;
  onDelete: (link: string) => void;
  onCopyLink: (link: string) => void;
  formatDate: (ts: number) => string;
  getThemeBadgeColor: (theme: string) => { bg: string; text: string };
}

// Reusable icon button style
const iconBtnBase: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "7px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.18s",
  flexShrink: 0,
  border: "1px solid transparent",
  background: "none",
  padding: 0,
};

export default function LetterCard({
  letter,
  isSelected,
  onToggleSelect,
  onOpenSendEmail,
  onDelete,
  onCopyLink,
  formatDate,
  getThemeBadgeColor,
}: LetterCardProps) {
  const badge = getThemeBadgeColor(letter.theme);

  return (
    <div
      className="dashboard-history-item"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-card)", transition: "all 0.2s", gap: "12px" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-card)"; e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"; }}
    >
      {/* Left: checkbox + info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
        <input type="checkbox" checked={isSelected} onChange={(e) => onToggleSelect(letter.link, e.target.checked)}
          style={{ accentColor: "var(--accent-rose)", cursor: "pointer", width: "16px", height: "16px", flexShrink: 0 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
          {/* Name */}
          <span style={{ fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", color: "var(--text-main)" }}>
            {letter.isWriteback ? `From: ${letter.sender}` : `To: ${letter.recipient}`}
          </span>

          {/* Badges — single wrapping row */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px 4px", flexWrap: "wrap", minWidth: 0 }}>
            {/* Theme */}
            <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: badge.bg, color: badge.text, padding: "2px 6px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {letter.theme}
            </span>
            {/* Envelope style */}
            <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(255,255,255,0.05)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {letter.envelopeStyle === "vintage-white" ? "✉ White" : letter.envelopeStyle === "celestial-blue" ? "✨ Starry" : "✉ Vintage"}
            </span>
            {/* Scheduled vs instant */}
            {!letter.isWriteback && (
              letter.sendLaterDate ? (
                <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(226,184,87,0.12)", color: "var(--accent-gold)", padding: "2px 6px", borderRadius: "8px", border: "1px solid rgba(226,184,87,0.2)", whiteSpace: "nowrap", flexShrink: 0 }} title={`Release: ${letter.sendLaterDate}`}>⏰ Scheduled</span>
              ) : (
                <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(16,185,129,0.08)", color: "#10b981", padding: "2px 6px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.15)", whiteSpace: "nowrap", flexShrink: 0 }}>✓ Instant</span>
              )
            )}
            {/* Writeback / read status */}
            {letter.isWriteback ? (
              <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(156,108,250,0.15)", color: "var(--accent-purple)", padding: "2px 6px", borderRadius: "8px", border: "1px solid rgba(156,108,250,0.2)", whiteSpace: "nowrap", flexShrink: 0 }}>✍️ Reply</span>
            ) : (
              letter.emailSent ? (
                letter.read ? (
                  <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 6px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }} title={`Opened on ${letter.readAt ? formatDate(letter.readAt) : "unknown"}`}>✓✓ Read</span>
                ) : (
                  <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(156,163,175,0.15)", color: "#9ca3af", padding: "2px 6px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0 }} title="Not opened yet">✓ Sent</span>
                )
              ) : (
                <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b", padding: "2px 6px", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.25)", whiteSpace: "nowrap", flexShrink: 0 }} title="Not emailed yet">✉️ Unsent</span>
              )
            )}
            {/* RSVP */}
            {letter.dateInvite?.enabled && (
              <span style={{
                fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", padding: "2px 6px", borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0,
                backgroundColor: letter.dateInvite.rsvpStatus === "accepted" ? "rgba(16,185,129,0.15)" : letter.dateInvite.rsvpStatus === "declined" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                color: letter.dateInvite.rsvpStatus === "accepted" ? "#10b981" : letter.dateInvite.rsvpStatus === "declined" ? "#ef4444" : "#f59e0b",
                border: letter.dateInvite.rsvpStatus === "accepted" ? "1px solid rgba(16,185,129,0.2)" : letter.dateInvite.rsvpStatus === "declined" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(245,158,11,0.2)"
              }} title={letter.dateInvite.rsvpStatus === "accepted" ? `Accepted! Notes: "${letter.dateInvite.rsvpNotes || "None"}"` : letter.dateInvite.rsvpStatus === "declined" ? "Declined." : "Waiting for response..."}>
                {letter.dateInvite.rsvpStatus === "accepted" ? "🌹 Accepted" : letter.dateInvite.rsvpStatus === "declined" ? "💔 Declined" : "⏳ Pending"}
              </span>
            )}
          </div>

          {/* Subtitle: title + date */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            {letter.title && !letter.title.toLowerCase().includes("secret letter") && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{letter.title}</span>
            )}
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", flexShrink: 0 }}>{formatDate(letter.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Right: icon-only action buttons */}
      <div className="dashboard-history-actions" style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>

        {/* Send email — only if not writeback and not yet emailed */}
        {!letter.isWriteback && !letter.emailSent && (
          <button onClick={() => onOpenSendEmail(letter)} title="Send via Email"
            style={{ ...iconBtnBase, backgroundColor: "rgba(255,75,114,0.12)", borderColor: "rgba(255,75,114,0.25)", color: "var(--accent-rose)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,75,114,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,75,114,0.12)"; e.currentTarget.style.transform = "none"; }}
          >
            {/* Paper plane / send */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        )}

        {/* Edit — only if not writeback */}
        {!letter.isWriteback && (
          <Link href={`/create?edit=${letter.id}`} title="Edit Letter"
            style={{ ...iconBtnBase, backgroundColor: "rgba(156,108,250,0.12)", borderColor: "rgba(156,108,250,0.25)", color: "var(--accent-purple)", textDecoration: "none" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(156,108,250,0.22)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(156,108,250,0.12)"; e.currentTarget.style.transform = "none"; }}
          >
            {/* Pencil */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </Link>
        )}

        {/* Preview / View */}
        <Link
          href={letter.isWriteback ? `/letter?d=${letter.link.split("?d=")[1]}` : `/letter?d=${letter.link.split("?d=")[1]}&preview=true`}
          target="_blank"
          title={letter.isWriteback ? "View Letter" : "Preview Letter"}
          style={{ ...iconBtnBase, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)", textDecoration: "none" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.transform = "none"; }}
        >
          {/* Eye */}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </Link>

        {/* Copy link */}
        <button onClick={() => onCopyLink(letter.link)} title="Copy Link"
          style={{ ...iconBtnBase, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.transform = "none"; }}
        >
          {/* Chain link */}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(letter.link)} title="Delete Letter"
          style={{ ...iconBtnBase, color: "rgba(255,75,114,0.4)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-rose)"; e.currentTarget.style.backgroundColor = "rgba(255,75,114,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,75,114,0.4)"; e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "none"; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}


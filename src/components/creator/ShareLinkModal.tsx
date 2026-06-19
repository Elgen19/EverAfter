"use client";

import React from "react";
import Link from "next/link";
import { db } from "@/utils/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface ShareLinkModalProps {
  shareUrl: string;
  copied: boolean;
  isWriteback: boolean;
  editId: string | null;
  envelopeStyle: string;
  sealColor: string;
  sender: string;
  recipient: string;
  title: string;
  email: string;
  emailToSend: string;
  setEmailToSend: (v: string) => void;
  emailStatus: string;
  sendingEmail: boolean;
  user: any;
  queryReplyToId: string;
  onCopyLink: () => void;
  onSendEmail: () => void;
}

export default function ShareLinkModal({
  shareUrl,
  copied,
  isWriteback,
  editId,
  envelopeStyle,
  sealColor,
  sender,
  recipient,
  title,
  email,
  emailToSend,
  setEmailToSend,
  emailStatus,
  sendingEmail,
  user,
  queryReplyToId,
  onCopyLink,
  onSendEmail,
}: ShareLinkModalProps) {
  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        backgroundColor: "rgba(11, 7, 17, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%", maxWidth: "520px", padding: "40px 30px",
          textAlign: "center", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "24px",
        }}
      >
        {/* Seal icon */}
        {["vintage-rose", "vintage-white", "celestial-blue"].includes(envelopeStyle) ? (
          <div
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              backgroundImage:
                envelopeStyle === "vintage-white" ? "url(/vintage_red_seal.png)" :
                envelopeStyle === "celestial-blue" ? "url(/vintage_heart_seal.jpg)" :
                "url(/vintage_rose_seal.png)",
              backgroundSize: "cover", backgroundPosition: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              transform: "rotate(-10deg)",
              WebkitMaskImage: "radial-gradient(circle, black 46%, transparent 48%)",
              maskImage: "radial-gradient(circle, black 46%, transparent 48%)",
            }}
          />
        ) : (
          <div
            style={{
              width: "80px", height: "80px", borderRadius: "50%",
              backgroundColor: sealColor, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "36px", color: "rgba(0,0,0,0.35)",
              boxShadow: `0 8px 24px ${sealColor}66, inset 0 2px 4px rgba(255,255,255,0.2)`,
              transform: "rotate(-10deg)",
            }}
          >
            ❤
          </div>
        )}

        {editId ? (
          <>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "normal", fontFamily: "var(--font-cursive)", color: "var(--accent-rose)", marginBottom: "8px" }}>
                Changes Saved!
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                Your love letter has been successfully updated with all customizations and saved back to your dashboard.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
              <Link href={isWriteback ? `/mailbox?ref=${queryReplyToId || editId || ""}` : "/dashboard"} style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: "var(--accent-purple)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)" }}>
                {isWriteback ? "Return to Mailbox" : "Back to Dashboard"}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "normal", fontFamily: "var(--font-cursive)", color: "var(--accent-rose)", marginBottom: "8px" }}>
                {isWriteback ? "Write Back Sealed!" : "Letter Sealed!"}
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                {isWriteback
                  ? "Your writeback has been sent and the sender will receive the writeback. You can also copy the link below to share it manually, or dispatch it directly to their email."
                  : "Your love letter has been converted into a magical, portable link containing all customizations. Send it to your special someone!"}
              </p>
            </div>

            {/* Share link row */}
            <div style={{ width: "100%", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <input
                type="text" readOnly value={shareUrl}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "13px", outline: "none", width: "100%", textOverflow: "ellipsis" }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={onCopyLink}
                style={{ background: copied ? "#2ec4b6" : "var(--accent-rose)", border: "none", borderRadius: "6px", padding: "8px 16px", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Email dispatch */}
            <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-card)", paddingTop: "16px", width: "100%", textAlign: "left" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "bold", textTransform: "uppercase" }}>
                {isWriteback ? "Send Write Back via Email ✉️" : "Send Letter via Email ✉️"}
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email" placeholder="partner@example.com"
                  value={emailToSend} onChange={(e) => setEmailToSend(e.target.value)}
                  style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none" }}
                />
                <button
                  type="button" onClick={onSendEmail}
                  disabled={sendingEmail || !emailToSend.trim()}
                  style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "var(--accent-purple)", border: "none", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: "pointer", opacity: (sendingEmail || !emailToSend.trim()) ? 0.6 : 1, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-rose)"; }}
                  onMouseLeave={(e) => { if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-purple)"; }}
                >
                  {sendingEmail ? "Sending..." : "Send"}
                </button>
              </div>
              {emailStatus && (
                <p style={{ fontSize: "11px", color: emailStatus.includes("successfully") ? "#10b981" : "var(--accent-rose)", marginTop: "6px", fontWeight: 500 }}>
                  {emailStatus}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "12px" }}>
              {isWriteback ? (
                <Link href={queryReplyToId ? `/mailbox?ref=${queryReplyToId}` : "/"} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "transparent", color: "var(--text-main)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Return to Mailbox
                </Link>
              ) : (
                <Link href={user ? "/dashboard" : "/"} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "transparent", color: "var(--text-main)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user ? "Back to Dashboard" : "Go to Homepage"}
                </Link>
              )}
              <Link
                href={`${shareUrl.replace(typeof window !== "undefined" ? window.location.origin : "", "")}&preview=true`}
                target="_blank"
                style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: "var(--accent-purple)", color: "#fff", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none", boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)" }}
              >
                Preview Letter
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

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
  const getEncodedParam = () => {
    try {
      if (typeof window !== "undefined") {
        const urlObj = new URL(shareUrl, window.location.origin);
        return urlObj.searchParams.get("d") || "";
      }
      if (shareUrl.includes("?d=")) {
        return shareUrl.split("?d=")[1]?.split("&")[0] || "";
      }
      return "";
    } catch {
      if (shareUrl.includes("?d=")) {
        return shareUrl.split("?d=")[1]?.split("&")[0] || "";
      }
      return "";
    }
  };

  const dParam = getEncodedParam();
  const hasParentLetter = !!(queryReplyToId && queryReplyToId !== "undefined" && queryReplyToId !== "null");

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        backgroundColor: "rgba(11, 7, 17, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex", justifyContent: "center",
        padding: "40px 20px",
        overflowY: "auto",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%", maxWidth: "490px", padding: "24px 28px",
          textAlign: "center", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "16px",
          margin: "auto 0",
        }}
      >
        {/* Seal icon */}
        {["vintage-rose", "vintage-white", "celestial-blue"].includes(envelopeStyle) ? (
          <div
            style={{
              width: "64px", height: "64px", borderRadius: "50%",
              backgroundImage:
                envelopeStyle === "vintage-white" ? "url(/vintage_red_seal.png)" :
                envelopeStyle === "celestial-blue" ? "url(/vintage_heart_seal.jpg)" :
                "url(/vintage_rose_seal.png)",
              backgroundSize: "cover", backgroundPosition: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              transform: "rotate(-10deg)",
              WebkitMaskImage: "radial-gradient(circle, black 46%, transparent 48%)",
              maskImage: "radial-gradient(circle, black 46%, transparent 48%)",
            }}
          />
        ) : (
          <div
            style={{
              width: "64px", height: "64px", borderRadius: "50%",
              backgroundColor: sealColor, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "28px", color: "rgba(0,0,0,0.35)",
              boxShadow: `0 6px 16px ${sealColor}66, inset 0 2px 4px rgba(255,255,255,0.2)`,
              transform: "rotate(-10deg)",
            }}
          >
            ❤
          </div>
        )}

        {editId ? (
          <>
            <div>
              <h2 style={{ fontSize: "26px", fontWeight: "normal", fontFamily: "var(--font-cursive)", color: "var(--accent-rose)", marginBottom: "6px" }}>
                Changes Saved!
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.45", margin: 0 }}>
                Your love letter has been successfully updated with all customizations and saved back to your dashboard.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "6px" }}>
              <Link href={isWriteback ? `/mailbox?ref=${queryReplyToId || editId || ""}` : "/dashboard"} style={{ flex: 1, padding: "12px", borderRadius: "8px", backgroundColor: "var(--accent-purple)", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)" }}>
                {isWriteback ? "Return to Mailbox" : "Back to Dashboard"}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ fontSize: "26px", fontWeight: "normal", fontFamily: "var(--font-cursive)", color: "var(--accent-rose)", marginBottom: "6px" }}>
                {isWriteback ? "Write Back Sealed!" : "Letter Sealed!"}
              </h2>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.45", margin: 0 }}>
                {isWriteback
                  ? (hasParentLetter
                      ? "Your writeback has been sent. Copy the link below to share it manually, or dispatch it directly to their email."
                      : "Your reply has been sealed! Since the original letter was created by a guest, you must copy the link below or send it via email to share your reply directly with them.")
                  : "Your love letter has been converted into a magical, portable link containing all customizations. Send it to your partner!"}
              </p>
            </div>

            {!user && (
              <div
                style={{
                  background: "rgba(255, 75, 114, 0.06)",
                  border: "1px dashed rgba(255, 75, 114, 0.3)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  textAlign: "left",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  boxShadow: "0 2px 10px rgba(255, 75, 114, 0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "15px" }}>⚠️</span>
                  <span style={{ fontWeight: "bold", fontSize: "12px", color: "#ff4b72" }}>
                    Temporary Guest Link (Expires in 24 Hours)
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                  This link will expire in 24 hours. If you close this tab without copying it, your draft is lost forever.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Save permanently?
                  </span>
                  <Link
                    href={`/login?redirect=/create&d=${dParam}`}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      background: "var(--accent-rose)",
                      backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "10.5px",
                      textDecoration: "none",
                      boxShadow: "0 2px 6px rgba(255, 75, 114, 0.2)",
                      transition: "transform 0.1s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                  >
                    Save to Free Account
                  </Link>
                </div>
              </div>
            )}

            {/* Share link row */}
            <div style={{ width: "100%", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <input
                type="text" readOnly value={shareUrl}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "12.5px", outline: "none", width: "100%", textOverflow: "ellipsis" }}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={onCopyLink}
                style={{ background: copied ? "#2ec4b6" : "var(--accent-rose)", border: "none", borderRadius: "6px", padding: "6px 12px", color: "#fff", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Email dispatch */}
            <div style={{ marginTop: "6px", borderTop: "1px solid var(--border-card)", paddingTop: "10px", width: "100%", textAlign: "left" }}>
              <label style={{ fontSize: "10.5px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: "bold", textTransform: "uppercase" }}>
                {isWriteback ? "Send Write Back via Email ✉️" : "Send Letter via Email ✉️"}
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email" placeholder="partner@example.com"
                  value={emailToSend} onChange={(e) => setEmailToSend(e.target.value)}
                  style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid var(--border-card)", borderRadius: "6px", padding: "7px 12px", color: "#fff", fontSize: "12.5px", outline: "none" }}
                />
                <button
                  type="button" onClick={onSendEmail}
                  disabled={sendingEmail || !emailToSend.trim()}
                  style={{ padding: "7px 12px", borderRadius: "6px", backgroundColor: "var(--accent-purple)", border: "none", color: "#fff", fontWeight: 600, fontSize: "11.5px", cursor: "pointer", opacity: (sendingEmail || !emailToSend.trim()) ? 0.6 : 1, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-rose)"; }}
                  onMouseLeave={(e) => { if (!sendingEmail && emailToSend.trim()) e.currentTarget.style.backgroundColor = "var(--accent-purple)"; }}
                >
                  {sendingEmail ? "Sending..." : "Send"}
                </button>
              </div>
              {emailStatus && (
                <p style={{ fontSize: "10.5px", color: emailStatus.includes("successfully") ? "#10b981" : "var(--accent-rose)", marginTop: "4px", fontWeight: 500 }}>
                  {emailStatus}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "6px" }}>
              {isWriteback && hasParentLetter ? (
                <Link href={`/mailbox?ref=${queryReplyToId}`} style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "transparent", color: "var(--text-main)", fontSize: "12.5px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  Return to Mailbox
                </Link>
              ) : (
                <Link href={user ? "/dashboard" : "/"} style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "transparent", color: "var(--text-main)", fontSize: "12.5px", fontWeight: 500, cursor: "pointer", transition: "background-color 0.2s", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {user ? "Back to Dashboard" : "Go to Homepage"}
                </Link>
              )}
              <Link
                href={`${shareUrl.replace(typeof window !== "undefined" ? window.location.origin : "", "")}&preview=true`}
                target="_blank"
                style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--accent-purple)", color: "#fff", fontSize: "12.5px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", textDecoration: "none", boxShadow: "0 4px 12px rgba(156, 108, 250, 0.25)" }}
              >
                Preview Letter
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

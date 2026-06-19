"use client";

import React from "react";

interface DashboardModalsProps {
  // Alert modal
  alertOpen: boolean;
  alertTitle: string;
  alertMessage: string;
  onCloseAlert: () => void;
  // Confirm modal
  confirmOpen: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmBtnText: string;
  onConfirm: () => void;
  onCancelConfirm: () => void;
  // Send email modal
  sendModalOpen: boolean;
  sendEmailInput: string;
  setSendEmailInput: (v: string) => void;
  sendEmailStatus: string;
  sendingEmail: boolean;
  onSubmitSendEmail: (e: React.FormEvent) => void;
  onCloseSendModal: () => void;
}

export default function DashboardModals({
  alertOpen, alertTitle, alertMessage, onCloseAlert,
  confirmOpen, confirmTitle, confirmMessage, confirmBtnText, onConfirm, onCancelConfirm,
  sendModalOpen, sendEmailInput, setSendEmailInput, sendEmailStatus, sendingEmail, onSubmitSendEmail, onCloseSendModal,
}: DashboardModalsProps) {
  const overlayStyle: React.CSSProperties = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000, backgroundColor: "rgba(11, 7, 17, 0.75)",
    backdropFilter: "blur(12px)", display: "flex",
    alignItems: "center", justifyContent: "center", padding: "20px",
  };
  const cardStyle: React.CSSProperties = {
    width: "100%", maxWidth: "460px", padding: "40px 30px",
    textAlign: "center", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "20px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)", borderRadius: "16px",
  };
  const titleStyle: React.CSSProperties = {
    fontSize: "22px", fontWeight: "normal",
    fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
    color: "var(--accent-rose)", marginBottom: "10px",
  };
  const primaryBtnStyle: React.CSSProperties = {
    padding: "10px 24px", borderRadius: "8px",
    backgroundColor: "var(--accent-rose)",
    backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
    border: "none", color: "#fff", fontWeight: 600, fontSize: "13px",
    cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 75, 114, 0.2)", transition: "all 0.2s",
  };
  const secondaryBtnStyle: React.CSSProperties = {
    padding: "10px 24px", borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid var(--border-card)", color: "var(--text-main)",
    fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s",
  };

  return (
    <>
      {/* Alert modal */}
      {alertOpen && (
        <div style={overlayStyle}>
          <div className="glass animate-reveal" style={cardStyle}>
            <span style={{ fontSize: "40px", animation: "heartbeat-survey 1.5s infinite" }}>💖</span>
            <div>
              <h3 style={titleStyle}>{alertTitle}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>{alertMessage}</p>
            </div>
            <button onClick={onCloseAlert} style={primaryBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >Close 💌</button>
          </div>
        </div>
      )}

      {/* Confirm (delete) modal */}
      {confirmOpen && (
        <div style={overlayStyle}>
          <div className="glass animate-reveal" style={cardStyle}>
            <span style={{ fontSize: "40px" }}>💔</span>
            <div>
              <h3 style={titleStyle}>{confirmTitle}</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>{confirmMessage}</p>
            </div>
            <div className="dashboard-modal-actions" style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
              <button onClick={onConfirm} style={primaryBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >{confirmBtnText}</button>
              <button onClick={onCancelConfirm} style={secondaryBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
              >Keep Safe 💖</button>
            </div>
          </div>
        </div>
      )}

      {/* Send email modal */}
      {sendModalOpen && (
        <div style={overlayStyle}>
          <form onSubmit={onSubmitSendEmail} className="glass animate-reveal" style={cardStyle}>
            <span style={{ fontSize: "40px" }}>✉️</span>
            <div>
              <h3 style={titleStyle}>Send Love Letter</h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>Send this love letter directly to your partner's email address.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", textAlign: "left" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Recipient's Email Address</label>
              <input type="email" value={sendEmailInput} onChange={(e) => setSendEmailInput(e.target.value)} placeholder="partner@example.com" required
                style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-card)", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none", width: "100%" }}
              />
            </div>
            {sendEmailStatus && (
              <p style={{ fontSize: "12px", color: sendEmailStatus.includes("successfully") ? "#10b981" : "var(--accent-rose)", fontWeight: 500, margin: 0 }}>
                {sendEmailStatus}
              </p>
            )}
            <div className="dashboard-modal-actions" style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
              <button type="submit" disabled={sendingEmail || !sendEmailInput.trim()}
                style={{ ...primaryBtnStyle, opacity: (sendingEmail || !sendEmailInput.trim()) ? 0.6 : 1 }}
                onMouseEnter={(e) => { if (!sendingEmail && sendEmailInput.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { if (!sendingEmail && sendEmailInput.trim()) e.currentTarget.style.transform = "none"; }}
              >{sendingEmail ? "Sending..." : "Send Letter 💌"}</button>
              <button type="button" onClick={onCloseSendModal} disabled={sendingEmail} style={secondaryBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

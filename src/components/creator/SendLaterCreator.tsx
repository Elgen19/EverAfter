"use client";

import React from "react";

interface SendLaterCreatorProps {
  sendLaterEnabled: boolean;
  setSendLaterEnabled: (val: boolean) => void;
  sendLaterDate: string;
  setSendLaterDate: (val: string) => void;
  sendLaterTime: string;
  setSendLaterTime: (val: string) => void;
}

export default function SendLaterCreator({
  sendLaterEnabled,
  setSendLaterEnabled,
  sendLaterDate,
  setSendLaterDate,
  sendLaterTime,
  setSendLaterTime
}: SendLaterCreatorProps) {
  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={sendLaterEnabled} 
            onChange={(e) => setSendLaterEnabled(e.target.checked)}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          ⏳ Send Later (Schedule Release)
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Locks letter until date</span>
      </div>

      {sendLaterEnabled && (
        <div className="creator-accordion-content">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Release Date</label>
              <input 
                type="date"
                required={sendLaterEnabled}
                value={sendLaterDate}
                onChange={(e) => setSendLaterDate(e.target.value)}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Release Time</label>
              <input 
                type="time"
                required={sendLaterEnabled}
                value={sendLaterTime}
                onChange={(e) => setSendLaterTime(e.target.value)}
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
            * When the recipient opens the link before this time, they will see a beautiful countdown lock screen instead of the letter.
          </p>
        </div>
      )}
    </div>
  );
}

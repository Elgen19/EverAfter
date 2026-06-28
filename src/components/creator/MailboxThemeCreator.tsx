"use client";

import React from "react";

interface MailboxThemeCreatorProps {
  mailboxThemeEnabled: boolean;
  setMailboxThemeEnabled: (val: boolean) => void;
  mailboxCustomBgUrl: string;
  setMailboxCustomBgUrl: (val: string) => void;
  mailboxCustomBgFile: File | null;
  setMailboxCustomBgFile: (val: File | null) => void;
  mailboxCustomBgFileName: string;
  setMailboxCustomBgFileName: (val: string) => void;
  mailboxMusicUrl: string;
  setMailboxMusicUrl: (val: string) => void;
  mailboxMusicFile: File | null;
  setMailboxMusicFile: (val: File | null) => void;
  mailboxMusicFileName: string;
  setMailboxMusicFileName: (val: string) => void;
  mailboxMusicAutoplay: boolean;
  setMailboxMusicAutoplay: (val: boolean) => void;
  mailboxStatement: string;
  setMailboxStatement: (val: string) => void;
  mailboxThemeConfirmed: boolean;
  setMailboxThemeConfirmed: (val: boolean) => void;
}

export default function MailboxThemeCreator({
  mailboxThemeEnabled,
  setMailboxThemeEnabled,
  mailboxCustomBgUrl,
  setMailboxCustomBgUrl,
  mailboxCustomBgFile,
  setMailboxCustomBgFile,
  mailboxCustomBgFileName,
  setMailboxCustomBgFileName,
  mailboxMusicUrl,
  setMailboxMusicUrl,
  mailboxMusicFile,
  setMailboxMusicFile,
  mailboxMusicFileName,
  setMailboxMusicFileName,
  mailboxMusicAutoplay,
  setMailboxMusicAutoplay,
  mailboxStatement,
  setMailboxStatement,
  mailboxThemeConfirmed,
  setMailboxThemeConfirmed
}: MailboxThemeCreatorProps) {
  return (
    <div style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--border-card)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={mailboxThemeEnabled} 
            onChange={(e) => {
              setMailboxThemeEnabled(e.target.checked);
              if (!e.target.checked) {
                setMailboxThemeConfirmed(false);
              }
            }}
            style={{ accentColor: "var(--accent-rose)" }}
          />
          📬 Customize Memory Chest
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Style their letters library</span>
      </div>

      {mailboxThemeEnabled && (
        <div className="creator-accordion-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Statement Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Custom Memory Chest Statement (Sub-header)</label>
            <input 
              type="text"
              disabled={mailboxThemeConfirmed}
              placeholder="e.g. A collection of letters for my favorite person in the world..."
              value={mailboxStatement}
              onChange={(e) => setMailboxStatement(e.target.value)}
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

          {/* Background Image Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Memory Chest Background Image</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input 
                type="file"
                accept="image/*"
                disabled={mailboxThemeConfirmed}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMailboxCustomBgFile(file);
                    setMailboxCustomBgFileName(file.name);
                    setMailboxCustomBgUrl(URL.createObjectURL(file));
                  }
                }}
                style={{ display: "none" }}
                id="mailbox-bg-uploader"
              />
              <button
                type="button"
                disabled={mailboxThemeConfirmed}
                onClick={() => document.getElementById("mailbox-bg-uploader")?.click()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-card)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
              >
                Upload BG Image
              </button>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {mailboxCustomBgFileName || (mailboxCustomBgUrl ? "Linked via URL" : "Using default sunset backdrop")}
              </span>
              {mailboxCustomBgUrl && !mailboxThemeConfirmed && (
                <button
                  type="button"
                  onClick={() => {
                    setMailboxCustomBgFile(null);
                    setMailboxCustomBgFileName("");
                    setMailboxCustomBgUrl("");
                  }}
                  style={{ background: "none", border: "none", color: "var(--accent-rose)", fontSize: "11px", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            <input 
              type="text"
              disabled={mailboxThemeConfirmed || !!mailboxCustomBgFile}
              placeholder="Or paste background image URL..."
              value={mailboxCustomBgFile ? "" : mailboxCustomBgUrl}
              onChange={(e) => setMailboxCustomBgUrl(e.target.value)}
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

          {/* Background Music Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Memory Chest Background Music</label>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input 
                type="file"
                accept="audio/*"
                disabled={mailboxThemeConfirmed}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMailboxMusicFile(file);
                    setMailboxMusicFileName(file.name);
                    setMailboxMusicUrl(URL.createObjectURL(file));
                  }
                }}
                style={{ display: "none" }}
                id="mailbox-music-uploader"
              />
              <button
                type="button"
                disabled={mailboxThemeConfirmed}
                onClick={() => document.getElementById("mailbox-music-uploader")?.click()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-card)",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
              >
                Upload BG Music
              </button>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {mailboxMusicFileName || (mailboxMusicUrl ? "Linked via URL" : "No background music")}
              </span>
              {mailboxMusicUrl && !mailboxThemeConfirmed && (
                <button
                  type="button"
                  onClick={() => {
                    setMailboxMusicFile(null);
                    setMailboxMusicFileName("");
                    setMailboxMusicUrl("");
                  }}
                  style={{ background: "none", border: "none", color: "var(--accent-rose)", fontSize: "11px", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            <input 
              type="text"
              disabled={mailboxThemeConfirmed || !!mailboxMusicFile}
              placeholder="Or paste background audio URL..."
              value={mailboxMusicFile ? "" : mailboxMusicUrl}
              onChange={(e) => setMailboxMusicUrl(e.target.value)}
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
            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              <input 
                type="checkbox"
                disabled={mailboxThemeConfirmed}
                checked={mailboxMusicAutoplay}
                onChange={(e) => setMailboxMusicAutoplay(e.target.checked)}
                style={{ accentColor: "var(--accent-rose)" }}
              />
              Autoplay music on opening the Memory Chest
            </label>
          </div>

          {/* Confirm Lock Button */}
          <button
            type="button"
            onClick={() => setMailboxThemeConfirmed(!mailboxThemeConfirmed)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              borderRadius: "8px",
              border: "none",
              background: mailboxThemeConfirmed ? "#2ec4b6" : "rgba(255, 75, 114, 0.2)",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {mailboxThemeConfirmed ? "✓ Memory Chest Customizations Sealed!" : "Seal Memory Chest Theme 💖"}
          </button>
        </div>
      )}
    </div>
  );
}

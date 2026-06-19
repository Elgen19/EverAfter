"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";

export default function ProfilePage() {
  const router = useRouter();
  const { user, recipient, loading, saveRecipientProfile, logout } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync recipient state to form inputs once loaded
  useEffect(() => {
    if (recipient) {
      setFirstName(recipient.firstName);
      setLastName(recipient.lastName);
      setEmail(recipient.email);
    }
  }, [recipient]);

  // Authenticate & Profile Check redirects
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!recipient) {
        // If they bypass it, send them to setup
        router.push("/recipient-setup");
      }
    }
  }, [user, recipient, loading, router]);

  const validateEmail = (val: string) => {
    setEmail(val);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || emailError) return;

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await saveRecipientProfile(firstName, lastName, email);
      setSuccess(true);
      setSaving(false);
      // Auto-hide success alert after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading || !user || !recipient) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <FloatingHearts />

      <main 
        className="glass"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "40px 30px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "relative",
          zIndex: 10,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          borderRadius: "16px"
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "36px" }}>⚙️</span>
          <h1 
            style={{ 
              fontSize: "36px", 
              fontWeight: "normal",
              fontFamily: "var(--font-cursive)",
              marginTop: "8px", 
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            EverAfter Settings
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Configure your sender credentials and receiver profile settings.
          </p>
        </div>

        {/* Sender details (Read-only Account Profile) */}
        <div 
          style={{ 
            backgroundColor: "rgba(255, 255, 255, 0.02)", 
            border: "1px solid var(--border-card)", 
            borderRadius: "10px", 
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-purple)", letterSpacing: "0.5px" }}>
            Sender Profile (You)
          </span>
          <div style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Registered Email</span>
            <strong style={{ color: "#fff", wordBreak: "break-all" }}>{user.email}</strong>
          </div>
        </div>

        {/* Receiver details (Editable Partner Profile) */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-rose)", letterSpacing: "0.5px" }}>
            Receiver Profile (Your Partner)
          </span>

          {error && (
            <div 
              style={{ 
                backgroundColor: "rgba(255, 75, 114, 0.1)", 
                border: "1px solid rgba(255, 75, 114, 0.2)", 
                borderRadius: "8px", 
                padding: "10px 12px", 
                color: "var(--accent-rose)", 
                fontSize: "12px",
                lineHeight: "1.4"
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div 
              style={{ 
                backgroundColor: "rgba(46, 196, 182, 0.1)", 
                border: "1px solid rgba(46, 196, 182, 0.2)", 
                borderRadius: "8px", 
                padding: "10px 12px", 
                color: "#2ec4b6", 
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "1.4"
              }}
            >
              ✅ Partner profile updated successfully! 💖
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Juliet"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Capulet"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recipient's Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              placeholder="juliet@verona.com"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: emailError ? "1px solid var(--accent-rose)" : "1px solid var(--border-card)",
                borderRadius: "8px",
                padding: "12px",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
              }}
            />
            {emailError && (
              <span style={{ color: "var(--accent-rose)", fontSize: "11px", fontWeight: "bold" }}>
                {emailError}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !firstName.trim() || !lastName.trim() || !email.trim() || !!emailError}
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "14px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: saving || !firstName.trim() || !lastName.trim() || !email.trim() || !!emailError ? 0.7 : 1,
              marginTop: "4px"
            }}
          >
            {saving ? "Saving changes..." : "Save Changes ✨"}
          </button>
        </form>

        {/* Navigation / Logout Section */}
        <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-card)",
              background: "transparent",
              color: "var(--text-main)",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              textAlign: "center",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            🏠 Dashboard
          </Link>

          <button
            onClick={() => logout()}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 75, 114, 0.25)",
              background: "rgba(255, 75, 114, 0.05)",
              color: "var(--accent-rose)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.05)")}
          >
            Logout 🔒
          </button>
        </div>
      </main>
    </div>
  );
}

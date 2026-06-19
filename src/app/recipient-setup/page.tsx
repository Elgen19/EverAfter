"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";

export default function RecipientSetupPage() {
  const router = useRouter();
  const { user, recipient, loading, saveRecipientProfile } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Authenticate & Profile Check redirects
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (recipient) {
        router.push("/dashboard");
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

    try {
      await saveRecipientProfile(firstName, lastName, email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to save recipient profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading || !user || recipient) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Redirecting...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <FloatingHearts />

      <main 
        className="glass animate-reveal recipient-setup-card"
        style={{
          width: "100%",
          maxWidth: "460px",
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
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "36px" }}>💌</span>
          <h1 
            style={{ 
              fontSize: "24px", 
              fontWeight: 700, 
              marginTop: "8px", 
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Recipient Profile Setup
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Welcome! Tell us who you'd like to write love letters to.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
            {saving ? "Saving profile..." : "Save & Continue 💖"}
          </button>
        </form>

        <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.4", margin: 0 }}>
          * This setup will only show once. We will auto-fill these recipient credentials for all your future love letters!
        </p>
      </main>
    </div>
  );
}

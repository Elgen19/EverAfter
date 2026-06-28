"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";

export default function ProfilePage() {
  const router = useRouter();
  const { user, recipient, loading, saveRecipientProfile, updateSenderName, logout } = useAuth();
  
  const [senderName, setSenderName] = useState("");
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

  // Sync sender state to form input once loaded
  useEffect(() => {
    if (user) {
      setSenderName(user.displayName || user.email.split("@")[0] || "");
    }
  }, [user]);

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

  // Prevent vertical page scroll
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.height = "100vh";
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    }
    return () => {
      if (typeof window !== "undefined") {
        document.documentElement.style.overflow = "";
        document.documentElement.style.height = "";
        document.body.style.overflow = "";
        document.body.style.height = "";
      }
    };
  }, []);

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
    if (!senderName.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || emailError) return;

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await updateSenderName(senderName);
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
    <div style={{ height: "100vh", width: "100vw", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflow: "hidden" }}>
      <FloatingHearts />

      <main 
        className="glass animate-reveal"
        style={{
          width: "100%",
          maxWidth: "460px",
          maxHeight: "calc(100vh - 32px)",
          padding: "24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          position: "relative",
          zIndex: 10,
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          borderRadius: "16px",
          overflowY: "auto",
        }}
      >
        {/* Close Button to Return to Dashboard */}
        <Link
          href="/dashboard"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255, 255, 255, 0.6)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
            zIndex: 20,
            textDecoration: "none"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.15)";
            e.currentTarget.style.color = "var(--accent-rose)";
            e.currentTarget.style.borderColor = "rgba(255, 75, 114, 0.3)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Close and Return to Dashboard"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Link>
        {/* Header Branding */}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "28px" }}>⚙️</span>
          <h1 
            style={{ 
              fontSize: "26px", 
              fontWeight: "normal",
              fontFamily: "var(--font-cursive)",
              marginTop: "4px", 
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            EverAfter Settings
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Configure your sender credentials and receiver profile settings.
          </p>
        </div>

        {/* Profile configuration form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Sender details (Editable Sender Name + Read-only Email) */}
          <div 
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.02)", 
              border: "1px solid var(--border-card)", 
              borderRadius: "10px", 
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-purple)", letterSpacing: "0.5px" }}>
              Sender Profile (You)
            </span>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Your Name</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Name"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>Registered Email</span>
              <strong style={{ color: "rgba(255, 255, 255, 0.5)", wordBreak: "break-all", fontWeight: "normal" }}>{user.email}</strong>
            </div>
          </div>

          <span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "var(--accent-rose)", letterSpacing: "0.5px", marginTop: "2px" }}>
            Receiver Profile (Your Partner)
          </span>

          {error && (
            <div 
              style={{ 
                backgroundColor: "rgba(255, 75, 114, 0.1)", 
                border: "1px solid rgba(255, 75, 114, 0.2)", 
                borderRadius: "8px", 
                padding: "8px 10px", 
                color: "var(--accent-rose)", 
                fontSize: "11px",
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
                padding: "8px 10px", 
                color: "#2ec4b6", 
                fontSize: "11px",
                fontWeight: 600,
                lineHeight: "1.4"
              }}
            >
              ✅ Profile updated successfully! 💖
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>First Name</label>
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
                  padding: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Last Name</label>
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
                  padding: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "10px", color: "var(--text-muted)" }}>Recipient's Email Address</label>
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
                padding: "10px",
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
            disabled={saving || !senderName.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !!emailError}
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "13px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: saving || !senderName.trim() || !firstName.trim() || !lastName.trim() || !email.trim() || !!emailError ? 0.7 : 1,
              marginTop: "2px"
            }}
          >
            {saving ? "Saving changes..." : "Save Changes ✨"}
          </button>
        </form>

        {/* Navigation / Logout Section */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
          <button
            onClick={() => logout()}
            style={{
              width: "100%",
              padding: "10px",
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

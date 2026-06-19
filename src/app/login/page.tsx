"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FloatingHearts from "@/components/FloatingHearts";

export default function LoginPage() {
  const router = useRouter();
  const { user, recipient, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      if (!recipient) {
        router.push("/recipient-setup");
      } else {
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
    if (emailError || !email || !password) return;

    setSubmitting(true);
    setAuthError("");

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please check your credentials.");
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setAuthError(err?.message || "Google Authentication failed.");
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255, 75, 114, 0.1)", borderTopColor: "var(--accent-rose)", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Verifying session...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <FloatingHearts />

      <main 
        className="glass animate-reveal"
        style={{
          width: "100%",
          maxWidth: "420px",
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
          <span style={{ fontSize: "36px", color: "var(--accent-rose)", animation: "heartbeat-survey 1.5s infinite" }}>❤️</span>
          <h1 
            style={{ 
              fontSize: "26px", 
              fontWeight: 700, 
              marginTop: "8px", 
              background: "linear-gradient(to right, #ff4b72, #9c6cfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Digital Love Letter
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            Sign in to start writing and managing your custom love letters.
          </p>
        </div>

        {/* Tab Switches */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "2px" }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setAuthError("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              color: !isSignUp ? "var(--accent-rose)" : "var(--text-muted)",
              fontWeight: !isSignUp ? "bold" : "500",
              fontSize: "14px",
              cursor: "pointer",
              borderBottom: !isSignUp ? "2px solid var(--accent-rose)" : "none",
              transition: "all 0.2s"
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setAuthError("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              color: isSignUp ? "var(--accent-rose)" : "var(--text-muted)",
              fontWeight: isSignUp ? "bold" : "500",
              fontSize: "14px",
              cursor: "pointer",
              borderBottom: isSignUp ? "2px solid var(--accent-rose)" : "none",
              transition: "all 0.2s"
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {authError && (
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
              ⚠️ {authError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              placeholder="you@example.com"
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

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <button
            type="submit"
            disabled={submitting || !!emailError}
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: "14px",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: submitting || !!emailError ? 0.7 : 1,
              marginTop: "4px"
            }}
          >
            {submitting ? "Processing..." : isSignUp ? "Create Account 💖" : "Sign In 🔒"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "8px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}></div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.08)" }}></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          style={{
            padding: "11px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-card)",
            color: "#fff",
            fontWeight: 500,
            fontSize: "13px",
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => {
            if (!submitting) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
          }}
          onMouseLeave={(e) => {
            if (!submitting) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
          }}
        >
          {/* Google Icon */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.92v2.32C2.4 15.99 5.48 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.94H.92C.33 6.12 0 7.48 0 9s.33 2.88.92 4.06l3.03-2.32z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.42 0 9 0 5.48 0 2.4 2.01.92 4.94l3.03 2.32C4.66 5.16 6.65 3.58 9 3.58z"
            />
          </svg>
          Sign in with Google
        </button>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
          <Link href="/" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-rose)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ← Back to Home
          </Link>
        </div>

      </main>
    </div>
  );
}

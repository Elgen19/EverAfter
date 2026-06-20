"use client";

import React from "react";
import Link from "next/link";

interface GuestFeatureLockoutProps {
  featureName: string;
  featureIcon: string;
  featureDesc: string;
  encodedData: string;
}

export default function GuestFeatureLockout({
  featureName,
  featureIcon,
  featureDesc,
  encodedData,
}: GuestFeatureLockoutProps) {
  // Pass the encoded letter data so that their progress is restored upon login/signup
  const redirectUrl = `/login?redirect=/create&d=${encodedData}`;

  return (
    <div
      className="guest-lockout-card"
      style={{
        background: "rgba(20, 15, 30, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px dashed rgba(255, 75, 114, 0.3)",
        borderRadius: "12px",
        padding: "30px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 75, 114, 0.05)",
        position: "relative",
        overflow: "hidden",
        margin: "10px 0"
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(255, 75, 114, 0.06) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 75, 114, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            boxShadow: "0 0 20px rgba(255, 75, 114, 0.25)",
            border: "1.5px solid rgba(255, 75, 114, 0.2)"
          }}
        >
          {featureIcon}
        </div>

        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>
          {featureName} Locked 🔒
        </h4>

        <p
          style={{
            fontSize: "12.5px",
            color: "var(--text-muted)",
            lineHeight: "1.6",
            margin: 0,
            maxWidth: "340px",
            opacity: 0.9
          }}
        >
          {featureDesc} Guests are limited to writing standard text letters. Create a free account to unlock this feature!
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "8px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Link
            href={redirectUrl}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "var(--accent-rose)",
              backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(255, 75, 114, 0.3)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            Sign Up Free
          </Link>
          <Link
            href={`${redirectUrl}&login=true`}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-card)",
              color: "var(--text-muted)",
              fontWeight: 500,
              fontSize: "13px",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import FloatingHearts from "@/components/FloatingHearts";

export default function ComingSoonPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      backgroundImage: "linear-gradient(rgba(11, 7, 17, 0.75), rgba(11, 7, 17, 0.75)), url('/desk_bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      textAlign: "center",
      padding: "20px"
    }}>
      <FloatingHearts />

      <div className="glass animate-reveal" style={{
        maxWidth: "480px",
        padding: "50px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        borderRadius: "20px",
        border: "1.5px solid var(--accent-rose)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
        backgroundColor: "rgba(25, 12, 22, 0.9)"
      }}>
        <span style={{ fontSize: "64px", animation: "heartbeat-survey 1.5s infinite ease-in-out" }}>🛠️</span>
        <h2 style={{ 
          fontSize: "36px", 
          fontWeight: "normal", 
          color: "var(--accent-rose)",
          fontFamily: "'Dancing Script', 'Great Vibes', 'Sacramento', cursive",
          margin: 0
        }}>
          EverAfter
        </h2>
        
        <p style={{ 
          fontSize: "16px", 
          color: "var(--text-main)", 
          lineHeight: "1.6", 
          margin: 0,
          fontWeight: 500
        }}>
          We are currently building some magical things for you! ❤️
        </p>
        
        <p style={{ 
          fontSize: "14px", 
          color: "var(--text-muted)", 
          lineHeight: "1.5", 
          margin: 0
        }}>
          Our creator studio and authentication services are under brief maintenance. Please check back soon to write and seal your love letters!
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            borderRadius: "30px",
            backgroundColor: "var(--accent-rose)",
            backgroundImage: "linear-gradient(135deg, #ff4b72, #d9264c)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "14px",
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(255, 75, 114, 0.3)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 75, 114, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 75, 114, 0.3)";
          }}
        >
          Return Home 🏡
        </Link>
      </div>
    </div>
  );
}

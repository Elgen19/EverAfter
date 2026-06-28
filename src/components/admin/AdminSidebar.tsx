"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "User Directory", path: "/admin/users", icon: "👥" },
    { name: "Letters Monitor", path: "/admin/letters", icon: "✉️" },
    { name: "Insights & Metrics", path: "/admin/insights", icon: "📈" },
    { name: "System Performance", path: "/admin/performance", icon: "⚡" },
    { name: "Settings & Config", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div style={{
      width: "280px",
      minHeight: "100vh",
      height: "100%",
      backgroundColor: "rgba(18, 10, 23, 0.95)",
      borderRight: "1px solid rgba(255, 75, 114, 0.15)",
      display: "flex",
      flexDirection: "column",
      padding: "24px",
      boxSizing: "border-box",
      color: "var(--text-main)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "36px",
          color: "var(--accent-rose)",
          margin: 0,
          textAlign: "center"
        }}>
          EverAfter Admin
        </h2>
        <p style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "2px",
          textAlign: "center",
          margin: "4px 0 0 0"
        }}>
          System Console
        </p>
      </div>

      {/* Admin Profile */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        borderRadius: "12px",
        backgroundColor: "rgba(255, 75, 114, 0.05)",
        border: "1px solid rgba(255, 75, 114, 0.1)",
        marginBottom: "30px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "var(--accent-rose)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",
          boxShadow: "0 0 10px rgba(255, 75, 114, 0.4)"
        }}>
          {user?.displayName ? user.displayName[0].toUpperCase() : "A"}
        </div>
        <div style={{ overflow: "hidden" }}>
          <p style={{
            fontSize: "14px",
            fontWeight: "bold",
            margin: 0,
            color: "var(--text-main)",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden"
          }}>
            {user?.displayName || "Admin Console"}
          </p>
          <span style={{
            fontSize: "11px",
            color: "var(--accent-rose)",
            fontWeight: 600,
            textTransform: "uppercase"
          }}>
            Super Admin
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        flexGrow: 1
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "#fff" : "rgba(255, 255, 255, 0.65)",
                backgroundColor: isActive ? "var(--accent-rose)" : "transparent",
                backgroundImage: isActive ? "linear-gradient(135deg, #ff4b72, #d9264c)" : "none",
                boxShadow: isActive ? "0 4px 15px rgba(255, 75, 114, 0.25)" : "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.08)";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "auto",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        paddingTop: "20px"
      }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "rgba(255, 255, 255, 0.6)",
            textDecoration: "none",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
        >
          <span>🏠</span>
          <span>App Dashboard</span>
        </Link>
        <button
          onClick={() => logout()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "var(--accent-rose)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 75, 114, 0.08)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <span>🚪</span>
          <span>Logout Console</span>
        </button>
      </div>
    </div>
  );
}

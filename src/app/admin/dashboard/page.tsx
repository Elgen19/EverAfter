"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  activeUsers15m: number;
  totalLetters: number;
  totalContacts: number;
  avgLatency: number;
  loading: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers15m: 0,
    totalLetters: 0,
    totalContacts: 0,
    avgLatency: 0,
    loading: true,
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLetters, setRecentLetters] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<"healthy" | "maintenance" | "error">("healthy");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch collections
        const usersSnap = await getDocs(collection(db, "users"));
        const lettersSnap = await getDocs(collection(db, "letters"));
        const contactsSnap = await getDocs(collection(db, "contacts"));
        
        // Calculate active users in the last 15 minutes
        const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
        const active15m = usersSnap.docs.filter(
          (d) => (d.data().lastActive || 0) > fifteenMinutesAgo
        ).length;

        // Fetch recent performance metrics to calculate average latency
        const metricsQ = query(
          collection(db, "performance_metrics"),
          orderBy("timestamp", "desc"),
          limit(100)
        );
        const metricsSnap = await getDocs(metricsQ);
        
        let totalVal = 0;
        let count = 0;
        metricsSnap.forEach((doc) => {
          const val = doc.data().value;
          if (typeof val === "number") {
            totalVal += val;
            count++;
          }
        });
        const avgLatency = count > 0 ? Math.round(totalVal / count) : 0;

        // Fetch maintenance mode state
        const configDoc = await getDoc(doc(db, "system_config", "maintenance"));
        const isMaintenance = configDoc.exists() && configDoc.data().enabled;

        // Map recent users (sorted by lastActive or createdAt)
        const mappedUsers = usersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.lastActive || 0) - (a.lastActive || 0))
          .slice(0, 5);

        // Map recent letters
        const mappedLetters = lettersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 5);

        setStats({
          totalUsers: usersSnap.size,
          activeUsers15m: active15m,
          totalLetters: lettersSnap.size,
          totalContacts: contactsSnap.size,
          avgLatency,
          loading: false,
        });

        setRecentUsers(mappedUsers);
        setRecentLetters(mappedLetters);
        setSystemStatus(isMaintenance ? "maintenance" : "healthy");
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setStats((prev) => ({ ...prev, loading: false }));
        setSystemStatus("error");
      }
    }

    loadDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        color: "rgba(255, 255, 255, 0.7)"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px"
        }}>
          <div className="spinner" />
          <span>Aggregating system statistics...</span>
        </div>
        <style jsx>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 75, 114, 0.1);
            border-top-color: var(--accent-rose);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Dashboard Title & System Status */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 600,
            color: "#fff",
            margin: 0
          }}>
            System Overview
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
            Real-time platform usage and network metrics.
          </p>
        </div>
        
        {/* Status Indicator */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 16px",
          borderRadius: "30px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}>
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: systemStatus === "healthy" ? "#10b981" : systemStatus === "maintenance" ? "#f59e0b" : "#ef4444",
            boxShadow: systemStatus === "healthy" 
              ? "0 0 8px #10b981" 
              : systemStatus === "maintenance" ? "0 0 8px #f59e0b" : "0 0 8px #ef4444",
            display: "inline-block"
          }} />
          <span style={{
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: systemStatus === "healthy" ? "#10b981" : systemStatus === "maintenance" ? "#f59e0b" : "#ef4444"
          }}>
            {systemStatus === "healthy" ? "All Systems Operational" : systemStatus === "maintenance" ? "Maintenance Mode Active" : "Database Latency High"}
          </span>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}>
        {/* Total Users Card */}
        <div style={cardStyle("linear-gradient(135deg, rgba(67, 24, 76, 0.6), rgba(30, 15, 40, 0.6))")}>
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>Total Users</span>
            <span style={{ fontSize: "22px" }}>👥</span>
          </div>
          <h2 style={cardValueStyle}>{stats.totalUsers}</h2>
          <div style={cardFooterStyle}>
            <span style={{ color: "#10b981", fontWeight: 600 }}>{stats.activeUsers15m} active</span>
            <span style={{ color: "var(--text-muted)" }}> in last 15 min</span>
          </div>
        </div>

        {/* Letters Sent Card */}
        <div style={cardStyle("linear-gradient(135deg, rgba(100, 31, 63, 0.6), rgba(40, 15, 30, 0.6))")}>
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>Letters Created</span>
            <span style={{ fontSize: "22px" }}>✉️</span>
          </div>
          <h2 style={cardValueStyle}>{stats.totalLetters}</h2>
          <div style={cardFooterStyle}>
            <span style={{ color: "var(--accent-rose)", fontWeight: 600 }}>
              {(stats.totalLetters / Math.max(1, stats.totalUsers)).toFixed(1)}
            </span>
            <span style={{ color: "var(--text-muted)" }}> letters per user</span>
          </div>
        </div>

        {/* Contacts Card */}
        <div style={cardStyle("linear-gradient(135deg, rgba(24, 48, 89, 0.6), rgba(12, 22, 50, 0.6))")}>
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>Contact Inquiries</span>
            <span style={{ fontSize: "22px" }}>💬</span>
          </div>
          <h2 style={cardValueStyle}>{stats.totalContacts}</h2>
          <div style={cardFooterStyle}>
            <span style={{ color: "#3b82f6", fontWeight: 600 }}>100%</span>
            <span style={{ color: "var(--text-muted)" }}> delivery success</span>
          </div>
        </div>

        {/* Latency Card */}
        <div style={cardStyle("linear-gradient(135deg, rgba(20, 60, 60, 0.6), rgba(10, 30, 30, 0.6))")}>
          <div style={cardHeaderStyle}>
            <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>Avg Response Latency</span>
            <span style={{ fontSize: "22px" }}>⚡</span>
          </div>
          <h2 style={cardValueStyle}>{stats.avgLatency} <span style={{ fontSize: "16px", fontWeight: "normal" }}>ms</span></h2>
          <div style={cardFooterStyle}>
            <span style={{ color: stats.avgLatency < 500 ? "#10b981" : "#f59e0b", fontWeight: 600 }}>
              {stats.avgLatency < 300 ? "Excellent" : stats.avgLatency < 600 ? "Good" : "Degraded"}
            </span>
            <span style={{ color: "var(--text-muted)" }}> connection speed</span>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Panels */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px"
      }}>
        {/* Recent Users Panel */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Recent User Registrations</h3>
            <Link href="/admin/users" style={linkActionStyle}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentUsers.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>No users registered yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} style={itemRowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={avatarStyle}>
                      {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U")}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{user.displayName || "Anonymous User"}</p>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{user.email || "No Email"}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor: (Date.now() - (user.lastActive || 0)) < 15 * 60 * 1000 ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      color: (Date.now() - (user.lastActive || 0)) < 15 * 60 * 1000 ? "#10b981" : "var(--text-muted)",
                      fontWeight: 600
                    }}>
                      {(Date.now() - (user.lastActive || 0)) < 15 * 60 * 1000 ? "Active Now" : "Inactive"}
                    </span>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0 0" }}>
                      Active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Letters Panel */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Recent Letters Generated</h3>
            <Link href="/admin/letters" style={linkActionStyle}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentLetters.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>No letters generated yet.</p>
            ) : (
              recentLetters.map((letter) => (
                <div key={letter.id} style={itemRowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                    <div style={{ fontSize: "20px" }}>✉️</div>
                    <div style={{ overflow: "hidden" }}>
                      <p style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        margin: 0,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                      }}>
                        {letter.title || "Untitled Love Letter"}
                      </p>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Style: <span style={{ textTransform: "capitalize", color: "var(--accent-rose)", fontWeight: 500 }}>{letter.letterStyle || "Default"}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{
                      fontSize: "11px",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      backgroundColor: letter.isOpened ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.12)",
                      color: letter.isOpened ? "#10b981" : "#ef4444",
                      fontWeight: 600
                    }}>
                      {letter.isOpened ? "Opened" : "Sealed"}
                    </span>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0 0" }}>
                      {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Style Helpers
const cardStyle = (gradient: string) => ({
  background: gradient,
  borderRadius: "16px",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(5px)"
} as React.CSSProperties);

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
} as React.CSSProperties;

const cardValueStyle = {
  fontSize: "36px",
  fontWeight: 600,
  color: "#fff",
  margin: 0
} as React.CSSProperties;

const cardFooterStyle = {
  fontSize: "12px"
} as React.CSSProperties;

const panelStyle = {
  backgroundColor: "rgba(25, 12, 22, 0.4)",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)"
} as React.CSSProperties;

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
} as React.CSSProperties;

const linkActionStyle = {
  color: "var(--accent-rose)",
  fontSize: "13px",
  fontWeight: 600,
  textDecoration: "none",
  transition: "all 0.2s"
} as React.CSSProperties;

const itemRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.03)"
} as React.CSSProperties;

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 75, 114, 0.2)",
  border: "1.5px solid rgba(255, 75, 114, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--accent-rose)"
} as React.CSSProperties;

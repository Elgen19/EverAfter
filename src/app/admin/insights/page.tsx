"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface InsightsData {
  totalUsers: number;
  totalLetters: number;
  totalOpened: number;
  featureUsage: {
    quiz: number;
    photos: number;
    audio: number;
    timelock: number;
  };
  themeDistribution: { name: string; count: number }[];
  traffic7d: number[];
  userGrowth7d: number[];
  dateLabels: string[];
  loading: boolean;
}

export default function InsightsMetrics() {
  const [data, setData] = useState<InsightsData>({
    totalUsers: 0,
    totalLetters: 0,
    totalOpened: 0,
    featureUsage: { quiz: 0, photos: 0, audio: 0, timelock: 0 },
    themeDistribution: [],
    traffic7d: Array(7).fill(0),
    userGrowth7d: Array(7).fill(0),
    dateLabels: [],
    loading: true,
  });

  // Calculate trailing 7 days labels
  const get7DaysLabels = () => {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }
    return labels;
  };

  useEffect(() => {
    async function fetchInsights() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const lettersSnap = await getDocs(collection(db, "letters"));
        const metricsSnap = await getDocs(collection(db, "performance_metrics"));

        const usersList = usersSnap.docs.map((d) => d.data());
        const lettersList = lettersSnap.docs.map((d) => d.data());
        const metricsList = metricsSnap.docs.map((d) => d.data());

        const totalUsers = usersList.length;
        const totalLetters = lettersList.length;
        const totalOpened = lettersList.filter((l) => l.isOpened).length;

        // 1. Feature Usage
        let quizCount = 0;
        let photosCount = 0;
        let audioCount = 0;
        let timelockCount = 0;

        lettersList.forEach((l) => {
          if (l.quizQuestions && l.quizQuestions.length > 0) quizCount++;
          if (l.polaroids && l.polaroids.length > 0) photosCount++;
          if (l.hasAudio) audioCount++;
          if (l.isTimeLocked) timelockCount++;
        });

        // 2. Theme Distribution
        const themes: Record<string, number> = {};
        lettersList.forEach((l) => {
          const style = l.letterStyle || "default";
          themes[style] = (themes[style] || 0) + 1;
        });
        const themeDistribution = Object.entries(themes)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        // 3. Trailing 7-day Traffic (Page Views)
        const traffic7d = Array(7).fill(0);
        const userGrowth7d = Array(7).fill(0);
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        // Traffic grouping
        metricsList.forEach((m) => {
          if (!m.name?.startsWith("page_load_") || !m.timestamp) return;
          const mDate = new Date(m.timestamp);
          const diffDays = Math.floor((now.getTime() - mDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            traffic7d[6 - diffDays]++;
          }
        });

        // User Growth grouping
        usersList.forEach((u) => {
          if (!u.createdAt) return;
          const uDate = new Date(u.createdAt);
          const diffDays = Math.floor((now.getTime() - uDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            userGrowth7d[6 - diffDays]++;
          }
        });

        setData({
          totalUsers,
          totalLetters,
          totalOpened,
          featureUsage: {
            quiz: quizCount,
            photos: photosCount,
            audio: audioCount,
            timelock: timelockCount,
          },
          themeDistribution,
          traffic7d,
          userGrowth7d,
          dateLabels: get7DaysLabels(),
          loading: false,
        });
      } catch (err) {
        console.error("Error loading insights metrics:", err);
        setData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchInsights();
  }, []);

  // Custom SVG line chart renderer
  const renderLineChart = (dataPoints: number[], labels: string[], title: string, color: string) => {
    const width = 500;
    const height = 150;
    const padding = 20;

    const maxVal = Math.max(...dataPoints, 5);
    const points = dataPoints.map((val, index) => {
      const x = padding + (index * (width - padding * 2)) / 6;
      const y = height - padding - (val / maxVal) * (height - padding * 2 - 10);
      return { x, y, val };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ position: "relative" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)", margin: "0 0 10px 0" }}>{title}</h4>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad-${color})`} />

          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Values */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="1.5" />
              <text x={p.x} y={p.y - 8} fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                {p.val}
              </text>
            </g>
          ))}

          {/* Labels */}
          {points.map((p, idx) => (
            <text key={`l-${idx}`} x={p.x} y={height - 4} fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="middle">
              {labels[idx]}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const readRate = data.totalLetters > 0 ? ((data.totalOpened / data.totalLetters) * 100).toFixed(0) : "0";

  if (data.loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", color: "rgba(255,255,255,0.7)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
          <div className="spinner" />
          <span>Crunching platform engagement metrics...</span>
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
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0 }}>
          Insights & Metrics
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Deep analysis of user engagement, traffic cycles, and core features usage.
        </p>
      </div>

      {/* Trailing Tractions (Custom SVG Charts) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "24px"
      }}>
        <div style={panelStyle}>
          {renderLineChart(data.traffic7d, data.dateLabels, "Daily Platform Traffic (Page Views)", "var(--accent-rose)")}
        </div>
        <div style={panelStyle}>
          {renderLineChart(data.userGrowth7d, data.dateLabels, "New User Registrations (7 Days)", "#3b82f6")}
        </div>
      </div>

      {/* Feature Usage & Selection Rates */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px"
      }}>
        {/* Core Feature Adoption rates */}
        <div style={panelStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0", color: "#fff" }}>Feature Adoption Rates</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Quiz */}
            {renderFeatureBar(
              "Interactive Quiz Integration", 
              data.featureUsage.quiz, 
              data.totalLetters, 
              "var(--accent-rose)"
            )}
            {/* Photos */}
            {renderFeatureBar(
              "Polaroid Photo Albums", 
              data.featureUsage.photos, 
              data.totalLetters, 
              "#8b5cf6"
            )}
            {/* Audio */}
            {renderFeatureBar(
              "Voice Audio Memos", 
              data.featureUsage.audio, 
              data.totalLetters, 
              "#10b981"
            )}
            {/* Time-locks */}
            {renderFeatureBar(
              "Scheduled Time-Lock Seals", 
              data.featureUsage.timelock, 
              data.totalLetters, 
              "#eab308"
            )}
          </div>
        </div>

        {/* Funnel Metrics & Themes */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          {/* Read funnel rate */}
          <div style={{ ...panelStyle, display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "5px solid rgba(255, 75, 114, 0.15)",
              borderTopColor: "var(--accent-rose)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0
            }}>
              {readRate}%
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px 0", color: "#fff" }}>Letter Read Success Rate</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                Matches total opened wax seals against sealed drafts. A higher rate indicates successful engagement.
              </p>
            </div>
          </div>

          {/* Theme distributions */}
          <div style={{ ...panelStyle, flexGrow: 1 }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0", color: "#fff" }}>Popular Stationeries</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto" }}>
              {data.themeDistribution.length === 0 ? (
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No stationery preferences recorded yet.</span>
              ) : (
                data.themeDistribution.map((theme) => (
                  <div key={theme.name} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{theme.name.replace(/_/g, " ")}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {theme.count} letters ({(data.totalLetters > 0 ? (theme.count / data.totalLetters) * 100 : 0).toFixed(0)}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Horizontal Feature Progress Bar Renderer
function renderFeatureBar(title: string, count: number, total: number, color: string) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
        <span>{title}</span>
        <span style={{ fontWeight: 600 }}>{percentage}% ({count}/{total})</span>
      </div>
      <div style={{ width: "100%", height: "8px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", borderRadius: "4px", backgroundColor: color, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

const panelStyle = {
  backgroundColor: "rgba(25, 12, 22, 0.4)",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)"
} as React.CSSProperties;

"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pages" | "apis" | "logs">("pages");

  // Fetch recent performance metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "performance_metrics"),
        orderBy("timestamp", "desc"),
        limit(200)
      );
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setMetrics(list);
    } catch (err) {
      console.error("Error fetching performance metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Aggregations
  const getAvgLatency = (filterFn: (m: any) => boolean) => {
    const subset = metrics.filter(filterFn);
    if (subset.length === 0) return 0;
    const sum = subset.reduce((acc, curr) => acc + (curr.value || 0), 0);
    return Math.round(sum / subset.length);
  };

  // 1. Page Load Averages
  const pageAverages = {
    landing: getAvgLatency((m) => m.name === "page_load_landing"),
    dashboard: getAvgLatency((m) => m.name === "page_load_dashboard"),
    mailbox: getAvgLatency((m) => m.name === "page_load_mailbox"),
    create: getAvgLatency((m) => m.name === "page_load_create"),
    letter: getAvgLatency((m) => m.name === "page_load_letter"),
  };

  // 2. API Latency Averages
  const apiAverages = {
    contact: getAvgLatency((m) => m.name === "api_contact"),
    sendLetter: getAvgLatency((m) => m.name === "api_send-letter"),
    sendRsvp: getAvgLatency((m) => m.name === "api_send-rsvp"),
    sendPrize: getAvgLatency((m) => m.name === "api_send-prize-claim"),
  };

  // 3. Error rate
  const totalCount = metrics.length;
  const errorCount = metrics.filter((m) => m.status === "error").length;
  const errorRate = totalCount > 0 ? ((errorCount / totalCount) * 100).toFixed(1) : "0.0";

  // 4. Browser Distribution
  const getBrowserData = () => {
    const browsers: Record<string, number> = {};
    metrics.forEach((m) => {
      const b = m.browser || "Other";
      browsers[b] = (browsers[b] || 0) + 1;
    });
    return Object.entries(browsers).map(([name, count]) => ({
      name,
      percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(0) : "0"
    }));
  };

  // 5. Generate Custom SVG Chart Coordinates
  const renderSVGChart = (dataValues: number[], title: string, color: string, colorGlow: string) => {
    const width = 600;
    const height = 180;
    const padding = 20;

    if (dataValues.length === 0) {
      return (
        <div style={{ height, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)" }}>
          Waiting for telemetry connection...
        </div>
      );
    }

    const maxVal = Math.max(...dataValues, 100);
    const points = dataValues.map((val, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(1, dataValues.length - 1);
      const y = height - padding - (val / maxVal) * (height - padding * 2 - 20);
      return { x, y, val };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    // Closed path for gradient area fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
          <span>{title} (Last {dataValues.length} requests)</span>
          <span>Max Latency: {maxVal} ms</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            {/* Area gradient */}
            <linearGradient id={`grad-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1={padding} y1={(height - padding) / 2} x2={width - padding} y2={(height - padding) / 2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#grad-${title.replace(/\s+/g, "")})`} />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" style={{ cursor: "pointer" }} />
              <title>{p.val} ms</title>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  // Get raw values for line charts
  const pageRawMetrics = metrics
    .filter((m) => m.name.startsWith("page_load_"))
    .slice(0, 15)
    .reverse()
    .map((m) => m.value);

  const apiRawMetrics = metrics
    .filter((m) => m.name.startsWith("api_"))
    .slice(0, 15)
    .reverse()
    .map((m) => m.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0 }}>
          System Performance
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Aggregated load times, API service health, and real-time query error analysis.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}>
        <div style={statCardStyle("linear-gradient(135deg, rgba(255, 75, 114, 0.15), rgba(80, 20, 40, 0.15))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Overall Network Latency</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#fff" }}>
            {getAvgLatency(() => true)} <span style={{ fontSize: "16px", fontWeight: "normal" }}>ms</span>
          </h2>
        </div>
        <div style={statCardStyle("linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(100, 20, 20, 0.12))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>API Request Failure Rate</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#ef4444" }}>
            {errorRate}%
          </h2>
        </div>
        <div style={statCardStyle("linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(10, 80, 50, 0.15))")}>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Telemetry Logs (Buffered)</span>
          <h2 style={{ fontSize: "28px", margin: "8px 0 0 0", color: "#10b981" }}>
            {totalCount} <span style={{ fontSize: "16px", fontWeight: "normal" }}>lines</span>
          </h2>
        </div>
      </div>

      {/* SVG Latency Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px"
      }}>
        <div style={chartPanelStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0", color: "#fff" }}>Page Load Latency Trend</h3>
          {renderSVGChart(pageRawMetrics, "Page Load speed", "var(--accent-rose)", "rgba(255, 75, 114, 0.45)")}
        </div>
        <div style={chartPanelStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0", color: "#fff" }}>API Handler Latency Trend</h3>
          {renderSVGChart(apiRawMetrics, "API response speed", "#3b82f6", "rgba(59, 130, 246, 0.45)")}
        </div>
      </div>

      {/* Interactive Tabs */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        gap: "24px"
      }}>
        <button 
          onClick={() => setActiveTab("pages")} 
          style={tabButtonStyle(activeTab === "pages")}
        >
          Page Load speeds 🖥️
        </button>
        <button 
          onClick={() => setActiveTab("apis")} 
          style={tabButtonStyle(activeTab === "apis")}
        >
          API Endpoints ⚡
        </button>
        <button 
          onClick={() => setActiveTab("logs")} 
          style={tabButtonStyle(activeTab === "logs")}
        >
          Raw Telemetry Logs 📋
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading performance index tables...
        </div>
      ) : (
        <div style={{
          backgroundColor: "rgba(25, 12, 22, 0.4)",
          border: "1px solid rgba(255, 75, 114, 0.15)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)"
        }}>
          {activeTab === "pages" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Average Page Load speeds</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>LANDING PAGE</span>
                  <p style={latencyValueStyle(pageAverages.landing)}>{pageAverages.landing || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>DASHBOARD PAGE</span>
                  <p style={latencyValueStyle(pageAverages.dashboard)}>{pageAverages.dashboard || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>MAILBOX VIEWER</span>
                  <p style={latencyValueStyle(pageAverages.mailbox)}>{pageAverages.mailbox || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>LETTER CREATION</span>
                  <p style={latencyValueStyle(pageAverages.create)}>{pageAverages.create || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>LETTER READER</span>
                  <p style={latencyValueStyle(pageAverages.letter)}>{pageAverages.letter || "N/A"} ms</p>
                </div>
              </div>

              {/* Browser metrics list */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 12px 0" }}>User browser Distribution</h4>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {getBrowserData().map((browser) => (
                    <div key={browser.name} style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{browser.name}</span>: <span style={{ color: "var(--accent-rose)", fontWeight: 600 }}>{browser.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "apis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>API Endpoint Response Speeds</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>CONTACT INQUIRY (/api/contact)</span>
                  <p style={latencyValueStyle(apiAverages.contact)}>{apiAverages.contact || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>SEND LETTER (/api/send-letter)</span>
                  <p style={latencyValueStyle(apiAverages.sendLetter)}>{apiAverages.sendLetter || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>SUBMIT RSVP (/api/send-rsvp)</span>
                  <p style={latencyValueStyle(apiAverages.sendRsvp)}>{apiAverages.sendRsvp || "N/A"} ms</p>
                </div>
                <div style={gridItemStyle}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>CLAIM PRIZE (/api/send-prize-claim)</span>
                  <p style={latencyValueStyle(apiAverages.sendPrize)}>{apiAverages.sendPrize || "N/A"} ms</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Raw Telemetry Logs</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                      <th style={{ padding: "10px", fontWeight: 600 }}>Metric ID / Name</th>
                      <th style={{ padding: "10px", fontWeight: 600 }}>Value</th>
                      <th style={{ padding: "10px", fontWeight: 600 }}>User Agent</th>
                      <th style={{ padding: "10px", fontWeight: 600 }}>Date/Time</th>
                      <th style={{ padding: "10px", fontWeight: 600 }}>Route Path</th>
                      <th style={{ padding: "10px", fontWeight: 600, textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.slice(0, 30).map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "10px", fontFamily: "monospace", color: "#fff" }}>{m.name}</td>
                        <td style={{ padding: "10px", fontWeight: 600, color: m.value < 400 ? "#10b981" : m.value < 800 ? "#f59e0b" : "#ef4444" }}>
                          {m.value} ms
                        </td>
                        <td style={{ padding: "10px", color: "var(--text-muted)" }}>{m.browser || "Unknown"}</td>
                        <td style={{ padding: "10px", color: "var(--text-muted)" }}>
                          {m.timestamp ? new Date(m.timestamp).toLocaleString() : ""}
                        </td>
                        <td style={{ padding: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.5)" }}>
                          {m.metadata?.path || "/"}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <span style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontWeight: 600,
                            backgroundColor: m.status === "error" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: m.status === "error" ? "#ef4444" : "#10b981"
                          }}>
                            {m.status || "success"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline Styles
const statCardStyle = (gradient: string) => ({
  background: gradient,
  borderRadius: "12px",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  padding: "16px 20px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
} as React.CSSProperties);

const chartPanelStyle = {
  backgroundColor: "rgba(25, 12, 22, 0.4)",
  border: "1px solid rgba(255, 75, 114, 0.15)",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  backdropFilter: "blur(10px)"
} as React.CSSProperties;

const tabButtonStyle = (isActive: boolean) => ({
  padding: "12px 6px",
  background: "transparent",
  border: "none",
  borderBottom: isActive ? "2.5px solid var(--accent-rose)" : "2.5px solid transparent",
  color: isActive ? "#fff" : "rgba(255, 255, 255, 0.5)",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s"
} as React.CSSProperties);

const gridItemStyle = {
  padding: "16px",
  borderRadius: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  border: "1px solid rgba(255, 255, 255, 0.03)",
  display: "flex",
  flexDirection: "column",
  gap: "8px"
} as React.CSSProperties;

const latencyValueStyle = (val: number) => ({
  fontSize: "24px",
  fontWeight: 600,
  margin: 0,
  color: val === 0 ? "var(--text-muted)" : (val < 400 ? "#10b981" : val < 800 ? "#f59e0b" : "#ef4444")
} as React.CSSProperties);

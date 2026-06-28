"use client";

import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db, logFirebaseEvent } from "@/utils/firebase";

export default function AdminSettings() {
  // Maintenance Mode
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // SMTP Testing
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpResult, setSmtpResult] = useState<any | null>(null);

  // Log Purging
  const [purgingLogs, setPurgingLogs] = useState(false);

  // Fetch initial maintenance mode status
  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const configDoc = await getDoc(doc(db, "system_config", "maintenance"));
        if (configDoc.exists()) {
          setMaintenanceEnabled(!!configDoc.data().enabled);
        }
      } catch (err) {
        console.error("Error loading maintenance mode config:", err);
      } finally {
        setLoadingMaintenance(false);
      }
    }
    fetchMaintenance();
  }, []);

  // Save/Toggle maintenance mode
  const handleToggleMaintenance = async () => {
    const nextState = !maintenanceEnabled;
    try {
      setSavingMaintenance(true);
      await setDoc(doc(db, "system_config", "maintenance"), {
        enabled: nextState,
        updatedAt: Date.now()
      }, { merge: true });
      logFirebaseEvent("admin_toggle_maintenance", { enabled: nextState });
      setMaintenanceEnabled(nextState);
    } catch (err) {
      console.error("Error toggling maintenance mode:", err);
      alert("Failed to toggle maintenance mode in database.");
    } finally {
      setSavingMaintenance(false);
    }
  };

  // Run SMTP connection verification
  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      setSmtpResult(null);
      
      const res = await fetch("/api/admin/smtp-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      setSmtpResult(data);
    } catch (err: any) {
      setSmtpResult({ success: false, error: err.message || "Failed to contact diagnostic API." });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Purge performance metrics older than 7 days
  const handlePurgeLogs = async () => {
    if (!confirm("Are you sure you want to delete all performance metric entries older than 7 days? This action cannot be undone.")) {
      return;
    }

    try {
      setPurgingLogs(true);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const q = query(
        collection(db, "performance_metrics"),
        where("timestamp", "<", sevenDaysAgo)
      );
      const snapshot = await getDocs(q);
      
      let deleted = 0;
      const deletePromises = snapshot.docs.map((docSnap) => {
        deleted++;
        return deleteDoc(docSnap.ref);
      });
      await Promise.all(deletePromises);
      logFirebaseEvent("admin_purge_telemetry_logs", { count: deleted });
      alert(`Cleanup completed. Successfully purged ${deleted} log records.`);
    } catch (err) {
      console.error("Failed to purge logs:", err);
      alert("Failed to execute logs purge.");
    } finally {
      setPurgingLogs(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0 }}>
          Settings & Config
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Control system status, verify mail dispatch, and optimize storage.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px"
      }}>
        {/* Maintenance Panel */}
        <div style={panelStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>
            Maintenance controls
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
            Enabling maintenance mode blocks regular users from logging in, creating, or viewing love letters. Administrative accounts will retain bypass privileges to test features.
          </p>

          {loadingMaintenance ? (
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Checking system config...</span>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "16px" }}>
              <button
                onClick={handleToggleMaintenance}
                disabled={savingMaintenance}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  backgroundColor: maintenanceEnabled ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  border: maintenanceEnabled ? "1.5px solid #ef4444" : "1.5px solid #10b981",
                  color: maintenanceEnabled ? "#ef4444" : "#10b981",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  opacity: savingMaintenance ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {savingMaintenance ? "Updating..." : (maintenanceEnabled ? "Disable Maintenance Mode" : "Enable Maintenance Mode")}
              </button>
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: maintenanceEnabled ? "#ef4444" : "#10b981"
              }}>
                Status: {maintenanceEnabled ? "ACTIVE (Public Locked)" : "OFF (Public Accessible)"}
              </span>
            </div>
          )}
        </div>

        {/* Database Optimization Panel */}
        <div style={panelStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>
            Database Optimization
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
            Optimize your Firestore writes. Purge obsolete performance telemetry logs that are older than 7 days to free up database index space and maintain responsive reporting dashboard.
          </p>

          <button
            onClick={handlePurgeLogs}
            disabled={purgingLogs}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 75, 114, 0.1)",
              border: "1.5px solid var(--accent-rose)",
              color: "var(--accent-rose)",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              opacity: purgingLogs ? 0.7 : 1
            }}
          >
            {purgingLogs ? "Executing Purge..." : "Purge Performance logs (>7d) 🗑️"}
          </button>
        </div>

        {/* SMTP Mail Panel */}
        <div style={{ ...panelStyle, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 12px 0" }}>
            SMTP Server Diagnostics
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
            Verify that your mail dispatch servers are properly configured in server environment configurations. Triggers a secure handshake check with the configured SMTP server.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <button
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                style={{
                  padding: "12px 24px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  border: "1.5px solid #3b82f6",
                  color: "#3b82f6",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: "pointer",
                  opacity: testingSmtp ? 0.7 : 1
                }}
              >
                {testingSmtp ? "Running Handshake..." : "Test SMTP Connection ⚡"}
              </button>
            </div>

            {/* Diagnostic results */}
            {smtpResult && (
              <div style={{
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: smtpResult.success ? "rgba(16, 185, 129, 0.05)" : "rgba(239, 68, 68, 0.05)",
                border: smtpResult.success ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                fontSize: "13px"
              }}>
                {smtpResult.success ? (
                  <div>
                    <p style={{ margin: "0 0 12px 0", color: "#10b981", fontWeight: 600, fontSize: "14px" }}>
                      ✓ SMTP Connection Diagnostic Successful!
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontFamily: "monospace" }}>
                      <div>Host: <span style={{ color: "#fff" }}>{smtpResult.diagnostics.host}</span></div>
                      <div>Port: <span style={{ color: "#fff" }}>{smtpResult.diagnostics.port}</span></div>
                      <div>User: <span style={{ color: "#fff" }}>{smtpResult.diagnostics.user}</span></div>
                      <div>From: <span style={{ color: "#fff" }}>{smtpResult.diagnostics.from}</span></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 6px 0", color: "#ef4444", fontWeight: 600, fontSize: "14px" }}>
                      ✕ SMTP Connection Check Failed!
                    </p>
                    <p style={{ margin: 0, color: "var(--text-muted)" }}>
                      Reason: <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{smtpResult.error || "Unknown response error."}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

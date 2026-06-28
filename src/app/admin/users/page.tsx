"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db, logFirebaseEvent } from "@/utils/firebase";

export default function UserDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Selected user for Detail Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userLetters, setUserLetters] = useState<any[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch letters for a specific user
  const fetchUserLetters = async (userId: string) => {
    try {
      setLoadingLetters(true);
      const q = query(collection(db, "letters"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const lettersList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setUserLetters(lettersList);
    } catch (err) {
      console.error("Error fetching user letters:", err);
    } finally {
      setLoadingLetters(false);
    }
  };

  const handleOpenUserModal = (user: any) => {
    setSelectedUser(user);
    fetchUserLetters(user.id);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserLetters([]);
  };

  // Toggle user suspension
  const handleToggleSuspend = async (user: any) => {
    const isSuspended = !user.isSuspended;
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { isSuspended });
      logFirebaseEvent("admin_toggle_suspend", { targetUserId: user.id, isSuspended });
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isSuspended } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => ({ ...prev, isSuspended }));
      }
    } catch (err) {
      console.error("Error toggling user suspension:", err);
    }
  };

  // Toggle admin privilege
  const handleToggleAdmin = async (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    const isAdmin = newRole === "admin";
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { role: newRole, isAdmin });
      logFirebaseEvent("admin_toggle_role", { targetUserId: user.id, role: newRole });
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole, isAdmin } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev: any) => ({ ...prev, role: newRole, isAdmin }));
      }
    } catch (err) {
      console.error("Error toggling user admin privilege:", err);
    }
  };

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    const term = searchQuery.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const displayName = (user.displayName || "").toLowerCase();
    return email.includes(term) || displayName.includes(term);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#fff", margin: 0 }}>
          User Directory
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
          Manage user permissions, review metrics, and enforce safety policies.
        </p>
      </div>

      {/* Directory Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "rgba(25, 12, 22, 0.4)",
        border: "1px solid rgba(255, 75, 114, 0.15)"
      }}>
        <div style={{ position: "relative", minWidth: "300px" }}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1.5px solid rgba(255, 75, 114, 0.15)",
              color: "#fff",
              fontSize: "14px",
              boxSizing: "border-box",
              outline: "none"
            }}
          />
        </div>
        <button 
          onClick={fetchUsers}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 75, 114, 0.1)",
            border: "1px solid var(--accent-rose)",
            color: "var(--accent-rose)",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Refresh Directory 🔄
        </button>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: "rgba(25, 12, 22, 0.4)",
        border: "1px solid rgba(255, 75, 114, 0.15)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
      }}>
        {loading ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            Aggregating platform user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
            No users matched your search criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(255, 75, 114, 0.05)", borderBottom: "1px solid rgba(255, 75, 114, 0.15)" }}>
                  <th style={{ padding: "16px 20px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>User Profile</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Last Active</th>
                  <th style={{ padding: "16px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "16px 20px", color: "rgba(255, 255, 255, 0.8)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ 
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    backgroundColor: user.isSuspended ? "rgba(239, 68, 68, 0.03)" : "transparent"
                  }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={avatarStyle}>
                          {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U")}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0, color: "#fff" }}>{user.displayName || "Anonymous User"}</p>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.email || "No Email"}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: user.role === "admin" ? "var(--accent-rose)" : "rgba(255,255,255,0.65)"
                      }}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-muted)" }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Prior"}
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-muted)" }}>
                      {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Unknown"}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontWeight: 600,
                        backgroundColor: user.isSuspended ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: user.isSuspended ? "#ef4444" : "#10b981"
                      }}>
                        {user.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button 
                        onClick={() => handleOpenUserModal(user)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        Inspect 🔍
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          backdropFilter: "blur(5px)",
          padding: "20px"
        }}>
          <div style={{
            width: "100%",
            maxWidth: "600px",
            backgroundColor: "rgba(25, 12, 22, 0.95)",
            border: "1.5px solid rgba(255, 75, 114, 0.25)",
            borderRadius: "20px",
            padding: "32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            color: "#fff"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ ...avatarStyle, width: "48px", height: "48px", fontSize: "18px" }}>
                  {selectedUser.displayName ? selectedUser.displayName[0].toUpperCase() : (selectedUser.email ? selectedUser.email[0].toUpperCase() : "U")}
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>{selectedUser.displayName || "Anonymous User"}</h3>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{selectedUser.email}</span>
                </div>
              </div>
              <button 
                onClick={handleCloseUserModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "20px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {/* Account Details */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>UID REFERENCE</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedUser.id}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ROLE ASSIGNMENT</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0", fontWeight: 600, textTransform: "uppercase", color: selectedUser.role === "admin" ? "var(--accent-rose)" : "#fff" }}>
                  {selectedUser.role || "user"}
                </p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>CREATION TIME</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "Prior to logs"}</p>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>LAST ACTIVE CONNECTION</span>
                <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : "Unknown"}</p>
              </div>
            </div>

            {/* User Letters List */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 12px 0", color: "rgba(255,255,255,0.8)" }}>
                Authored Letters ({userLetters.length})
              </h4>
              <div style={{
                maxHeight: "180px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                {loadingLetters ? (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading user letters list...</span>
                ) : userLetters.length === 0 ? (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No letters created by this user yet.</span>
                ) : (
                  userLetters.map((letter) => (
                    <div key={letter.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.03)"
                    }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>
                        {letter.title || "Untitled Letter"}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: 600,
                        backgroundColor: letter.isOpened ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                        color: letter.isOpened ? "#10b981" : "rgba(255,255,255,0.6)"
                      }}>
                        {letter.isOpened ? "Opened" : "Sealed"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Administrative Action Bar */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "20px"
            }}>
              {/* Role Toggle */}
              <button
                onClick={() => handleToggleAdmin(selectedUser)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {selectedUser.role === "admin" ? "Demote to User 👤" : "Promote to Admin 🔑"}
              </button>

              {/* Suspension Toggle */}
              <button
                onClick={() => handleToggleSuspend(selectedUser)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: selectedUser.isSuspended ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: selectedUser.isSuspended ? "1px solid #10b981" : "1px solid #ef4444",
                  color: selectedUser.isSuspended ? "#10b981" : "#ef4444",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {selectedUser.isSuspended ? "Re-activate Account" : "Suspend Account 🚫"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

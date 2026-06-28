"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import FloatingHearts from "@/components/FloatingHearts";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && user.isAdmin) {
        setIsAuthorized(true);
      } else {
        // Redirection for unauthorized attempts
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "linear-gradient(rgba(11, 7, 17, 0.85), rgba(11, 7, 17, 0.85)), url('/desk_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        textAlign: "center",
        padding: "20px"
      }}>
        <FloatingHearts />
        
        <div style={{
          maxWidth: "400px",
          padding: "40px",
          borderRadius: "20px",
          border: "1.5px solid rgba(255, 75, 114, 0.25)",
          backgroundColor: "rgba(25, 12, 22, 0.9)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)"
        }}>
          <div className="spinner" />
          <h3 style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "32px",
            color: "var(--accent-rose)",
            margin: 0
          }}>
            Verifying Admin Authority...
          </h3>
          <p style={{
            fontSize: "14px",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.5
          }}>
            Securing access to console. Please hold on a moment.
          </p>
        </div>

        <style jsx global>{`
          .spinner {
            width: 48px;
            height: 48px;
            border: 3.5px solid rgba(255, 75, 114, 0.15);
            border-top-color: var(--accent-rose);
            border-radius: 50%;
            animation: spin-guard 1s linear infinite;
          }
          @keyframes spin-guard {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}

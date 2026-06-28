import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "EverAfter Admin Console",
  description: "Administrative tools and system performance dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#0b0711",
        backgroundImage: "linear-gradient(rgba(11, 7, 17, 0.9), rgba(11, 7, 17, 0.9)), url('/desk_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}>
        <AdminSidebar />
        <main style={{
          flexGrow: 1,
          padding: "40px",
          boxSizing: "border-box",
          overflowY: "auto",
          maxHeight: "100vh",
        }}>
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}

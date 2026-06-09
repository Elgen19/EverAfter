import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: "EverAfter | Write & Send Interactive Wax-Sealed Letters",
  description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
  keywords: "love letter, valentine, anniversary, anniversary gift, digital letter, animated envelope, wax seal, everafter",
  authors: [{ name: "Antigravity" }],
  openGraph: {
    title: "EverAfter | Send a Sealed Envelope",
    description: "Write and share a beautiful digital love letter with custom wax seals and physical-feeling animations.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Inter:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sacramento&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

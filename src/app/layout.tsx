import type { Metadata } from "next";
import { 
  Inter, 
  Sacramento, 
  Great_Vibes, 
  Dancing_Script 
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-google",
  display: "swap",
});

const sacramento = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sacramento-google",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes-google",
  display: "swap",
});

const dancingScript = Dancing_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-dancing-script-google",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EverAfter | Write & Send Interactive Wax-Sealed Letters",
  description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
  keywords: "love letter, valentine, anniversary, anniversary gift, digital letter, animated envelope, wax seal, everafter",
  authors: [{ name: "Antigravity" }],
  openGraph: {
    title: "EverAfter | Send a Sealed Envelope",
    description: "Write and share a beautiful digital love letter with custom wax seals and physical-feeling animations.",
    type: "website",
  },
  verification: {
    google: "xiBtB2kEv1o3uoA372KzftN7hx5CkqkSv1VpKWLZhx4",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable} ${sacramento.variable} ${greatVibes.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

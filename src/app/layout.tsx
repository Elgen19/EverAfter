import type { Metadata } from "next";
import { 
  Inter, 
  Playfair_Display, 
  Sacramento, 
  Great_Vibes, 
  Allura, 
  Cinzel_Decorative, 
  Cormorant_Garamond, 
  Dancing_Script, 
  Geist, 
  Geist_Mono, 
  Libre_Baskerville 
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-google",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-google",
});

const sacramento = Sacramento({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sacramento-google",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes-google",
});

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allura-google",
});

const cinzelDec = Cinzel_Decorative({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-cinzel-dec-google",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant-google",
});

const dancingScript = Dancing_Script({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-dancing-script-google",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-google",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono-google",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville-google",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${sacramento.variable} ${greatVibes.variable} ${allura.variable} ${cinzelDec.variable} ${cormorant.variable} ${dancingScript.variable} ${geist.variable} ${geistMono.variable} ${libreBaskerville.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

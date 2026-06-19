import type { Metadata } from "next";
import { 
  Inter, 
  Sacramento, 
  Great_Vibes, 
  Dancing_Script 
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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
  keywords: "love letter, valentine, anniversary, anniversary gift, digital letter, animated envelope, wax seal, everafter, digital stationery, romantic card",
  authors: [{ name: "EverAfter Team" }],
  metadataBase: new URL("https://everafterletters.xyz"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "EverAfter | Write & Send Interactive Wax-Sealed Letters",
    description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
    type: "website",
    url: "https://everafterletters.xyz",
    siteName: "EverAfter",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EverAfter Interactive Digital Love Letters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EverAfter | Write & Send Interactive Wax-Sealed Letters",
    description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "xiBtB2kEv1o3uoA372KzftN7hx5CkqkSv1VpKWLZhx4",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
      </body>
    </html>
  );
}

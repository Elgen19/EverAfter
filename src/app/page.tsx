import React from "react";
import { Metadata } from "next";
import LandingClientPage from "./LandingClientPage";

export const metadata: Metadata = {
  title: "EverAfter | Create and Send Interactive Digital Love Letters",
  description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
  keywords: "love letter, valentine, anniversary, anniversary gift, digital letter, animated envelope, wax seal, everafter, digital stationery, romantic card, polaroid photos, love quiz, audio message, relationship milestones, date rsvp",
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
    title: "EverAfter | Create and Send Interactive Digital Love Letters",
    description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
    type: "website",
    url: "https://everafterletters.xyz",
    siteName: "EverAfter",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EverAfter Interactive Digital Love Letters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EverAfter | Create and Send Interactive Digital Love Letters",
    description: "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "xiBtB2kEv1o3uoA372KzftN7hx5CkqkSv1VpKWLZhx4",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

export default function Page() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EverAfter",
              "url": "https://everafterletters.xyz",
              "description": "Express your feelings with beautiful custom stationery, romantic music, floating hearts, and an interactive 3D wax-sealed envelope that opens physically in your partner's browser.",
              "applicationCategory": "RelationshipApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires HTML5 compatible browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How does the time-lock release work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "When creating a letter, you can set a specific date and time for it to unlock. Your partner can open the link anytime, but they will be greeted with a beautiful countdown screen showing exactly when the seal can be broken."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How secure and private are my letters?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Privacy is our utmost priority. Along with data encryption, you can add a Security Gate—a custom question (e.g., 'Where was our first vacation?') that only your partner knows the answer to."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can my partner reply to my letter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Once they read your letter, they are presented with a 'Write Back' option. They can compose a response, choose a theme, and send it back, which appears on your dashboard under 'Received Writebacks'."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Will I know when they read my letter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, EverAfter features real-time tracking. Your dashboard will immediately update to 'Read' with a green checkmark as soon as they break the digital wax seal."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is EverAfter free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Creating, styling, and sending letters is completely free. We believe everyone deserves a beautiful space to express their deepest emotions without barriers."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I add music and custom themes?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. You can select from curated background scenes (like Cozy Cafe, Cherry Blossoms, or Starry Night) and attach ambient soundtrack loops to create a multi-sensory reading experience."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I attach photos or images to my love letters?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! You can attach personal Polaroid photo albums with custom captions directly to your letter, sharing your favorite memories side-by-side with your writing."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the Love Quiz feature?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Love Quiz lets you insert multiple-choice trivia questions that your partner must answer correctly to unlock or proceed through the letter. It's a playful, interactive way to test how well they know your shared moments!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I record a voice message in my digital letter?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. With our Audio Voice Messages feature, you can record or upload a custom voice message (like a vocal whisper or romantic greeting) that your partner can play directly from the letter."
                  }
                }
              ]
            }
          ])
        }}
      />
      <LandingClientPage />
    </>
  );
}

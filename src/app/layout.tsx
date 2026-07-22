import type { Metadata, Viewport } from "next";
import { Nunito, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AppProviders from "@/components/AppProviders";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pebblesum.vattitude.ca";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PebbleSum - Fun Math Practice for Kids Ages 2-15",
    template: "%s | PebbleSum",
  },
  description:
    "Free math learning app for kids. Daily practice with gamified streaks, rewards, and progressive difficulty. From counting to multiplication — learn math the fun way!",
  keywords: [
    "math app for kids",
    "children math practice",
    "learn math online",
    "math games for kids",
    "addition practice",
    "subtraction practice",
    "multiplication for kids",
    "math learning app",
    "gamified math",
    "daily math practice",
    "math for toddlers",
    "math for preschoolers",
    "elementary math",
    "counting app",
    "number recognition",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192x192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-512x512.webp", sizes: "512x512", type: "image/webp" },
    ],
    apple: "/apple-icon.webp",
  },
  openGraph: {
    title: "PebbleSum - Fun Math Practice for Kids Ages 2-15",
    description:
      "Free math learning app with daily practice, gamified streaks, rewards, and progressive difficulty. From counting to multiplication!",
    images: [{ url: "/og-image.png", width: 512, height: 512, alt: "PebbleSum - Math Learning App for Kids" }],
    type: "website",
    siteName: "PebbleSum",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PebbleSum - Fun Math Practice for Kids Ages 2-15",
    description:
      "Free math learning app with daily practice, gamified streaks, rewards, and progressive difficulty.",
    images: [{ url: "/og-image.png", alt: "PebbleSum - Math Learning App for Kids" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PebbleSum",
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
  alternates: {
    canonical: "/",
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PebbleSum",
  description:
    "Free math learning app for kids. Daily practice with gamified streaks, rewards, and progressive difficulty. From counting to multiplication.",
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    suggestedMinAge: 2,
    suggestedMaxAge: 15,
  },
  educationalAlignment: {
    "@type": "AlignmentObject",
    educationalFramework: "Common Core",
    targetName: "Mathematics",
    targetDescription: "Counting, Addition, Subtraction, Multiplication",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaInstallPrompt = e;
                window.dispatchEvent(new Event('pwainstallready'));
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>
          {children}
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}

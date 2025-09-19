import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Inside the Game - BIG",
  description: "The community where multi-hyphenates connect, collaborate, and thrive. Join athletes, entrepreneurs, creators, and investors.",
  keywords: "athletes, entrepreneurs, creators, investors, networking, events, community",
  authors: [{ name: "Business Inside the Game" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#1e3a8a",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BIG",
  },
  openGraph: {
    title: "Business Inside the Game - BIG",
    description: "The community where multi-hyphenates connect, collaborate, and thrive",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Inside the Game - BIG",
    description: "The community where multi-hyphenates connect, collaborate, and thrive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BIG" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

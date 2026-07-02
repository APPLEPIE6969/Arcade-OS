import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARCADE.OS — Indie Games Portal",
  description:
    "ARCADE.OS is a high-performance indie games portal hosting custom-built 2D and 3D HTML5 games. Play instantly in your browser — no downloads, no installs.",
  keywords: [
    "indie games",
    "html5 games",
    "browser games",
    "arcade",
    "2d games",
    "3d games",
    "neon shooter",
    "endless runner",
    "physics puzzle",
  ],
  authors: [{ name: "ARCADE.OS" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ARCADE.OS — Indie Games Portal",
    description:
      "Play custom-built 2D and 3D HTML5 games instantly in your browser.",
    siteName: "ARCADE.OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARCADE.OS — Indie Games Portal",
    description:
      "Play custom-built 2D and 3D HTML5 games instantly in your browser.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

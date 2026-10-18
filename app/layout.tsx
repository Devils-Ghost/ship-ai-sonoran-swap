import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { content } from "@/lib/content/load";
import { publicEnv } from "@/lib/env";
import "./globals.css";

// P0 placeholder fonts; swaps in Fraunces + Inter per DESIGN_SYSTEM §3.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { business } = content;

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: `${business.name}: ${business.tagline}`,
  description: business.shortDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

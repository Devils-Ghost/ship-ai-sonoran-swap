import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/layout/skip-link";
import { content } from "@/lib/content/load";
import { publicEnv } from "@/lib/env";
import "./globals.css";

// DESIGN §3: Fraunces for display, Inter for body; swap to avoid invisible text. The opsz axis is
// left out: it nearly doubled the font (66 → 36 KB) and cost ~1 Lighthouse point on mobile LCP (C1).
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const { business } = content;

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: `${business.name}: ${business.tagline}`,
  description: business.shortDescription,
};

export const viewport: Viewport = {
  themeColor: "#2f4a35",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <Header />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

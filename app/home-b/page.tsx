import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { pageMetadata } from "@/lib/seo/metadata";

// SRS §4.8 headline B. Reached through proxy.ts (/?v=b keeps its URL); never indexed on its own, and its
// canonical is the home page so search engines see one page.
export const metadata: Metadata = {
  ...pageMetadata("/"),
  robots: { index: false, follow: true },
};

export default function HomeVariantB() {
  return <HomePage variant="b" />;
}

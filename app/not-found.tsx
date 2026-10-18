import type { Metadata } from "next";
import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// FR-404 (SRS §6.17 copy; it outranks the CONTENT §8 variant). Next serves this with HTTP 404.
export default function NotFound() {
  return (
    <section className="container-page flex flex-1 flex-col justify-center py-24">
      <div className="flex max-w-2xl flex-col gap-5">
        <p className="eyebrow">404</p>
        <h1>This page dried up.</h1>
        <p className="text-lead">Let&apos;s get you back to something green… er, desert.</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
          <PrimaryCta />
          <Link href="/" className="font-semibold link">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}

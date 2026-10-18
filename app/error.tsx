"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// SRS §15.10: no stack traces; only a short reference ID (Next's digest) for support.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="container-page flex flex-1 flex-col justify-center py-24">
      <div className="flex max-w-2xl flex-col gap-5" role="alert">
        <h1>Something went wrong.</h1>
        <p className="text-lead">Your estimate is still in the link above.</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className="font-semibold link">
            Home
          </Link>
        </div>
        {error.digest && <p className="text-sm text-ink-muted">Reference: {error.digest}</p>}
      </div>
    </section>
  );
}

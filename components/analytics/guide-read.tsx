"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/client";

// FR-ANL-03 guide_read: counted when the end of the article scrolls into view, not on page load.
export function GuideRead({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        track("guide_read", { slug });
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);
  return <div ref={ref} aria-hidden="true" />;
}

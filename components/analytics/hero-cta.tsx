"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import type { NavLink } from "@/lib/site";

// FR-ANL-06: cta_impression fires once per page view when the hero's primary CTA is at least half
// visible; hero_cta_click on click. With headline_variant they give click-through per A/B variant.
export function HeroCta({ link, variant }: { link: NavLink; variant: "a" | "b" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const cta = link.label.toLowerCase().replaceAll(" ", "_");

  useEffect(() => {
    track("headline_variant", { v: variant });
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track("cta_impression", { cta, variant });
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cta, variant]);

  return (
    <Button asChild>
      <Link ref={ref} href={link.href} onClick={() => track("hero_cta_click", { cta, variant })}>
        {link.label}
      </Link>
    </Button>
  );
}

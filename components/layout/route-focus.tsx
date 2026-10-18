"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

// HACKATHON C10 / SRS §15.7: after a client-side navigation, keyboard focus would otherwise stay where the
// old page's link was (often deep in the page), so the next Tab lands in the footer. Move it to <main>
// instead; Next's route announcer reads the new title to screen readers.
function Focus() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export function RouteFocus() {
  return (
    <Suspense fallback={null}>
      <Focus />
    </Suspense>
  );
}

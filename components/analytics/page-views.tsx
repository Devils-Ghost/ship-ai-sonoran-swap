"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { currentVariant, initAnalytics, track } from "@/lib/analytics/client";

// FR-ANL-05/07: starts the tab's analytics session (source, variant, team flag, test session) and
// records page_view in our own events table, so the funnel denominator lives in our database.
function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    initAnalytics();
    track("page_view", { path: pathname, variant: currentVariant() ?? "a" });
  }, [pathname]);
  return null;
}

/** usePathname needs a Suspense boundary on dynamic routes (Cache Components). */
export function PageViews() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}

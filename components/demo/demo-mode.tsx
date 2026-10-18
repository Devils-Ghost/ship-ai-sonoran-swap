"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { initDemo } from "@/lib/demo/flag";
import { SAMPLE_YARDS, sampleAfter, sampleBefore } from "@/lib/visualize/samples";

// ARCH §8: in demo mode, warm the router and image caches so the core flow keeps working if the venue
// Wi-Fi drops after the first load, and say plainly on screen that this is demo mode.
const ROUTES = ["/studio", "/visualize", "/eligibility", "/book", "/live", "/rebates/phoenix"];
const STYLES = ["sonoran-native", "modern-desert", "pollinator-garden"];

export function DemoMode() {
  const router = useRouter();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!initDemo()) return;
    // The flag lives in sessionStorage, which only exists after hydration; showing the pill is that sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(true);
    for (const r of ROUTES) router.prefetch(r);
    for (const y of SAMPLE_YARDS) {
      for (const src of [sampleBefore(y.id), ...STYLES.map((s) => sampleAfter(y.id, s))]) {
        const img = new Image();
        img.src = src;
      }
    }
  }, [router]);

  if (!on) return null;
  return (
    <p className="order-first border-b border-line bg-saguaro px-4 py-2 text-center text-xs font-semibold text-caliche print:hidden">
      Demo mode · mock previews, no crew push
    </p>
  );
}

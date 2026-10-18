"use client";

import { useEffect, useState } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

// FR-VIS-04/06: honest steps driven by elapsed time (no fake percentages), cancel, and a slow notice
// after 25 s with a way out. CONTENT §5 copy.
const STEPS = [
  { label: "Uploading…", from: 0 },
  { label: "Designing your yard…", from: 2 },
  { label: "Adding plants…", from: 8 },
];
export const SLOW_AFTER_S = 25;

export function RenderProgress({ onCancel, onExample }: { onCancel: () => void; onExample: () => void }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setSeconds((Date.now() - t0) / 1000), 250);
    return () => clearInterval(id);
  }, []);
  const current = STEPS.findLastIndex((s) => seconds >= s.from);

  return (
    <div
      className="flex flex-col gap-5 rounded-media border border-line bg-paper p-6"
      role="status"
      aria-live="polite"
    >
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3 text-ink">
            {i < current ? (
              <CheckIcon className="size-5 text-success" aria-hidden="true" />
            ) : i === current ? (
              <Loader2Icon className="size-5 animate-spin text-terracotta" aria-hidden="true" />
            ) : (
              <span className="size-5 rounded-full border-2 border-line" aria-hidden="true" />
            )}
            <span className={i > current ? "text-ink-muted" : undefined}>{s.label}</span>
          </li>
        ))}
      </ol>
      {seconds >= SLOW_AFTER_S && (
        <p className="text-ink">Taking longer than usual. Keep waiting, or see an example instead.</p>
      )}
      <div className="flex flex-wrap gap-3">
        {seconds >= SLOW_AFTER_S && <Button onClick={onExample}>See an example</Button>}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

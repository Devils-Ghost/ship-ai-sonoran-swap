"use client";

import { useState } from "react";
import { Share2Icon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import type { ProgramId } from "@/lib/content/schema";
import { sharePath, shareSummary } from "@/lib/share";

type Status = { kind: "idle" } | { kind: "copied" } | { kind: "error"; url: string };

/**
 * Share a rebate result: the Web Share API where the browser has it, otherwise (or on request) the link is
 * copied. The link holds only the city and the lawn size. Renders nothing when there is no amount to share.
 */
export function ShareRebate({
  city,
  sqft,
  className,
  compact = false,
}: {
  city: ProgramId;
  sqft: number;
  className?: string;
  /** Text-link styling for tight spots such as the hero estimator. */
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const summary = shareSummary({ city, sqft });
  if (!summary) return null;

  const url = () => new URL(sharePath(summary), window.location.origin).toString();

  const copy = async () => {
    const link = url();
    try {
      await navigator.clipboard.writeText(link);
      setStatus({ kind: "copied" });
      track("rebate_shared", { method: "copy", city });
    } catch {
      setStatus({ kind: "error", url: link });
    }
  };

  const share = async () => {
    const data = {
      title: summary.headline,
      text: `${summary.headline}, by Sonoran Swap's estimate for a ${sqft.toLocaleString("en-US")} sq ft lawn.`,
      url: url(),
    };
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        setStatus({ kind: "idle" });
        track("rebate_shared", { method: "native", city });
        return;
      } catch (err) {
        // The visitor closed the share sheet: nothing to do.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copy();
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {compact ? (
          <button
            type="button"
            onClick={share}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-semibold link"
          >
            <Share2Icon className="size-4" aria-hidden="true" />
            Share this estimate
          </button>
        ) : (
          <Button type="button" variant="secondary" onClick={share}>
            <Share2Icon aria-hidden="true" />
            Share this estimate
          </Button>
        )}
        <button type="button" onClick={copy} className="min-h-11 cursor-pointer font-semibold link">
          Copy link
        </button>
      </div>
      <p aria-live="polite" className="text-sm text-ink-muted">
        {status.kind === "copied" && "Link copied. It holds only the city and lawn size, never your address."}
        {status.kind === "error" && (
          <>
            Couldn&apos;t copy. Here&apos;s the link: <span className="break-all">{status.url}</span>
          </>
        )}
      </p>
    </div>
  );
}

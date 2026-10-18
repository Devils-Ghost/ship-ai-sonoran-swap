"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ReceiptTextIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics/client";
import { PROOF_OPEN_EVENT } from "@/lib/proof/open";
import type { ProofTab } from "@/lib/proof/content";

// FR-PROOF-01: a "Proof" button on every page opens a right-side drawer (full-height sheet on phones). Radix
// traps focus and closes on Escape; the URL hash #proof opens it, so a link can share it.
const ProofPanel = dynamic(() => import("./proof-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3 px-6 pt-4" aria-busy="true">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  ),
});

const HASH = "#proof";

export function ProofDrawer({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ProofTab>("timeline");

  useEffect(() => {
    const fromHash = () => window.location.hash === HASH && show();
    const onEvent = () => show();
    fromHash();
    window.addEventListener("hashchange", fromHash);
    window.addEventListener(PROOF_OPEN_EVENT, onEvent);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener(PROOF_OPEN_EVENT, onEvent);
    };
  }, []);

  function show() {
    setOpen(true);
    track("proof_opened", { tab: "timeline" });
    if (window.location.hash !== HASH) window.history.replaceState(window.history.state, "", HASH);
  }

  const change = (next: boolean) => {
    if (next) return show();
    setOpen(false);
    if (window.location.hash === HASH) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={change}>
      <button
        type="button"
        onClick={show}
        className={className}
        aria-label="Proof: how this site was built and tested"
        title="Proof"
      >
        <ReceiptTextIcon className="size-5" aria-hidden="true" />
      </button>
      <SheetContent closeLabel="Close proof">
        <SheetHeader className="pr-14">
          <SheetTitle>Proof</SheetTitle>
          <SheetDescription>What we shipped, how we checked it, and its limits.</SheetDescription>
        </SheetHeader>
        {open && <ProofPanel tab={tab} onTab={setTab} />}
      </SheetContent>
    </Sheet>
  );
}

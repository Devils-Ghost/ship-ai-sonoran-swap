"use client";

import dynamic from "next/dynamic";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProofTab } from "@/lib/proof/content";

// Loaded on first open (see ./proof-drawer): the dialog and the tab panel stay out of every page's first load.
const ProofPanel = dynamic(() => import("./proof-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3 px-6 pt-4" aria-busy="true">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  ),
});

export default function ProofSheet({
  open,
  onOpenChange,
  tab,
  setTab,
  restoreFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: ProofTab;
  setTab: (tab: ProofTab) => void;
  restoreFocus: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        closeLabel="Close proof"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          restoreFocus();
        }}
      >
        <SheetHeader className="pr-14">
          <SheetTitle>Proof</SheetTitle>
          <SheetDescription>What we shipped, how we checked it, and its limits.</SheetDescription>
        </SheetHeader>
        {open && <ProofPanel tab={tab} onTab={setTab} />}
      </SheetContent>
    </Sheet>
  );
}

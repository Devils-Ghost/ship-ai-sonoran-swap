"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ReceiptTextIcon } from "lucide-react";
import { track } from "@/lib/analytics/client";
import { PROOF_OPEN_EVENT } from "@/lib/proof/open";
import type { ProofTab } from "@/lib/proof/content";

// FR-PROOF-01: a "Proof" button on every page opens a right-side drawer (full-height sheet on phones). Radix
// traps focus and closes on Escape; the URL hash #proof opens it, so a link can share it.
const ProofSheet = dynamic(() => import("./proof-sheet"), { ssr: false });

const HASH = "#proof";

export function ProofDrawer({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ProofTab>("timeline");
  // The sheet's code loads the first time it opens (button, hash or menu), not with the page.
  const [loaded, setLoaded] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

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
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setLoaded(true);
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
    <>
      <button
        aria-haspopup="dialog"
        type="button"
        onClick={show}
        className={className}
        aria-label="Proof: how this site was built and tested"
        title="Proof"
      >
        <ReceiptTextIcon className="size-5" aria-hidden="true" />
      </button>
      {loaded && (
        <ProofSheet
          open={open}
          onOpenChange={change}
          tab={tab}
          setTab={setTab}
          restoreFocus={() => {
            const el = opener.current;
            if (el?.isConnected && el.offsetParent !== null) el.focus();
            else document.getElementById("main")?.focus({ preventScroll: true });
          }}
        />
      )}
    </>
  );
}

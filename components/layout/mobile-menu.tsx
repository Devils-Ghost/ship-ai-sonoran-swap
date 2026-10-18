"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { MenuIcon } from "lucide-react";
import type { NavLink } from "@/lib/site";

// The menu button is plain; the sheet (Radix Dialog) loads on the first tap. Without a Radix Trigger, the
// sheet hands focus back to this button itself when it closes.
const MobileMenuSheet = dynamic(() => import("./mobile-menu-sheet"), { ssr: false });

export function MobileMenu(props: { links: NavLink[]; extra: NavLink[]; badge: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-sand"
        aria-label="Open menu"
      >
        <MenuIcon className="size-6" aria-hidden="true" />
      </button>
      {loaded && <MobileMenuSheet {...props} open={open} setOpen={setOpen} returnFocus={button} />}
    </>
  );
}

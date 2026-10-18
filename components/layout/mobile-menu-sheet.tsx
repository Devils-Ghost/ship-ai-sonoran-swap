"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { openProof } from "@/lib/proof/open";
import type { NavLink } from "@/lib/site";

// SRS §5.2 mobile: menu sheet with 48 px rows; the concept badge and Proof link live inside. Loaded on the
// first tap (see ./mobile-menu), so the dialog code isn't in every page's first load (C1).
export default function MobileMenuSheet({
  links,
  extra,
  badge,
  open,
  setOpen,
  returnFocus,
}: {
  links: NavLink[];
  extra: NavLink[];
  badge: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  returnFocus: React.RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        closeLabel="Close menu"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col px-3 pb-6">
          <ul className="flex flex-col">
            {[...links, ...extra].map((link) => (
              <li key={link.href}>
                {link.href === "#proof" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openProof();
                    }}
                    className="flex min-h-12 w-full cursor-pointer items-center rounded-input px-3 text-lg font-medium text-ink hover:bg-sand"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="flex min-h-12 items-center rounded-input px-3 text-lg font-medium text-ink hover:bg-sand aria-[current=page]:text-terracotta"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6 px-3">{badge}</div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

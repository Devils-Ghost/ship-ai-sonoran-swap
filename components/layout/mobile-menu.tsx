"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavLink } from "@/lib/site";

// SRS §5.2 mobile: menu sheet with 48 px rows; the concept badge and Proof link live inside.
export function MobileMenu({
  links,
  extra,
  badge,
}: {
  links: NavLink[];
  extra: NavLink[];
  badge: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-sand"
        aria-label="Open menu"
      >
        <MenuIcon className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent closeLabel="Close menu">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col px-3 pb-6">
          <ul className="flex flex-col">
            {[...links, ...extra].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="flex min-h-12 items-center rounded-input px-3 text-lg font-medium text-ink hover:bg-sand aria-[current=page]:text-terracotta"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 px-3">{badge}</div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

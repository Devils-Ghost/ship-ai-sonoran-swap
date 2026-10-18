"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { NavLink } from "@/lib/site";

// SRS §4.3 / HACKATHON D2: one primary button per viewport. On the studio the results panel owns the
// primary action, so the header doesn't repeat "See my rebate" there.
export function HeaderCta({ link }: { link: NavLink }) {
  const pathname = usePathname();
  if (pathname === link.href) return <span className="w-0" aria-hidden="true" />;
  return (
    <Button asChild size="sm" className="max-[359px]:px-3">
      <Link href={link.href}>{link.label}</Link>
    </Button>
  );
}

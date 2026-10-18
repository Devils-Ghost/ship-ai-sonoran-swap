"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { NavLink } from "@/lib/site";

// SRS §4.3 / QUALITY D2: one primary button per viewport. The header CTA is saguaro ("brand") so the
// page's own terracotta button stays the single primary; on the studio it's hidden (the page is the CTA).
export function HeaderCta({ link }: { link: NavLink }) {
  const pathname = usePathname();
  if (pathname === link.href) return <span className="w-0" aria-hidden="true" />;
  return (
    <Button asChild size="sm" variant="brand" className="max-[359px]:px-3">
      <Link href={link.href}>{link.label}</Link>
    </Button>
  );
}

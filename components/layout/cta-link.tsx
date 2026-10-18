import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRIMARY_CTA, type NavLink } from "@/lib/site";

// SRS §4.3: one primary-styled action per viewport; everything else is secondary or a text link.
export function PrimaryCta({ link = PRIMARY_CTA }: { link?: NavLink }) {
  return (
    <Button asChild>
      <Link href={link.href}>{link.label}</Link>
    </Button>
  );
}

export function SecondaryCta({ link }: { link: NavLink }) {
  return (
    <Button asChild variant="secondary">
      <Link href={link.href}>{link.label}</Link>
    </Button>
  );
}

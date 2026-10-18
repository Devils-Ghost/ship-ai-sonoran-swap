import Link from "next/link";
import { cn } from "cn";
import { ChevronRightIcon } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { webPageJsonLd } from "@/lib/seo/json-ld";
import type { NavLink } from "@/lib/site";

// SRS §5.2: on every page except home, studio, visualize and live. The last crumb is the current page.
// It also emits the page's WebPage + BreadcrumbList structured data (FR-SEO-03), so the two never drift.
export function Breadcrumbs({ items, className }: { items: NavLink[]; className?: string }) {
  const trail: NavLink[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-ink-muted", className)}>
      <JsonLd data={webPageJsonLd(trail)} />
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((item, i) => {
          const current = i === trail.length - 1;
          return (
            <li key={item.href} className="inline-flex items-center gap-1">
              {current ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href} className="underline-offset-3 hover:text-ink hover:underline">
                    {item.label}
                  </Link>
                  <ChevronRightIcon className="size-3.5" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

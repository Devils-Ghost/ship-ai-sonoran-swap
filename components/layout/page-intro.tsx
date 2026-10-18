import { cn } from "cn";
import type { NavLink } from "@/lib/site";
import { Breadcrumbs } from "./breadcrumbs";

// The top of every inner page: breadcrumbs, eyebrow, the single H1 (HACKATHON D6), lead and actions.
export function PageIntro({
  title,
  eyebrow,
  lead,
  crumbs,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  lead?: React.ReactNode;
  /** Trail after Home; omit on pages SRS §5.2 exempts (studio, visualize, live). */
  crumbs?: NavLink[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("container-page pt-8 pb-12 lg:pt-12 lg:pb-16", className)}>
      {crumbs && <Breadcrumbs items={crumbs} className="mb-8" />}
      <div className="flex max-w-3xl flex-col gap-5">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="text-lead">{lead}</p>}
        {children && <div className="mt-2 flex flex-wrap items-center gap-4">{children}</div>}
      </div>
    </section>
  );
}

/** Honest marker on shell pages until their phase ships; removed page by page. */
export function BuildingNote() {
  return (
    <div className="container-page pb-16">
      <p className="max-w-3xl rounded-card border border-dashed border-line bg-paper px-5 py-4 text-ink-muted">
        This page is being built during the hackathon, Oct 17–18, 2026.
      </p>
    </div>
  );
}

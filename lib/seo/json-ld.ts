import business from "@/content/business.json";
import { publicEnv } from "@/lib/env";
import type { NavLink } from "@/lib/site";

// FR-SEO-03 / SRS §4.5 structured data. No LocalBusiness markup in concept mode: the business isn't real.
// JSON_LD_TYPES feeds scripts/seo-report.ts and the /insights SEO panel; keep it in step with the builders.
export const JSON_LD_TYPES: readonly string[] = [
  "WebSite",
  "WebPage",
  "BreadcrumbList",
  "FAQPage",
  "Article",
];

const abs = (path: string) => new URL(path, publicEnv.siteUrl).toString();

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.name,
    url: abs("/"),
    description: business.shortDescription,
    inLanguage: "en-US",
  };
}

/** WebPage with its breadcrumb trail (Home first, current page last). */
export function webPageJsonLd(trail: NavLink[]) {
  const current = trail.at(-1);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: current?.label,
    url: current ? abs(current.href) : abs("/"),
    isPartOf: { "@type": "WebSite", name: business.name, url: abs("/") },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: trail.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
        item: abs(item.href),
      })),
    },
  };
}

export function articleJsonLd(guide: {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sources: { label: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updated,
    mainEntityOfPage: abs(`/guides/${guide.slug}`),
    image: abs(`/api/og?${new URLSearchParams({ title: guide.title }).toString()}`),
    author: { "@type": "Organization", name: business.name, url: abs("/") },
    citation: guide.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })),
  };
}

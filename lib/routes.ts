import { content } from "@/lib/content/load";
import { GUIDES } from "@/lib/guides";
import { formatRateShort, summarize } from "@/lib/rebates/summary";

// SRS §5.1 route registry: one place for every page's title, description and indexing rule.
// Feeds page metadata (FR-SEO-01), sitemap.xml (FR-SEO-02) and the route audit.

export type RouteInfo = {
  path: string;
  title: string;
  description: string;
  /** FR-SEO-02: excluded from the sitemap and marked noindex. */
  index: boolean;
};

const { business, rebates, styles } = content;

const STATIC_ROUTES: RouteInfo[] = [
  {
    path: "/",
    title: `${business.name} · Lawn-to-Desert Yards in Phoenix`,
    description: business.shortDescription,
    index: true,
  },
  {
    path: "/studio",
    title: "Swap Studio: Measure Your Lawn, See Your Rebate",
    description:
      "Outline your lawn on a satellite map and see your estimated city rebate, project range and water savings.",
    index: true,
  },
  {
    path: "/studio/prep",
    title: "Rebate Prep Sheet",
    description: "A printable lawn measurement and rebate prep sheet.",
    index: false,
  },
  {
    path: "/visualize",
    title: "Preview Your Yard as a Desert Garden",
    description: "Upload a photo of your lawn and preview it in three desert styles.",
    index: true,
  },
  {
    path: "/eligibility",
    title: "Will Your Yard Qualify for a Grass Removal Rebate?",
    description:
      "Seven quick questions to check your yard against your city's grass removal rules before you remove anything.",
    index: true,
  },
  {
    path: "/rebates",
    title: "Phoenix-Area Grass Removal Rebates by City",
    description:
      "Compare grass removal rebates across Phoenix-area cities: how each pays, minimums, caps and approval rules.",
    index: true,
  },
  {
    path: "/styles",
    title: "Desert Yard Styles for Phoenix Homes",
    description:
      "Sonoran Native, Modern Desert and Pollinator Garden: three low-water styles for a Phoenix yard.",
    index: true,
  },
  {
    path: "/plants",
    title: "Low-Water Plants for Phoenix Yards",
    description:
      "Trees, shrubs, cacti and groundcovers for a low-water Phoenix yard, filterable by type and sun.",
    index: true,
  },
  {
    path: "/how-it-works",
    title: "How the Lawn-to-Desert Swap Works",
    description:
      "Measure, design, apply, approval, swap, rebate: six steps, and nothing comes out before the city approves.",
    index: true,
  },
  {
    path: "/pricing",
    title: "Lawn-to-Desert Conversion Pricing",
    description:
      "Price ranges per square foot for three project tiers, and how the city rebate changes your net cost.",
    index: true,
  },
  {
    path: "/guides",
    title: "Guides to Phoenix Grass Removal and Desert Yards",
    description:
      "Step-by-step guides to city grass removal rebates, fall planting and artificial turf rules.",
    index: true,
  },
  {
    path: "/book",
    title: "Book a Free Yard Walk",
    description: "Pick a time for a free yard walk to confirm your measurement and design.",
    index: true,
  },
  {
    path: "/live",
    title: "Live Board",
    description: "Live estimates and bookings from this site.",
    index: false,
  },
  {
    path: "/launch-notes",
    title: "Launch Notes: How This Site Was Built and Tested",
    description:
      "The build timeline, quality reports, user-test results and honest limits for this concept site.",
    index: true,
  },
  {
    path: "/insights",
    title: "Growth Insights",
    description: "How this site is performing, from its own anonymized data.",
    index: true,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description: "What this site collects, what it doesn't, and who processes it.",
    index: true,
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    description: "The accessibility standard this site targets, how it was tested and known gaps.",
    index: true,
  },
];

/** SRS §4.5: meta descriptions ≤ 155 characters, cut at a word boundary. */
function clip(text: string, max = 155): string {
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`;
}

// SRS §4.5 title patterns, built from the program data so amounts never drift from rebate-programs.json.
const REBATE_ROUTES: RouteInfo[] = rebates.programs.map((p) => ({
  path: `/rebates/${p.id}`,
  title:
    p.type === "per_sqft"
      ? `${p.city} Grass Removal Rebate: ${formatRateShort(p.ratePerSqft)}/sq ft, Explained`
      : p.type === "tiered"
        ? `${p.city} Grass Removal Incentive: Tiers & Rules`
        : `${p.city} Grass Removal Rebate: Program Status`,
  description: clip(`${summarize(p).sentence} Who qualifies, what not to do, documents and timeline.`),
  index: true,
}));

const STYLE_ROUTES: RouteInfo[] = styles.styles.map((s) => ({
  path: `/styles/${s.slug}`,
  title: `${s.name} Desert Yard Style`,
  description: s.description,
  index: true,
}));

const GUIDE_ROUTES: RouteInfo[] = GUIDES.map((g) => ({
  path: `/guides/${g.slug}`,
  title: g.title,
  description: g.description,
  index: true,
}));

export const ROUTES: RouteInfo[] = [...STATIC_ROUTES, ...REBATE_ROUTES, ...STYLE_ROUTES, ...GUIDE_ROUTES];

export function getRoute(path: string): RouteInfo {
  const route = ROUTES.find((r) => r.path === path);
  if (!route) throw new Error(`No route registered for ${path} (lib/routes.ts)`);
  return route;
}

export function findRoute(path: string): RouteInfo | undefined {
  return ROUTES.find((r) => r.path === path);
}

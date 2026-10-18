// SRS §5.2 navigation. One list feeds the header, mobile menu, footer and sitemap so they never drift.

export type NavLink = { label: string; href: string };

/** Header (desktop) and mobile menu: at most 6 items plus the CTA (QUALITY D3). */
export const PRIMARY_NAV: NavLink[] = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Rebates", href: "/rebates" },
  { label: "Styles", href: "/styles" },
  { label: "Pricing", href: "/pricing" },
  { label: "Guides", href: "/guides" },
];

export const PRIMARY_CTA: NavLink = { label: "See my rebate", href: "/studio" };

export const FOOTER_NAV: { title: string; links: NavLink[] }[] = [
  {
    title: "Swap",
    links: [
      { label: "Studio", href: "/studio" },
      { label: "Visualize", href: "/visualize" },
      { label: "Eligibility", href: "/eligibility" },
      { label: "Book", href: "/book" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Rebates by city", href: "/rebates" },
      { label: "Styles", href: "/styles" },
      { label: "Plants", href: "/plants" },
      { label: "Guides", href: "/guides" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Launch notes", href: "/launch-notes" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

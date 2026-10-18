import rebates from "@/content/rebate-programs.json";
import business from "@/content/business.json";

// SRS §5.1 routes 19–21, §4.5 titles, §6.12 fields. Bodies are MDX in content/guides/<slug>.mdx.
// Every number inside a guide comes from rebate-programs.json through components/guides/facts.tsx.

const source = (id: string) => {
  const p = rebates.programs.find((x) => x.id === id);
  return p ? { label: `${p.name}, City of ${p.city}`, url: p.sourceUrl } : null;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  sources: { label: string; url: string }[];
  related: { label: string; href: string }[];
};

export const GUIDES = [
  {
    slug: "phoenix-grass-rebate-step-by-step",
    title: "How to Get Phoenix's Grass Removal Rebate, Step by Step",
    description:
      "Every step of the City of Phoenix grass removal incentive, from checking you qualify to the check in the mail.",
    sources: [source("phoenix")],
    related: [
      { label: "Phoenix rebate summary", href: "/rebates/phoenix" },
      { label: "Check your eligibility", href: "/eligibility?city=phoenix" },
    ],
  },
  {
    slug: "fall-planting-phoenix",
    title: "Fall Planting in Phoenix: Start Your Desert Yard Now",
    description:
      "Why fall is planting season in Phoenix, what to plant first, and how city approval fits the calendar.",
    sources: [
      {
        label: "KJZZ, The Show: Gardening during one of the hottest Phoenix Octobers on record",
        url: business.seasonal.sourceUrl,
      },
      source("phoenix"),
    ],
    related: [
      { label: "Phoenix rebate summary", href: "/rebates/phoenix" },
      { label: "Low-water plants", href: "/plants" },
    ],
  },
  {
    slug: "artificial-turf-and-rebates",
    title: "Artificial Turf and Rebates: What Mesa and Chandler Say",
    description: "What Mesa, Chandler and Phoenix say about artificial turf, and what to choose instead.",
    sources: [source("mesa"), source("chandler"), source("phoenix")],
    related: [
      { label: "Mesa rebate summary", href: "/rebates/mesa" },
      { label: "Chandler rebate summary", href: "/rebates/chandler" },
      { label: "Desert yard styles", href: "/styles" },
    ],
  },
].map((g) => ({ ...g, sources: g.sources.filter((s) => s !== null) })) satisfies Guide[];

export type GuideSlug = (typeof GUIDES)[number]["slug"];

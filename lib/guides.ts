// SRS §5.1 routes 19–21 and §4.5 titles. replaces this list with MDX frontmatter.
export const GUIDES = [
  {
    slug: "phoenix-grass-rebate-step-by-step",
    title: "How to Get Phoenix's Grass Removal Rebate, Step by Step",
    description:
      "Every step of the City of Phoenix grass removal incentive, from checking you qualify to the check in the mail.",
  },
  {
    slug: "fall-planting-phoenix",
    title: "Fall Planting in Phoenix: Start Your Desert Yard Now",
    description:
      "Why fall is planting season in Phoenix, what to plant first, and how city approval fits the calendar.",
  },
  {
    slug: "artificial-turf-and-rebates",
    title: "Artificial Turf and Rebates: What Mesa and Chandler Say",
    description: "What Mesa, Chandler and Phoenix say about artificial turf, and what to choose instead.",
  },
] as const;

export type GuideSlug = (typeof GUIDES)[number]["slug"];

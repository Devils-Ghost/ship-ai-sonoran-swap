import business from "@/content/business.json";

// FR-PROOF-02/03 copy for the Proof drawer and /launch-notes. Every statement here describes what the code
// does or what the data files say; nothing is invented (AGENTS §2.1). Numbers come from the content files.

export const PROOF_TABS = [
  { id: "quality", label: "Quality" },
  { id: "testing", label: "Testing" },
  { id: "how", label: "How it works" },
  { id: "limits", label: "Limits" },
  { id: "privacy", label: "Privacy" },
] as const;

export type ProofTab = (typeof PROOF_TABS)[number]["id"];

/** The honest limits list (RC10). */
export const LIMITS: string[] = [
  `${business.name} is a concept business. There is no crew yet: bookings are demonstrations and no one will visit.`,
  "Rebate figures are estimates from the cities' public pages. Eligibility and payment are decided by each city, and the Phoenix, Mesa and Chandler pages don't state whether funds remain.",
  "Scottsdale's program is between seasons, so the site shows its status instead of an amount.",
  "Prices are illustrative concept pricing, not quotes.",
  "Water savings are an estimate from a City of Phoenix figure (about a million gallons per acre of grass a year), not a measurement of your yard.",
  "A lawn outlined on satellite imagery is approximate. A yard walk would confirm the measurement before any application.",
  "When Mapbox is unavailable, address search and imagery switch to free OpenStreetMap search and USGS aerial photos, which can be older and less sharp.",
  "Yard previews are AI concept renderings from a free image service with a daily limit. After the limit, or if the service fails, the site shows a labeled example instead of your yard.",
  "User-test numbers come from a small group of people. They show how this site performed for them, not a statistical result.",
  "The site is in English only.",
];

/** "How it works" tab: the engine and AI constraints, in plain words. */
export const HOW_IT_WORKS: { title: string; text: string }[] = [
  {
    title: "Rebate engine",
    text: "Each city's published rules (rate, tiers, minimum, cap, rounding, tree bonus) live in one data file. A single pure function turns your city and lawn size into an estimate, and the server recomputes it with the same function. Unit tests cover every boundary in the requirements.",
  },
  {
    title: "Measuring",
    text: "You outline your grass on satellite imagery in your browser; the area is computed there. Your address and outline never reach our server, only the city and the square footage.",
  },
  {
    title: "Yard previews",
    text: "Your photo is resized in your browser, sent to an image-editing model with a style prompt, and returned as a preview. We don't store photos or previews, and every preview is labeled as an AI concept rendering.",
  },
  {
    title: "Eligibility check",
    text: "The questions come from each program's rules. Any blocking answer says so plainly, and the most common mistake, removing grass before approval, is always asked.",
  },
  {
    title: "Booking and the live board",
    text: "A demo booking stores a date, a time window and a city, and sends a push notification to the team's phone. The live board and the insights page count real events on this site, never invented numbers.",
  },
];

export const PRIVACY_SUMMARY: string[] = [
  "We keep your city, lawn size and the options you choose.",
  "No names, phone numbers, street addresses, coordinates or photos.",
  "Anonymous events use a random ID kept in your browser tab, not a cookie.",
  "Feedback email is optional and kept only if you agree we may reply.",
];

import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

// FR-SEO-02. Non-indexable pages also carry noindex, since robots.txt alone doesn't keep them out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/live", "/studio/prep", "/book/confirmed/"] }],
    sitemap: new URL("/sitemap.xml", publicEnv.siteUrl).toString(),
  };
}

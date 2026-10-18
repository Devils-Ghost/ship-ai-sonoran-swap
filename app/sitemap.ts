import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { ROUTES } from "@/lib/routes";

// FR-SEO-02: every indexable route; /live, /studio/prep and booking confirmations are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter((r) => r.index).map((r) => ({
    url: new URL(r.path, publicEnv.siteUrl).toString(),
    changeFrequency: "weekly",
    priority: r.path === "/" ? 1 : r.path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}

import type { MetadataRoute } from "next";
import { content } from "@/lib/content/load";

// FR-SEO-05. Colors are the caliche and saguaro tokens (DESIGN §2).
export default function manifest(): MetadataRoute.Manifest {
  const { business } = content;
  return {
    name: business.name,
    short_name: business.name,
    description: business.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#2f4a35",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}

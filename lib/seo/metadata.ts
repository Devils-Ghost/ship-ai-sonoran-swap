import type { Metadata } from "next";
import { content } from "@/lib/content/load";
import { findRoute, getRoute, type RouteInfo } from "@/lib/routes";

// FR-SEO-01: title, description, canonical, Open Graph and Twitter card per route.
// OG images arrive later (FR-SEO-04); until then the root defaults apply.
export function pageMetadata(pathOrRoute: string | RouteInfo): Metadata {
  const route = typeof pathOrRoute === "string" ? getRoute(pathOrRoute) : pathOrRoute;
  const siteName = content.business.name;
  return {
    title: route.path === "/" ? { absolute: route.title } : route.title,
    description: route.description,
    alternates: { canonical: route.path },
    robots: route.index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: route.path,
      title: route.title,
      description: route.description,
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
    },
  };
}

/** For dynamic segments: an unknown slug returns empty metadata so the page's notFound() can answer 404. */
export function dynamicPageMetadata(path: string): Metadata {
  const route = findRoute(path);
  return route ? pageMetadata(route) : {};
}

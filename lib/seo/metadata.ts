import type { Metadata } from "next";
import { content } from "@/lib/content/load";
import { findRoute, getRoute, type RouteInfo } from "@/lib/routes";

// FR-SEO-01: title, description, canonical, Open Graph and Twitter card per route.

/** FR-SEO-04: the share image for a page, rendered by /api/og. */
export function ogImage(title: string, subtitle?: string) {
  const q = new URLSearchParams({ title });
  if (subtitle) q.set("subtitle", subtitle);
  return { url: `/api/og?${q.toString()}`, width: 1200, height: 630, alt: title };
}

export function pageMetadata(pathOrRoute: string | RouteInfo): Metadata {
  const route = typeof pathOrRoute === "string" ? getRoute(pathOrRoute) : pathOrRoute;
  const siteName = content.business.name;
  // The home page shares the tagline; every other page its own title.
  const image = ogImage(
    route.path === "/" ? content.business.tagline : route.title,
    route.path === "/" ? content.business.oneLiner : route.description,
  );
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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
      images: [image.url],
    },
  };
}

/** For dynamic segments: an unknown slug returns empty metadata so the page's notFound() can answer 404. */
export function dynamicPageMetadata(path: string): Metadata {
  const route = findRoute(path);
  return route ? pageMetadata(route) : {};
}

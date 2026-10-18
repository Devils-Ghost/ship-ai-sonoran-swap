import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/rebates");

// The comparison table (FR-RBH) ships later; city links are live now so every page is ≤ 2 clicks away.
export default function RebatesPage() {
  return (
    <>
      <PageIntro
        title="Grass removal rebates by city"
        lead="How Phoenix, Mesa, Chandler and Scottsdale pay you to replace a lawn, from each city's official page."
        crumbs={[{ label: "Rebates", href: "/rebates" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <nav aria-label="City rebate pages" className="container-page pb-12">
        <ul className="flex flex-wrap gap-3">
          {content.rebates.programs.map((p) => (
            <li key={p.id}>
              <Link
                href={`/rebates/${p.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-4 font-medium text-ink hover:border-ink-muted"
              >
                {p.city}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <BuildingNote />
    </>
  );
}

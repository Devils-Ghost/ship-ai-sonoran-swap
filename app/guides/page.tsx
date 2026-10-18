import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { GUIDES } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/guides");

export default function GuidesPage() {
  return (
    <>
      <PageIntro
        title="Guides"
        lead="Plain-language guides to city grass removal rebates and desert yards, with sources."
        crumbs={[{ label: "Guides", href: "/guides" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <ul className="container-page grid gap-4 pb-16 md:grid-cols-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="flex h-full flex-col gap-2 rounded-card border border-line bg-paper p-6 hover:border-ink-muted"
            >
              <span className="font-display text-xl font-medium text-saguaro">{g.title}</span>
              <span className="text-ink-muted">{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

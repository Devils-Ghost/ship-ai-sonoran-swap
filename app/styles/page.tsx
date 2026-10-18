import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/styles");

// Copy: CONTENT §2 styles teaser and §6. The full overview ships later.
export default function StylesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Three ways to go desert"
        title="See your yard before you change it."
        lead="Upload a photo of your lawn and preview it in three styles."
        crumbs={[{ label: "Styles", href: "/styles" }]}
      >
        <PrimaryCta link={{ label: "Preview my yard", href: "/visualize" }} />
      </PageIntro>
      <div className="container-page grid gap-4 pb-12 md:grid-cols-3">
        {content.styles.styles.map((s) => (
          <Link
            key={s.slug}
            href={`/styles/${s.slug}`}
            className="flex flex-col gap-2 rounded-card border border-line bg-paper p-6 hover:border-ink-muted"
          >
            <span className="font-display text-2xl font-medium text-saguaro">{s.name}</span>
            <span className="text-ink-muted">{s.tagline}</span>
          </Link>
        ))}
      </div>
      <BuildingNote />
    </>
  );
}

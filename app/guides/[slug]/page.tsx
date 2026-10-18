import { GuideRead } from "@/components/analytics/guide-read";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRightIcon } from "lucide-react";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { JsonLd } from "@/components/shared/json-ld";
import { GUIDES } from "@/lib/guides";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { dynamicPageMetadata } from "@/lib/seo/metadata";

// Content-only pages: render fully at build. An unlisted param waits for the full render, so
// notFound() below answers with a real 404 instead of a 200 app shell (Cache Components has no dynamicParams).
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  return dynamicPageMetadata(`/guides/${slug}`);
}

/** ~220 words a minute over the MDX source, ignoring imports and component tags. */
async function readingMinutes(slug: string): Promise<number> {
  // The MDX only changes with a deploy, so the count is cached and the page stays fully static.
  "use cache";
  const raw = await readFile(path.join(process.cwd(), "content", "guides", `${slug}.mdx`), "utf8");
  const words = raw
    .replace(/^import .*$/gm, "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// SRS §6.12 FR-GDE: title, description, reading time, body, sources, related links, CTA.
export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();
  const { default: Body } = (await import(`@/content/guides/${guide.slug}.mdx`)) as {
    default: React.ComponentType;
  };
  const minutes = await readingMinutes(guide.slug);

  return (
    <>
      <PageIntro
        title={guide.title}
        lead={guide.description}
        crumbs={[
          { label: "Guides", href: "/guides" },
          { label: guide.title, href: `/guides/${guide.slug}` },
        ]}
      >
        <p className="text-sm text-ink-muted">{minutes} min read</p>
      </PageIntro>

      <JsonLd data={articleJsonLd(guide)} />
      <article className="container-page pb-12">
        <div className="max-w-[68ch]">
          <Body />
        </div>
        <GuideRead slug={guide.slug} />
      </article>

      <section aria-labelledby="sources" className="border-t border-line py-12">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 id="sources" className="text-2xl">
              Sources
            </h2>
            <ul className="flex flex-col gap-2">
              {guide.sources.map((s) => (
                <li key={s.url + s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">
                    {s.label}
                    <ArrowUpRightIcon className="ml-0.5 inline size-3.5" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl">Related</h2>
            <ul className="flex flex-col gap-2">
              {guide.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="link">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container-page pt-10">
          <PrimaryCta />
        </div>
      </section>
    </>
  );
}

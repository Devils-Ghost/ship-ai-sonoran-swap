import Link from "next/link";
import { notFound } from "next/navigation";
import { PrimaryCta, SecondaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { AiLabel } from "@/components/shared/ai-label";
import { CompareSlider } from "@/components/visualize/compare-slider";
import { content } from "@/lib/content/load";
import { dynamicPageMetadata } from "@/lib/seo/metadata";
import { sampleAfter, sampleBefore, SAMPLE_YARDS, showcaseYard } from "@/lib/visualize/samples";

// Content-only pages: render fully at build. An unlisted param waits for the full render, so
// notFound() below answers with a real 404 instead of a 200 app shell (Cache Components has no dynamicParams).
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return content.styles.styles.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/styles/[slug]">) {
  const { slug } = await params;
  return dynamicPageMetadata(`/styles/${slug}`);
}

// SRS §6.8 FR-STY: description, mood, before/after, materials, plants (from plants.json by style), upkeep.
export default async function StylePage({ params }: PageProps<"/styles/[slug]">) {
  const { slug } = await params;
  const style = content.styles.styles.find((s) => s.slug === slug);
  if (!style) notFound();
  const yard = SAMPLE_YARDS.find((y) => y.id === showcaseYard(style.slug)) ?? SAMPLE_YARDS[0];
  const plants = style.plantIds
    .map((id) => content.plants.plants.find((p) => p.id === id))
    .filter((p) => p !== undefined);
  const others = content.styles.styles.filter((s) => s.slug !== style.slug);

  return (
    <>
      <PageIntro
        eyebrow={style.mood.join(" · ")}
        title={style.name}
        lead={`${style.tagline} ${style.description}`}
        crumbs={[
          { label: "Styles", href: "/styles" },
          { label: style.name, href: `/styles/${style.slug}` },
        ]}
      >
        <PrimaryCta link={{ label: "Try this style on my yard", href: `/visualize?style=${style.slug}` }} />
      </PageIntro>

      <section aria-label="Before and after" className="container-page pb-12">
        <figure className="flex flex-col gap-2">
          <CompareSlider
            before={{ src: sampleBefore(yard.id), alt: yard.alt }}
            after={{
              src: sampleAfter(yard.id, style.slug),
              alt: `The same sample yard as a ${style.name} desert garden`,
            }}
            priority
            sizes="(min-width: 1248px) 1200px, 100vw"
          >
            <AiLabel />
          </CompareSlider>
          <figcaption className="text-[0.8125rem] text-ink-muted">
            {content.business.disclosures.sample}
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="materials" className="border-t border-line py-12">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-3">
            <h2 id="materials">Materials</h2>
            <p className="text-ink first-letter:uppercase">{style.materials}.</p>
            <p className="text-ink-muted">Upkeep: {style.maintenance}</p>
          </div>
          <div className="flex flex-col gap-4">
            <h2>Plants in this style</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {plants.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 rounded-card border border-line bg-paper p-4">
                  <span className="font-semibold text-ink">{p.common}</span>
                  <span className="text-[0.9375rem] text-ink-muted italic">{p.botanical}</span>
                  <span className="text-[0.9375rem] text-ink-muted">
                    {p.matureSize} · {p.bloom}
                  </span>
                  <span className="text-[0.9375rem] text-ink">{p.note}</span>
                </li>
              ))}
            </ul>
            <Link href="/plants" className="w-fit font-semibold link">
              See every low-water plant
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="other-styles" className="border-t border-line py-12">
        <div className="container-page flex flex-col gap-4">
          <h2 id="other-styles">Other styles</h2>
          <div className="flex flex-wrap gap-3">
            {others.map((s) => (
              <SecondaryCta key={s.slug} link={{ label: s.name, href: `/styles/${s.slug}` }} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

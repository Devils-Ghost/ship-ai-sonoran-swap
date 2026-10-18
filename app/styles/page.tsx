import Image from "next/image";
import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { AiLabel } from "@/components/shared/ai-label";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";
import { sampleAfter, showcaseYard } from "@/lib/visualize/samples";

export const metadata = pageMetadata("/styles");

// SRS §6.8 overview. Copy: CONTENT §2 styles teaser and §6 (taglines and descriptions from styles.json).
export default function StylesPage() {
  const { styles } = content.styles;
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
      <ul className="container-page flex flex-col gap-10 pb-16">
        {styles.map((s, i) => (
          <li
            key={s.slug}
            className="grid gap-6 overflow-hidden rounded-card border border-line bg-paper lg:grid-cols-2 lg:items-center"
          >
            <div className={i % 2 === 1 ? "relative aspect-[3/2] lg:order-2" : "relative aspect-[3/2]"}>
              <Image
                src={sampleAfter(showcaseYard(s.slug), s.slug)}
                alt={`A sample yard as a ${s.name} desert garden`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <AiLabel />
            </div>
            <div className="flex flex-col gap-4 p-6 lg:p-10">
              <p className="eyebrow">{s.mood.join(" · ")}</p>
              <h2>{s.name}</h2>
              <p className="text-lead">{s.tagline}</p>
              <p className="text-ink">{s.description}</p>
              <p className="text-[0.9375rem] text-ink-muted">Upkeep: {s.maintenance}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                <Link href={`/styles/${s.slug}`} className="font-semibold link">
                  About {s.name}
                </Link>
                <Link href={`/visualize?style=${s.slug}`} className="font-semibold link">
                  Try it on my yard
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

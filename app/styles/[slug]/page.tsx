import { notFound } from "next/navigation";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { dynamicPageMetadata } from "@/lib/seo/metadata";

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

// FR-STY detail (before/after, materials, plants) ships later.
export default async function StylePage({ params }: PageProps<"/styles/[slug]">) {
  const { slug } = await params;
  const style = content.styles.styles.find((s) => s.slug === slug);
  if (!style) notFound();

  return (
    <>
      <PageIntro
        eyebrow={style.tagline}
        title={style.name}
        lead={style.description}
        crumbs={[
          { label: "Styles", href: "/styles" },
          { label: style.name, href: `/styles/${style.slug}` },
        ]}
      >
        <PrimaryCta link={{ label: "Try this style on my yard", href: `/visualize?style=${style.slug}` }} />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

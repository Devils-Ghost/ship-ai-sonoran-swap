import { notFound } from "next/navigation";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { GUIDES } from "@/lib/guides";
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

// Guide bodies (MDX with sources) ship later.
export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

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
        <PrimaryCta />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

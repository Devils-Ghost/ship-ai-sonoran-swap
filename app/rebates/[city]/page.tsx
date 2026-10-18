import { notFound } from "next/navigation";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { SourceNote } from "@/components/shared/source-note";
import { content } from "@/lib/content/load";
import { dynamicPageMetadata } from "@/lib/seo/metadata";

// Content-only pages: render fully at build. An unlisted param waits for the full render, so
// notFound() below answers with a real 404 instead of a 200 app shell (Cache Components has no dynamicParams).
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return content.rebates.programs.map((p) => ({ city: p.id }));
}

function findProgram(city: string) {
  return content.rebates.programs.find((p) => p.id === city);
}

export async function generateMetadata({ params }: PageProps<"/rebates/[city]">) {
  const { city } = await params;
  return dynamicPageMetadata(`/rebates/${city}`);
}

// FR-RBC template (facts, worked example, documents, FAQ) ships later.
export default async function CityRebatePage({ params }: PageProps<"/rebates/[city]">) {
  const program = findProgram((await params).city);
  if (!program) notFound();

  return (
    <>
      <PageIntro
        eyebrow={`City of ${program.city}`}
        title={program.name}
        lead={program.statusNote}
        crumbs={[
          { label: "Rebates", href: "/rebates" },
          { label: program.city, href: `/rebates/${program.id}` },
        ]}
      >
        <PrimaryCta />
      </PageIntro>
      <div className="container-page pb-8">
        <SourceNote program={program} />
      </div>
      <BuildingNote />
    </>
  );
}

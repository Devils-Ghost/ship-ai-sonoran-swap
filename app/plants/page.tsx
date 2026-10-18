import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { PlantBrowser } from "@/components/plants/plant-browser";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/plants");

// SRS §6.9 FR-PLT. Every plant was checked against the ADWR list (content/plants.json listNote).
export default function PlantsPage() {
  const { listName, listNote, listSourceUrl } = content.plants;
  return (
    <>
      <PageIntro
        title="Low-water plants for Phoenix yards"
        lead={`Trees, shrubs, cacti and groundcovers for a desert yard, chosen from the ${listName}. Useful even if you never hire us.`}
        crumbs={[{ label: "Plants", href: "/plants" }]}
      >
        <PrimaryCta link={{ label: "Preview my yard", href: "/visualize" }} />
      </PageIntro>
      <section aria-label="Plant guide" className="container-page pb-16">
        <PlantBrowser listSourceUrl={listSourceUrl} />
        <p className="mt-8 text-sm text-ink-muted">{listNote}</p>
      </section>
    </>
  );
}

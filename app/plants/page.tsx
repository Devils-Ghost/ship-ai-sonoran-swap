import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/plants");

// The filterable guide (FR-PLT) ships later.
export default function PlantsPage() {
  return (
    <>
      <PageIntro
        title="Low-water plants for Phoenix yards"
        lead={`Trees, shrubs, cacti and groundcovers for a desert yard, chosen from the ${content.plants.listName}.`}
        crumbs={[{ label: "Plants", href: "/plants" }]}
      >
        <PrimaryCta link={{ label: "Preview my yard", href: "/visualize" }} />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content, isConcept } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/pricing");

// Copy: CONTENT §2 pricing preview. Tier cards and the net-cost example ship later.
export default function PricingPage() {
  return (
    <>
      <PageIntro
        title="Clear ranges, before anyone visits."
        lead="Every project is different. Here's what most yards cost per square foot, before your rebate."
        crumbs={[{ label: "Pricing", href: "/pricing" }]}
      >
        <PrimaryCta />
      </PageIntro>
      {isConcept && <p className="container-page pb-8 text-sm text-ink-muted">{content.pricing.caption}</p>}
      <BuildingNote />
    </>
  );
}

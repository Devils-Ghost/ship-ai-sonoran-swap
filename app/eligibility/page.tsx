import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/eligibility");

// Copy: CONTENT §4. The question flow ships later.
export default function EligibilityPage() {
  return (
    <>
      <PageIntro
        title="Will your yard qualify?"
        lead="Seven quick questions. We'll tell you what looks good, what to check, and the one mistake to avoid."
        crumbs={[{ label: "Eligibility", href: "/eligibility" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

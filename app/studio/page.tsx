import { SecondaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/studio");

// Copy: CONTENT §3. No breadcrumbs here (SRS §5.2). The studio itself ships in Phase 2.
export default function StudioPage() {
  return (
    <>
      <PageIntro
        title="Measure your lawn. See your rebate."
        lead="Measure on the map, enter the square footage you know, or try a sample yard."
      >
        <SecondaryCta link={{ label: "Compare city rebates", href: "/rebates" }} />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

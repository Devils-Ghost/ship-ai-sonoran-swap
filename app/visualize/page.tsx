import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/visualize");

// Copy: CONTENT §5. No breadcrumbs here (SRS §5.2). The visualizer ships in Phase 3.
export default function VisualizePage() {
  return (
    <>
      <PageIntro
        title="See your lawn as a desert yard."
        lead="Upload a photo of your lawn and preview it in three styles."
      >
        <PrimaryCta />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

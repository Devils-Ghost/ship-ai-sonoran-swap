import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/live");

// The projector board (FR-LIVE, dark variant) ships later. No breadcrumbs (SRS §5.2).
export default function LivePage() {
  return (
    <>
      <PageIntro title="Live board" lead="Estimates and bookings made on this site, counted as they happen.">
        <PrimaryCta />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

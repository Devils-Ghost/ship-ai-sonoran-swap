import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/insights");

// Copy: CONTENT §9. Panels ship later.
export default function InsightsPage() {
  return (
    <>
      <PageIntro
        title="Growth insights"
        lead="How this site is performing, from its own anonymized data. This is the dashboard a landscaper would use to improve their marketing, shown in the open."
        crumbs={[{ label: "Insights", href: "/insights" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/accessibility");

// SRS §6.16 / §15.7. Testing results and known gaps are added later after the accessibility audit.
export default function AccessibilityPage() {
  return (
    <>
      <PageIntro
        title="Accessibility"
        lead="This site aims to meet WCAG 2.2 AA: it works with a keyboard and screen readers, respects reduced motion, and never uses color alone to carry meaning."
        crumbs={[{ label: "Accessibility", href: "/accessibility" }]}
      />
      <BuildingNote />
    </>
  );
}

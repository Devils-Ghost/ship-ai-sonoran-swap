import type { Metadata } from "next";
import { SecondaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content, isConcept } from "@/lib/content/load";

// FR-SEO-02: confirmations are private to the visitor and never indexed.
export const metadata: Metadata = {
  title: "Your yard walk",
  robots: { index: false, follow: false },
};

// The real confirmation reads the booking. The stub doesn't read params, so it stays static.
export default function BookingConfirmedPage() {
  return (
    <>
      <PageIntro
        title="Your yard walk"
        crumbs={[
          { label: "Book", href: "/book" },
          { label: "Confirmation", href: "/book" },
        ]}
      >
        <SecondaryCta link={{ label: "Book a yard walk", href: "/book" }} />
      </PageIntro>
      {isConcept && (
        <p className="container-page pb-8 text-ink-muted">{content.business.disclosures.booking}</p>
      )}
      <BuildingNote />
    </>
  );
}

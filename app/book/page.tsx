import { SecondaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content, isConcept } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/book");

// Copy: CONTENT §7. The slot picker and booking flow ship later.
export default function BookPage() {
  return (
    <>
      <PageIntro
        title="Book a free yard walk."
        lead={content.business.hours}
        crumbs={[{ label: "Book", href: "/book" }]}
      >
        <SecondaryCta link={{ label: "See my rebate first", href: "/studio" }} />
      </PageIntro>
      {isConcept && (
        <p className="container-page pb-8 text-ink-muted">
          This is a demonstration booking. No one will visit.
        </p>
      )}
      <BuildingNote />
    </>
  );
}

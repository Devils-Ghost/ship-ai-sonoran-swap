import { SecondaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/studio/prep");

// FR-PREP-02 title. The printable sheet ships later.
export default function PrepSheetPage() {
  return (
    <>
      <PageIntro
        title="Lawn measurement & rebate prep sheet"
        lead="A printable summary of your measurement, estimated rebate and the documents your city asks for."
        crumbs={[
          { label: "Studio", href: "/studio" },
          { label: "Prep sheet", href: "/studio/prep" },
        ]}
      >
        <SecondaryCta link={{ label: "Measure my lawn", href: "/studio" }} />
      </PageIntro>
      <BuildingNote />
    </>
  );
}

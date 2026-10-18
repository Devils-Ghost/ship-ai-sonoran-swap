import { PageIntro } from "@/components/layout/page-intro";
import { PrepSheet } from "@/components/studio/prep-sheet";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/studio/prep");

// SRS §6.3 (FR-PREP). Static shell; the sheet reads the link and this tab's map snapshot in the browser.
export default function PrepSheetPage() {
  return (
    <>
      <PageIntro
        title="Lawn measurement & rebate prep sheet"
        lead="Your measurement, estimated rebate and the documents your city asks for, ready to print."
        crumbs={[
          { label: "Studio", href: "/studio" },
          { label: "Prep sheet", href: "/studio/prep" },
        ]}
        className="print:pt-0 print:pb-6"
      />
      <div className="container-page pb-20">
        <PrepSheet />
      </div>
    </>
  );
}

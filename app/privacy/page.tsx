import { PageIntro } from "@/components/layout/page-intro";
import { content, isConcept } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/privacy");

// SRS §15.8 summary; the full statement ships later.
export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        title="Privacy"
        lead="We keep your city, lawn size and the options you choose. We don't collect names, phone numbers, addresses or photos."
        crumbs={[{ label: "Privacy", href: "/privacy" }]}
      />
      <div className="container-page flex max-w-3xl flex-col gap-4 pb-16 text-ink-muted">
        <p>
          Your address stays in your browser: it is used only to find your home on the map and is never sent
          to our server. Photos you upload for a preview are sent to our image provider to create it and are
          not stored by us. There are no tracking cookies.
        </p>
        {isConcept && <p>{content.business.disclosures.footer}</p>}
      </div>
    </>
  );
}

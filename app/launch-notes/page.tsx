import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/launch-notes");

// The "about" answer is CONTENT §2 FAQ 6; the concept badge links to #about (SRS §3.6).
// Timeline, reports, test results and limits ship later.
export default function LaunchNotesPage() {
  return (
    <>
      <PageIntro
        title="Launch notes"
        lead="How this site was built and tested: the timeline, quality reports, user-test results and honest limits."
        crumbs={[{ label: "Launch notes", href: "/launch-notes" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <section id="about" aria-labelledby="about-title" className="container-page pb-12">
        <div className="max-w-3xl rounded-card border border-line bg-paper p-6">
          <h2 id="about-title" className="text-2xl">
            Is Sonoran Swap a real company?
          </h2>
          <p className="mt-3 text-ink-muted">
            Not yet. It&apos;s a concept business built for a Phoenix hackathon to show how a local
            landscaper&apos;s website could work. The rebate information is real and linked to official city
            pages.
          </p>
        </div>
      </section>
      <BuildingNote />
    </>
  );
}

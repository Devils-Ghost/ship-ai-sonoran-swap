import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { FeedbackForm } from "@/components/proof/feedback-form";
import {
  HowItWorksSection,
  LimitsSection,
  PrivacySection,
  QualitySection,
  TimelineSection,
} from "@/components/proof/proof-sections";
import { TestingSection } from "@/components/proof/testing-section";
import { ROUTES } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/launch-notes");

// FR-PROOF-03: the Proof drawer's content long-form, plus the about answer (CONTENT §2 FAQ 6; the concept
// badge links to #about, SRS §3.6) and the feedback form (FR-FB).
const FEATURES: { name: string; href: string; text: string }[] = [
  {
    name: "Lawn measurer",
    href: "/studio",
    text: "Outline your grass on satellite imagery, or type the size, or try a sample yard.",
  },
  {
    name: "Rebate engine",
    href: "/rebates",
    text: "Phoenix, Mesa and Chandler rules from the cities' pages; Scottsdale's status.",
  },
  {
    name: "Eligibility check",
    href: "/eligibility",
    text: "One question at a time, with the approval-first warning.",
  },
  {
    name: "AI yard visualizer",
    href: "/visualize",
    text: "Your photo in three desert styles, labeled, never stored.",
  },
  {
    name: "Booking with a live notification",
    href: "/book",
    text: "A demo yard walk that buzzes the team's phone.",
  },
  {
    name: "Live board and growth insights",
    href: "/insights",
    text: "Real, anonymous counts from this site.",
  },
];

export default function LaunchNotesPage() {
  const live = ROUTES.filter((r) => r.index).length;
  return (
    <>
      <PageIntro
        title="Launch notes"
        lead="How this site was built and tested: the timeline, quality reports, user-test results and honest limits."
        crumbs={[{ label: "Launch notes", href: "/launch-notes" }]}
      >
        <PrimaryCta />
      </PageIntro>

      <div className="container-page pb-20">
        <div className="flex max-w-3xl flex-col gap-16">
          <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
            <div className="rounded-card border border-line bg-paper p-6">
              <h2 id="about-title" className="text-2xl">
                Is Sonoran Swap a real company?
              </h2>
              <p className="mt-3 text-ink-muted">
                Not yet. It&apos;s a concept business built for a Phoenix hackathon to show how a local
                landscaper&apos;s website could work. The rebate information is real and linked to official
                city pages.
              </p>
            </div>
          </section>

          <Block id="shipped" title="What we shipped">
            <p className="text-ink-muted">
              {live} indexable pages (listed in the{" "}
              <a href="/sitemap.xml" className="link">
                sitemap
              </a>
              ) and these working tools:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.href} className="rounded-card border border-line bg-paper p-4">
                  <Link href={f.href} className="font-semibold link">
                    {f.name}
                  </Link>
                  <p className="mt-1 text-[0.9375rem] text-ink-muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="quality" title="Quality reports">
            <QualitySection />
          </Block>

          <Block id="testing" title="User testing">
            <TestingSection />
          </Block>

          <Block id="how" title="How it works">
            <HowItWorksSection />
          </Block>

          <Block id="limits" title="Honest limits">
            <LimitsSection />
          </Block>

          <Block id="privacy" title="Privacy in short">
            <PrivacySection />
          </Block>

          <Block id="timeline" title="Build timeline">
            <TimelineSection />
          </Block>

          <Block id="feedback" title="Send feedback">
            <p className="text-ink-muted">
              Something unclear, broken or missing? Tell us. An email is optional.
            </p>
            <FeedbackForm />
          </Block>
        </div>
      </div>
    </>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-5">
      <h2 id={`${id}-title`} className="text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

import { CheckIcon, OctagonXIcon } from "lucide-react";
import { PrimaryCta, SecondaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { FaqList } from "@/components/shared/faq-list";
import { JsonLd } from "@/components/shared/json-ld";
import { content, isConcept } from "@/lib/content/load";
import { faqJsonLd, homeFaq } from "@/lib/faq";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/how-it-works");

// SRS §6.10 FR-HOW: six steps expanded, the promise and guarantee (concept), what's included, what we never
// do, FAQ with JSON-LD. Steps and services from business.json; the "never" list restates the city rules.
const NEVER = [
  "Remove any grass before your city approves the project in writing.",
  "Put artificial turf in a rebate area.",
  "Use black plastic sheeting under rock.",
  "Leave bare soil when we're done.",
];

export default function HowItWorksPage() {
  const { business } = content;
  const faqs = homeFaq();
  return (
    <>
      <PageIntro
        title="How the swap works"
        lead={business.promise}
        crumbs={[{ label: "How it works", href: "/how-it-works" }]}
      >
        <PrimaryCta />
      </PageIntro>

      <section aria-label="Six steps" className="container-page pb-12">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {business.process.map((step) => (
            <li
              key={step.step}
              className={
                step.highlight
                  ? "flex flex-col gap-2 rounded-card bg-saguaro p-6 text-caliche"
                  : "flex flex-col gap-2 rounded-card border border-line bg-paper p-6"
              }
            >
              <span className={step.highlight ? "eyebrow text-caliche/80" : "eyebrow"}>Step {step.step}</span>
              <h2 className={step.highlight ? "text-2xl text-caliche" : "text-2xl"}>{step.title}</h2>
              <p className={step.highlight ? "text-caliche/90" : "text-ink-muted"}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="promise" className="bg-saguaro py-14 text-caliche">
        <div className="container-page flex max-w-3xl flex-col gap-3">
          <h2 id="promise" className="text-caliche">
            Approval first. Always.
          </h2>
          <p className="text-lead text-caliche/90">{business.promise}</p>
          <p className="text-caliche/85">
            {business.promiseGuarantee}
            {isConcept && " (Concept business: this shows the promise a real landscaper could make.)"}
          </p>
        </div>
      </section>

      <section aria-labelledby="included" className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 id="included">What&apos;s included</h2>
          <ul className="flex flex-col gap-4">
            {business.services.map((s) => (
              <li key={s.id} className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-success" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">{s.name}.</span>{" "}
                  <span className="text-ink-muted">{s.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2>What we never do</h2>
          <ul className="flex flex-col gap-4">
            {NEVER.map((n) => (
              <li key={n} className="flex gap-3 text-ink">
                <OctagonXIcon className="mt-1 size-5 shrink-0 text-error" aria-hidden="true" />
                <span>
                  <span className="sr-only">Never: </span>
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq" className="border-t border-line py-14">
        <div className="container-page flex flex-col gap-6">
          <h2 id="faq">Questions</h2>
          <FaqList faqs={faqs} className="max-w-3xl" />
          <div className="flex flex-wrap gap-4 pt-4">
            <PrimaryCta />
            <SecondaryCta link={{ label: "Book a free yard walk", href: "/book" }} />
          </div>
        </div>
      </section>
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}

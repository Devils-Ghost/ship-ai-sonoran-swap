import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote, PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/how-it-works");

// Six steps from business.json (CONTENT §2). Expanded steps, promise and FAQ ship later.
export default function HowItWorksPage() {
  const { business } = content;
  return (
    <>
      <PageIntro
        title="How the swap works"
        lead={business.promise}
        crumbs={[{ label: "How it works", href: "/how-it-works" }]}
      >
        <PrimaryCta />
      </PageIntro>
      <ol className="container-page grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {business.process.map((step) => (
          <li
            key={step.step}
            className={
              step.highlight
                ? "rounded-card bg-saguaro p-6 text-caliche"
                : "rounded-card border border-line bg-paper p-6"
            }
          >
            <span className={step.highlight ? "eyebrow text-caliche/80" : "eyebrow"}>Step {step.step}</span>
            <h2 className={step.highlight ? "mt-2 text-2xl text-caliche" : "mt-2 text-2xl"}>{step.title}</h2>
            <p className={step.highlight ? "mt-2 text-caliche/90" : "mt-2 text-ink-muted"}>{step.text}</p>
          </li>
        ))}
      </ol>
      <BuildingNote />
    </>
  );
}

import { notFound } from "next/navigation";
import { PrimaryCta, SecondaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { QuickEstimate } from "@/components/home/quick-estimate";
import {
  DocumentsChecklist,
  ExampleNotes,
  OfficialSource,
  ProgramFacts,
  Requirements,
  WhatNotToDo,
  WhoQualifies,
  WorkedExample,
} from "@/components/rebates/program-sections";
import { Disclaimer } from "@/components/shared/disclaimer";
import { FaqList } from "@/components/shared/faq-list";
import { JsonLd } from "@/components/shared/json-ld";
import { content } from "@/lib/content/load";
import { cityFaq, faqJsonLd } from "@/lib/faq";
import { summarize } from "@/lib/rebates/summary";
import { dynamicPageMetadata } from "@/lib/seo/metadata";
import { ReopenAlertForm } from "@/components/alerts/reopen-alert-form";
import { isReopenAlertProgram } from "@/lib/alerts";

// Content-only pages: render fully at build. An unlisted param waits for the full render, so
// notFound() below answers with a real 404 instead of a 200 app shell (Cache Components has no dynamicParams).
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return content.rebates.programs.map((p) => ({ city: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/rebates/[city]">) {
  const { city } = await params;
  return dynamicPageMetadata(`/rebates/${city}`);
}

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-12 lg:py-14">
      <div className="container-page flex flex-col gap-6">
        <h2 id={id}>{title}</h2>
        {children}
      </div>
    </section>
  );
}

// SRS §6.7 FR-RBC template. Scottsdale (status only) shows status, last season's maximum and the official
// notice, with no calculator (FR-REB-14).
export default async function CityRebatePage({ params }: PageProps<"/rebates/[city]">) {
  const { city } = await params;
  const program = content.rebates.programs.find((p) => p.id === city);
  if (!program) notFound();
  const summary = summarize(program);
  const faqs = cityFaq(program);
  const noun = program.type === "tiered" ? "incentive" : "rebate";

  return (
    <>
      <PageIntro
        eyebrow={`City of ${program.city}`}
        title={
          summary.open
            ? `${program.city}'s grass removal ${noun}: ${summary.headline}`
            : `${program.city}'s grass removal rebate is between seasons`
        }
        lead={
          summary.open
            ? `${summary.sentence} Here's how it works, from the city's official page.`
            : summary.sentence
        }
        crumbs={[
          { label: "Rebates", href: "/rebates" },
          { label: program.city, href: `/rebates/${program.id}` },
        ]}
      >
        {summary.open ? (
          <>
            <PrimaryCta />
            <SecondaryCta link={{ label: "Check my eligibility", href: `/eligibility?city=${program.id}` }} />
          </>
        ) : (
          <SecondaryCta link={{ label: "Measure my lawn anyway", href: `/studio?city=${program.id}` }} />
        )}
      </PageIntro>

      {!summary.open && isReopenAlertProgram(program.id) && (
        <div id="reopen-alert" className="container-page scroll-mt-24 pb-12">
          <ReopenAlertForm programId={program.id} headingLevel="h2" className="max-w-2xl" />
        </div>
      )}

      <Block id="glance" title="At a glance">
        <ProgramFacts program={program} />
      </Block>

      {summary.open && (
        <Block id="money" title="How the money is calculated">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-6">
              <WorkedExample program={program} />
              <ExampleNotes program={program} />
            </div>
            <QuickEstimate lockedCity={program.id} />
          </div>
        </Block>
      )}

      <Block id="qualify" title="Who qualifies">
        <WhoQualifies program={program} />
      </Block>

      <Block id="dont" title="What you must not do">
        <WhatNotToDo program={program} />
      </Block>

      {program.requirements.length > 0 && (
        <Block id="landscape" title="What the new landscape needs">
          <Requirements program={program} />
        </Block>
      )}

      {program.documents.length > 0 && (
        <Block id="documents" title="Documents you'll need">
          <DocumentsChecklist program={program} />
          <p className="text-ink-muted">
            Our studio measures your lawn and prints a prep sheet with the area.
          </p>
        </Block>
      )}

      <Block id="apply" title="How to apply">
        <p className="max-w-3xl text-ink">{program.howToApply}</p>
      </Block>

      <Block id="questions" title="Questions">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Block>

      <Block id="source" title="Source">
        <OfficialSource program={program} />
        <Disclaimer city={program.city} />
        <div className="flex flex-wrap gap-4 pt-2">
          <PrimaryCta />
          <SecondaryCta link={{ label: "Compare other cities", href: "/rebates" }} />
        </div>
      </Block>

      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}

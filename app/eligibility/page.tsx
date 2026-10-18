import { EligibilityFlow, type ProgramOption } from "@/components/eligibility/eligibility-flow";
import { PageIntro } from "@/components/layout/page-intro";
import { DocumentsChecklist, OfficialSource } from "@/components/rebates/program-sections";
import type { ProgramId } from "@/lib/content/schema";
import { content } from "@/lib/content/load";
import { hasQuestionFlow, questionsFor, type ResolvedQuestion } from "@/lib/eligibility/evaluate";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/eligibility");

// Copy: CONTENT §4. The page is static; the flow is a client island fed with resolved questions.
export default function EligibilityPage() {
  const { rebates, business } = content;
  const programs: ProgramOption[] = rebates.programs.map((p) => ({
    id: p.id,
    city: p.city,
    hasQuestions: hasQuestionFlow(p),
    statusNote: p.statusNote,
  }));
  const flows: Partial<Record<ProgramId, ResolvedQuestion[]>> = {};
  const extras: Partial<Record<ProgramId, React.ReactNode>> = {};
  for (const p of rebates.programs) {
    flows[p.id] = questionsFor(p.id);
    // FR-ELIG-05: what the city asks for, and where the rules come from.
    extras[p.id] = (
      <div className="flex flex-col gap-5">
        {p.documents.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-sans text-base font-semibold">What {p.city} asks for</h3>
            <DocumentsChecklist program={p} />
          </section>
        )}
        <OfficialSource program={p} />
      </div>
    );
  }

  return (
    <>
      <PageIntro
        title="Will your yard qualify?"
        lead="Seven quick questions. We'll tell you what looks good, what to check, and the one mistake to avoid."
        crumbs={[{ label: "Eligibility", href: "/eligibility" }]}
      />
      <EligibilityFlow
        programs={programs}
        flows={flows}
        extras={extras}
        otherCityText={rebates.otherCities.other ?? ""}
        promise={business.promise}
      />
    </>
  );
}

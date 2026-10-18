"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckIcon, CircleHelpIcon, OctagonXIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "cn";
import { Disclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import type { ProgramId } from "@/lib/content/schema";
import { evaluate, type Answers, type Evaluation, type ResolvedQuestion } from "@/lib/eligibility/evaluate";

// SRS §9 (FR-ELIG-01–06). Questions arrive resolved from the server page, so the client bundle ships no
// JSON parsing or Zod. One question per screen; answers survive Back (SRS §12 Eligibility).

export type CityChoice = ProgramId | "other";

export type ProgramOption = {
  id: ProgramId;
  city: string;
  /** False for status-only programs (Scottsdale): they get a status result, not questions. */
  hasQuestions: boolean;
  statusNote: string;
};

type Props = {
  programs: ProgramOption[];
  flows: Partial<Record<ProgramId, ResolvedQuestion[]>>;
  /** Server-rendered documents checklist and official link per program (FR-ELIG-05). */
  extras: Partial<Record<ProgramId, React.ReactNode>>;
  /** Shown for "Another city": rebate-programs.json → otherCities.other. */
  otherCityText: string;
  promise: string;
};

type Screen = { kind: "intro" } | { kind: "city" } | { kind: "question"; index: number } | { kind: "result" };

export function EligibilityFlow({ programs, flows, extras, otherCityText, promise }: Props) {
  const [screen, setScreen] = useState<Screen>({ kind: "intro" });
  const [city, setCity] = useState<CityChoice | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstScreen = useRef(true);

  const program = programs.find((p) => p.id === city);
  const questions = (city && city !== "other" && flows[city]) || [];
  const hasFlow = Boolean(program?.hasQuestions && questions.length > 0);
  const total = 1 + questions.length; // the city step counts as question 1

  // Move focus to the new screen's heading so keyboard and screen-reader users land on the question.
  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [screen]);

  // ?city= (from a city page or the studio) preselects the city. Read on Start, not at render, so the
  // static page needs no Suspense boundary and nothing remounts after hydration.
  const start = () => {
    const fromLink = new URLSearchParams(window.location.search).get("city");
    if (city === null && programs.some((p) => p.id === fromLink)) setCity(fromLink as ProgramId);
    setScreen({ kind: "city" });
  };

  const chooseCity = (next: CityChoice) => {
    if (next !== city) setAnswers({});
    setCity(next);
    const p = programs.find((x) => x.id === next);
    track("eligibility_started", { city: next });
    if (!p?.hasQuestions) track("eligibility_result", { city: next, result: "status" });
    setScreen(p?.hasQuestions ? { kind: "question", index: 0 } : { kind: "result" });
  };

  const answer = (q: ResolvedQuestion, optionIndex: number, index: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    setScreen(index + 1 < questions.length ? { kind: "question", index: index + 1 } : { kind: "result" });
  };

  const back = () => {
    if (screen.kind === "city") setScreen({ kind: "intro" });
    else if (screen.kind === "question")
      setScreen(screen.index === 0 ? { kind: "city" } : { kind: "question", index: screen.index - 1 });
    else if (screen.kind === "result")
      setScreen(hasFlow ? { kind: "question", index: questions.length - 1 } : { kind: "city" });
  };

  const restart = () => {
    setAnswers({});
    setScreen({ kind: "city" });
  };

  const evaluation = hasFlow ? evaluate(questions, answers) : null;

  return (
    <div className="container-page pb-20">
      <div className="max-w-2xl rounded-card border border-line bg-paper p-6 sm:p-8">
        {screen.kind !== "intro" && screen.kind !== "result" && (
          <Progress step={screen.kind === "city" ? 1 : screen.index + 2} total={hasFlow ? total : null} />
        )}

        {screen.kind === "intro" && (
          <div className="flex flex-col gap-5">
            <h2 ref={headingRef} tabIndex={-1} className="font-sans text-xl font-semibold outline-none">
              Before you remove anything, check the basics.
            </h2>
            <p className="text-ink-muted">
              One question at a time. You can go back and change an answer. We only keep your city and the
              result, never your answers.
            </p>
            <div>
              <Button onClick={start}>Start the check</Button>
            </div>
          </div>
        )}

        {screen.kind === "city" && (
          <QuestionScreen
            headingRef={headingRef}
            text="Which city sends your water bill?"
            hint="Programs are run by the water utility, so this is the city on your water bill."
            options={[
              ...programs.map((p) => ({ label: p.city, value: p.id as CityChoice })),
              { label: "Another city", value: "other" as CityChoice },
            ].map((o) => ({
              label: o.label,
              selected: city === o.value,
              onSelect: () => chooseCity(o.value),
            }))}
          />
        )}

        {screen.kind === "question" && questions[screen.index] && (
          <QuestionScreen
            headingRef={headingRef}
            text={questions[screen.index]!.text}
            options={questions[screen.index]!.options.map((o, i) => {
              // Non-null: guarded by the condition above.
              const q = questions[screen.index]!;
              return {
                label: o.label,
                selected: answers[q.id] === i,
                onSelect: () => answer(q, i, screen.index),
              };
            })}
          />
        )}

        {screen.kind === "result" && (
          <ResultScreen
            headingRef={headingRef}
            city={city}
            program={program}
            evaluation={evaluation}
            extras={program ? extras[program.id] : null}
            otherCityText={otherCityText}
            promise={promise}
          />
        )}

        {screen.kind !== "intro" && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
            <Button variant="ghost" size="sm" onClick={back}>
              <ArrowLeftIcon aria-hidden="true" />
              Back
            </Button>
            {screen.kind === "result" && (
              <Button variant="ghost" size="sm" onClick={restart}>
                <RotateCcwIcon aria-hidden="true" />
                Start over
              </Button>
            )}
          </div>
        )}
      </div>
      {evaluation?.complete && screen.kind === "result" && program && (
        <StoreResult programId={program.id} evaluation={evaluation} />
      )}
    </div>
  );
}

/** Before a city is chosen the question count isn't known yet, so the city step shows no total. */
function Progress({ step, total }: { step: number; total: number | null }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <p className="text-sm font-medium text-ink-muted tabular">
        Question {step}
        {total !== null && ` of ${total}`}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
        <div
          className="h-full rounded-full bg-saguaro transition-[width] duration-300 ease-soft motion-reduce:transition-none"
          style={{ width: total ? `${Math.round((step / total) * 100)}%` : "8%" }}
        />
      </div>
    </div>
  );
}

function QuestionScreen({
  headingRef,
  text,
  hint,
  options,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  text: string;
  hint?: string;
  options: { label: string; selected: boolean; onSelect: () => void }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 ref={headingRef} tabIndex={-1} className="font-sans text-xl font-semibold outline-none">
        {text}
      </h2>
      {hint && <p className="-mt-2 text-ink-muted">{hint}</p>}
      <ul className="flex flex-col gap-3">
        {options.map((o) => (
          <li key={o.label}>
            {/* A button per answer: choosing one moves on, so arrow keys never answer by accident. */}
            <button
              type="button"
              aria-pressed={o.selected}
              onClick={o.onSelect}
              className={cn(
                "flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-card border bg-caliche px-4 py-3 text-left text-base font-semibold text-ink transition-colors duration-150 hover:border-ink-muted",
                o.selected ? "border-saguaro ring-1 ring-saguaro" : "border-line",
              )}
            >
              {o.label}
              {o.selected && (
                <span className="flex items-center gap-1 text-sm font-medium text-saguaro">
                  <CheckIcon className="size-4" aria-hidden="true" />
                  Your answer
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const RESULT_COPY = {
  likely: {
    title: "Looks eligible",
    lead: "Looks good so far. Next step: apply for approval before anything is removed.",
    Icon: CheckIcon,
    tone: "text-success",
  },
  not_eligible: {
    title: "Not eligible right now",
    lead: "Here's what's in the way, and what would change it.",
    Icon: OctagonXIcon,
    tone: "text-error",
  },
  check_city: {
    title: "Check with the city",
    lead: "A couple of answers need the city to confirm.",
    Icon: CircleHelpIcon,
    tone: "text-warning",
  },
} as const;

function ResultScreen({
  headingRef,
  city,
  program,
  evaluation,
  extras,
  otherCityText,
  promise,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  city: CityChoice | null;
  program: ProgramOption | undefined;
  evaluation: Evaluation | null;
  extras: React.ReactNode;
  otherCityText: string;
  promise: string;
}) {
  const studioHref = program ? `/studio?city=${program.id}` : "/studio";

  // FR-ELIG-02: Scottsdale (status only) and cities outside our data get a status answer, not a verdict.
  if (!evaluation || !program) {
    return (
      <div className="flex flex-col gap-5" aria-live="polite">
        <h2 ref={headingRef} tabIndex={-1} className="font-sans text-xl font-semibold outline-none">
          {program ? `${program.city}: check the program status` : "Check your city's program"}
        </h2>
        <p className="text-ink">{program ? program.statusNote : otherCityText}</p>
        {extras}
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href={studioHref}>See my rebate</Link>
          </Button>
          <Link
            href={city === "other" ? "/rebates" : "/book"}
            className="min-h-11 content-center font-semibold link"
          >
            {city === "other" ? "Rebates by city" : "Book a free yard walk"}
          </Link>
        </div>
        <Disclaimer city={program?.city} />
      </div>
    );
  }

  const copy = RESULT_COPY[evaluation.result];
  const likely = evaluation.result === "likely";
  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      <div className="flex flex-col gap-3">
        <p className={cn("flex items-center gap-2 font-semibold", copy.tone)}>
          <copy.Icon className="size-5" aria-hidden="true" />
          {program.city}
        </p>
        <h2 ref={headingRef} tabIndex={-1} className="outline-none">
          {copy.title}
        </h2>
        <p className="text-lead">{copy.lead}</p>
      </div>

      {evaluation.fails.length > 0 && (
        <ReasonList title="What's in the way" items={evaluation.fails.map((f) => f.reason)} kind="fail" />
      )}
      {evaluation.checks.length > 0 && (
        <ReasonList title="Ask the city about" items={evaluation.checks.map((c) => c.reason)} kind="check" />
      )}

      <p className="rounded-card border border-saguaro/30 bg-caliche p-4 text-ink">
        <span className="font-semibold">{promise.split(".")[0]}.</span>
        {promise.slice(promise.indexOf(".") + 1)}
      </p>

      {extras}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {likely ? (
          <>
            <Button asChild>
              <Link href="/book">Book a free yard walk</Link>
            </Button>
            <Link href={studioHref} className="min-h-11 content-center font-semibold link">
              See my rebate
            </Link>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href={studioHref}>See my rebate</Link>
            </Button>
            <Link href="/book" className="min-h-11 content-center font-semibold link">
              Book a free yard walk
            </Link>
          </>
        )}
      </div>
      <Disclaimer city={program.city} />
    </div>
  );
}

function ReasonList({ title, items, kind }: { title: string; items: string[]; kind: "fail" | "check" }) {
  const Icon = kind === "fail" ? OctagonXIcon : CircleHelpIcon;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-sans text-base font-semibold">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-ink">
            <Icon
              className={cn("mt-1 size-[18px] shrink-0", kind === "fail" ? "text-error" : "text-warning")}
              aria-hidden="true"
            />
            <span>
              <span className="sr-only">{kind === "fail" ? "Not eligible: " : "Check: "}</span>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** FR-ELIG-06: stores { programId, result, reasonCodes } once per distinct result. Best-effort. */
function StoreResult({ programId, evaluation }: { programId: ProgramId; evaluation: Evaluation }) {
  const key = `${programId}|${evaluation.result}|${evaluation.reasonCodes.join(",")}`;
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (sent.current === key) return;
    sent.current = key;
    track("eligibility_result", { city: programId, result: evaluation.result });
    fetch("/api/eligibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programId, result: evaluation.result, reasonCodes: evaluation.reasonCodes }),
    }).catch(() => {
      // The result is already on screen; storing it is only for aggregate counts.
    });
  }, [key, programId, evaluation.result, evaluation.reasonCodes]);
  return null;
}

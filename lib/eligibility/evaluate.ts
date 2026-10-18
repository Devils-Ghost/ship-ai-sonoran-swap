import rebates from "@/content/rebate-programs.json";
import type { ProgramId, RebateProgram, RebatePrograms } from "@/lib/content/schema";
import { formatNumber } from "@/lib/utils/format";

// SRS §9 (FR-ELIG). Pure: questions come from rebate-programs.json → eligibilityQuestions, with the
// program's own numbers filled in, so no rule is typed into a component (AGENTS §2.2).

const DATA = rebates as unknown as RebatePrograms;

export type Outcome = "pass" | "fail" | "check";
export type EligibilityResult = "likely" | "not_eligible" | "check_city";

export type ResolvedOption = { label: string; outcome: Outcome; reason?: string };
export type ResolvedQuestion = { id: string; text: string; options: ResolvedOption[] };

/** FR-ELIG-04: this question always appears, whatever the JSON says. */
export const REMOVED_QUESTION_ID = "removed";

export function eligibilityProgram(id: ProgramId): RebateProgram | undefined {
  return DATA.programs.find((p) => p.id === id);
}

/** Programs with rules we can check question by question (Scottsdale is status-only: FR-ELIG-02). */
export function hasQuestionFlow(program: RebateProgram): boolean {
  return program.type !== "status_only";
}

function healthyText(program: RebateProgram): string {
  if ("healthyGrassMinPercent" in program && typeof program.healthyGrassMinPercent === "number") {
    return `at least ${program.healthyGrassMinPercent}% healthy`;
  }
  return "living grass";
}

function minimumText(program: RebateProgram): string {
  return "minimumSqft" in program ? formatNumber(program.minimumSqft) : "";
}

function fill(text: string, program: RebateProgram): string {
  return text
    .replaceAll("{City}", program.city)
    .replaceAll("{minimum}", minimumText(program))
    .replaceAll("{healthy}", healthyText(program));
}

/**
 * The program's question list: its own set if the JSON has one, otherwise the default set filtered by
 * each question's `programs`. A size question is dropped when the program has no minimum.
 */
export function questionsFor(programId: ProgramId): ResolvedQuestion[] {
  const program = eligibilityProgram(programId);
  if (!program || !hasQuestionFlow(program)) return [];
  const sets = DATA.eligibilityQuestions;
  const base = sets[programId] ?? sets.default ?? [];
  const removed = (sets.default ?? []).find((q) => q.id === REMOVED_QUESTION_ID);

  const list = base.filter((q) => !q.programs || q.programs.includes(programId));
  if (removed && !list.some((q) => q.id === REMOVED_QUESTION_ID)) list.push(removed);

  return list
    .filter((q) => q.id !== "size" || minimumText(program) !== "")
    .map((q) => ({
      id: q.id,
      text: fill(q.text, program),
      options: q.options.map((o) => ({
        label: o.label,
        outcome: o.outcome,
        ...(o.reason ? { reason: fill(o.reason, program) } : {}),
      })),
    }));
}

export type Answers = Record<string, number>; // question id → option index

export type Evaluation = {
  result: EligibilityResult;
  fails: { questionId: string; reason: string }[];
  checks: { questionId: string; reason: string }[];
  /** Stored by POST /api/eligibility (FR-ELIG-06): "<questionId>:<outcome>" for every non-pass answer. */
  reasonCodes: string[];
  complete: boolean;
};

/** FR-ELIG-03: any fail → not eligible; else any check → check with the city; else looks eligible. */
export function evaluate(questions: ResolvedQuestion[], answers: Answers): Evaluation {
  const fails: Evaluation["fails"] = [];
  const checks: Evaluation["checks"] = [];
  let complete = true;
  for (const q of questions) {
    const option = q.options[answers[q.id] ?? -1];
    if (!option) {
      complete = false;
      continue;
    }
    if (option.outcome === "fail") fails.push({ questionId: q.id, reason: option.reason ?? "" });
    if (option.outcome === "check") checks.push({ questionId: q.id, reason: option.reason ?? "" });
  }
  const result: EligibilityResult = fails.length ? "not_eligible" : checks.length ? "check_city" : "likely";
  return {
    result,
    fails,
    checks,
    reasonCodes: [...fails.map((f) => `${f.questionId}:fail`), ...checks.map((c) => `${c.questionId}:check`)],
    complete,
  };
}

export const RESULT_IDS = ["likely", "not_eligible", "check_city"] as const;
export const REASON_CODE = /^[a-z][a-z0-9_-]{0,31}:(fail|check)$/;

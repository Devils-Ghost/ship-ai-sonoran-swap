import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "cn";
import quality from "@/content/quality.json";
import type { Quality } from "@/lib/content/schema";
import rebates from "@/content/rebate-programs.json";
import { HOW_IT_WORKS, LIMITS, PRIVACY_SUMMARY } from "@/lib/proof/content";

// FR-PROOF-02/03 sections, shared by the Proof drawer (lazy, client) and /launch-notes (server). No hooks.
// Data is read from the committed JSON directly (no Zod in the client chunk); `pnpm build` validates it.

type Report = Quality["reports"][number];

const PAGE_LABEL: Record<string, string> = {
  "/": "Home",
  "/studio": "Studio",
  "/rebates/phoenix": "Phoenix rebate",
};

export function QualitySection() {
  const reports = [...(quality.reports as Report[])].sort((a, b) => b.round - a.round);
  if (reports.length === 0) return <p className="text-ink-muted">No reports saved yet.</p>;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Lighthouse scores (out of 100), read from the saved reports. Mobile unless noted. Round 2 reports are
        each the median of three runs, because scores move a few points between runs. Target: 95 or more in
        every category.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.9375rem]">
          <caption className="sr-only">Lighthouse reports</caption>
          <thead className="text-[0.8125rem] text-ink-muted">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-3 font-medium">
                Page · round
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                Perf.
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                Access.
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                Best pr.
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                SEO
              </th>
              <th scope="col" className="py-2 pl-2 font-medium">
                Report
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.file} className="border-b border-line/70">
                <th scope="row" className="py-2.5 pr-2 font-medium text-ink">
                  {PAGE_LABEL[r.path] ?? r.path}
                  <span className="block text-[0.8125rem] font-normal text-ink-muted">
                    Round {r.round}
                    {r.formFactor === "desktop" && " · desktop"}
                  </span>
                </th>
                {[r.scores.performance, r.scores.accessibility, r.scores.bestPractices, r.scores.seo].map(
                  (s, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-1.5 py-2.5 tabular",
                        s !== null && s >= 95 ? "text-success" : "text-warning",
                      )}
                    >
                      {s ?? "–"}
                    </td>
                  ),
                )}
                <td className="py-2.5 pl-2">
                  <a
                    href={r.file}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-11 items-center font-semibold link"
                  >
                    Open
                    <span className="sr-only">
                      {" "}
                      the {PAGE_LABEL[r.path] ?? r.path} report (opens in a new tab)
                    </span>
                    <ArrowUpRightIcon className="ml-0.5 size-4" aria-hidden="true" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <div className="flex flex-col gap-5">
      {HOW_IT_WORKS.map((h) => (
        <section key={h.title} className="flex flex-col gap-1">
          <h3 className="font-sans text-base font-semibold text-ink">{h.title}</h3>
          <p className="text-ink-muted">{h.text}</p>
        </section>
      ))}
      <section className="flex flex-col gap-2">
        <h3 className="font-sans text-base font-semibold text-ink">Sources</h3>
        <ul className="flex flex-col gap-1">
          {rebates.programs.map((p) => (
            <li key={p.id}>
              <a
                href={p.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center link"
              >
                {p.name}, City of {p.city}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function LimitsSection() {
  return (
    <ul className="flex list-disc flex-col gap-3 pl-5 text-ink marker:text-ink-muted">
      {LIMITS.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
}

export function PrivacySection() {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex list-disc flex-col gap-2 pl-5 text-ink marker:text-ink-muted">
        {PRIVACY_SUMMARY.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <a href="/privacy" className="inline-flex min-h-11 w-fit items-center font-semibold link">
        Read the privacy statement
      </a>
    </div>
  );
}

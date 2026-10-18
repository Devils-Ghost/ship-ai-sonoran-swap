import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "cn";
import quality from "@/content/quality.json";
import type { Quality } from "@/lib/content/schema";
import rebates from "@/content/rebate-programs.json";
import timeline from "@/content/timeline.json";
import { HOW_IT_WORKS, LIMITS, PRIVACY_SUMMARY } from "@/lib/proof/content";
import { formatDate } from "@/lib/utils/format";

// FR-PROOF-02/03 sections, shared by the Proof drawer (lazy, client) and /launch-notes (server). No hooks.
// Data is read from the committed JSON directly (no Zod in the client chunk); `pnpm build` validates it.

type Entry = { date: string; hash: string; title: string; type: string; scope: string | null };
type Report = Quality["reports"][number];

const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "America/Phoenix",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Phoenix",
});

const TYPE_LABEL: Record<string, string> = { feat: "Feature", fix: "Fix", perf: "Speed", content: "Content" };

export function TimelineSection({ compact = false }: { compact?: boolean }) {
  const entries = timeline.entries as Entry[];
  const days = new Map<string, Entry[]>();
  for (const e of entries) {
    const day = dayFormat.format(new Date(e.date));
    days.set(day, [...(days.get(day) ?? []), e]);
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-muted">
        {entries.length} dated changes from the project&apos;s commit history, newest first. Times are Arizona
        time.
      </p>
      {[...days].map(([day, list]) => (
        <section key={day} className="flex flex-col gap-3">
          <h3 className="font-sans text-base font-semibold text-ink">
            {day} <span className="font-normal text-ink-muted">· {list.length}</span>
          </h3>
          <ol className="flex flex-col gap-3 border-l-2 border-line pl-4">
            {list.map((e) => (
              <li key={e.hash} className="flex flex-col gap-0.5">
                <span className="text-[0.8125rem] text-ink-muted tabular">
                  {timeFormat.format(new Date(e.date))} · {TYPE_LABEL[e.type] ?? e.type}
                  {e.scope && ` · ${e.scope}`}
                </span>
                <span className={cn("text-ink", compact && "text-[0.9375rem]")}>{e.title}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

const PAGE_LABEL: Record<string, string> = {
  "/": "Home",
  "/studio": "Studio",
  "/rebates/phoenix": "Phoenix rebate",
};

export function QualitySection() {
  const reports = [...(quality.reports as Report[])].sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt));
  if (reports.length === 0) return <p className="text-ink-muted">No reports saved yet.</p>;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Lighthouse scores (out of 100), read from the saved reports. Mobile unless noted. Target: 95 or more
        in every category.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.9375rem]">
          <caption className="sr-only">Lighthouse reports</caption>
          <thead className="text-[0.8125rem] text-ink-muted">
            <tr className="border-b border-line">
              <th scope="col" className="py-2 pr-3 font-medium">
                Page · date
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
                    {formatDate(r.fetchedAt)}
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
              <span className="text-[0.8125rem] text-ink-muted"> · checked {formatDate(p.lastVerified)}</span>
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

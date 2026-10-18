import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Disclaimer } from "@/components/shared/disclaimer";
import { content } from "@/lib/content/load";
import type { RebateProgram } from "@/lib/content/schema";
import { summarize } from "@/lib/rebates/summary";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils/format";

export const metadata = pageMetadata("/rebates");

// SRS §6.6 FR-RBH comparison, all from rebate-programs.json.
type Row = { label: string; value: (p: RebateProgram) => React.ReactNode };

const STATUS: Record<RebateProgram["status"], string> = {
  open: "Open",
  unknown: "Funding not stated; confirm with the city",
  closed: "Closed between seasons",
};

const ROWS: Row[] = [
  { label: "How it pays", value: (p) => summarize(p).headline },
  {
    label: "Minimum",
    value: (p) =>
      "minimumSqft" in p && typeof p.minimumSqft === "number" ? `${formatNumber(p.minimumSqft)} sq ft` : "—",
  },
  {
    label: "Cap",
    value: (p) =>
      p.type === "per_sqft"
        ? p.maximumAmount === null
          ? "No fixed cap"
          : formatMoney(p.maximumAmount)
        : p.type === "tiered"
          ? formatMoney(p.maximumAmount)
          : p.lastSeasonMaximum
            ? `Last season up to ${formatMoney(p.lastSeasonMaximum)}`
            : "—",
  },
  { label: "Approval first", value: (p) => (p.approval.required ? p.approval.name : "Not required") },
  { label: "Time to finish", value: (p) => p.approval.completeWithin ?? "—" },
  { label: "Status", value: (p) => STATUS[p.status] },
  {
    label: "Last checked",
    value: (p) => <time dateTime={p.lastVerified}>{formatDate(p.lastVerified)}</time>,
  },
  {
    label: "Official page",
    value: (p) => (
      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="link">
        City of {p.city}
        <ArrowUpRightIcon className="ml-0.5 inline size-3.5" aria-hidden="true" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ),
  },
];

export default function RebatesPage() {
  const { programs, otherCities } = content.rebates;
  return (
    <>
      <PageIntro
        title="Grass removal rebates by city"
        lead="How Phoenix, Mesa, Chandler and Scottsdale pay you to replace a lawn, from each city's official page. Every city asks for approval before you remove anything."
        crumbs={[{ label: "Rebates", href: "/rebates" }]}
      >
        <PrimaryCta />
      </PageIntro>

      <section aria-label="Program comparison" className="container-page pb-12">
        {/* Desktop and tablet: one comparison table. */}
        <div className="hidden overflow-x-auto rounded-card border border-line bg-paper md:block">
          <table className="w-full border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">Grass removal programs compared by city</caption>
            <thead>
              <tr className="border-b border-line">
                <td className="p-4" />
                {programs.map((p) => (
                  <th key={p.id} scope="col" className="p-4 align-bottom">
                    <Link
                      href={`/rebates/${p.id}`}
                      className="font-display text-xl font-semibold text-saguaro hover:underline"
                    >
                      {p.city}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <th scope="row" className="w-40 p-4 align-top font-medium text-ink-muted">
                    {row.label}
                  </th>
                  {programs.map((p) => (
                    <td key={p.id} className="p-4 align-top text-ink">
                      {row.value(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phones: one card per city (DESIGN §9). */}
        <ul className="flex flex-col gap-4 md:hidden">
          {programs.map((p) => (
            <li key={p.id} className="rounded-card border border-line bg-paper p-5">
              <h2 className="text-2xl">
                <Link href={`/rebates/${p.id}`} className="hover:underline">
                  {p.city}
                </Link>
              </h2>
              <dl className="mt-3 flex flex-col gap-3">
                {ROWS.map((row) => (
                  <div key={row.label} className="flex flex-col gap-0.5">
                    <dt className="text-sm text-ink-muted">{row.label}</dt>
                    <dd className="text-ink">{row.value(p)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <Disclaimer className="mt-4" />
      </section>

      <section aria-labelledby="other-title" className="container-page pb-16">
        <h2 id="other-title" className="text-2xl">
          Tempe, Gilbert, Glendale and other cities
        </h2>
        <p className="mt-3 max-w-3xl text-ink-muted">{otherCities.other}</p>
      </section>
    </>
  );
}

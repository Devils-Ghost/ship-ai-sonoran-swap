"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { FileTextIcon, PrinterIcon, TriangleAlertIcon } from "lucide-react";
import { Disclaimer } from "@/components/shared/disclaimer";
import { NotesList } from "@/components/shared/notes-list";
import { SourceNote } from "@/components/shared/source-note";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { computeEstimate, isCityId, notInDataText, programFor, type CityId } from "@/lib/estimate/estimate";
import { DEFAULT_TIER, getTier, TIERS, type TierId } from "@/lib/estimate/pricing";
import { allPrograms, summarize } from "@/lib/rebates/summary";
import { readPrepSnapshot } from "@/lib/studio/snapshot";
import { formatMoney, formatSqft } from "@/lib/utils/format";
import { pickParams } from "@/lib/utils/url";

// SRS §6.3 (FR-PREP-01–03). Everything comes from the link (?city&sqft&tier) and this tab's sessionStorage;
// nothing is sent anywhere. Printing uses the browser's own "Save as PDF".

const noop = () => () => {};

export function PrepSheet() {
  const search = useSyncExternalStore(
    noop,
    () => pickParams(window.location.search, ["city", "sqft", "tier"]),
    () => null,
  );
  const snapshot = useSyncExternalStore(noop, readPrepSnapshot, () => null);
  if (search === null) return <div className="h-[600px]" aria-hidden="true" />; // server render: reserve space

  const params = new URLSearchParams(search);
  const city = params.get("city");
  const sqft = Math.round(Number(params.get("sqft")));
  const tierParam = params.get("tier");
  const tier: TierId = TIERS.some((t) => t.id === tierParam) ? (tierParam as TierId) : DEFAULT_TIER;

  if (!isCityId(city) || !Number.isFinite(sqft) || sqft <= 0) {
    return (
      <div className="flex max-w-xl flex-col gap-4 rounded-card border border-line bg-paper p-6">
        <p className="text-lg text-ink">Measure your lawn first, then print this sheet from your results.</p>
        <div>
          <Button asChild>
            <Link href="/studio">Measure my lawn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Sheet city={city} sqft={sqft} tier={tier} snapshot={snapshot} />;
}

function Sheet({
  city,
  sqft,
  tier,
  snapshot,
}: {
  city: CityId;
  sqft: number;
  tier: TierId;
  snapshot: string | null;
}) {
  const estimate = computeEstimate({ city, sqft, tier });
  const programId = programFor(city);
  const program = allPrograms().find((p) => p.id === programId);
  const summary = program ? summarize(program) : null;
  const rebate = estimate.rebate;

  return (
    <article className="prep-sheet flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-ink-muted">Check the details, then print or save as a PDF.</p>
        <Button
          onClick={() => {
            track("prep_sheet_opened", { city });
            window.print();
          }}
        >
          <PrinterIcon aria-hidden="true" />
          Print / Save as PDF
        </Button>
      </div>

      <dl className="grid gap-x-8 gap-y-4 rounded-card border border-line bg-paper p-6 sm:grid-cols-2 print:border-ink/30">
        <Row
          label="Water utility"
          value={program ? `City of ${program.city}` : city === "other" ? "Another utility" : city}
        />
        <Row label="Measured grass area" value={formatSqft(estimate.sqft)} />
        <Row label="Project style" value={getTier(tier)?.name ?? tier} />
        <Row
          label="Estimated rebate"
          value={
            rebate?.amount != null
              ? formatMoney(rebate.amount)
              : summary && !summary.open
                ? summary.headline
                : "Not in our data"
          }
          strong
        />
        {summary && <Row label="How the city pays" value={summary.headline} />}
      </dl>

      <figure className="flex break-inside-avoid flex-col gap-2">
        {snapshot ? (
          <div className="relative overflow-hidden rounded-card border border-line">
            {/* A data URL from this browser tab; next/image can't optimize it and there's nothing to fetch. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snapshot}
              alt={`Satellite view with the outlined grass, ${formatSqft(estimate.sqft)}`}
              className="w-full"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-sm font-semibold text-ink">
              {formatSqft(estimate.sqft)} outlined
            </span>
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-line p-5 text-ink-muted">
            No map image: this measurement was typed in or came from the sample yard. Outline your lawn on the
            map in the studio to include one.
          </p>
        )}
        {snapshot && (
          <figcaption className="text-[0.8125rem] text-ink-muted">
            Measured on satellite imagery in the browser. A yard walk confirms the measurement.
          </figcaption>
        )}
      </figure>

      {rebate && rebate.notes.length > 0 && (
        <section className="flex break-inside-avoid flex-col gap-3">
          <h2 className="font-sans text-lg font-semibold">Program rules for this estimate</h2>
          <NotesList notes={rebate.notes} />
        </section>
      )}
      {!program && <p className="text-ink">{notInDataText(city)}</p>}

      {/* The engine's notes already lead with the approval warning; status-only programs need it here. */}
      {program && !rebate?.notes.length && (
        <p className="flex break-inside-avoid gap-3 rounded-card border border-warning/30 bg-warning-bg p-4 text-ink">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <span>
            <span className="font-semibold">
              Don&apos;t remove any grass until {program.city} approves your project in writing.
            </span>{" "}
            Removing grass before approval can cost you the whole rebate.
          </span>
        </p>
      )}

      {program && program.documents.length > 0 && (
        <section className="flex break-inside-avoid flex-col gap-3">
          <h2 className="font-sans text-lg font-semibold">Documents {program.city} asks for</h2>
          <ul className="flex flex-col gap-2">
            {program.documents.map((d) => (
              <li key={d} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 hidden size-4 shrink-0 rounded-sm border border-ink/50 print:inline-block"
                />
                <FileTextIcon
                  className="mt-1 size-[18px] shrink-0 text-success print:hidden"
                  aria-hidden="true"
                />
                {d}
              </li>
            ))}
          </ul>
          <p className="text-ink-muted">{program.howToApply}</p>
        </section>
      )}

      {program && (
        <div className="flex flex-col gap-1">
          <SourceNote program={program} />
          <p className="hidden text-[0.8125rem] text-ink-muted print:block">{program.sourceUrl}</p>
        </div>
      )}
      <Disclaimer city={program?.city} />

      <footer className="border-t border-line pt-4 text-sm text-ink-muted">
        Prepared with Sonoran Swap (concept). Not an official city form.
      </footer>
    </article>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd
        className={
          strong ? "font-display text-3xl font-semibold text-terracotta tabular" : "font-semibold text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}

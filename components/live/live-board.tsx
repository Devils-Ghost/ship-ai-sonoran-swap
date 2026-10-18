"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExpandIcon, ShrinkIcon, WifiOffIcon } from "lucide-react";
import { renderSVG } from "uqr";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemo } from "@/lib/demo/flag";
import { demoStats } from "@/lib/demo/stats";
import { useCountUp } from "@/lib/hooks/use-count-up";
import type { Stats, TickerItem } from "@/lib/stats/summary";
import { LIVE_CITIES } from "@/lib/stats/summary";
import { formatMoney, formatNumber } from "@/lib/utils/format";

// SRS §11.3 (FR-LIVE-01–05). Polls /api/stats every 5 s; after 3 failed polls in a row the board says its
// numbers are stale instead of pretending. Counts are real events on this site, labeled as such.

const POLL_MS = 5000;
const STALE_AFTER = 3;

const CITY_LABEL: Record<(typeof LIVE_CITIES)[number], string> = {
  phoenix: "Phoenix",
  mesa: "Mesa",
  chandler: "Chandler",
  other: "Other cities",
};

const time = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Phoenix",
});
const sinceFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Phoenix",
});

function cityName(city: string): string {
  return city in CITY_LABEL
    ? CITY_LABEL[city as keyof typeof CITY_LABEL]
    : city.charAt(0).toUpperCase() + city.slice(1);
}

export function LiveBoard({ qrUrl, host }: { qrUrl: string; host: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failures, setFailures] = useState(0);
  const [full, setFull] = useState(false);
  const boardRef = useRef<HTMLElement>(null);

  const [demo, setDemo] = useState(false);

  useEffect(() => {
    // Demo mode replays labeled sample numbers instead of polling (NFR-REL-02); never mixed with live data.
    if (isDemo()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemo(true);
      setStats(demoStats());
      return;
    }
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; data?: Stats };
        if (!alive) return;
        if (json.ok && json.data) {
          setStats(json.data);
          setFailures(0);
        } else setFailures((f) => f + 1);
      } catch {
        if (alive) setFailures((f) => f + 1);
      }
    };
    void poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === boardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void boardRef.current?.requestFullscreen?.();
  };

  const qr = useMemo(() => renderSVG(qrUrl, { border: 2, ecc: "M" }), [qrUrl]);
  const stale = failures >= STALE_AFTER;
  const maxCity = stats ? Math.max(1, ...LIVE_CITIES.map((c) => stats.byCity[c])) : 1;

  return (
    <section
      ref={boardRef}
      aria-labelledby="live-title"
      className="bg-night py-8 text-caliche sm:py-10 lg:min-h-[calc(100vh-4rem)] lg:py-14 [&:fullscreen]:overflow-auto"
    >
      <div className="container-page flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {demo ? (
              <p className="w-fit rounded-full bg-warning-bg px-3 py-1 text-sm font-semibold text-warning">
                Demo replay: sample numbers, not real visits
              </p>
            ) : (
              <p className="text-sm font-medium tracking-wide text-caliche/70 uppercase">
                Live from {host}
                {stats && ` · since ${sinceFormat.format(new Date(stats.since))}`}
              </p>
            )}
            <h1 id="live-title" className="text-caliche">
              Lawns measured on this site, live.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p aria-live="polite" className="text-sm">
              {stale && (
                <span className="flex items-center gap-2 rounded-full bg-warning-bg px-3 py-1.5 font-semibold text-warning">
                  <WifiOffIcon className="size-4" aria-hidden="true" />
                  Reconnecting… numbers may be out of date
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={toggleFull}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-caliche/40 px-4 text-sm font-semibold text-caliche hover:bg-caliche/10"
            >
              {full ? (
                <ShrinkIcon className="size-4" aria-hidden="true" />
              ) : (
                <ExpandIcon className="size-4" aria-hidden="true" />
              )}
              {full ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-8">
            {stats ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
                <Counter label="Estimates run" value={stats.estimates} />
                <Counter label="Lawn measured" value={stats.sqft} suffix=" sq ft" />
                <Counter label="Estimated rebates" value={stats.rebateDollars} money />
                <Counter label="Yard previews created" value={stats.renders} />
                <Counter label="Yard walks booked (demo)" value={stats.bookings} />
              </dl>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-24 bg-caliche/10" />
                ))}
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <section aria-labelledby="cities-title" className="flex flex-col gap-4">
                <h2 id="cities-title" className="font-sans text-lg font-semibold text-caliche">
                  Estimates by city
                </h2>
                <ul className="flex flex-col gap-3">
                  {LIVE_CITIES.map((c) => {
                    const n = stats?.byCity[c] ?? 0;
                    return (
                      <li key={c} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
                        <span className="text-caliche/85">{CITY_LABEL[c]}</span>
                        <span className="h-3 overflow-hidden rounded-full bg-caliche/10" aria-hidden="true">
                          <span
                            className="block h-full rounded-full bg-terracotta-light transition-[width] duration-700 ease-soft motion-reduce:transition-none"
                            style={{ width: `${(n / maxCity) * 100}%` }}
                          />
                        </span>
                        <span className="text-right font-semibold tabular">{formatNumber(n)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section aria-labelledby="ticker-title" className="flex flex-col gap-4">
                <h2 id="ticker-title" className="font-sans text-lg font-semibold text-caliche">
                  Latest
                </h2>
                {stats && stats.recent.length === 0 && (
                  <p className="text-caliche/70">Waiting for the first estimate.</p>
                )}
                <ol className="flex flex-col gap-2">
                  {stats?.recent.map((item) => (
                    <li
                      key={`${item.kind}-${item.at}`}
                      className="flex gap-3 text-caliche/90 motion-safe:animate-in motion-safe:fade-in"
                    >
                      <span className="w-16 shrink-0 text-caliche/60 tabular">
                        {time.format(new Date(item.at))}
                      </span>
                      <span>{tickerText(item)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </div>

          <aside
            aria-label="Scan to try it"
            className="flex flex-col items-center gap-4 self-start rounded-card bg-caliche p-6 text-ink lg:p-8"
          >
            <div
              role="img"
              aria-label={`QR code for ${qrUrl}`}
              className="w-full max-w-[18rem] [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="text-center font-display text-2xl font-semibold text-saguaro">
              Scan, measure your lawn, watch it appear here.
            </p>
            <p className="text-center text-sm text-ink-muted">
              Counts are real estimates and demo bookings made on this site. Sonoran Swap is a concept
              business.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function tickerText(item: TickerItem): string {
  if (item.kind === "booking") return `${cityName(item.city)} · yard walk booked (demo)`;
  const rebate = item.rebate != null && item.rebate > 0 ? ` · ${formatMoney(item.rebate)} est.` : "";
  return `${cityName(item.city)} · ${formatNumber(item.sqft)} sq ft${rebate}`;
}

function Counter({
  label,
  value,
  suffix = "",
  money = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  money?: boolean;
}) {
  const shown = useCountUp(value, 600);
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-caliche/75">{label}</dt>
      <dd className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-none font-semibold text-terracotta-light tabular">
        {money ? formatMoney(shown) : formatNumber(shown)}
        {suffix && <span className="ml-1 text-[0.4em] text-caliche/75">{suffix.trim()}</span>}
      </dd>
    </div>
  );
}

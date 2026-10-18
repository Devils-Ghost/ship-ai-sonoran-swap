import { CheckIcon, MinusIcon } from "lucide-react";
import { InsightsLive } from "@/components/insights/insights-live";
import { PageIntro } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/format";

export const metadata = pageMetadata("/insights");

// FR-INS-01–13. Copy: CONTENT §9. Live panels come from /api/insights; SEO readiness, the decisions log
// and the KPI explainer are built from committed content at build time.
export default function InsightsPage() {
  const { seoReport, decisions } = content;
  const entries = [...decisions.entries].sort((a, b) => b.date.localeCompare(a.date));
  const pct = (part: number) => (seoReport.routes ? `${Math.round((part / seoReport.routes) * 100)}%` : "–");
  const sc = seoReport.searchConsole;

  return (
    <>
      <PageIntro
        title="Growth insights"
        lead="How this site is performing, from its own anonymized data. This is the dashboard a landscaper would use to improve their marketing, shown in the open."
        crumbs={[{ label: "Insights", href: "/insights" }]}
      />
      <div className="container-page flex flex-col gap-16 pb-20">
        <InsightsLive />

        <div className="grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="seo-title" className="flex flex-col gap-4">
            <h2 id="seo-title" className="text-2xl">
              SEO readiness
            </h2>
            <ul className="flex flex-col gap-2">
              <Check
                ok
                label={`${seoReport.routes} indexable pages, all in the sitemap (${seoReport.sitemapUrls} URLs)`}
              />
              <Check
                ok={seoReport.withTitle === seoReport.routes}
                label={`${pct(seoReport.withTitle)} with a unique title`}
              />
              <Check
                ok={seoReport.withDescription === seoReport.routes}
                label={`${pct(seoReport.withDescription)} with a meta description`}
              />
              <Check
                ok={seoReport.withOg === seoReport.routes}
                label={`${pct(seoReport.withOg)} with a share image`}
              />
              <Check
                ok={seoReport.jsonLdTypes.length > 0}
                label={`Structured data: ${seoReport.jsonLdTypes.join(", ") || "none yet"}`}
              />
              <Check
                ok={sc.submittedAt !== null}
                label={
                  sc.submittedAt
                    ? `Sitemap submitted to Google Search Console on ${formatDate(sc.submittedAt)}${
                        sc.indexedPages !== null
                          ? `; ${sc.indexedPages} pages indexed as of ${formatDate(sc.checkedAt ?? sc.submittedAt)}`
                          : ""
                      }`
                    : "Sitemap not yet submitted to Google Search Console"
                }
              />
            </ul>
            <p className="text-[0.9375rem] text-ink-muted">
              Search rankings and search click-through take weeks to appear for a new site, so we show what we
              controlled this weekend: complete metadata, share previews, structured data and a submitted
              sitemap.
            </p>
            {seoReport.generatedAt && (
              <p className="text-[0.8125rem] text-ink-muted">
                Measured at build, {formatDate(seoReport.generatedAt)}.
              </p>
            )}
          </section>

          <section aria-labelledby="kpi-title" className="flex flex-col gap-4">
            <h2 id="kpi-title" className="text-2xl">
              How we&apos;d measure the business
            </h2>
            <dl className="flex flex-col gap-3">
              <Kpi term="North star" text="Booked yard walks." />
              <Kpi
                term="Leading indicators"
                text="Estimate completion, rebate-to-booking, preview-to-booking."
              />
              <Kpi term="Efficiency" text="Cost per booked walk by source, once there's ad spend." />
              <Kpi term="Quality" text="Share of bookings that pass the eligibility check." />
            </dl>
          </section>
        </div>

        <section aria-labelledby="decisions-title" className="flex max-w-3xl flex-col gap-4">
          <h2 id="decisions-title" className="text-2xl">
            What we changed because of data
          </h2>
          {entries.length === 0 ? (
            <p className="rounded-card border border-dashed border-line p-5 text-ink-muted">
              Our first test round is Saturday at 12:30 PM. Changes we make because of data will appear here.
            </p>
          ) : (
            <ol className="flex flex-col gap-4">
              {entries.map((e) => (
                <li key={`${e.date}-${e.change}`} className="rounded-card border border-line bg-paper p-5">
                  <p className="text-[0.8125rem] text-ink-muted">{formatDate(e.date)}</p>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-[9rem_1fr]">
                    <dt className="font-semibold">We saw</dt>
                    <dd>{e.observation}</dd>
                    <dt className="font-semibold">Evidence</dt>
                    <dd>{e.evidence}</dd>
                    <dt className="font-semibold">We changed</dt>
                    <dd>{e.change}</dd>
                    {e.result && (
                      <>
                        <dt className="font-semibold">Result</dt>
                        <dd>{e.result}</dd>
                      </>
                    )}
                  </dl>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckIcon : MinusIcon;
  return (
    <li className="flex gap-3 text-ink">
      <Icon
        className={ok ? "mt-1 size-[18px] shrink-0 text-success" : "mt-1 size-[18px] shrink-0 text-ink-muted"}
        aria-hidden="true"
      />
      <span>
        <span className="sr-only">{ok ? "Done: " : "Not yet: "}</span>
        {label}
      </span>
    </li>
  );
}

function Kpi({ term, text }: { term: string; text: string }) {
  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <dt className="font-semibold text-saguaro">{term}</dt>
      <dd className="mt-1 text-ink">{text}</dd>
    </div>
  );
}

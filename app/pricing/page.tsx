import { CheckIcon } from "lucide-react";
import { PrimaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Money, Sqft } from "@/components/shared/money";
import { content, isConcept } from "@/lib/content/load";
import { computeEstimate } from "@/lib/estimate/estimate";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("/pricing");

// SRS §6.11 FR-PRC. Ranges from pricing.json; the net-cost example is computed by the engine
// (1,200 sq ft, Phoenix, Signature → $12,000–$18,000 project, $2,400 rebate, $9,600–$15,600 net).
const EXAMPLE = { city: "phoenix", sqft: 1200, tier: "signature" } as const;

export default function PricingPage() {
  const { pricing } = content;
  const example = computeEstimate(EXAMPLE);
  const tierName = pricing.tiers.find((t) => t.id === EXAMPLE.tier)?.name ?? EXAMPLE.tier;

  return (
    <>
      <PageIntro
        title="Clear ranges, before anyone visits."
        lead="Every project is different. Here's what most yards cost per square foot, before your rebate."
        crumbs={[{ label: "Pricing", href: "/pricing" }]}
      >
        <PrimaryCta />
      </PageIntro>

      <section aria-label="Project tiers" className="container-page pb-6">
        <ul className="grid gap-4 lg:grid-cols-3">
          {pricing.tiers.map((t) => (
            <li
              key={t.id}
              className={
                t.featured
                  ? "flex flex-col gap-4 rounded-card border-2 border-saguaro bg-paper p-6 shadow-card"
                  : "flex flex-col gap-4 rounded-card border border-line bg-paper p-6"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl">{t.name}</h2>
                {t.badge && (
                  <span className="rounded-full bg-saguaro px-2.5 py-1 text-xs font-semibold text-caliche">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="text-3xl font-semibold text-ink">
                <Money low={t.lowPerSqft} high={t.highPerSqft} />{" "}
                <span className="text-base font-normal text-ink-muted">per sq ft</span>
              </p>
              <ul className="flex flex-col gap-2">
                {t.includes.map((i) => (
                  <li key={i} className="flex gap-2 text-[0.9375rem] text-ink">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          {isConcept && `${pricing.caption} `}Minimum project <Money amount={pricing.minimumProject} />.
        </p>
      </section>

      <section aria-labelledby="net" className="container-page py-14">
        <div className="flex max-w-3xl flex-col gap-5">
          <h2 id="net">How net cost works</h2>
          <p className="text-lead">
            Your city&apos;s rebate comes off the project price. Here is one example.
          </p>
          <dl className="grid gap-4 rounded-card border border-line bg-paper p-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">
                Project (<Sqft value={EXAMPLE.sqft} />, {tierName})
              </dt>
              <dd className="text-xl font-semibold text-ink">
                <Money low={example.project.low} high={example.project.high} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Estimated Phoenix rebate</dt>
              <dd className="text-xl font-semibold text-terracotta">
                − <Money amount={example.rebate?.amount ?? 0} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">After your rebate</dt>
              <dd className="text-xl font-semibold text-ink">
                <Money low={example.net.low} high={example.net.high} />
              </dd>
            </div>
          </dl>
          <p className="text-[0.9375rem] text-ink-muted">
            The rebate is an estimate; your city decides eligibility and pays you directly after its final
            inspection.
          </p>
          <div>
            <PrimaryCta link={{ label: "Price my yard", href: "/studio" }} />
          </div>
        </div>
      </section>
    </>
  );
}

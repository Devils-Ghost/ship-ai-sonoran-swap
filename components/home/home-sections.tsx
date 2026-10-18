import Image from "next/image";
import { WaterEquivalent } from "@/components/estimate/water-equivalent";
import Link from "next/link";
import { ArrowRightIcon, FileCheck2Icon, SproutIcon } from "lucide-react";
import { PrimaryCta, SecondaryCta } from "@/components/layout/cta-link";
import { AiLabel } from "@/components/shared/ai-label";
import { Money } from "@/components/shared/money";
import { FaqList } from "@/components/shared/faq-list";
import { content, isConcept } from "@/lib/content/load";
import { WATER, waterGallonsPerYear } from "@/lib/estimate/water";
import type { Faq } from "@/lib/faq";
import { summarizeAll } from "@/lib/rebates/summary";
import { formatNumber } from "@/lib/utils/format";
import { sampleAfter, showcaseYard } from "@/lib/visualize/samples";
import { Section } from "./section";
import { isReopenAlertProgram } from "@/lib/alerts";

// SRS §6.1 FR-HOME-03 – 12. Copy: CONTENT §2. Every number comes from content/*.json via the engine.

export function StepsStrip() {
  const { process, promise } = content.business;
  return (
    <Section id="steps" tone="sand" eyebrow="Six steps" title="How the swap works">
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {process.map((s) => (
          <li
            key={s.step}
            className={
              s.highlight
                ? "flex flex-col gap-2 rounded-card bg-saguaro p-5 text-caliche"
                : "flex flex-col gap-2 rounded-card border border-line bg-paper p-5"
            }
          >
            <span className={s.highlight ? "eyebrow text-caliche/80" : "eyebrow"}>Step {s.step}</span>
            <h3 className={s.highlight ? "text-caliche" : undefined}>{s.title}</h3>
            <p
              className={s.highlight ? "text-[0.9375rem] text-caliche/90" : "text-[0.9375rem] text-ink-muted"}
            >
              {s.text}
            </p>
          </li>
        ))}
      </ol>
      <p className="max-w-3xl text-ink">{promise}</p>
    </Section>
  );
}

export function CityCards() {
  const cards = summarizeAll();
  return (
    <Section
      id="cities"
      eyebrow="Rebates by city"
      title="What your city pays"
      lead="Real numbers from each city's official page. Your exact amount depends on your measured lawn."
      action={<SecondaryCta link={{ label: "Compare every program", href: "/rebates" }} />}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          return (
            <li key={c.id}>
              <Link
                href={`/rebates/${c.id}`}
                className="group flex h-full flex-col gap-3 rounded-card border border-line bg-paper p-6 transition-colors hover:border-ink-muted"
              >
                <span className="eyebrow">{c.city}</span>
                <span className="font-display text-2xl leading-tight font-semibold text-saguaro">
                  {c.headline}
                </span>
                {c.open ? (
                  <ul className="flex flex-col gap-1 text-[0.9375rem] text-ink-muted">
                    {c.facts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[0.9375rem] text-ink-muted">{c.sentence}</p>
                )}
                <span className="inline-flex items-center gap-1 font-semibold text-terracotta">
                  {c.city} details{" "}
                  <ArrowRightIcon
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
              {!c.open && isReopenAlertProgram(c.id) && (
                <Link
                  href={`/rebates/${c.id}#reopen-alert`}
                  className="mt-2 inline-flex min-h-11 items-center font-semibold link"
                >
                  Notify me when {c.city} reopens
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function StylesTeaser() {
  const { styles } = content.styles;
  const plants = content.plants.plants;
  return (
    <Section
      id="styles"
      tone="sand"
      eyebrow="Three ways to go desert"
      title="See your yard before you change it."
      lead="Upload a photo of your lawn and preview it in three styles."
      action={<SecondaryCta link={{ label: "Preview my yard", href: "/visualize" }} />}
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {styles.map((s) => {
          const yard = showcaseYard(s.slug);
          const signature = s.plantIds
            .slice(0, 3)
            .map((id) => plants.find((p) => p.id === id)?.common)
            .filter(Boolean);
          return (
            <li
              key={s.slug}
              className="flex flex-col overflow-hidden rounded-card border border-line bg-paper"
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={sampleAfter(yard, s.slug)}
                  alt={`A sample yard as a ${s.name} desert garden`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <AiLabel className="text-[0.6875rem]" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3>{s.name}</h3>
                <p className="text-ink-muted">{s.tagline}</p>
                <p className="text-[0.9375rem] text-ink">
                  <span className="font-medium">Signature plants:</span> {signature.join(", ")}
                </p>
                <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
                  <Link href={`/styles/${s.slug}`} className="font-semibold link">
                    About {s.name}
                  </Link>
                  <Link href={`/visualize?style=${s.slug}`} className="font-semibold link">
                    Try it on my yard
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function PromiseBand() {
  const { promiseGuarantee } = content.business;
  return (
    <Section
      id="promise"
      tone="saguaro"
      title="Approval first. Always."
      lead={
        <>
          Most city programs only pay for grass removed <em>after</em> they approve your project. Pull it out
          early and you can lose the whole rebate. We never remove a blade of grass before your approval
          arrives in writing.
        </>
      }
      action={
        <Link
          href="/eligibility"
          className="font-semibold text-caliche underline decoration-[1.5px] underline-offset-3 hover:text-terracotta-light"
        >
          Check my eligibility →
        </Link>
      }
    >
      <p className="flex max-w-3xl items-start gap-3 text-caliche/90">
        <FileCheck2Icon className="mt-0.5 size-6 shrink-0 text-terracotta-light" aria-hidden="true" />
        {promiseGuarantee}
        {isConcept && " (Concept business: an illustration of the promise a real landscaper could make.)"}
      </p>
    </Section>
  );
}

/** FR-HOME-07 + FR-HOME-08 side by side: two short sections read better as one band. */
export function WhyNowAndWater() {
  const { seasonal } = content.business;
  const gallons = waterGallonsPerYear(1000);
  return (
    <section aria-label="Why now and water savings" className="section-y">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Fall is planting season</p>
          <h2>{seasonal.headline}</h2>
          <p className="text-lead">{seasonal.body} So the best time to start is now.</p>
          <a
            href={seasonal.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-[0.8125rem] text-ink-muted underline underline-offset-3 hover:text-ink"
          >
            Source: KJZZ<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <WaterImpact gallons={gallons} />
      </div>
    </section>
  );
}

function WaterImpact({ gallons }: { gallons: number }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="eyebrow">Water</p>
      <h2>Less lawn. Less water.</h2>
      <div className="flex flex-col gap-3">
        <p className="text-lead">
          A 1,000 sq ft lawn uses roughly {formatNumber(gallons)} gallons of water a year.{" "}
          <span className="text-ink-muted">(Estimate.)</span>
        </p>
        <WaterEquivalent gallons={gallons} className="text-[0.9375rem] text-ink-muted" />
        <details className="text-[0.9375rem] text-ink-muted">
          <summary className="w-fit cursor-pointer underline decoration-1 underline-offset-3">
            How we estimate this
          </summary>
          <p className="mt-2">
            {WATER.derivation}{" "}
            <a
              href={WATER.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-3"
            >
              Source<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </details>
      </div>
    </div>
  );
}

export function PricingPreview() {
  const { tiers, caption } = content.pricing;
  return (
    <Section
      id="pricing"
      tone="sand"
      eyebrow="Pricing"
      title="Clear ranges, before anyone visits."
      lead="Every project is different. Here's what most yards cost per square foot, before your rebate."
      action={<SecondaryCta link={{ label: "See pricing details", href: "/pricing" }} />}
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <li key={t.id} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-6">
            <span className="flex items-center justify-between gap-2">
              <h3>{t.name}</h3>
              {t.badge && (
                <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">
                  {t.badge}
                </span>
              )}
            </span>
            <p className="text-2xl font-semibold text-ink tabular">
              <Money low={t.lowPerSqft} high={t.highPerSqft} />{" "}
              <span className="text-base font-normal text-ink-muted">per sq ft</span>
            </p>
            <p className="text-[0.9375rem] text-ink-muted">
              {t.includes[0]}, {t.includes[1]?.toLowerCase()} and more.
            </p>
          </li>
        ))}
      </ul>
      {isConcept && <p className="text-sm text-ink-muted">{caption}</p>}
    </Section>
  );
}

export function PlantsPreview() {
  const featured = content.plants.plants.filter((p) => p.featured).slice(0, 6);
  return (
    <Section
      id="plants"
      eyebrow="Plants"
      title="Low-water plants that belong here."
      lead={`Chosen from the ${content.plants.listName}.`}
      action={<SecondaryCta link={{ label: "Browse all plants", href: "/plants" }} />}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <li key={p.id} className="flex gap-4 rounded-card border border-line bg-paper p-5">
            <SproutIcon className="mt-1 size-6 shrink-0 text-palo-verde" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-ink">{p.common}</p>
              <p className="text-[0.9375rem] text-ink-muted italic">{p.botanical}</p>
              <p className="text-[0.9375rem] text-ink-muted">
                {p.type.charAt(0).toUpperCase() + p.type.slice(1)} · blooms {p.bloom.toLowerCase()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function HomeFaq({ faqs }: { faqs: Faq[] }) {
  return (
    <Section id="faq" eyebrow="Questions" title="Good questions, straight answers.">
      <FaqList faqs={faqs} className="max-w-3xl" />
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section
      id="final"
      tone="sand"
      title="Your lawn is costing you water. Your city wants it gone."
      action={<PrimaryCta />}
    />
  );
}

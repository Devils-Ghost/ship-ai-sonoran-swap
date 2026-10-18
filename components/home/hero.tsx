import Link from "next/link";
import { HeroCta } from "@/components/analytics/hero-cta";
import { AiLabel } from "@/components/shared/ai-label";
import { CompareSlider } from "@/components/visualize/compare-slider";
import { content } from "@/lib/content/load";
import { PRIMARY_CTA } from "@/lib/site";
import { sampleAfter, sampleBefore, SAMPLE_YARDS } from "@/lib/visualize/samples";
import { QuickEstimate } from "./quick-estimate";

// FR-HOME-01/02. Copy: CONTENT §2 hero. Variant B is served at /?v=b through proxy.ts (SRS §4.8).
// "See my rebate" is the only primary button (D2). One estimator, placed by the grid: on phones it follows
// the buttons (text, estimator, photo); from 1024 px the text and photo share a row and the estimator
// runs as a full-width strip beneath them.
export const HEADLINES = {
  a: "Phoenix will pay you to lose your lawn.",
  b: "Swap your lawn for the Sonoran. The city helps pay.",
} as const;

export type Variant = keyof typeof HEADLINES;

const HERO_STYLE = "sonoran-native";
const HERO_YARD = SAMPLE_YARDS[0];

export function Hero({ variant }: { variant: Variant }) {
  const { business } = content;
  return (
    <section aria-labelledby="hero-title" className="container-page pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-x-14">
        <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <p className="eyebrow">Phoenix · Mesa · Chandler</p>
          <h1 id="hero-title">{HEADLINES[variant]}</h1>
          <p className="text-lead">
            Draw your lawn on a satellite map, see your city rebate, and preview your yard as a desert garden,
            all in about a minute. We handle the design, the paperwork and the swap.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <HeroCta link={PRIMARY_CTA} variant={variant} />
            <Link href="/visualize" className="inline-flex min-h-11 items-center font-semibold link">
              Preview my yard
            </Link>
          </div>
          <p className="text-sm text-ink-muted">Rebate rules from official city pages</p>
        </div>
        <div className="lg:col-span-2 lg:row-start-2">
          <QuickEstimate defaultSqft={business.sample.sqft} layout="strip" />
        </div>
        <figure className="flex flex-col gap-2 lg:col-start-2 lg:row-start-1">
          <CompareSlider
            before={{ src: sampleBefore(HERO_YARD.id), alt: HERO_YARD.alt }}
            after={{
              src: sampleAfter(HERO_YARD.id, HERO_STYLE),
              alt: "The same sample yard as a Sonoran Native desert garden",
            }}
            intro
            priority
            sizes="(min-width: 1248px) 610px, (min-width: 1024px) 50vw, calc(100vw - 32px)"
          >
            <AiLabel />
          </CompareSlider>
          <figcaption className="text-[0.8125rem] text-ink-muted">{business.disclosures.sample}</figcaption>
        </figure>
      </div>
    </section>
  );
}

import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { AiLabel } from "@/components/shared/ai-label";
import { CompareSlider } from "@/components/visualize/compare-slider";
import { content } from "@/lib/content/load";
import { formatDate } from "@/lib/utils/format";
import { sampleAfter, sampleBefore, SAMPLE_YARDS } from "@/lib/visualize/samples";
import { QuickEstimate } from "./quick-estimate";

// FR-HOME-01/02. Copy: CONTENT §2 hero. Variant B is served at /?v=b through proxy.ts (SRS §4.8).
export const HEADLINES = {
  a: "Phoenix will pay you to lose your lawn.",
  b: "Swap your lawn for the Sonoran. The city helps pay.",
} as const;

export type Variant = keyof typeof HEADLINES;

const HERO_STYLE = "sonoran-native";
const HERO_YARD = SAMPLE_YARDS[0];

export function Hero({ variant }: { variant: Variant }) {
  const { business, rebates } = content;
  return (
    <section aria-labelledby="hero-title" className="container-page pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">Phoenix · Mesa · Chandler</p>
          <h1 id="hero-title">{HEADLINES[variant]}</h1>
          <p className="text-lead">
            Draw your lawn on a satellite map, see your city rebate, and preview your yard as a desert garden,
            all in about a minute. We handle the design, the paperwork and the swap.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <PrimaryCta />
            <Link href="/visualize" className="font-semibold link">
              Preview my yard
            </Link>
          </div>
          <p className="text-sm text-ink-muted">
            Rebate rules from official city pages · last checked{" "}
            <time dateTime={rebates.lastReviewed}>{formatDate(rebates.lastReviewed)}</time>
          </p>
        </div>
        <figure className="flex flex-col gap-2">
          <CompareSlider
            before={{ src: sampleBefore(HERO_YARD.id), alt: HERO_YARD.alt }}
            after={{
              src: sampleAfter(HERO_YARD.id, HERO_STYLE),
              alt: "The same sample yard as a Sonoran Native desert garden",
            }}
            intro
            priority
            sizes="(min-width: 1248px) 610px, (min-width: 1024px) 50vw, 100vw"
          >
            <AiLabel />
          </CompareSlider>
          <figcaption className="text-[0.8125rem] text-ink-muted">{business.disclosures.sample}</figcaption>
        </figure>
      </div>
      <div className="mt-10">
        <QuickEstimate defaultSqft={business.sample.sqft} layout="strip" />
      </div>
    </section>
  );
}

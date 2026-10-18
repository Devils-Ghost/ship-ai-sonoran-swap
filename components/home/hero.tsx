import { HeroCta } from "@/components/analytics/hero-cta";
import { AiLabel } from "@/components/shared/ai-label";
import { CompareSlider } from "@/components/visualize/compare-slider";
import { content } from "@/lib/content/load";
import { Button } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/site";
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
    <section aria-labelledby="hero-title" className="v2-hero container-page pt-10 pb-16 lg:pt-14 lg:pb-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-10">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">Phoenix · Mesa · Chandler</p>
          <h1 id="hero-title">{HEADLINES[variant]}</h1>
          <p className="text-lead">
            Measure your lawn, explore an estimated city rebate, and picture a desert garden. Start with a
            sample or your own square footage. No photo or account needed.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <HeroCta link={{ ...PRIMARY_CTA, label: "Calculate my rebate" }} variant={variant} />
            <Button asChild variant="secondary">
              <a href="/studio?sample=1&demo=1">Try a sample yard →</a>
            </Button>
          </div>
          <p className="text-sm text-ink-muted">
            {business.mode === "concept" && (
              <span className="mb-2 block font-semibold">Hackathon concept · Interactive demo</span>
            )}
            Rebate rules from official city pages · last checked{" "}
            <time dateTime={rebates.lastReviewed}>{formatDate(rebates.lastReviewed)}</time>
          </p>
        </div>
        <figure className="v2-hero-figure flex flex-col gap-2">
          <div className="v2-figure-heading">
            <span>01 / The possibility</span>
            <span>Sonoran Native</span>
          </div>
          <CompareSlider
            before={{ src: sampleBefore(HERO_YARD.id), alt: HERO_YARD.alt }}
            after={{
              src: sampleAfter(HERO_YARD.id, HERO_STYLE),
              alt: "The same sample yard as a Sonoran Native desert garden",
            }}
            priority
            sizes="(min-width: 1248px) 610px, (min-width: 1024px) 50vw, 100vw"
          >
            <AiLabel />
          </CompareSlider>
          <figcaption className="text-[0.8125rem] text-ink-muted">
            Drag to explore · Use arrow keys on the handle.
            <br />
            {business.disclosures.sample}
          </figcaption>
        </figure>
      </div>
      <div className="v2-estimate-strip mt-10">
        <QuickEstimate defaultSqft={business.sample.sqft} layout="strip" />
      </div>
    </section>
  );
}

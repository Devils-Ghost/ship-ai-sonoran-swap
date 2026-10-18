"use client";

import Link from "next/link";
import styles from "@/content/styles.json";
import business from "@/content/business.json";
import { AiLabel } from "@/components/shared/ai-label";
import { CompareSlider } from "@/components/visualize/compare-slider";
import { sampleBefore, sampleAfter, EXAMPLE_YARD } from "@/lib/visualize/samples";
import type { CityId } from "@/lib/estimate/estimate";
import type { TierId } from "@/lib/estimate/pricing";

// FR-EST-09 / FR-VIS-03/07/08: the bundled pair never represents a visitor's measured property.
export function YardPlanPreview({
  style,
  onStyleChange,
  city,
  sqft,
  tier,
}: {
  style: string;
  onStyleChange: (value: string) => void;
  city: CityId;
  sqft: number;
  tier: TierId;
}) {
  const selected = styles.styles.find((s) => s.slug === style) ?? styles.styles[0];
  return (
    <section className="v2-plan-preview" aria-labelledby="plan-preview-title">
      <p className="eyebrow">02 / Imagine the change</p>
      <h2 id="plan-preview-title" className="mt-2 mb-5">
        A little more Sonoran.
      </h2>
      <label className="mb-2 block font-semibold" htmlFor="plan-landscape-style">
        Landscape style
      </label>
      <select
        id="plan-landscape-style"
        value={selected.slug}
        onChange={(e) => onStyleChange(e.target.value)}
        className="mb-5 min-h-11 w-full rounded-input border border-line bg-paper px-3"
      >
        {styles.styles.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
      <CompareSlider
        before={{ src: sampleBefore(EXAMPLE_YARD), alt: "AI-generated sample lawn, not your property" }}
        after={{
          src: sampleAfter(EXAMPLE_YARD, selected.slug),
          alt: `The same sample yard in ${selected.name} style`,
        }}
      >
        <AiLabel />
      </CompareSlider>
      <p className="mt-3 text-sm text-ink-muted">
        {business.disclosures.sample} Example style preview; city and area affect the estimate, not this
        image.
      </p>
      <p className="mt-4 font-semibold">
        {selected.name} · {selected.tagline}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{selected.description}</p>
      <div className="mt-5 flex flex-wrap gap-4">
        <Link
          className="min-h-11 content-center font-semibold link"
          href={`/visualize?style=${selected.slug}`}
        >
          Try a photo in the visualizer →
        </Link>
        <Link
          className="min-h-11 content-center font-semibold link"
          href={`/studio/prep?city=${city}&sqft=${sqft}&tier=${tier}`}
        >
          Prepare for city approval →
        </Link>
      </div>
    </section>
  );
}

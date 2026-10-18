import Link from "next/link";
import { PrimaryCta } from "@/components/layout/cta-link";
import { BuildingNote } from "@/components/layout/page-intro";
import { content } from "@/lib/content/load";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/format";

export const metadata = pageMetadata("/");

// Hero copy: CONTENT §2 (variant A). The full home (FR-HOME-01 – 12) ships later.
export default function Home() {
  return (
    <>
      <section className="container-page pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="flex max-w-3xl flex-col gap-6">
          <p className="eyebrow">Phoenix · Mesa · Chandler</p>
          <h1>Phoenix will pay you to lose your lawn.</h1>
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
            <time dateTime={content.rebates.lastReviewed}>{formatDate(content.rebates.lastReviewed)}</time>
          </p>
        </div>
      </section>
      <BuildingNote />
    </>
  );
}

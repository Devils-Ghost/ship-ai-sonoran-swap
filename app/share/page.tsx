import type { Metadata } from "next";
import { Suspense } from "react";
import { PrimaryCta, SecondaryCta } from "@/components/layout/cta-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Disclaimer } from "@/components/shared/disclaimer";
import { SourceNote } from "@/components/shared/source-note";
import { Skeleton } from "@/components/ui/skeleton";
import { content } from "@/lib/content/load";
import { getProgram } from "@/lib/rebates/engine";
import { getRoute } from "@/lib/routes";
import { ogImage } from "@/lib/seo/metadata";
import { parseShareParams, sharePath, shareSummary, type ShareSummary } from "@/lib/share";
import { formatSqft } from "@/lib/utils/format";

// Shareable rebate result: /share?city=phoenix&sqft=1240. The link holds only the city and the lawn size;
// the amount is recomputed here by the rebate engine. Noindex and not in the sitemap (lib/routes.ts).

type Search = PageProps<"/share">["searchParams"];

const CRUMBS = [
  { label: "Rebates", href: "/rebates" },
  { label: "Shared estimate", href: "/share" },
];

async function summaryFrom(searchParams: Search): Promise<ShareSummary | null> {
  const sp = await searchParams;
  const input = parseShareParams(sp.city, sp.sqft);
  return input && shareSummary(input);
}

function describe(s: ShareSummary) {
  return `An estimate from ${s.cityName}'s grass removal rules for a ${formatSqft(s.sqft)} lawn. See what your own lawn could earn.`;
}

export async function generateMetadata({ searchParams }: PageProps<"/share">): Promise<Metadata> {
  const s = await summaryFrom(searchParams);
  const { business } = content;
  const route = getRoute("/share");
  const title = s ? s.headline : route.title;
  const description = s ? describe(s) : route.description;
  const image = s
    ? ogImage(s.headline, `${formatSqft(s.sqft)} of lawn · estimated from ${s.cityName}'s rules`)
    : ogImage(business.tagline, business.oneLiner);
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: business.name,
      locale: "en_US",
      url: s ? sharePath(s) : "/share",
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default function SharePage({ searchParams }: PageProps<"/share">) {
  return (
    <Suspense fallback={<Skeleton className="container-page my-12 h-72 rounded-card" />}>
      <ShareResult searchParams={searchParams} />
    </Suspense>
  );
}

async function ShareResult({ searchParams }: { searchParams: Search }) {
  const s = await summaryFrom(searchParams);
  if (!s) {
    return (
      <PageIntro
        eyebrow="Shared estimate"
        title="This estimate link isn't complete."
        lead="It may have been cut off when it was copied. Measure a lawn to see what your city could pay."
        crumbs={CRUMBS}
      >
        <PrimaryCta />
      </PageIntro>
    );
  }
  const program = getProgram(s.city);
  return (
    <>
      <PageIntro eyebrow="Shared estimate" title={`${s.headline}.`} lead={describe(s)} crumbs={CRUMBS}>
        <PrimaryCta link={{ label: "See my rebate", href: `/studio?city=${s.city}&sqft=${s.sqft}` }} />
        <SecondaryCta link={{ label: `How ${s.cityName} pays`, href: `/rebates/${s.city}` }} />
      </PageIntro>
      <div className="container-page flex max-w-3xl flex-col gap-3 pb-20">
        <p className="text-[0.9375rem] text-ink-muted">
          Approval comes first: most programs only pay for grass removed after the city approves the project
          in writing.
        </p>
        <Disclaimer city={s.cityName} />
        <SourceNote program={program} />
      </div>
    </>
  );
}

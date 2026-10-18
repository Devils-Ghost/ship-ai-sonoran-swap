import { connection } from "next/server";
import { Suspense } from "react";
import { BookingForm } from "@/components/booking/booking-form";
import { PageIntro } from "@/components/layout/page-intro";
import { Skeleton } from "@/components/ui/skeleton";
import { arizonaToday, bookingDays } from "@/lib/booking/slots";
import { getEstimateSummary, UUID, type EstimateSummary } from "@/lib/booking/store";
import { content, isConcept } from "@/lib/content/load";
import { isCityId } from "@/lib/estimate/estimate";
import { cityName } from "@/lib/notify";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatMoney, formatSqft } from "@/lib/utils/format";

export const metadata = pageMetadata("/book");

// Copy: CONTENT §7. The intro is static; the picker reads ?estimateId= and today's date at request time.
export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <>
      <PageIntro
        title="Book a free yard walk."
        lead={content.business.hours}
        crumbs={[{ label: "Book", href: "/book" }]}
      />
      <div className="container-page pb-20">
        <Suspense fallback={<Skeleton className="h-[560px] w-full rounded-card" />}>
          <BookingSection searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function BookingSection({ searchParams }: { searchParams: PageProps<"/book">["searchParams"] }) {
  await connection(); // the calendar starts from today's date, so render per request
  const raw = (await searchParams).estimateId;
  const estimateId = typeof raw === "string" && UUID.test(raw) ? raw : null;
  let estimate: EstimateSummary | null = null;
  try {
    estimate = estimateId ? await getEstimateSummary(estimateId) : null;
  } catch {
    estimate = null; // booking still works without the summary
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-14">
      <BookingForm
        days={bookingDays(arizonaToday())}
        initialCity={estimate && isCityId(estimate.city) ? estimate.city : "phoenix"}
        estimateId={estimate ? estimateId : null}
        conceptNote={isConcept ? "This is a demonstration booking. No one will visit." : null}
        buttonLabel={isConcept ? "Book a demo yard walk" : "Book a free yard walk"}
      />
      <WalkSummary estimate={estimate} />
    </div>
  );
}

// The right column on desktop (after the form on phones): the carried-over estimate, what the walk covers,
// and the terms. Describes the service only; no numbers beyond the visitor's own estimate.
function WalkSummary({ estimate }: { estimate: EstimateSummary | null }) {
  return (
    <aside
      aria-labelledby="walk-title"
      className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 shadow-card sm:p-6 lg:sticky lg:top-24"
    >
      {estimate && (
        <section aria-label="Your estimate" className="flex flex-col gap-1 border-b border-line pb-5">
          <p className="eyebrow">Your estimate</p>
          <p className="text-lg text-ink">
            {cityName(estimate.city)} · {formatSqft(estimate.sqft)}
          </p>
          {estimate.rebateAmount != null && (
            <p className="text-ink">
              Estimated rebate{" "}
              <span className="font-display text-2xl font-semibold text-terracotta tabular">
                {formatMoney(estimate.rebateAmount)}
              </span>
            </p>
          )}
        </section>
      )}
      <div className="flex flex-col gap-3">
        <h2 id="walk-title" className="font-sans text-lg font-semibold text-ink">
          On the yard walk
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-[0.9375rem] text-ink">
          <li>We measure your lawn to confirm the square footage.</li>
          <li>We talk through styles, plants and drip irrigation for your yard.</li>
          <li>We go over your city&apos;s rules and the approval-first steps.</li>
        </ul>
      </div>
      <p className="font-semibold text-saguaro">Free, no obligation.</p>
    </aside>
  );
}

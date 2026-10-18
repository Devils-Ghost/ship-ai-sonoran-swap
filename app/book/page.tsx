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
        <div className="max-w-3xl">
          <Suspense fallback={<Skeleton className="h-[560px] w-full rounded-card" />}>
            <BookingSection searchParams={searchParams} />
          </Suspense>
        </div>
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
    <div className="flex flex-col gap-8">
      {estimate && <EstimateCard estimate={estimate} />}
      <BookingForm
        days={bookingDays(arizonaToday())}
        initialCity={estimate && isCityId(estimate.city) ? estimate.city : "phoenix"}
        estimateId={estimate ? estimateId : null}
        conceptNote={isConcept ? "This is a demonstration booking. No one will visit." : null}
        buttonLabel={isConcept ? "Book a demo yard walk" : "Book a free yard walk"}
      />
    </div>
  );
}

function EstimateCard({ estimate }: { estimate: EstimateSummary }) {
  return (
    <section aria-label="Your estimate" className="rounded-card border border-line bg-paper p-5">
      <p className="eyebrow">Attached estimate</p>
      <p className="mt-2 text-lg text-ink">
        {cityName(estimate.city)} · {formatSqft(estimate.sqft)}
        {estimate.rebateAmount != null && (
          <>
            {" "}
            · est. rebate{" "}
            <span className="font-semibold text-terracotta tabular">
              {formatMoney(estimate.rebateAmount)}
            </span>
          </>
        )}
      </p>
    </section>
  );
}

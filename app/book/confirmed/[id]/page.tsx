import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BellRingIcon, BellOffIcon } from "lucide-react";
import { cn } from "cn";
import { AddToCalendar } from "@/components/booking/add-to-calendar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay, windowInfo } from "@/lib/booking/slots";
import { getBooking, type BookingSummary } from "@/lib/booking/store";
import { content, isConcept } from "@/lib/content/load";
import { GUIDES } from "@/lib/guides";
import { cityName } from "@/lib/notify";
import { formatMoney, formatSqft } from "@/lib/utils/format";

// FR-SEO-02: confirmations are private to the visitor and never indexed.
export const metadata: Metadata = {
  title: "Your yard walk",
  robots: { index: false, follow: false },
};

// FR-BOOK-05, FR-NOTIF-03. Reads the booking at request time; the shell (breadcrumbs) stays static.
export default function BookingConfirmedPage({ params }: PageProps<"/book/confirmed/[id]">) {
  return (
    <section className="container-page pt-8 pb-20 lg:pt-12">
      <Breadcrumbs
        items={[
          { label: "Book", href: "/book" },
          { label: "Confirmation", href: "/book" },
        ]}
        className="mb-8"
      />
      <Suspense fallback={<ConfirmationSkeleton />}>
        <Confirmation params={params} />
      </Suspense>
    </section>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function Confirmation({ params }: { params: PageProps<"/book/confirmed/[id]">["params"] }) {
  const { id } = await params;
  let booking: BookingSummary | null;
  try {
    booking = await getBooking(id);
  } catch {
    booking = null;
  }
  if (!booking) notFound();

  const w = windowInfo(booking.slotWindow);
  const { business } = content;
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div className="flex flex-col gap-5">
        <p className="eyebrow">Yard walk {isConcept ? "(demo)" : "requested"}</p>
        <h1>
          You&apos;re booked for {formatDay(booking.slotDate)}, {w.label.toLowerCase()}.
        </h1>
        <p className="text-lead">
          {w.label} window, {w.hours} · {cityName(booking.city)}
        </p>
        {isConcept && (
          <p className="rounded-card border border-warning/30 bg-warning-bg p-4 text-ink">
            {business.disclosures.booking}
          </p>
        )}
      </div>

      <NotifyCard notified={booking.notified} />

      {booking.estimate && (
        <section aria-labelledby="estimate-heading" className="flex flex-col gap-2">
          <h2 id="estimate-heading" className="font-sans text-lg font-semibold">
            Your attached estimate
          </h2>
          <p className="text-ink">
            {cityName(booking.estimate.city)} · {formatSqft(booking.estimate.sqft)}
            {booking.estimate.rebateAmount != null &&
              ` · est. rebate ${formatMoney(booking.estimate.rebateAmount)}`}
          </p>
        </section>
      )}

      <div className="flex flex-wrap gap-4">
        <AddToCalendar
          id={booking.id}
          slotDate={booking.slotDate}
          slotWindow={booking.slotWindow}
          city={cityName(booking.city)}
          note={isConcept ? business.disclosures.booking : business.hours}
        />
      </div>

      <section aria-labelledby="next-heading" className="flex flex-col gap-4">
        <h2 id="next-heading">What happens next</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {business.process.map((s) => (
            <li
              key={s.step}
              aria-current={s.step === 1 ? "step" : undefined}
              className={cn(
                "flex flex-col gap-1 rounded-card border p-4",
                s.step === 1 ? "border-saguaro bg-saguaro text-caliche" : "border-line bg-paper",
              )}
            >
              <span className={cn("eyebrow", s.step === 1 && "text-caliche/80")}>
                Step {s.step}
                {s.step === 1 && " · you are here"}
              </span>
              <span className="font-semibold">{s.title}</span>
              <span className={cn("text-[0.9375rem]", s.step === 1 ? "text-caliche/90" : "text-ink-muted")}>
                {s.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="read-heading" className="flex flex-col gap-3">
        <h2 id="read-heading" className="font-sans text-lg font-semibold">
          Read before the walk
        </h2>
        <ul className="flex flex-col gap-2">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="inline-block min-h-11 content-center font-semibold link"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** FR-NOTIF-03: reflects what actually happened to the push. Never claims a delivery that failed. */
function NotifyCard({ notified }: { notified: boolean }) {
  const Icon = notified ? BellRingIcon : BellOffIcon;
  return (
    <section
      aria-label="Crew notification"
      className={cn(
        "flex items-start gap-4 rounded-card border p-5",
        notified ? "border-success/40 bg-paper" : "border-line bg-paper",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-6 shrink-0", notified ? "text-success" : "text-ink-muted")}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-ink">{notified ? "Sent to the crew's phone" : "Not delivered"}</p>
        <p className="text-[0.9375rem] text-ink-muted">
          {notified
            ? "A push notification went to the team's demo phone the moment you booked."
            : "No push reached the team's phone for this booking. Your booking is still saved."}
        </p>
      </div>
    </section>
  );
}

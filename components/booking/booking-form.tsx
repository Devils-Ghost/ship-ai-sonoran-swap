"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { cn } from "cn";
import { CitySelect } from "@/components/estimate/city-select";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { DEMO_HEADER, isDemo } from "@/lib/demo/flag";
import { formatDay, SLOT_WINDOWS, type Day, type SlotWindow } from "@/lib/booking/slots";
import type { CityId } from "@/lib/estimate/estimate";

// FR-BOOK-01–06. Native radios for days and windows: arrow keys, labels and "dimmed" (disabled) state
// come from the browser, and taken windows are announced as unavailable (FR-BOOK-03).

type Props = {
  days: Day[];
  initialCity: CityId;
  estimateId: string | null;
  conceptNote: string | null;
  buttonLabel: string;
};

type ApiReply = { ok: true; data: { id: string } } | { ok: false; error: { message: string } };

export function BookingForm({ days, initialCity, estimateId, conceptNote, buttonLabel }: Props) {
  const router = useRouter();
  const [city, setCity] = useState<CityId>(initialCity);
  const [date, setDate] = useState<string | null>(null);
  const [slotWindow, setWindow] = useState<SlotWindow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // FR-BOOK-06: one key per choice, reused if the same request is retried.
  const keyRef = useRef<{ choice: string; key: string } | null>(null);
  const errorId = useId();

  const day = days.find((d) => d.date === date);

  const pickDate = (next: string) => {
    if (date === null) track("booking_started");
    setDate(next);
    setError(null);
    const stillOpen = days
      .find((d) => d.date === next)
      ?.slots.find((s) => s.window === slotWindow)?.available;
    if (!stillOpen) setWindow(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!date || !slotWindow) {
      setError("Pick a day and a time first.");
      return;
    }
    const choice = `${date}|${slotWindow}|${city}`;
    if (keyRef.current?.choice !== choice) keyRef.current = { choice, key: crypto.randomUUID() };
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(isDemo() ? DEMO_HEADER : {}) },
        body: JSON.stringify({
          slotDate: date,
          slotWindow,
          city,
          idempotencyKey: keyRef.current.key,
          ...(estimateId ? { estimateId } : {}),
        }),
      });
      const json = (await res.json()) as ApiReply;
      if (json.ok) {
        track("booking_confirmed", { city });
        router.push(`/book/confirmed/${json.data.id}`);
        return; // stay busy while the confirmation loads
      }
      setError(json.error.message);
    } catch {
      setError("Couldn't book. Try again.");
    }
    setBusy(false);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-8"
      aria-describedby={error ? errorId : undefined}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-sans text-lg font-semibold text-ink">1. Pick a day</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {days.map((d) => {
            const full = d.slots.every((s) => !s.available);
            return (
              <label
                key={d.date}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center rounded-card border px-2 py-2 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                  full
                    ? "cursor-not-allowed border-dashed border-line bg-transparent text-ink-muted"
                    : "cursor-pointer border-line bg-paper hover:border-ink-muted",
                  date === d.date && "border-saguaro bg-saguaro text-caliche hover:border-saguaro",
                )}
              >
                <input
                  type="radio"
                  name="day"
                  value={d.date}
                  checked={date === d.date}
                  disabled={full}
                  onChange={() => pickDate(d.date)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{formatDay(d.date, "weekday")}</span>
                <span className="font-semibold tabular">{formatDay(d.date, "monthDay")}</span>
                {full && <span className="text-xs">Full</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3" disabled={!day}>
        <legend className="mb-3 font-sans text-lg font-semibold text-ink">2. Pick a time</legend>
        {!day && <p className="text-ink-muted">Choose a day to see open times.</p>}
        {day && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SLOT_WINDOWS.map((w) => {
              const available = day.slots.find((s) => s.window === w.id)?.available ?? false;
              return (
                <label
                  key={w.id}
                  className={cn(
                    "flex min-h-14 items-center justify-between gap-3 rounded-card border px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                    available
                      ? "cursor-pointer border-line bg-paper hover:border-ink-muted"
                      : "cursor-not-allowed border-dashed border-line text-ink-muted",
                    slotWindow === w.id && "border-saguaro bg-saguaro text-caliche hover:border-saguaro",
                  )}
                >
                  <input
                    type="radio"
                    name="slotWindow"
                    value={w.id}
                    checked={slotWindow === w.id}
                    disabled={!available}
                    onChange={() => {
                      setWindow(w.id);
                      setError(null);
                    }}
                    className="sr-only"
                  />
                  <span className="font-semibold">
                    {w.label} <span className="font-normal">· {w.hours}</span>
                  </span>
                  {!available && <span className="text-sm">Unavailable</span>}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className="max-w-sm">
        <CitySelect value={city} onChange={setCity} label="3. Your city" />
      </div>

      <div className="flex flex-col gap-3">
        {conceptNote && <p className="text-ink-muted">{conceptNote}</p>}
        <div>
          <Button type="submit" loading={busy}>
            {busy ? "Booking…" : buttonLabel}
          </Button>
        </div>
        <p id={errorId} role="alert" className="min-h-6 font-medium text-error">
          {error}
        </p>
      </div>
    </form>
  );
}

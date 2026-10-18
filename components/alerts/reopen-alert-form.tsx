"use client";

import { useId, useState } from "react";
import { BellIcon, CheckIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics/client";
import { validateAlert, type ReopenAlertProgram } from "@/lib/alerts";
import { getProgram } from "@/lib/rebates/engine";

// "Notify me when it reopens", shown wherever a program's between-seasons status appears. Success is shown
// only after the server confirms (SRS §12 form states). The email is used for the one reopening notice.

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

export function ReopenAlertForm({
  programId,
  headingLevel = "h3",
  className,
}: {
  programId: ReopenAlertProgram;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const city = getProgram(programId).city;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const id = useId();
  const Heading = headingLevel;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    const found = validateAlert(email, consent);
    setErrors(found);
    if (found.email || found.consent) return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, email: email.trim(), consent: true, ...(hp ? { hp } : {}) }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (json.ok) {
        track("reopen_alert_signup", { city: programId });
        setStatus({ kind: "done" });
        return;
      }
      setStatus({ kind: "error", message: json.error?.message ?? "Couldn't sign you up. Try again." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't sign you up. Check your connection and try again." });
    }
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("flex flex-col gap-4 rounded-card border border-line bg-paper p-5 sm:p-6", className)}
    >
      <div className="flex flex-col gap-1">
        <Heading
          id={`${id}-title`}
          className="flex items-center gap-2 font-sans text-lg font-semibold text-ink"
        >
          <BellIcon className="size-5 text-terracotta" aria-hidden="true" />
          Notify me when {city} reopens
        </Heading>
        <p className="text-[0.9375rem] text-ink-muted">
          We&apos;ll send one email when {city}&apos;s grass removal rebate takes applications again.
        </p>
      </div>

      {status.kind === "done" ? (
        <p role="status" className="flex items-start gap-2 font-semibold text-ink">
          <CheckIcon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          You&apos;re on the list. We&apos;ll email you once when {city} reopens.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${id}-email-error` : undefined}
            />
            {errors.email && (
              <p id={`${id}-email-error`} className="text-[0.875rem] font-medium text-error">
                {errors.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[0.9375rem] text-ink">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
                className="mt-0.5 size-5 shrink-0 accent-saguaro"
              />
              <span>
                You may email me once when {city}&apos;s program reopens. Nothing else, and my email
                isn&apos;t shared. See the{" "}
                <a href="/privacy" className="link">
                  privacy statement
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p id={`${id}-consent-error`} className="text-[0.875rem] font-medium text-error">
                {errors.consent}
              </p>
            )}
          </div>
          {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Leave this empty
              <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <Button type="submit" variant="secondary" loading={status.kind === "sending"}>
                Notify me
              </Button>
            </div>
            <p role="alert" className="min-h-6 text-[0.9375rem] font-medium text-error">
              {status.kind === "error" ? status.message : ""}
            </p>
          </div>
        </form>
      )}
    </section>
  );
}

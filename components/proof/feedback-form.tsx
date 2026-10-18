"use client";

import { useId, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/analytics/client";

// SRS §11.5 (FR-FB) and the §12 Feedback states. Success is shown only after the server confirms storage.
const MAX = 1000;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const id = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    if (!message.trim()) return setStatus({ kind: "error", message: "Write a message first." });
    if (email && !consent)
      return setStatus({ kind: "error", message: "Tick the box so we may reply, or leave the email empty." });
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          consent: Boolean(email) && consent,
          page: window.location.pathname,
          ...(email ? { email: email.trim() } : {}),
          ...(hp ? { hp } : {}),
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (json.ok) {
        track("feedback_sent");
        setStatus({ kind: "sent" });
        return;
      }
      setStatus({ kind: "error", message: json.error?.message ?? "Couldn't send. Try again." });
    } catch {
      setStatus({ kind: "error", message: "Couldn't send. Check your connection and try again." });
    }
  };

  if (status.kind === "sent") {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-card border border-success/40 bg-paper p-5 font-semibold text-ink"
      >
        <CheckIcon className="size-5 text-success" aria-hidden="true" />
        Thanks, received.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-message`}>Your feedback</Label>
        <textarea
          id={`${id}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
          rows={5}
          required
          aria-describedby={`${id}-count`}
          className="rounded-input border border-line bg-paper px-3.5 py-3 text-base text-ink transition-colors hover:border-ink-muted"
        />
        <p id={`${id}-count`} className="text-[0.8125rem] text-ink-muted tabular">
          {message.length} / {MAX}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>Email (optional, only if you&apos;d like a reply)</Label>
        <Input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {email && (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-5 accent-saguaro"
          />
          You may use this email to reply to my feedback. Nothing else.
        </label>
      )}
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
            Send feedback
          </Button>
        </div>
        <p role="alert" className="min-h-6 font-medium text-error">
          {status.kind === "error" ? status.message : ""}
        </p>
      </div>
    </form>
  );
}

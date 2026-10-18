// Programs that can take "notify me when it reopens" sign-ups: the ones between seasons. Pure; shared by
// the API route and the form.
export const REOPEN_ALERT_PROGRAMS = ["scottsdale"] as const;
export type ReopenAlertProgram = (typeof REOPEN_ALERT_PROGRAMS)[number];

export function isReopenAlertProgram(id: string): id is ReopenAlertProgram {
  return (REOPEN_ALERT_PROGRAMS as readonly string[]).includes(id);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client-side check before sending; the server validates again with Zod. */
export function validateAlert(email: string, consent: boolean): { email?: string; consent?: string } {
  const errors: { email?: string; consent?: string } = {};
  const trimmed = email.trim();
  if (!trimmed) errors.email = "Enter your email address.";
  else if (trimmed.length > 254 || !EMAIL.test(trimmed))
    errors.email = "That email address doesn't look right.";
  if (!consent) errors.consent = "Tick the box so we may email you about the reopening.";
  return errors;
}

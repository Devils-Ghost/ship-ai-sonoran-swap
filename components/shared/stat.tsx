import { cn } from "cn";

// DESIGN §6 Stat: Fraunces 48 px figure over a 14 px muted Inter label.
export function Stat({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="font-display text-5xl leading-none font-semibold text-saguaro tabular">{value}</span>
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  );
}

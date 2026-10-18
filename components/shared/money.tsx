import { cn } from "cn";
import { formatMoney, formatMoneyRange, formatSqft } from "@/lib/utils/format";

// DESIGN §3/§6: money and areas always use tabular figures so columns and count-ups don't jitter.

type MoneyProps = { className?: string } & ({ amount: number } | { low: number; high: number });

export function Money(props: MoneyProps) {
  const text = "amount" in props ? formatMoney(props.amount) : formatMoneyRange(props.low, props.high);
  return <span className={cn("whitespace-nowrap tabular", props.className)}>{text}</span>;
}

export function Sqft({ value, className }: { value: number; className?: string }) {
  return <span className={cn("whitespace-nowrap tabular", className)}>{formatSqft(value)}</span>;
}

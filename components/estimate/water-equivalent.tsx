import { familyDays, WATER } from "@/lib/estimate/water";
import { formatNumber } from "@/lib/utils/format";

// Makes a water estimate easy to picture with an official, cited figure (EPA WaterSense: the average
// American family uses more than 300 gallons a day at home). "Up to", because 300 is EPA's lower bound.
export function WaterEquivalent({ gallons, className }: { gallons: number; className?: string }) {
  const days = familyDays(gallons);
  if (days < 1) return null;
  const { householdEquivalent: eq } = WATER;
  return (
    <p className={className}>
      That&apos;s up to {formatNumber(days)} {days === 1 ? "day" : "days"} of an average American
      family&apos;s home water use.{" "}
      <a
        href={eq.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={eq.statement}
        className="whitespace-nowrap underline underline-offset-3"
      >
        Source: U.S. EPA<span className="sr-only"> WaterSense (opens in a new tab)</span>
      </a>
    </p>
  );
}

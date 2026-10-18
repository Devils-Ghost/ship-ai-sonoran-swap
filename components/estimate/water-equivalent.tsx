import { bathtubs, WATER } from "@/lib/estimate/water";
import { formatNumber } from "@/lib/utils/format";

// Makes a water estimate easy to picture: full bathtubs, from an official figure kept in
// content/business.json (USGS Water Science School: a good-sized bath holds 40 gallons).
export function WaterEquivalent({ gallons, className }: { gallons: number; className?: string }) {
  const tubs = bathtubs(gallons);
  if (tubs < 1) return null;
  return (
    <p className={className}>
      That&apos;s about {formatNumber(tubs)} full {tubs === 1 ? "bathtub" : "bathtubs"} a year.
    </p>
  );
}

/** The bathtub figure's source, for the "how we estimate water" fold-outs (not shown elsewhere). */
export function BathtubSource({ className }: { className?: string }) {
  const tub = WATER.bathtubEquivalent;
  return (
    <p className={className}>
      Bathtubs: {tub.statement.replace(/\.$/, "")}, says the USGS Water Science School.{" "}
      <a
        href={tub.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-3"
      >
        Source<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}

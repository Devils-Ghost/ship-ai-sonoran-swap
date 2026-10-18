import { bathtubs } from "@/lib/estimate/water";
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

import Link from "next/link";
import plantsData from "@/content/plants.json";
import { Button } from "@/components/ui/button";
import { STYLES } from "./style-picker";

// FR-VIS-09: the palette comes from plants.json (never from the image), plus materials and upkeep.
const PLANTS = plantsData.plants;

export function PlantPalette({ style }: { style: string }) {
  const s = STYLES.find((x) => x.slug === style);
  if (!s) return null;
  const plants = s.plantIds.map((id) => PLANTS.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <aside
      className="flex flex-col gap-5 rounded-card border border-line bg-paper p-6"
      aria-label={`${s.name} plant palette`}
    >
      <div className="flex flex-col gap-1">
        <p className="eyebrow">{s.name}</p>
        <p className="text-ink">{s.description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-sans text-base font-semibold text-ink">Plants in this style</h2>
        <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
          {plants.map((p) => (
            <li key={p.id} className="text-[0.9375rem]">
              <span className="font-medium text-ink">{p.common}</span>{" "}
              <span className="text-ink-muted italic">{p.botanical}</span>
            </li>
          ))}
        </ul>
      </div>
      <dl className="grid gap-3 text-[0.9375rem] sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-muted">Materials</dt>
          <dd className="text-ink first-letter:uppercase">{s.materials}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">Upkeep</dt>
          <dd className="text-ink">{s.maintenance}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3">
        {/* Secondary: the header and the visualizer own this viewport's primary action (D2). */}
        <Button asChild variant="secondary">
          <Link href="/studio">Estimate this yard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/book">Book a yard walk</Link>
        </Button>
      </div>
    </aside>
  );
}

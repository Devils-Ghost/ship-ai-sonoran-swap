"use client";

import { useMemo, useState } from "react";
import { cn } from "cn";
import { ArrowUpRightIcon, CheckIcon } from "lucide-react";
import plantsData from "@/content/plants.json";
import stylesData from "@/content/styles.json";
import { Button } from "@/components/ui/button";

// SRS §6.9 FR-PLT: filter chips and an empty state. Data from plants.json (verified against the ADWR list).
const PLANTS = plantsData.plants;
const STYLE_NAME = Object.fromEntries(stylesData.styles.map((s) => [s.slug, s.name]));

const TYPES = [
  { value: "tree", label: "Trees" },
  { value: "shrub", label: "Shrubs" },
  { value: "cactus", label: "Cacti" },
  { value: "accent", label: "Accents" },
  { value: "groundcover", label: "Groundcovers" },
] as const;
const SUN = [
  { value: "full", label: "Full sun" },
  { value: "part", label: "Part shade" },
] as const;

type Type = (typeof TYPES)[number]["value"];
type Sun = (typeof SUN)[number]["value"];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-[0.9375rem] font-medium transition-colors",
        pressed
          ? "border-saguaro bg-saguaro text-caliche"
          : "border-line bg-paper text-ink hover:border-ink-muted",
      )}
    >
      {pressed && <CheckIcon className="size-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function PlantBrowser({ listSourceUrl }: { listSourceUrl: string | null }) {
  const [types, setTypes] = useState<Set<Type>>(new Set());
  const [sun, setSun] = useState<Set<Sun>>(new Set());
  const [pollinator, setPollinator] = useState(false);

  const shown = useMemo(
    () =>
      PLANTS.filter(
        (p) =>
          (types.size === 0 || types.has(p.type as Type)) &&
          (sun.size === 0 || p.sun.some((s) => sun.has(s as Sun))) &&
          (!pollinator || p.pollinator),
      ),
    [types, sun, pollinator],
  );
  const filtered = types.size > 0 || sun.size > 0 || pollinator;
  const clear = () => {
    setTypes(new Set());
    setSun(new Set());
    setPollinator(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4" role="group" aria-label="Filter plants">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Chip
              key={t.value}
              pressed={types.has(t.value)}
              onClick={() => setTypes((s) => toggle(s, t.value))}
            >
              {t.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SUN.map((s) => (
            <Chip key={s.value} pressed={sun.has(s.value)} onClick={() => setSun((x) => toggle(x, s.value))}>
              {s.label}
            </Chip>
          ))}
          <Chip pressed={pollinator} onClick={() => setPollinator((v) => !v)}>
            Pollinator friendly
          </Chip>
        </div>
        <p className="text-sm text-ink-muted" aria-live="polite">
          {shown.length} of {PLANTS.length} plants
          {filtered && (
            <>
              {" · "}
              <button type="button" onClick={clear} className="cursor-pointer link">
                Clear filters
              </button>
            </>
          )}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-line bg-paper p-8">
          <p className="text-ink">No plants match. Clear filters to see them all.</p>
          <Button variant="secondary" onClick={clear}>
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 rounded-card border border-line bg-paper p-5">
              <p className="eyebrow">
                {TYPES.find((t) => t.value === p.type)?.label.replace(/s$/, "") ?? p.type}
              </p>
              <h2 className="text-xl">{p.common}</h2>
              <p className="text-[0.9375rem] text-ink-muted italic">{p.botanical}</p>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.9375rem]">
                <dt className="text-ink-muted">Size</dt>
                <dd className="text-ink">{p.matureSize}</dd>
                <dt className="text-ink-muted">Bloom</dt>
                <dd className="text-ink">
                  {p.bloom}
                  {p.flowerColor ? `, ${p.flowerColor}` : ""}
                </dd>
                <dt className="text-ink-muted">Sun</dt>
                <dd className="text-ink">
                  {p.sun.map((s) => SUN.find((x) => x.value === s)?.label).join(", ")}
                </dd>
                <dt className="text-ink-muted">Styles</dt>
                <dd className="text-ink">{p.styles.map((s) => STYLE_NAME[s] ?? s).join(", ")}</dd>
              </dl>
              <p className="text-[0.9375rem] text-ink">{p.note}</p>
              {p.pollinator && <p className="text-sm font-medium text-success">Feeds pollinators</p>}
              {listSourceUrl && (
                <a
                  href={listSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-2 text-[0.8125rem] text-ink-muted underline underline-offset-3 hover:text-ink"
                >
                  On the ADWR Phoenix AMA low-water list
                  <ArrowUpRightIcon className="ml-0.5 inline size-3" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "cn";
import { ChevronsLeftRightIcon } from "lucide-react";

// FR-VIS-07 / DESIGN §6: before/after comparison. Pointer drag or click anywhere; keyboard ←/→ in 5%
// steps and Home/End on the handle (role="slider"). The box reserves its aspect ratio so nothing shifts.

export type CompareMode = "compare" | "before" | "after";

type Props = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  /** Width / height of the images, e.g. 3 / 2. */
  aspect?: number;
  mode?: CompareMode;
  /** DESIGN §7: glide from 85% to 50% once on load (skipped with reduced motion). */
  intro?: boolean;
  /** Overlays such as the AI label; positioned by the caller. */
  children?: React.ReactNode;
  className?: string;
  priority?: boolean;
  /** next/image sizes for local images (e.g. the home hero). */
  sizes?: string;
};

const STEP = 5;

export function CompareSlider({
  before,
  after,
  aspect = 3 / 2,
  mode = "compare",
  intro = false,
  children,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: Props) {
  const [pos, setPos] = useState(intro ? 85 : 50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const interacted = useRef(false);

  useEffect(() => {
    if (!intro) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      if (interacted.current) return;
      const p = reduce ? 1 : Math.min(1, (now - t0) / 600);
      setPos(85 - 35 * (1 - (1 - p) ** 3));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [intro]);

  const moveTo = (clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? pos - STEP
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? pos + STEP
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    interacted.current = true;
    setPos(Math.min(100, Math.max(0, Math.round(next))));
  };

  const shown = mode === "before" ? 100 : mode === "after" ? 0 : pos;

  return (
    <div
      ref={box}
      className={cn("relative w-full overflow-hidden rounded-media bg-sand select-none", className)}
      style={{ aspectRatio: aspect, touchAction: "pan-y" }}
      onPointerDown={(e) => {
        if (mode !== "compare") return;
        interacted.current = true;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* Before fills the frame and After is revealed right of the divider. The full-frame layer never
          changes size, so it is a stable LCP element even while the intro glide moves the divider (C2). */}
      <Picture {...before} load={priority ? "preload" : "lazy"} sizes={sizes} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${shown}%)` }}>
        <Picture {...after} load={priority ? "eager" : "lazy"} sizes={sizes} />
      </div>

      {mode !== "after" && (
        <span className="absolute top-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-caliche">
          Before
        </span>
      )}
      {mode !== "before" && (
        <span className="absolute top-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-caliche">
          After
        </span>
      )}

      {mode === "compare" && (
        <div className="absolute inset-y-0" style={{ left: `${shown}%` }}>
          <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-caliche shadow-[0_0_8px_rgb(0_0_0/0.35)]" />
          <button
            type="button"
            role="slider"
            aria-label="Compare before and after"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(shown)}
            aria-valuetext={`${Math.round(shown)}% before`}
            onKeyDown={onKeyDown}
            className="absolute top-1/2 left-0 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-[3px] border-terracotta bg-caliche text-terracotta shadow-card"
          >
            <ChevronsLeftRightIcon className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

/** Local files go through next/image (AVIF/WebP, srcset); uploads and API renders are blob:/data: URLs. */
// The before image fills the frame, so it is the LCP element: preload it and load the after image eagerly
// without competing for the preload slot (next/image docs, Next 16 `preload`).
function Picture({
  src,
  alt,
  load,
  sizes,
}: {
  src: string;
  alt: string;
  load: "preload" | "eager" | "lazy";
  sizes: string;
}) {
  if (src.startsWith("/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        // Full-bleed photos behind a slider: 60 is visually the same here and ~25% lighter (C2).
        quality={60}
        preload={load === "preload"}
        loading={load === "preload" ? undefined : load}
        // The after image is visible but isn't the LCP: let the before image have the bandwidth first.
        fetchPriority={load === "eager" ? "low" : undefined}
        draggable={false}
        className="object-cover"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob: and data: URLs can't be optimized
    <img src={src} alt={alt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
  );
}

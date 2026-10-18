"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";
import business from "@/content/business.json";
import { AiLabel } from "@/components/shared/ai-label";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { track } from "@/lib/analytics/client";
import { DEMO_HEADER, isDemo } from "@/lib/demo/flag";
import { pickParams } from "@/lib/utils/url";
import { composeBeforeAfter } from "@/lib/visualize/composite";
import { PrepareFailure, prepareMessage, preparePhoto, type PreparedPhoto } from "@/lib/visualize/preprocess";
import {
  EXAMPLE_YARD,
  sampleAfter,
  sampleBefore,
  SAMPLE_YARDS,
  type SampleYardId,
} from "@/lib/visualize/samples";
import { CompareSlider, type CompareMode } from "./compare-slider";
import { PlantPalette } from "./plant-palette";
import { RenderProgress } from "./render-progress";
import { StylePicker, STYLES } from "./style-picker";
import { UploadZone } from "./upload-zone";

// SRS §10 visualizer. The uploaded photo lives only in this component's memory (FR-VIS-10/11).

const CLIENT_TIMEOUT_MS = 45_000; // FR-VIS-06
const MODES = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "compare", label: "Compare" },
] as const;

// Labels: business.json (AGENTS §2.7) and CONTENT §5.
const LABEL = {
  sample: business.disclosures.sample,
  gallery: "Example rendering for this style",
  fallback: "Example rendering (live preview unavailable)",
  refused: "We couldn't process that photo. Try a photo of a yard.",
  rateLimited: "You're moving fast. Try again in a minute.",
};

type Result = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  /** live: their photo edited. sample: a bundled sample yard. gallery/fallback: an example pair. */
  kind: "live" | "sample" | "gallery" | "fallback";
  style: string;
};

const styleName = (slug: string) => STYLES.find((s) => s.slug === slug)?.name ?? slug;
const isStyle = (v: string | null): v is string => STYLES.some((s) => s.slug === v);

function examplePair(style: string, kind: "gallery" | "fallback"): Result {
  const yard = SAMPLE_YARDS.find((y) => y.id === EXAMPLE_YARD);
  return {
    before: { src: sampleBefore(EXAMPLE_YARD), alt: yard?.alt ?? "Sample yard" },
    after: {
      src: sampleAfter(EXAMPLE_YARD, style),
      alt: `The same sample yard as a ${styleName(style)} desert garden`,
    },
    kind,
    style,
  };
}

function samplePair(id: SampleYardId, style: string): Result {
  const yard = SAMPLE_YARDS.find((y) => y.id === id);
  return {
    before: { src: sampleBefore(id), alt: yard?.alt ?? "Sample yard" },
    after: {
      src: sampleAfter(id, style),
      alt: `The same sample yard as a ${styleName(style)} desert garden`,
    },
    kind: "sample",
    style,
  };
}

/** Reads ?style= without a Suspense hole (same pattern as the studio). Demo mode is a tab flag (lib/demo). */
export function VisualizerRoot() {
  // Only the params this page reads: analytics strips ?src=/?team= after load, and that must not remount it.
  const search = useSyncExternalStore(
    () => () => {},
    () => pickParams(window.location.search, ["style"]),
    () => "",
  );
  const params = new URLSearchParams(search);
  const style = params.get("style");
  return <VisualizerApp key={search} initialStyle={isStyle(style) ? style : (STYLES[0]?.slug ?? "")} />;
}

function VisualizerApp({ initialStyle }: { initialStyle: string }) {
  const [style, setStyle] = useState(initialStyle);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [sample, setSample] = useState<SampleYardId | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<CompareMode>("compare");
  const controller = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Release the in-memory photo when it's replaced or the page closes.
  useEffect(() => () => void (photo && URL.revokeObjectURL(photo.url)), [photo]);

  const show = (r: Result) => {
    setResult(r);
    setMode("compare");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const onFile = async (file: File) => {
    track("visualizer_upload", { source: "upload" });
    setError(null);
    setResult(null);
    setSample(null);
    setPreparing(true);
    try {
      setPhoto(await preparePhoto(file));
    } catch (err) {
      setError(prepareMessage(err instanceof PrepareFailure ? err.code : "UNREADABLE"));
    } finally {
      setPreparing(false);
    }
  };

  const onSample = (id: SampleYardId) => {
    track("visualizer_upload", { source: "sample" });
    setError(null);
    setPhoto(null);
    setSample(id);
    show(samplePair(id, style));
  };

  const onStyle = (next: string) => {
    setStyle(next);
    // Samples and examples switch instantly; a live result waits for "Create my preview" (FR-VIS-10).
    if (sample) show(samplePair(sample, next));
    else if (result && result.kind !== "live")
      show(examplePair(next, result.kind === "gallery" ? "gallery" : "fallback"));
  };

  const render = async () => {
    if (!photo) return;
    setError(null);
    setRendering(true);
    const ac = new AbortController();
    controller.current = ac;
    let timedOut = false;
    const started = performance.now();
    const failed = (code: string) => track("render_failed", { style, code });
    const timer = setTimeout(() => {
      timedOut = true;
      ac.abort();
    }, CLIENT_TIMEOUT_MS);
    try {
      const form = new FormData();
      form.append("image", photo.blob, "yard.jpg");
      form.append("style", style);
      form.append("width", String(photo.width));
      form.append("height", String(photo.height));
      const res = await fetch("/api/render", {
        method: "POST",
        body: form,
        signal: ac.signal,
        headers: isDemo() ? DEMO_HEADER : undefined,
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        data?: { imageBase64: string; mime: string; kind: "live" | "example"; reason: string | null };
        error?: { code?: string };
      } | null;

      if (json?.ok && json.data) {
        const d = json.data;
        if (d.kind === "live") {
          track("render_success", { style, ms: performance.now() - started });
          show({
            before: { src: photo.url, alt: "Your photo" },
            after: {
              src: `data:${d.mime};base64,${d.imageBase64}`,
              alt: `Your yard as a ${styleName(style)} desert garden (AI concept)`,
            },
            kind: "live",
            style,
          });
        } else {
          failed(d.reason ?? "EXAMPLE");
          show(examplePair(style, d.reason === "GALLERY" ? "gallery" : "fallback"));
        }
      } else {
        const code = json?.error?.code ?? "UNKNOWN";
        failed(code);
        if (code === "PROVIDER_REFUSED" || code === "INVALID_IMAGE") setError(LABEL.refused);
        else if (code === "RATE_LIMITED") setError(LABEL.rateLimited);
        else show(examplePair(style, "fallback")); // FR-VIS-12
      }
    } catch {
      // A visitor's cancel returns to the photo; a timeout or network failure shows the example.
      if (timedOut || !ac.signal.aborted) {
        failed(timedOut ? "CLIENT_TIMEOUT" : "NETWORK");
        show(examplePair(style, "fallback"));
      }
    } finally {
      clearTimeout(timer);
      controller.current = null;
      setRendering(false);
    }
  };

  const cancel = () => controller.current?.abort();
  const showExampleNow = () => {
    controller.current?.abort();
    show(examplePair(style, "fallback"));
  };

  const download = async () => {
    if (!result) return;
    try {
      const blob = await composeBeforeAfter({
        beforeSrc: result.before.src,
        afterSrc: result.after.src,
        styleName: styleName(result.style),
        aiLabel: business.disclosures.ai,
        siteName: business.name,
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sonoran-swap-${result.style}.png`;
      a.click();
      track("render_downloaded", { style: result.style });
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setError("Couldn't build the download. Try again.");
    }
  };

  const reset = () => {
    setPhoto(null);
    setSample(null);
    setResult(null);
    setError(null);
  };

  const needsRender = photo && !rendering && (!result || result.kind !== "live" || result.style !== style);

  return (
    <div className="container-page flex flex-col gap-10 pb-16">
      <section aria-labelledby="style-heading" className="flex flex-col gap-4">
        <h2 id="style-heading" className="font-sans text-lg font-semibold text-ink">
          1. Pick a style
        </h2>
        <StylePicker value={style} onChange={onStyle} />
      </section>

      <section aria-labelledby="photo-heading" className="flex flex-col gap-4">
        <h2 id="photo-heading" className="font-sans text-lg font-semibold text-ink">
          2. Add your yard
        </h2>
        {photo ? (
          <div className="flex flex-col gap-4 rounded-media border border-line bg-paper p-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- in-memory blob: URL */}
            <img
              src={photo.url}
              alt="Your photo"
              className="aspect-[3/2] w-full rounded-card object-cover sm:w-64"
            />
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-ink">Your photo is ready. It stays in this browser tab.</p>
              <div className="flex flex-wrap gap-3">
                {needsRender && <Button onClick={render}>Create my {styleName(style)} preview</Button>}
                <Button variant="ghost" onClick={reset}>
                  <RotateCcwIcon aria-hidden="true" /> Use a different photo
                </Button>
              </div>
              {error && (
                <p
                  role="alert"
                  className="rounded-input bg-warning-bg px-3 py-2 text-[0.9375rem] text-warning"
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <UploadZone busy={preparing} error={error} onFile={onFile} onSample={onSample} />
        )}
      </section>

      {rendering && <RenderProgress onCancel={cancel} onExample={showExampleNow} />}

      {result && !rendering && (
        <section
          ref={resultRef}
          aria-labelledby="result-heading"
          className="grid scroll-mt-24 gap-6 lg:grid-cols-[3fr_2fr] lg:items-start"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="result-heading" className="text-2xl">
                {result.kind === "live"
                  ? `Your yard, ${styleName(result.style)}`
                  : `${styleName(result.style)} example`}
              </h2>
              <SegmentedControl label="View" value={mode} onValueChange={setMode} options={MODES} />
            </div>
            <CompareSlider before={result.before} after={result.after} mode={mode}>
              <AiLabel />
            </CompareSlider>
            <div className="flex flex-col gap-1 text-[0.9375rem]" aria-live="polite">
              {result.kind === "sample" && <p className="text-ink-muted">{LABEL.sample}</p>}
              {result.kind === "gallery" && <p className="font-medium text-ink">{LABEL.gallery}</p>}
              {result.kind === "fallback" && <p className="font-medium text-ink">{LABEL.fallback}</p>}
              <AiLabel variant="inline" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={download}>
                <DownloadIcon aria-hidden="true" /> Download before/after
              </Button>
            </div>
          </div>
          <PlantPalette style={result.style} />
        </section>
      )}
    </div>
  );
}

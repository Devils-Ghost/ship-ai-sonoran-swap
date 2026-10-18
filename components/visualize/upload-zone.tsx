"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { cn } from "cn";
import { CameraIcon, ImageUpIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_YARDS, sampleBefore, type SampleYardId } from "@/lib/visualize/samples";

// FR-VIS-01 inputs and FR-VIS-11 notice. CONTENT §5 copy.
export function UploadZone({
  busy,
  error,
  onFile,
  onSample,
}: {
  busy: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onSample: (id: SampleYardId) => void;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const noteId = useId();
  const take = (files: FileList | null) => {
    const f = files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-4 rounded-media border-2 border-dashed border-line bg-paper px-6 py-10 text-center transition-colors",
          over && "border-saguaro bg-sand",
        )}
      >
        {busy ? (
          <p className="flex items-center gap-2 text-ink" role="status">
            <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />
            Preparing your photo…
          </p>
        ) : (
          <>
            <ImageUpIcon className="size-10 text-saguaro" aria-hidden="true" />
            <p className="max-w-sm text-ink">Drop a photo of your front lawn here, or:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => uploadRef.current?.click()} aria-describedby={noteId}>
                <ImageUpIcon aria-hidden="true" /> Upload a photo
              </Button>
              <Button
                variant="secondary"
                onClick={() => cameraRef.current?.click()}
                aria-describedby={noteId}
              >
                <CameraIcon aria-hidden="true" /> Take a photo
              </Button>
            </div>
          </>
        )}
        <input
          ref={uploadRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => take(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => take(e.target.files)}
        />
        <p id={noteId} className="max-w-md text-[0.8125rem] text-ink-muted">
          Your photo is sent to our image provider to create the preview and isn&apos;t stored by us.
        </p>
        <p className="max-w-md text-[0.8125rem] text-ink-muted">
          Tips: Stand at the street or porch. Get the whole lawn in frame. Daylight works best.
        </p>
        {error && (
          <p role="alert" className="rounded-input bg-warning-bg px-3 py-2 text-[0.9375rem] text-warning">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-ink">Or use a sample yard</p>
        <ul className="grid grid-cols-3 gap-3">
          {SAMPLE_YARDS.map((y) => (
            <li key={y.id}>
              <button
                type="button"
                onClick={() => onSample(y.id)}
                className="group block w-full cursor-pointer overflow-hidden rounded-card border border-line"
                aria-label={`Use sample yard ${y.id.slice(-1)}`}
              >
                <Image
                  src={sampleBefore(y.id)}
                  alt=""
                  width={240}
                  height={160}
                  sizes="(min-width: 1024px) 200px, 30vw"
                  className="aspect-[3/2] w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

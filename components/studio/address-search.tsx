"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "cn";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// FR-EST-02: browser-only Mapbox geocoding, US + Phoenix metro, after 3 characters with a 250 ms debounce.
// The address string goes only to Mapbox, never to our API (AGENTS §2.4).
const PHOENIX_METRO_BBOX = "-112.65,33.15,-111.55,33.85";
const MIN_CHARS = 3;
const DEBOUNCE_MS = 250;

export type AddressPick = { label: string; lng: number; lat: number; place: string | null };

type Status = "idle" | "loading" | "results" | "empty" | "error";

type Feature = {
  id: string;
  geometry: { coordinates: [number, number] };
  properties: { full_address?: string; name?: string; context?: { place?: { name?: string } } };
};

export function AddressSearch({ token, onPick }: { token: string; onPick: (pick: AddressPick) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [options, setOptions] = useState<AddressPick[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const listId = useId();
  const noteId = useId();
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < MIN_CHARS) return; // the change handler already reset the list
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
        url.search = new URLSearchParams({
          q,
          autocomplete: "true",
          country: "us",
          bbox: PHOENIX_METRO_BBOX,
          types: "address",
          limit: "5",
          access_token: token,
        }).toString();
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`geocode ${res.status}`);
        const json = (await res.json()) as { features?: Feature[] };
        const picks = (json.features ?? []).map((f) => ({
          label: f.properties.full_address ?? f.properties.name ?? q,
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
          place: f.properties.context?.place?.name ?? null,
        }));
        setOptions(picks);
        setActive(picks.length ? 0 : -1);
        setStatus(picks.length ? "results" : "empty");
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, token]);

  const choose = (pick: AddressPick) => {
    skipNext.current = true;
    setQuery(pick.label);
    setOpen(false);
    setStatus("idle");
    onPick(pick);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      const pick = options[active];
      if (pick) choose(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && status === "results";
  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={inputId}>Find your home</Label>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          aria-describedby={noteId}
          autoComplete="off"
          placeholder="Start typing your address"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < MIN_CHARS) {
              setStatus("idle");
              setOptions([]);
            }
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="pr-11 pl-11"
        />
        {status === "loading" && (
          <Loader2Icon
            className="absolute top-1/2 right-3.5 size-5 -translate-y-1/2 animate-spin text-ink-muted"
            aria-label="Searching"
          />
        )}
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label="Address suggestions"
        hidden={!showList}
        className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-card border border-line bg-paper shadow-card"
      >
        {options.map((o, i) => (
          <li
            key={`${o.label}-${i}`}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(o)}
            className={cn(
              "flex min-h-11 cursor-pointer items-center px-4 py-2 text-[0.9375rem]",
              i === active && "bg-sand",
            )}
          >
            {o.label}
          </li>
        ))}
      </ul>
      <p id={noteId} className="text-[0.8125rem] text-ink-muted" aria-live="polite">
        {status === "error"
          ? "Can't search addresses right now. Enter square footage instead."
          : status === "empty"
            ? "No match in the Phoenix area."
            : "Your address stays in your browser. We only keep your city and lawn size."}
      </p>
    </div>
  );
}

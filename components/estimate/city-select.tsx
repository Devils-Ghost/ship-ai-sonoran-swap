"use client";

import { useId } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CITY_IDS, cityLabel, isCityId, type CityId } from "@/lib/estimate/estimate";

// FR-EST-08 "Your water bill comes from:". Programs are tied to the water utility, not the mailing city.
// A native <select>: the phone's own picker, keyboard and screen-reader support for free, and no
// dropdown library in the home page bundle (C1). Styled like Input (DESIGN §6).
export function CitySelect({
  value,
  onChange,
  label = "Your water bill comes from",
  cities = CITY_IDS,
  labelClassName,
}: {
  value: CityId;
  onChange: (city: CityId) => void;
  label?: string;
  cities?: readonly CityId[];
  /** Lets a form style the label like its other step headings. */
  labelClassName?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => isCityId(e.target.value) && onChange(e.target.value)}
          className="h-12 w-full cursor-pointer appearance-none rounded-input border border-line bg-paper pr-11 pl-3.5 text-base text-ink transition-colors duration-150 hover:border-ink-muted"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {cityLabel(c)}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

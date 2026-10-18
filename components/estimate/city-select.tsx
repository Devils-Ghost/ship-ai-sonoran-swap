"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITY_IDS, cityLabel, isCityId, type CityId } from "@/lib/estimate/estimate";

// FR-EST-08 "Your water bill comes from:". Programs are tied to the water utility, not the mailing city.
export function CitySelect({
  value,
  onChange,
  label = "Your water bill comes from",
  cities = CITY_IDS,
}: {
  value: CityId;
  onChange: (city: CityId) => void;
  label?: string;
  cities?: readonly CityId[];
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => isCityId(v) && onChange(v)}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>
              {cityLabel(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

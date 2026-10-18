// FR-EST-14 / FR-PREP-01: the studio map hands its snapshot to the prep sheet through sessionStorage only;
// the image never reaches our server. MapMeasure registers the source while a map is on screen.
export const PREP_SNAPSHOT_KEY = "ss_prep_snapshot";

let source: (() => string | null) | null = null;

export function registerSnapshotSource(fn: (() => string | null) | null): void {
  source = fn;
}

/** Saves the current map view for the prep sheet, or clears an old one when there is no map. */
export function saveSnapshotForPrep(): void {
  try {
    const data = source?.() ?? null;
    if (data) sessionStorage.setItem(PREP_SNAPSHOT_KEY, data);
    else sessionStorage.removeItem(PREP_SNAPSHOT_KEY);
  } catch {
    // Storage full or blocked: the sheet prints without the map.
  }
}

export function readPrepSnapshot(): string | null {
  try {
    const v = sessionStorage.getItem(PREP_SNAPSHOT_KEY);
    return v?.startsWith("data:image/") ? v : null;
  } catch {
    return null;
  }
}

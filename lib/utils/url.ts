/**
 * The query string reduced to `keys`, in that order. Client roots key their remount on this so that
 * analytics stripping ?src=/?team=/?t= from the address bar never resets a visitor's work.
 */
export function pickParams(search: string, keys: string[]): string {
  const all = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const k of keys) {
    const v = all.get(k);
    if (v !== null) kept.set(k, v);
  }
  return kept.toString();
}

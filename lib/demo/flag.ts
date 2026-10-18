// NFR-REL-02 / ARCH §8 demo mode for the pitch: ?demo=1 turns it on for this tab, ?demo=0 turns it off.
// Kept free of imports: it's in every page's bundle via analytics. demoStats lives in ./stats.
// Renders and the crew push go to mocks (x-demo header), sessions count as team (excluded from /insights),
// and /live shows a labeled replay instead of live counts. Nothing here pretends to be real data.

const KEY = "ss_demo";
export const DEMO_HEADER = { "x-demo": "1" } as const;

export function initDemo(): boolean {
  if (typeof window === "undefined") return false;
  const flag = new URLSearchParams(window.location.search).get("demo");
  try {
    if (flag === "1") window.sessionStorage.setItem(KEY, "1");
    if (flag === "0") window.sessionStorage.removeItem(KEY);
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return flag === "1";
  }
}

export function isDemo(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return new URLSearchParams(window.location.search).get("demo") === "1";
  }
}

import {
  MAX_BATCH,
  normalizeSource,
  normalizeVariant,
  type EventName,
  type EventProps,
  type Variant,
} from "./whitelist";

// FR-ANL-02/04/05, FR-INS-13. First-party, cookieless: a random session ID in sessionStorage, events
// batched and sent with navigator.sendBeacon. Every call is safe on a private window or blocked storage.

const KEYS = { sid: "ss_sid", src: "ss_src", v: "ss_v", team: "ss_team", test: "ss_test" } as const;
/** URL params read once and then removed from the address bar (SRS §11.9). */
const STRIP = ["src", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "team", "t"];
const FLUSH_MS = 1500;

type Session = { id: string; source: string; variant: Variant | null; team: boolean };
type Queued = { name: EventName; props: EventProps; path: string; ts: number };

let session: Session | null = null;
let queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked: the session lasts for this page only.
  }
}

function referralSource(): string {
  try {
    if (!document.referrer) return "direct";
    const host = new URL(document.referrer).hostname;
    return host && host !== window.location.hostname ? `referral:${host.toLowerCase()}` : "direct";
  } catch {
    return "direct";
  }
}

/** Reads the tab's session, creating it on the first page load (and starting a test session for ?t=). */
export function initAnalytics(): Session {
  if (session) return session;
  const params = new URLSearchParams(window.location.search);

  let source = read(KEYS.src);
  if (!source) {
    const tagged = params.get("src") ?? params.get("utm_source");
    source = tagged ? normalizeSource(tagged) : referralSource();
    write(KEYS.src, source);
  }

  const urlVariant = normalizeVariant(params.get("v"));
  if (urlVariant && !read(KEYS.v)) write(KEYS.v, urlVariant);
  const variant = normalizeVariant(read(KEYS.v)) ?? urlVariant;

  if (params.get("team") === "1") write(KEYS.team, "1");
  const team = read(KEYS.team) === "1";

  let id = read(KEYS.sid);
  if (!id) {
    id = crypto.randomUUID();
    write(KEYS.sid, id);
  }
  session = { id, source, variant, team };

  const tester = params.get("t");
  if (tester && !read(KEYS.test)) void startTestSession(tester, variant ?? "a");

  if (STRIP.some((k) => params.has(k))) {
    for (const k of STRIP) params.delete(k);
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  }

  if (!listening) {
    listening = true;
    // Unload is the moment that matters most for a beacon, and the only one it survives.
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  }
  return session;
}

/** FR-ANL-04: /?t=T01&v=a starts a test_sessions row; its ID rides along with the first estimate. */
async function startTestSession(label: string, variant: Variant): Promise<void> {
  try {
    const res = await fetch("/api/test-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, variant }),
    });
    const json = (await res.json()) as { ok: boolean; data?: { id: string } };
    if (json.ok && json.data) write(KEYS.test, json.data.id);
  } catch {
    // A missed test session only loses timing data, never the visitor's flow.
  }
}

export function testSessionId(): string | null {
  return typeof window === "undefined" ? null : read(KEYS.test);
}

export function currentVariant(): Variant | null {
  return session?.variant ?? null;
}

export function track(name: EventName, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  initAnalytics();
  queue.push({ name, props, path: window.location.pathname, ts: Date.now() });
  if (queue.length >= MAX_BATCH) flush();
  else if (!timer) timer = setTimeout(flush, FLUSH_MS);
}

export function flush(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  const s = session;
  if (!s) return;
  while (queue.length > 0) {
    const batch = queue.splice(0, MAX_BATCH);
    send(
      JSON.stringify({
        events: batch.map((e) => ({
          ...e,
          sessionId: s.id,
          source: s.source,
          variant: s.variant,
          team: s.team,
        })),
      }),
    );
  }
}

function send(body: string): void {
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch("/api/events", {
    method: "POST",
    body,
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  }).catch(() => undefined);
}

/** Tests only. */
export function resetAnalyticsForTests(): void {
  session = null;
  queue = [];
  if (timer) clearTimeout(timer);
  timer = null;
}

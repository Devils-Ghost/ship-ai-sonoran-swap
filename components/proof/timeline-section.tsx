import timeline from "@/content/timeline.json";

// FR-PROOF-02 Timeline: dated changes from the commit history, written by scripts/timeline.ts at build.
// Shared by the Proof drawer (lazy, client) and /launch-notes (server). No hooks.

export type TimelineEntry = {
  date: string;
  hash: string;
  title: string;
  description?: string;
  type: string;
  scope: string | null;
};

const dayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "America/Phoenix",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Phoenix",
});

const TYPE_LABEL: Record<string, string> = { feat: "Feature", fix: "Fix", perf: "Speed" };

export const timelineEntries = (timeline as unknown as { entries: TimelineEntry[] }).entries;

export function TimelineSection() {
  const entries = timelineEntries;
  if (entries.length === 0) return <p className="text-ink-muted">No changes published yet.</p>;
  const days = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const day = dayFormat.format(new Date(e.date));
    days.set(day, [...(days.get(day) ?? []), e]);
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-muted">
        {entries.length} changes from the project&apos;s commit history, newest first. Times are Arizona time.
      </p>
      {[...days].map(([day, list]) => (
        <section key={day} className="flex flex-col gap-3">
          <h3 className="font-sans text-base font-semibold text-ink">
            {day} <span className="font-normal text-ink-muted">· {list.length}</span>
          </h3>
          <ol className="flex flex-col gap-3 border-l-2 border-line pl-4">
            {list.map((e) => (
              <li key={e.hash} className="flex flex-col gap-0.5">
                <span className="text-[0.8125rem] text-ink-muted tabular">
                  {timeFormat.format(new Date(e.date))} · {TYPE_LABEL[e.type] ?? e.type}
                  {e.scope && ` · ${e.scope}`}
                </span>
                <span className="text-ink">{e.title}</span>
                {e.description ? (
                  <span className="line-clamp-2 text-[0.875rem] text-ink-muted">{e.description}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

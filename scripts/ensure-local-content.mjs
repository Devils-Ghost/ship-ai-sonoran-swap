// Some content files stay out of the repository (hand-kept or generated logs). Create
// empty, valid placeholders when they are missing so a fresh clone installs and builds.
import { existsSync, writeFileSync } from "node:fs";

const placeholders = {
  "content/decisions.json": {
    note: "Hand-maintained. Real observations only, from user tests or the events data. Add one entry per change, newest first.",
    entries: [],
  },
  "content/timeline.json": { generatedAt: new Date().toISOString(), entries: [] },
};

for (const [file, value] of Object.entries(placeholders)) {
  if (!existsSync(file)) writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

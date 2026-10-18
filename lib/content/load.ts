import business from "@/content/business.json";
import decisions from "@/content/decisions.json";
import plants from "@/content/plants.json";
import pricing from "@/content/pricing.json";
import rebates from "@/content/rebate-programs.json";
import seoReport from "@/content/seo-report.json";
import styles from "@/content/styles.json";
import quality from "@/content/quality.json";
import timeline from "@/content/timeline.json";
import { validateContent, type ProgramId, type RebateProgram } from "./schema";

// ARCH §5: validated at import, so a bad edit fails `next build` (and `pnpm validate:content`).
export const content = validateContent({
  business,
  rebates,
  pricing,
  plants,
  styles,
  decisions,
  seoReport,
  timeline,
  quality,
});

export const isConcept = content.business.mode === "concept";

export function getProgram(id: ProgramId): RebateProgram | undefined {
  return content.rebates.programs.find((p) => p.id === id);
}

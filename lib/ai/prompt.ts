import data from "@/content/styles.json";
import type { Styles } from "@/lib/content/schema";

// SRS §10.1: one base template, filled from styles.json. Validated at build; read directly here.
const STYLES = data as unknown as Styles;

export type StyleSlug = string;

export function getStyle(slug: StyleSlug) {
  return STYLES.styles.find((s) => s.slug === slug);
}

export const STYLE_SLUGS = STYLES.styles.map((s) => s.slug);

export function buildPrompt(slug: StyleSlug): string {
  const style = getStyle(slug);
  if (!style) throw new Error(`Unknown style "${slug}"`);
  return STYLES.basePrompt
    .replace("{name}", style.name)
    .replace("{materials}", style.materials)
    .replace("{plantsPrompt}", style.plantsPrompt);
}

export const PROMPT_VERSION = STYLES.basePromptVersion;

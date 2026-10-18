import { z } from "zod";

// SRS §13.2: every content/*.json file is validated here; invalid content fails `pnpm build`.
// Objects are strict so a misspelled key (e.g. "ratePerSqFt") is an error, not a silent undefined.

const nonEmpty = z.string().trim().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });
export const PROGRAM_IDS = ["phoenix", "mesa", "chandler", "scottsdale"] as const;
const programId = z.enum(PROGRAM_IDS);
const tierId = z.enum(["essentials", "signature", "showcase"]);

// AGENTS §2.7 and §2.3: the labels are fixed wording, not free copy.
export const AI_LABEL = "AI concept rendering. Actual results vary.";
export const PRICING_LABEL = "Illustrative concept pricing.";
/** The sample "before" photos are generated, so they are labeled as such wherever shown. */
export const SAMPLE_LABEL = "AI-generated sample yard. Not a real home.";

export const businessSchema = z.strictObject({
  name: nonEmpty,
  mode: z.enum(["concept", "partner"]),
  tagline: nonEmpty,
  oneLiner: nonEmpty,
  shortDescription: nonEmpty,
  promise: nonEmpty,
  promiseGuarantee: nonEmpty,
  hours: nonEmpty,
  contact: z.strictObject({
    phone: nonEmpty.nullable(),
    email: z.email().nullable(),
    address: nonEmpty.nullable(),
  }),
  serviceCities: z.array(nonEmpty).min(1),
  rebateCities: z.array(programId).min(1),
  services: z.array(z.strictObject({ id: nonEmpty, name: nonEmpty, description: nonEmpty })).min(1),
  process: z
    .array(
      z.strictObject({
        step: z.number().int().positive(),
        title: nonEmpty,
        text: nonEmpty,
        highlight: z.boolean().optional(),
      }),
    )
    .min(1),
  disclosures: z.strictObject({
    badge: nonEmpty,
    footer: nonEmpty,
    pricing: z.literal(PRICING_LABEL),
    booking: nonEmpty,
    ai: z.literal(AI_LABEL),
    sample: z.literal(SAMPLE_LABEL),
  }),
  waterEstimate: z.strictObject({
    galPerSqftYear: z.number().positive(),
    derivation: nonEmpty,
    sourceUrl: httpsUrl,
    label: z.literal("estimate"),
    // An official, sourced conversion that makes the gallons easy to picture (kept in data, not shown).
    bathtubEquivalent: z.strictObject({
      galPerBathtub: z.number().positive(),
      statement: nonEmpty,
      sourceName: nonEmpty,
      sourceUrl: httpsUrl,
    }),
  }),
  seasonal: z.strictObject({ headline: nonEmpty, body: nonEmpty, sourceUrl: httpsUrl }),
  sample: z.strictObject({ label: nonEmpty, city: programId, sqft: z.number().int().positive() }),
  // SRS §13.2 lists `social`; the seed has none yet.
  social: z.record(z.string(), httpsUrl).optional(),
});

const approvalSchema = z.strictObject({
  required: z.boolean(),
  name: nonEmpty,
  reviewTime: nonEmpty.nullable(),
  completeWithin: nonEmpty.nullable(),
});

const programBase = {
  id: programId,
  city: nonEmpty,
  name: nonEmpty,
  status: z.enum(["open", "unknown", "closed"]),
  statusNote: nonEmpty,
  approval: approvalSchema,
  healthyGrassMinPercent: z.number().int().min(0).max(100).nullable().optional(),
  eligibility: z.array(nonEmpty),
  prohibitions: z.array(nonEmpty),
  requirements: z.array(nonEmpty),
  documents: z.array(nonEmpty),
  howToApply: nonEmpty,
  payment: nonEmpty.nullable(),
  sourceUrl: httpsUrl,
  // SRS §13.2 lists `notes[]`; the seed has none yet.
  notes: z.array(nonEmpty).optional(),
};

const perSqftProgram = z.strictObject({
  ...programBase,
  type: z.literal("per_sqft"),
  ratePerSqft: z.number().positive(),
  minimumSqft: z.number().int().nonnegative(),
  maximumAmount: z.number().int().positive().nullable(),
  caseByCaseAboveSqft: z.number().int().positive().optional(),
  roundingIncrementSqft: z.number().int().positive().optional(),
  minimumWaiver: nonEmpty.optional(),
});

const tieredProgram = z.strictObject({
  ...programBase,
  type: z.literal("tiered"),
  tiers: z
    .array(
      z.strictObject({
        minSqft: z.number().int().nonnegative(),
        maxSqft: z.number().int().positive().nullable(),
        amount: z.number().int().positive(),
      }),
    )
    .min(1),
  treeBonus: z.strictObject({
    perTree: z.number().int().nonnegative(),
    maxTrees: z.number().int().nonnegative(),
  }),
  minimumSqft: z.number().int().nonnegative(),
  maximumAmount: z.number().int().positive(),
});

const statusOnlyProgram = z.strictObject({
  ...programBase,
  type: z.literal("status_only"),
  lastSeasonMaximum: z.number().int().positive().optional(),
});

const programSchema = z
  .discriminatedUnion("type", [perSqftProgram, tieredProgram, statusOnlyProgram])
  .superRefine((p, ctx) => {
    if (p.type !== "tiered") return;
    // Tiers must be ascending, contiguous and open-ended so every area maps to exactly one tier.
    p.tiers.forEach((t, i) => {
      const next = p.tiers[i + 1];
      if (next) {
        if (t.maxSqft === null || next.minSqft !== t.maxSqft + 1) {
          ctx.addIssue({ code: "custom", path: ["tiers", i], message: "tiers must be contiguous" });
        }
        if (next.amount <= t.amount) {
          ctx.addIssue({ code: "custom", path: ["tiers", i + 1], message: "amounts must ascend" });
        }
      } else if (t.maxSqft !== null) {
        ctx.addIssue({ code: "custom", path: ["tiers", i], message: "last tier must be open-ended" });
      }
    });
    if (p.tiers[0] && p.minimumSqft !== p.tiers[0].minSqft) {
      ctx.addIssue({ code: "custom", path: ["minimumSqft"], message: "must equal the first tier's minSqft" });
    }
    const top = p.tiers.at(-1)?.amount ?? 0;
    const expected = top + p.treeBonus.perTree * p.treeBonus.maxTrees;
    if (p.maximumAmount !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["maximumAmount"],
        message: `must equal top tier + max tree bonus (${expected})`,
      });
    }
  });

const outcomeSchema = z
  .strictObject({
    label: nonEmpty,
    outcome: z.enum(["pass", "fail", "check"]),
    reason: nonEmpty.optional(),
  })
  .refine((o) => o.outcome === "pass" || o.reason !== undefined, {
    message: "fail and check outcomes need a reason",
    path: ["reason"],
  });

const questionSchema = z.strictObject({
  id: nonEmpty,
  text: nonEmpty,
  options: z.array(outcomeSchema).min(2),
  programs: z.array(programId).optional(),
});

export const rebateProgramsSchema = z
  .strictObject({
    disclaimer: nonEmpty,
    programs: z.array(programSchema).min(1),
    otherCities: z.record(z.string(), nonEmpty),
    eligibilityQuestions: z.partialRecord(
      z.union([z.literal("default"), programId]),
      z.array(questionSchema).min(1),
    ),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.programs.forEach((p, i) => {
      if (seen.has(p.id))
        ctx.addIssue({ code: "custom", path: ["programs", i, "id"], message: "duplicate id" });
      seen.add(p.id);
    });
  });

export const pricingSchema = z.strictObject({
  caption: z.literal(PRICING_LABEL),
  minimumProject: z.number().int().positive(),
  currency: z.literal("USD"),
  tiers: z
    .array(
      z
        .strictObject({
          id: tierId,
          name: nonEmpty,
          lowPerSqft: z.number().positive(),
          highPerSqft: z.number().positive(),
          featured: z.boolean(),
          badge: nonEmpty.optional(),
          includes: z.array(nonEmpty).min(1),
        })
        .refine((t) => t.lowPerSqft <= t.highPerSqft, { message: "low must not exceed high" }),
    )
    .length(3),
});

const plantType = z.enum(["tree", "shrub", "cactus", "accent", "groundcover"]);

export const plantsSchema = z.strictObject({
  listName: nonEmpty,
  listNote: nonEmpty,
  listSourceUrl: httpsUrl.nullable(),
  plants: z
    .array(
      z.strictObject({
        id: nonEmpty,
        common: nonEmpty,
        botanical: nonEmpty,
        type: plantType,
        sun: z.array(z.enum(["full", "part", "shade"])).min(1),
        matureSize: nonEmpty,
        bloom: nonEmpty,
        flowerColor: nonEmpty.nullable().optional(),
        pollinator: z.boolean(),
        styles: z.array(nonEmpty).min(1),
        note: nonEmpty,
        featured: z.boolean(),
      }),
    )
    .min(1),
});

const samplePath = z.string().regex(/^\/samples\/[a-z0-9-]+\.(jpg|jpeg|png|webp|avif)$/);

export const stylesSchema = z.strictObject({
  basePromptVersion: z.number().int().positive(),
  styles: z
    .array(
      z.strictObject({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        name: nonEmpty,
        tagline: nonEmpty,
        description: nonEmpty,
        mood: z.array(nonEmpty).min(1),
        materials: nonEmpty,
        plantsPrompt: nonEmpty,
        plantIds: z.array(nonEmpty).min(1),
        maintenance: nonEmpty,
        swatches: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1),
        sampleBefore: samplePath,
        sampleAfter: samplePath,
      }),
    )
    .min(1),
  basePrompt: nonEmpty.refine(
    (s) => ["{name}", "{materials}", "{plantsPrompt}"].every((k) => s.includes(k)),
    { message: "basePrompt must contain {name}, {materials} and {plantsPrompt}" },
  ),
});

export const decisionsSchema = z.strictObject({
  note: z.string().optional(),
  entries: z.array(
    z.strictObject({
      observation: nonEmpty,
      evidence: nonEmpty,
      change: nonEmpty,
      result: nonEmpty.optional(),
    }),
  ),
});

export const seoReportSchema = z.strictObject({
  note: z.string().optional(),
  routes: z.number().int().nonnegative(),
  withTitle: z.number().int().nonnegative(),
  withDescription: z.number().int().nonnegative(),
  withOg: z.number().int().nonnegative(),
  jsonLdTypes: z.array(nonEmpty),
  sitemapUrls: z.number().int().nonnegative(),
  searchConsole: z.strictObject({
    submitted: z.boolean(),
    discoveredPages: z.number().int().nonnegative().nullable(),
    indexedPages: z.number().int().nonnegative().nullable(),
  }),
});

export type Business = z.infer<typeof businessSchema>;
export type RebatePrograms = z.infer<typeof rebateProgramsSchema>;
export type RebateProgram = RebatePrograms["programs"][number];
export type ProgramId = (typeof PROGRAM_IDS)[number];
export type Pricing = z.infer<typeof pricingSchema>;
export type Plants = z.infer<typeof plantsSchema>;
export type Styles = z.infer<typeof stylesSchema>;

const score = z.number().int().min(0).max(100).nullable();
export const qualitySchema = z.strictObject({
  reports: z.array(
    z.strictObject({
      file: z.string().regex(/^\/reports\/[\w.-]+\.html$/),
      round: z.number().int().positive(),
      formFactor: z.enum(["mobile", "desktop"]),
      host: nonEmpty,
      path: z.string().startsWith("/"),
      scores: z.strictObject({ performance: score, accessibility: score, bestPractices: score, seo: score }),
      lcpMs: z.number().int().nonnegative(),
      cls: z.number().nonnegative(),
    }),
  ),
});

export type Decisions = z.infer<typeof decisionsSchema>;
export type Quality = z.infer<typeof qualitySchema>;
export type SeoReport = z.infer<typeof seoReportSchema>;

export type Content = {
  business: Business;
  rebates: RebatePrograms;
  pricing: Pricing;
  plants: Plants;
  styles: Styles;
  decisions: Decisions;
  seoReport: SeoReport;
  quality: Quality;
};

export type RawContent = Record<keyof Content, unknown>;

/** Validates every file, then the references between files. Throws one error listing all problems. */
export function validateContent(raw: RawContent): Content {
  const problems: string[] = [];
  const parse = <T>(file: string, schema: z.ZodType<T>, value: unknown): T | undefined => {
    const r = schema.safeParse(value);
    if (r.success) return r.data;
    for (const i of r.error.issues) problems.push(`${file}: ${i.path.join(".") || "(root)"}: ${i.message}`);
    return undefined;
  };

  const business = parse("business.json", businessSchema, raw.business);
  const rebates = parse("rebate-programs.json", rebateProgramsSchema, raw.rebates);
  const pricing = parse("pricing.json", pricingSchema, raw.pricing);
  const plants = parse("plants.json", plantsSchema, raw.plants);
  const styles = parse("styles.json", stylesSchema, raw.styles);
  const decisions = parse("decisions.json", decisionsSchema, raw.decisions);
  const seoReport = parse("seo-report.json", seoReportSchema, raw.seoReport);
  const quality = parse("quality.json", qualitySchema, raw.quality);

  if (business && rebates) {
    const ids = new Set(rebates.programs.map((p) => p.id));
    for (const c of business.rebateCities) {
      if (!ids.has(c))
        problems.push(`business.json: rebateCities: "${c}" has no program in rebate-programs.json`);
    }
    for (const p of rebates.programs) {
      if (!business.serviceCities.includes(p.id)) {
        problems.push(`rebate-programs.json: program "${p.id}" is not in business.serviceCities`);
      }
    }
  }
  if (plants && styles) {
    const plantIds = new Set(plants.plants.map((p) => p.id));
    const slugs = new Set(styles.styles.map((s) => s.slug));
    for (const s of styles.styles) {
      for (const id of s.plantIds) {
        if (!plantIds.has(id)) problems.push(`styles.json: ${s.slug}.plantIds: unknown plant "${id}"`);
      }
    }
    for (const p of plants.plants) {
      for (const slug of p.styles) {
        if (!slugs.has(slug)) problems.push(`plants.json: ${p.id}.styles: unknown style "${slug}"`);
      }
    }
  }

  if (
    problems.length > 0 ||
    !business ||
    !rebates ||
    !pricing ||
    !plants ||
    !styles ||
    !decisions ||
    !quality ||
    !seoReport
  ) {
    throw new Error(`Invalid content in content/*.json:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  }
  return { business, rebates, pricing, plants, styles, decisions, seoReport, quality };
}

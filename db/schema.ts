import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// SRS §13.1. No personal data in concept mode (AGENTS §2.4): no names, addresses or coordinates.

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const testSessions = pgTable("test_sessions", {
  id: id(),
  createdAt: createdAt(),
  testerLabel: text("tester_label").notNull(),
  variant: text("variant").notNull(), // a|b
  firstEstimateAt: timestamp("first_estimate_at", { withTimezone: true }),
  completed: boolean("completed").notNull().default(false),
  notes: text("notes"),
});

export const estimates = pgTable(
  "estimates",
  {
    id: id(),
    createdAt: createdAt(),
    city: text("city").notNull(),
    programId: text("program_id"),
    programStatus: text("program_status"),
    sqft: integer("sqft").notNull(),
    source: text("source").notNull(), // map|manual|sample
    shapeCount: smallint("shape_count").notNull().default(0),
    tier: text("tier").notNull(),
    trees: smallint("trees").notNull().default(0),
    rebateAmount: integer("rebate_amount"),
    rebateBlocked: boolean("rebate_blocked").notNull().default(false),
    projectLow: integer("project_low").notNull(),
    projectHigh: integer("project_high").notNull(),
    netLow: integer("net_low").notNull(),
    netHigh: integer("net_high").notNull(),
    waterGalYear: integer("water_gal_year").notNull(),
    testSessionId: uuid("test_session_id").references(() => testSessions.id),
  },
  (t) => [
    check("estimates_sqft_range", sql`${t.sqft} >= 0 and ${t.sqft} <= 50000`),
    index("estimates_created_at_idx").on(t.createdAt),
  ],
);

export const renders = pgTable(
  "renders",
  {
    id: id(),
    createdAt: createdAt(),
    style: text("style").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull(), // success|failed|timeout|fallback|refused
    durationMs: integer("duration_ms"),
    errorCode: text("error_code"),
    testSessionId: uuid("test_session_id").references(() => testSessions.id),
  },
  (t) => [index("renders_created_at_idx").on(t.createdAt)],
);

export const eligibilityChecks = pgTable("eligibility_checks", {
  id: id(),
  createdAt: createdAt(),
  programId: text("program_id").notNull(),
  result: text("result").notNull(), // likely|not_eligible|check_city
  reasonCodes: text("reason_codes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
});

export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    createdAt: createdAt(),
    slotDate: date("slot_date").notNull(),
    slotWindow: text("slot_window").notNull(), // morning|afternoon
    city: text("city").notNull(),
    estimateId: uuid("estimate_id").references(() => estimates.id),
    mode: text("mode").notNull(), // concept|partner
    status: text("status").notNull().default("demo"), // demo|requested|cancelled
    notified: boolean("notified").notNull().default(false),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    // Partner mode only; always null while business.mode === "concept".
    firstName: text("first_name"),
    phone: text("phone"),
    email: text("email"),
    consent: boolean("consent"),
  },
  (t) => [index("bookings_created_at_idx").on(t.createdAt)],
);

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: createdAt(),
    name: text("name").notNull(),
    props: jsonb("props").notNull().default({}),
    path: text("path"),
    sessionId: text("session_id"),
    source: text("source").notNull().default("direct"),
    variant: text("variant"),
    team: boolean("team").notNull().default(false),
  },
  (t) => [
    index("events_name_created_at_idx").on(t.name, t.createdAt),
    index("events_session_id_idx").on(t.sessionId),
    index("events_source_idx").on(t.source),
  ],
);

export const feedback = pgTable(
  "feedback",
  {
    id: id(),
    createdAt: createdAt(),
    message: text("message").notNull(),
    email: text("email"), // FR-FB: only with explicit consent
    consent: boolean("consent").notNull().default(false),
    page: text("page"),
  },
  (t) => [check("feedback_message_length", sql`char_length(${t.message}) <= 1000`)],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    ipHash: text("ip_hash").notNull(), // SHA-256 + salt; raw IPs are never stored
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    route: text("route").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.ipHash, t.route, t.windowStart] })],
);

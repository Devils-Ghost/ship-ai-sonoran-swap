CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slot_date" date NOT NULL,
	"slot_window" text NOT NULL,
	"city" text NOT NULL,
	"estimate_id" uuid,
	"mode" text NOT NULL,
	"status" text DEFAULT 'demo' NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"idempotency_key" text NOT NULL,
	"first_name" text,
	"phone" text,
	"email" text,
	"consent" boolean,
	CONSTRAINT "bookings_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "eligibility_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"program_id" text NOT NULL,
	"result" text NOT NULL,
	"reason_codes" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"city" text NOT NULL,
	"program_id" text,
	"program_status" text,
	"sqft" integer NOT NULL,
	"source" text NOT NULL,
	"shape_count" smallint DEFAULT 0 NOT NULL,
	"tier" text NOT NULL,
	"trees" smallint DEFAULT 0 NOT NULL,
	"rebate_amount" integer,
	"rebate_blocked" boolean DEFAULT false NOT NULL,
	"project_low" integer NOT NULL,
	"project_high" integer NOT NULL,
	"net_low" integer NOT NULL,
	"net_high" integer NOT NULL,
	"water_gal_year" integer NOT NULL,
	"test_session_id" uuid,
	CONSTRAINT "estimates_sqft_range" CHECK ("estimates"."sqft" >= 0 and "estimates"."sqft" <= 50000)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"props" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"path" text,
	"session_id" text,
	"source" text DEFAULT 'direct' NOT NULL,
	"variant" text,
	"team" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message" text NOT NULL,
	"email" text,
	"consent" boolean DEFAULT false NOT NULL,
	"page" text,
	CONSTRAINT "feedback_message_length" CHECK (char_length("feedback"."message") <= 1000)
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"ip_hash" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"route" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_ip_hash_route_window_start_pk" PRIMARY KEY("ip_hash","route","window_start")
);
--> statement-breakpoint
CREATE TABLE "renders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"style" text NOT NULL,
	"provider" text NOT NULL,
	"status" text NOT NULL,
	"duration_ms" integer,
	"error_code" text,
	"test_session_id" uuid
);
--> statement-breakpoint
CREATE TABLE "test_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tester_label" text NOT NULL,
	"variant" text NOT NULL,
	"first_estimate_at" timestamp with time zone,
	"completed" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_test_session_id_test_sessions_id_fk" FOREIGN KEY ("test_session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renders" ADD CONSTRAINT "renders_test_session_id_test_sessions_id_fk" FOREIGN KEY ("test_session_id") REFERENCES "public"."test_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "estimates_created_at_idx" ON "estimates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_name_created_at_idx" ON "events" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "events_session_id_idx" ON "events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "events_source_idx" ON "events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "renders_created_at_idx" ON "renders" USING btree ("created_at");
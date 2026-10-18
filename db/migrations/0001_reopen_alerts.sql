CREATE TABLE "reopen_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"program_id" text NOT NULL,
	"email" text NOT NULL,
	"consent" boolean NOT NULL,
	CONSTRAINT "reopen_alerts_consent" CHECK ("reopen_alerts"."consent" = true)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reopen_alerts_program_email_idx" ON "reopen_alerts" USING btree ("program_id","email");
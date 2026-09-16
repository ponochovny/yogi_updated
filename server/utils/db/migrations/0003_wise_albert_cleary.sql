ALTER TABLE "studio_practitioners" ADD COLUMN "compensation_type" text DEFAULT 'FLAT_RATE' NOT NULL;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ADD COLUMN "compensation_rate" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN "cancellation_policy" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN "liability_waiver" text;--> statement-breakpoint
ALTER TABLE "studios" ADD COLUMN "liability_waiver_version" integer DEFAULT 1 NOT NULL;
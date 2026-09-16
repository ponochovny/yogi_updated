ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "cancellation_policy" text;
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "liability_waiver" text;
ALTER TABLE "studios" ADD COLUMN IF NOT EXISTS "liability_waiver_version" integer DEFAULT 1 NOT NULL;
ALTER TABLE "studio_practitioners" ADD COLUMN IF NOT EXISTS "compensation_type" text DEFAULT 'FLAT_RATE' NOT NULL;
ALTER TABLE "studio_practitioners" ADD COLUMN IF NOT EXISTS "compensation_rate" integer DEFAULT 0 NOT NULL;

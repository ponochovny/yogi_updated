ALTER TABLE "pricing_options"
  ADD COLUMN IF NOT EXISTS "expiry_rule" varchar DEFAULT 'DURATION' NOT NULL;

ALTER TABLE "pricing_options"
  ADD COLUMN IF NOT EXISTS "expiry_buffer_days" integer DEFAULT 0 NOT NULL;

ALTER TABLE "pricing_options"
  ADD COLUMN IF NOT EXISTS "max_bookings_per_day" integer;

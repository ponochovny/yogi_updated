ALTER TABLE "pricing_options" ADD COLUMN "expiry_rule" varchar DEFAULT 'DURATION' NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_options" ADD COLUMN "expiry_buffer_days" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pricing_options" ADD COLUMN "max_bookings_per_day" integer;
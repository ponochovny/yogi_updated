DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "bookings"
		WHERE "status" IN ('PENDING', 'ACTIVE', 'CONFIRMED')
		GROUP BY "slot_id", "user_id"
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Cannot apply booking invariants: duplicate active booking for the same user and slot. Run npm run db:check-invariants.';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "transactions"
		WHERE "provider_transaction_id" IS NOT NULL
		GROUP BY "provider_transaction_id"
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Cannot apply payment invariants: duplicate provider transaction ID. Run npm run db:check-invariants.';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "offering_practitioners"
		GROUP BY "offering_id", "practitioner_id"
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Cannot apply offering invariants: duplicate practitioner link. Run npm run db:check-invariants.';
	END IF;

	IF EXISTS (SELECT 1 FROM "offering_slots" WHERE "start_time" >= "end_time")
		OR EXISTS (SELECT 1 FROM "offerings" WHERE "capacity" < 0)
		OR EXISTS (SELECT 1 FROM "offering_slots" WHERE "capacity_override" < 0)
		OR EXISTS (SELECT 1 FROM "pricing_options" WHERE "price" < 0 OR "credits" < 0)
		OR EXISTS (SELECT 1 FROM "transactions" WHERE "amount" < 0)
		OR EXISTS (SELECT 1 FROM "user_passes" WHERE "remaining_credits" < 0)
	THEN
		RAISE EXCEPTION 'Cannot apply CHECK constraints: existing invalid values found. Run npm run db:check-invariants.';
	END IF;
END $$;
--> statement-breakpoint
DROP INDEX "transactions_provider_transaction_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "offering_practitioners_offering_practitioner_unique" ON "offering_practitioners" USING btree ("offering_id","practitioner_id");--> statement-breakpoint
CREATE INDEX "offering_slots_status_idx" ON "offering_slots" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_active_user_slot_unique" ON "bookings" USING btree ("slot_id","user_id") WHERE status in ('PENDING', 'ACTIVE', 'CONFIRMED');--> statement-breakpoint
CREATE INDEX "bookings_slot_id_status_idx" ON "bookings" USING btree ("slot_id","status");--> statement-breakpoint
CREATE INDEX "bookings_user_id_status_idx" ON "bookings" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "bookings_transaction_id_idx" ON "bookings" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_provider_transaction_id_unique" ON "transactions" USING btree ("provider_transaction_id") WHERE provider_transaction_id is not null;--> statement-breakpoint
ALTER TABLE "offering_slots" ADD CONSTRAINT "offering_slots_start_before_end" CHECK ("offering_slots"."start_time" < "offering_slots"."end_time");--> statement-breakpoint
ALTER TABLE "offering_slots" ADD CONSTRAINT "offering_slots_capacity_override_non_negative" CHECK ("offering_slots"."capacity_override" is null or "offering_slots"."capacity_override" >= 0);--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_capacity_non_negative" CHECK ("offerings"."capacity" is null or "offerings"."capacity" >= 0);--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_price_non_negative" CHECK ("pricing_options"."price" >= 0);--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_credits_non_negative" CHECK ("pricing_options"."credits" is null or "pricing_options"."credits" >= 0);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_non_negative" CHECK ("transactions"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "user_passes" ADD CONSTRAINT "user_passes_remaining_credits_non_negative" CHECK ("user_passes"."remaining_credits" is null or "user_passes"."remaining_credits" >= 0);

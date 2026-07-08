ALTER TYPE "public"."booking_status" ADD VALUE 'PENDING';--> statement-breakpoint
ALTER TABLE "pricing_options" DROP CONSTRAINT "pricing_options_offering_id_offerings_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_offering_id_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offerings"("id") ON DELETE restrict ON UPDATE no action;
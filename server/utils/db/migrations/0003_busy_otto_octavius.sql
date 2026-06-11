CREATE TYPE "public"."offering_slot_status" AS ENUM('ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "offering_slots" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."offering_slot_status";--> statement-breakpoint
ALTER TABLE "offering_slots" ALTER COLUMN "status" SET DATA TYPE "public"."offering_slot_status" USING "status"::"public"."offering_slot_status";
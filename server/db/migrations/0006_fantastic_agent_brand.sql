CREATE TYPE "public"."activity_type" AS ENUM('CLASS', 'APPOINTMENT', 'EVENT');--> statement-breakpoint
CREATE TABLE "offering_practitioners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"practitioner_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "activity_type" "activity_type" DEFAULT 'CLASS' NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "is_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "timezone" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "offering_practitioners" ADD CONSTRAINT "offering_practitioners_offering_id_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_practitioners" ADD CONSTRAINT "offering_practitioners_practitioner_id_studio_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."studio_practitioners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_location_id_studio_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."studio_locations"("id") ON DELETE set null ON UPDATE no action;
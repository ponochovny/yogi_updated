CREATE TABLE "offering_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"practitioner_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" varchar DEFAULT 'ACTIVE' NOT NULL,
	"capacity_override" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offering_slots" ADD CONSTRAINT "offering_slots_offering_id_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering_slots" ADD CONSTRAINT "offering_slots_practitioner_id_studio_practitioners_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."studio_practitioners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_locations" ADD CONSTRAINT "studio_locations_id_studio_id_unique" UNIQUE("id","studio_id");--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_location_studio_match" CHECK (location_id IS NULL OR studio_id = (SELECT studio_id FROM studio_locations WHERE id = location_id));
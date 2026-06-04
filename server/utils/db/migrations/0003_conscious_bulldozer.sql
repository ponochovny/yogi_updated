CREATE TABLE "studio_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_logo_studio_id_studios_id_fk";
--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_banner_studio_id_studios_id_fk";
--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_banner_offering_id_offerings_id_fk";
--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "entity_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "entity_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "studio_locations" ADD CONSTRAINT "studio_locations_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_location_id_studio_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."studio_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "media_files" DROP COLUMN "logo_studio_id";--> statement-breakpoint
ALTER TABLE "media_files" DROP COLUMN "banner_studio_id";--> statement-breakpoint
ALTER TABLE "media_files" DROP COLUMN "banner_offering_id";--> statement-breakpoint
ALTER TABLE "studios" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "studios" DROP COLUMN "timezone";
CREATE TYPE "public"."offering_type" AS ENUM('GROUP', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."pricing_type" AS ENUM('DROP_IN', 'PACK', 'MEMBERSHIP');--> statement-breakpoint
CREATE TABLE "offering_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar DEFAULT '#000000'
);
--> statement-breakpoint
CREATE TABLE "pricing_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"studio_id" uuid NOT NULL,
	"category_id" uuid,
	"name" varchar NOT NULL,
	"description" text,
	"type" "pricing_type" NOT NULL,
	"price" integer NOT NULL,
	"credits" integer,
	"duration_days" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_slots" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "causes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "donations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memberships" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "offering_practitioners" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "promocodes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "purchases" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tickets" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tips" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_memberships" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "booking_slots" CASCADE;--> statement-breakpoint
DROP TABLE "causes" CASCADE;--> statement-breakpoint
DROP TABLE "donations" CASCADE;--> statement-breakpoint
DROP TABLE "memberships" CASCADE;--> statement-breakpoint
DROP TABLE "offering_practitioners" CASCADE;--> statement-breakpoint
DROP TABLE "promocodes" CASCADE;--> statement-breakpoint
DROP TABLE "purchases" CASCADE;--> statement-breakpoint
DROP TABLE "reviews" CASCADE;--> statement-breakpoint
DROP TABLE "tags" CASCADE;--> statement-breakpoint
DROP TABLE "tickets" CASCADE;--> statement-breakpoint
DROP TABLE "tips" CASCADE;--> statement-breakpoint
DROP TABLE "user_memberships" CASCADE;--> statement-breakpoint
ALTER TABLE "offerings" DROP CONSTRAINT "offerings_slug_unique";--> statement-breakpoint
ALTER TABLE "offerings" DROP CONSTRAINT "offerings_location_id_studio_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DEFAULT 'PRACTITIONER'::text;--> statement-breakpoint
DROP TYPE "public"."studio_role";--> statement-breakpoint
CREATE TYPE "public"."studio_role" AS ENUM('MANAGER', 'PRACTITIONER', 'OWNER');--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DEFAULT 'PRACTITIONER'::"public"."studio_role";--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DATA TYPE "public"."studio_role" USING "role"::"public"."studio_role";--> statement-breakpoint
ALTER TABLE "offerings" ALTER COLUMN "name" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "offerings" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "type" "offering_type" DEFAULT 'GROUP' NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "duration" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "capacity" integer;--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "offering_categories" ADD CONSTRAINT "offering_categories_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_category_id_offering_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."offering_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_category_id_offering_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."offering_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "activity";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "is_private";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "types";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "categories";--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "location_id";
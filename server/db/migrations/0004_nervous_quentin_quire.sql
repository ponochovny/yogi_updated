CREATE TYPE "public"."studio_role" AS ENUM('OWNER', 'PRACTITIONER', 'MANAGER');--> statement-breakpoint
ALTER TABLE "studio_practitioners" ADD COLUMN "role" "studio_role" DEFAULT 'PRACTITIONER' NOT NULL;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ADD CONSTRAINT "studio_practitioners_studio_id_user_id_unique" UNIQUE("studio_id","user_id");
ALTER TABLE "studio_members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DEFAULT 'PRACTITIONER'::text;--> statement-breakpoint
DROP TYPE "public"."studio_role";--> statement-breakpoint
CREATE TYPE "public"."studio_role" AS ENUM('MANAGER', 'PRACTITIONER', 'BUSINESS');--> statement-breakpoint
ALTER TABLE "studio_members" ALTER COLUMN "role" SET DATA TYPE "public"."studio_role" USING "role"::"public"."studio_role";--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DEFAULT 'PRACTITIONER'::"public"."studio_role";--> statement-breakpoint
ALTER TABLE "studio_practitioners" ALTER COLUMN "role" SET DATA TYPE "public"."studio_role" USING "role"::"public"."studio_role";
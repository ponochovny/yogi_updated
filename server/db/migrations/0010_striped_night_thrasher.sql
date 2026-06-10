CREATE TYPE "public"."media_entity_type" AS ENUM('OFFERING', 'STUDIO', 'USER');--> statement-breakpoint
ALTER TABLE "media_files" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."media_type";--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('GALLERY', 'LOGO', 'AVATAR');--> statement-breakpoint
ALTER TABLE "media_files" ALTER COLUMN "type" SET DATA TYPE "public"."media_type" USING "type"::"public"."media_type";--> statement-breakpoint
ALTER TABLE "media_files" ALTER COLUMN "entity_type" SET DATA TYPE "public"."media_entity_type" USING "entity_type"::text::"public"."media_entity_type";

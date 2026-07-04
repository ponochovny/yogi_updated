CREATE TABLE "global_currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "global_currencies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "studios" ALTER COLUMN "categories" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "studios" ALTER COLUMN "types" SET DATA TYPE uuid[];--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "categories" uuid[];--> statement-breakpoint
ALTER TABLE "offerings" ADD COLUMN "types" uuid[];
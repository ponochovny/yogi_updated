CREATE TABLE "global_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "global_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "global_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "global_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "offering_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "offering_categories" CASCADE;--> statement-breakpoint
ALTER TABLE "offerings" DROP CONSTRAINT "offerings_category_id_offering_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_options" DROP CONSTRAINT "pricing_options_category_id_offering_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "pricing_options" ADD COLUMN "offering_id" uuid;--> statement-breakpoint
ALTER TABLE "pricing_options" ADD COLUMN "applicable_category_ids" uuid[];--> statement-breakpoint
ALTER TABLE "pricing_options" ADD CONSTRAINT "pricing_options_offering_id_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "pricing_options" DROP COLUMN "category_id";
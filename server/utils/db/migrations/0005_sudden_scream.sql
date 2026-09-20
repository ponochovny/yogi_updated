CREATE TABLE "studio_waiver_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"studio_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"waiver_version" integer NOT NULL,
	"ip_address" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "studio_waiver_consents_studio_id_user_id_waiver_version_unique" UNIQUE("studio_id","user_id","waiver_version")
);
--> statement-breakpoint
ALTER TABLE "studio_waiver_consents" ADD CONSTRAINT "studio_waiver_consents_studio_id_studios_id_fk" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_waiver_consents" ADD CONSTRAINT "studio_waiver_consents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

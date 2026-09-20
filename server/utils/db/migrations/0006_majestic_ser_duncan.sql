ALTER TABLE "studio_waiver_consents" ALTER COLUMN "studio_id" SET DATA TYPE uuid USING "studio_id"::uuid;

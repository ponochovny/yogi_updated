ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "idempotency_key" text;
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_user_idempotency_key_unique"
  ON "transactions" ("user_id", "idempotency_key");
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_provider_transaction_id_unique"
  ON "transactions" ("provider_transaction_id")
  WHERE "provider_transaction_id" IS NOT NULL;

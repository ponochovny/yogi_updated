# Database invariants

## Preflight

Run `npm run db:check-invariants` against a copy of the production database before `npm run db:migrate`. The command reports duplicate active bookings, duplicate provider transaction IDs, duplicate practitioner links, invalid non-negative values, and invalid slot ranges.

Migration `0008_soft_chamber.sql` repeats these checks inside the migration and aborts before creating any new index or constraint when violations exist.

## Capacity rule

`PENDING`, `ACTIVE`, and `CONFIRMED` bookings occupy capacity. `CANCELLED`, `ATTENDED`, `NO_SHOW`, and `COMPLETED` do not occupy the active-booking uniqueness slot. Capacity counting in application code currently includes `PENDING`, `CONFIRMED`, `ATTENDED`, and `NO_SHOW`; `ATTENDED` and `NO_SHOW` remain historical occupancy records and are intentionally not part of the duplicate-booking constraint.

## Forward fix

1. Run `npm run db:check-invariants` on the database copy.
2. Resolve each reported group, preserving the earliest row and cancelling duplicate active bookings where appropriate.
3. Re-run the command until it exits successfully.
4. Run `npm run db:migrate`.
5. Run `npm run test:db` with `DATABASE_URL` pointing at the migrated copy.

Do not delete payment records to resolve a provider transaction collision. Reconcile the provider response first, then retain one canonical transaction and mark the other record according to the payment reconciliation procedure.

## Rollback

Drizzle migrations are forward-only. If `0008` must be reverted before dependent application code is deployed, run the following statements manually in a transaction after confirming no duplicate data has been introduced:

```sql
DROP INDEX IF EXISTS bookings_active_user_slot_unique;
DROP INDEX IF EXISTS offering_practitioners_offering_practitioner_unique;
DROP INDEX IF EXISTS bookings_slot_id_status_idx;
DROP INDEX IF EXISTS bookings_user_id_status_idx;
DROP INDEX IF EXISTS bookings_transaction_id_idx;
DROP INDEX IF EXISTS transactions_status_idx;
DROP INDEX IF EXISTS offering_slots_status_idx;
ALTER TABLE offering_slots DROP CONSTRAINT IF EXISTS offering_slots_start_before_end;
ALTER TABLE offering_slots DROP CONSTRAINT IF EXISTS offering_slots_capacity_override_non_negative;
ALTER TABLE offerings DROP CONSTRAINT IF EXISTS offerings_capacity_non_negative;
ALTER TABLE pricing_options DROP CONSTRAINT IF EXISTS pricing_options_price_non_negative;
ALTER TABLE pricing_options DROP CONSTRAINT IF EXISTS pricing_options_credits_non_negative;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_amount_non_negative;
ALTER TABLE user_passes DROP CONSTRAINT IF EXISTS user_passes_remaining_credits_non_negative;
DROP INDEX IF EXISTS transactions_provider_transaction_id_unique;
CREATE UNIQUE INDEX transactions_provider_transaction_id_unique
  ON transactions (provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;
```

The rollback restores the previous database shape but also removes the protections introduced by this phase. Prefer the forward-fix procedure unless an immediate application rollback requires it.

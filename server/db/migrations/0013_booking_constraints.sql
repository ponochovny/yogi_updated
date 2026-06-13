-- Migration: 0013_booking_constraints.sql
-- Adds DB-level protections for bookings:
-- 1) unique partial index to prevent multiple CONFIRMED bookings per user per slot
-- 2) bookings_count on offering_slots maintained by trigger
-- 3) trigger function enforces capacity atomically using FOR UPDATE

BEGIN;

-- 1. Add bookings_count to offering_slots
ALTER TABLE offering_slots
ADD COLUMN IF NOT EXISTS bookings_count integer NOT NULL DEFAULT 0;

-- 2. Unique partial index to prevent duplicate confirmed bookings
CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_user_confirmed_idx
ON bookings (slot_id, user_id)
WHERE status = 'CONFIRMED';

-- 3. Trigger function to maintain bookings_count and enforce capacity
CREATE OR REPLACE FUNCTION fn_bookings_update_count() RETURNS trigger AS $$
DECLARE
  slot_rec RECORD;
  offering_capacity integer;
  slot_capacity integer;
  max_capacity integer;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'CONFIRMED') THEN
      SELECT * INTO slot_rec FROM offering_slots WHERE id = NEW.slot_id FOR UPDATE;
      SELECT capacity INTO offering_capacity FROM offerings WHERE id = slot_rec.offering_id;
      slot_capacity := slot_rec.capacity_override;
      -- interpret 0 as unlimited in application; preserve that behaviour: NULL => unlimited
      max_capacity := COALESCE(NULLIF(slot_capacity,0), offering_capacity);
      IF (max_capacity IS NOT NULL AND max_capacity <> 0 AND slot_rec.bookings_count + 1 > max_capacity) THEN
        RAISE EXCEPTION 'capacity exceeded for slot %', NEW.slot_id;
      END IF;
      UPDATE offering_slots SET bookings_count = bookings_count + 1 WHERE id = NEW.slot_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Transition into CONFIRMED: increment (and check capacity)
    IF (OLD.status <> 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
      SELECT * INTO slot_rec FROM offering_slots WHERE id = NEW.slot_id FOR UPDATE;
      SELECT capacity INTO offering_capacity FROM offerings WHERE id = slot_rec.offering_id;
      slot_capacity := slot_rec.capacity_override;
      max_capacity := COALESCE(NULLIF(slot_capacity,0), offering_capacity);
      IF (max_capacity IS NOT NULL AND max_capacity <> 0 AND slot_rec.bookings_count + 1 > max_capacity) THEN
        RAISE EXCEPTION 'capacity exceeded for slot %', NEW.slot_id;
      END IF;
      UPDATE offering_slots SET bookings_count = bookings_count + 1 WHERE id = NEW.slot_id;
    ELSIF (OLD.status = 'CONFIRMED' AND NEW.status <> 'CONFIRMED') THEN
      UPDATE offering_slots SET bookings_count = GREATEST(bookings_count - 1, 0) WHERE id = OLD.slot_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'CONFIRMED') THEN
      UPDATE offering_slots SET bookings_count = GREATEST(bookings_count - 1, 0) WHERE id = OLD.slot_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger
DROP TRIGGER IF EXISTS trg_bookings_update_count ON bookings;
CREATE TRIGGER trg_bookings_update_count
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION fn_bookings_update_count();

COMMIT;

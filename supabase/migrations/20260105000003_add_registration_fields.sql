-- Migration: Add attendee fields and status to registrations
-- Adds: first_name, last_name, phone, status columns

-- ===========================================
-- REGISTRATION STATUS ENUM
-- ===========================================
DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- ADD COLUMNS TO REGISTRATIONS
-- ===========================================
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status registration_status DEFAULT 'approved';

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- ===========================================
-- UPDATE EXISTING REGISTRATIONS
-- ===========================================
UPDATE public.registrations 
SET status = 'approved' 
WHERE status IS NULL;

-- ===========================================
-- RLS POLICY: Event creators can update registrations
-- ===========================================
DROP POLICY IF EXISTS "Event creators can update registrations" ON public.registrations;
CREATE POLICY "Event creators can update registrations"
  ON public.registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id
      AND events.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Event creators can delete registrations" ON public.registrations;
CREATE POLICY "Event creators can delete registrations"
  ON public.registrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = registrations.event_id
      AND events.creator_id = auth.uid()
    )
  );


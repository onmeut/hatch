-- Migration: Update registrations table with additional fields
-- Run this in Supabase SQL Editor

-- Create registration status enum
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to registrations table
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status registration_status DEFAULT 'approved';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);

-- Update existing registrations to have 'approved' status
UPDATE public.registrations SET status = 'approved' WHERE status IS NULL;


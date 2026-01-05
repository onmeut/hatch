-- Migration: Add city, category, and tickets to events
-- Adds: city_type enum, category_type enum, new columns on events

-- ===========================================
-- CITY ENUM
-- ===========================================
DO $$ BEGIN
  CREATE TYPE city_type AS ENUM (
    'tehran', 'mashhad', 'isfahan', 'karaj', 'shiraz',
    'tabriz', 'qom', 'ahvaz', 'kermanshah', 'urmia',
    'rasht', 'zahedan', 'hamadan', 'kerman', 'yazd'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- CATEGORY ENUM
-- ===========================================
DO $$ BEGIN
  CREATE TYPE category_type AS ENUM (
    'tech', 'business', 'art', 'music', 'sports',
    'food', 'education', 'networking', 'startup', 'health', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- ADD COLUMNS TO EVENTS
-- ===========================================
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS city city_type,
ADD COLUMN IF NOT EXISTS category category_type DEFAULT 'other',
ADD COLUMN IF NOT EXISTS tickets JSONB DEFAULT '[]'::jsonb;

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);


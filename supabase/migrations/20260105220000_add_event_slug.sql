-- Migration: Add slug column to events table
-- Adds: slug column with unique constraint and generates slugs for existing events

-- ===========================================
-- ADD SLUG COLUMN
-- ===========================================
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS slug TEXT;

-- ===========================================
-- FUNCTION: Generate 8-character alphanumeric slug
-- ===========================================
CREATE OR REPLACE FUNCTION generate_event_slug()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- GENERATE SLUGS FOR EXISTING EVENTS
-- ===========================================
DO $$
DECLARE
  event_record RECORD;
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  FOR event_record IN SELECT id FROM public.events WHERE slug IS NULL LOOP
    LOOP
      new_slug := generate_event_slug();
      SELECT EXISTS(SELECT 1 FROM public.events WHERE slug = new_slug) INTO slug_exists;
      EXIT WHEN NOT slug_exists;
    END LOOP;
    
    UPDATE public.events
    SET slug = new_slug
    WHERE id = event_record.id;
  END LOOP;
END $$;

-- ===========================================
-- ADD UNIQUE CONSTRAINT AND NOT NULL
-- ===========================================
ALTER TABLE public.events
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- ===========================================
-- FUNCTION: Auto-generate slug on insert
-- ===========================================
CREATE OR REPLACE FUNCTION public.generate_unique_event_slug()
RETURNS TRIGGER AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    LOOP
      new_slug := generate_event_slug();
      SELECT EXISTS(SELECT 1 FROM public.events WHERE slug = new_slug) INTO slug_exists;
      EXIT WHEN NOT slug_exists;
    END LOOP;
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_slug_generate ON public.events;
CREATE TRIGGER on_event_slug_generate
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.generate_unique_event_slug();


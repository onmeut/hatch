-- Migration: Add city, category, and ticket types to events

-- Create city enum for Iran's 15 largest cities
DO $$ BEGIN
  CREATE TYPE city_type AS ENUM (
    'tehran',      -- تهران
    'mashhad',     -- مشهد
    'isfahan',     -- اصفهان
    'karaj',       -- کرج
    'shiraz',      -- شیراز
    'tabriz',      -- تبریز
    'qom',         -- قم
    'ahvaz',       -- اهواز
    'kermanshah',  -- کرمانشاه
    'urmia',       -- ارومیه
    'rasht',       -- رشت
    'zahedan',     -- زاهدان
    'hamadan',     -- همدان
    'kerman',      -- کرمان
    'yazd'         -- یزد
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create category enum
DO $$ BEGIN
  CREATE TYPE category_type AS ENUM (
    'tech',        -- تکنولوژی
    'business',    -- کسب و کار
    'art',         -- هنر
    'music',       -- موسیقی
    'sports',      -- ورزش
    'food',        -- غذا
    'education',   -- آموزش
    'networking',  -- نتورکینگ
    'startup',     -- استارتاپ
    'health',      -- سلامت
    'other'        -- سایر
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS city city_type,
ADD COLUMN IF NOT EXISTS category category_type DEFAULT 'other',
ADD COLUMN IF NOT EXISTS tickets JSONB DEFAULT '[]'::jsonb;

-- Add ticket_id to registrations table
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS ticket_id TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);


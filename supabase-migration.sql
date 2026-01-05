-- Migration: Add city, category, and ticket types to events

-- Create city enum for Iran's 15 largest cities
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

-- Create category enum
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

-- Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN city city_type,
ADD COLUMN category category_type DEFAULT 'other',
ADD COLUMN tickets JSONB DEFAULT '[]'::jsonb;

-- Update location column to be more specific (venue name)
COMMENT ON COLUMN public.events.location IS 'Venue name or specific address';
COMMENT ON COLUMN public.events.city IS 'City where the event is held';
COMMENT ON COLUMN public.events.category IS 'Event category/topic';
COMMENT ON COLUMN public.events.tickets IS 'Array of ticket types with name, price, description, requires_approval, capacity';

-- Example tickets JSON structure:
-- [
--   {"name": "رایگان", "price": 0, "description": "...", "requires_approval": true, "capacity": null},
--   {"name": "عادی", "price": 50000, "description": "...", "requires_approval": false, "capacity": 100},
--   {"name": "VIP", "price": 500000, "description": "...", "requires_approval": false, "capacity": 10}
-- ]

-- Add full_name to profiles if not exists (for host display)
-- Already exists from initial schema

-- Add ticket_id to registrations table
ALTER TABLE public.registrations
ADD COLUMN ticket_id TEXT;

-- Create index for category filtering
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_city ON public.events(city);


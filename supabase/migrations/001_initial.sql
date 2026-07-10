-- NOVA AI — extraction history schema
-- Run this in the Supabase SQL editor or via supabase db push

CREATE TABLE IF NOT EXISTS extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript TEXT NOT NULL,
  transcript_preview TEXT NOT NULL,
  meeting_date DATE,
  task_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID NOT NULL REFERENCES extractions(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'Unassigned',
  due_date TEXT,
  due_date_text TEXT NOT NULL DEFAULT 'No date given',
  priority TEXT NOT NULL DEFAULT 'Not specified',
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_created_at
  ON extractions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_action_items_extraction_id
  ON action_items (extraction_id);

-- Demo / hackathon: allow service-role access from backend only.
-- For production, add auth + RLS policies per user.

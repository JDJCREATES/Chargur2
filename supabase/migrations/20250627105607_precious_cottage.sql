/*
  # Add competitor search history

  1. New Tables
    - `competitor_search_history` - Stores search history for competitor analysis
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `search_query` (text)
      - `results` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `competitor_search_history` table
    - Add policy for users to view their own search history
    - Add policy for users to create search history entries
*/

-- Create competitor search history table
CREATE TABLE IF NOT EXISTS competitor_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  search_query TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_competitor_search_history_user_id ON competitor_search_history(user_id);

-- Create index on search_query for text search
CREATE INDEX IF NOT EXISTS idx_competitor_search_history_search_query ON competitor_search_history USING gin (to_tsvector('english', search_query));

-- Enable Row Level Security
ALTER TABLE competitor_search_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own search history"
  ON competitor_search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history entries"
  ON competitor_search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
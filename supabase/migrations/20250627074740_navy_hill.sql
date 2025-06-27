/*
  # Add project_id to chat_conversations table

  1. New Columns
    - `project_id` (uuid): References projects table, allows null for backward compatibility
  2. Foreign Key
    - Adds foreign key constraint to projects table with cascade delete
  3. Security
    - Maintains existing RLS policies
*/

-- Add project_id column to chat_conversations table
ALTER TABLE public.chat_conversations
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_project_id ON public.chat_conversations(project_id);
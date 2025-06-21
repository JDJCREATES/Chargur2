/*
  # Chat Streaming and Recovery System

  1. New Tables
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stage_id` (text)
      - `status` (text: 'active', 'completed', 'failed')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `metadata` (jsonb for stage data, user message, etc.)
    
    - `chat_response_tokens`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references chat_conversations)
      - `token_index` (integer)
      - `token_content` (text)
      - `token_type` (text: 'content', 'suggestion', 'autofill', 'complete')
      - `created_at` (timestamp)
    
    - `chat_responses`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references chat_conversations)
      - `full_content` (text)
      - `suggestions` (jsonb)
      - `auto_fill_data` (jsonb)
      - `stage_complete` (boolean)
      - `context` (jsonb)
      - `is_complete` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Ensure users can only access their own conversations
*/

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Chat Response Tokens Table (for incremental saving)
CREATE TABLE IF NOT EXISTS chat_response_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  token_index INTEGER NOT NULL,
  token_content TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'content' CHECK (token_type IN ('content', 'suggestion', 'autofill', 'complete')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, token_index)
);

-- Chat Responses Table (for final assembled responses)
CREATE TABLE IF NOT EXISTS chat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  full_content TEXT,
  suggestions JSONB DEFAULT '[]'::jsonb,
  auto_fill_data JSONB DEFAULT '{}'::jsonb,
  stage_complete BOOLEAN DEFAULT FALSE,
  context JSONB DEFAULT '{}'::jsonb,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_stage_id ON chat_conversations(stage_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_response_tokens_conversation_id ON chat_response_tokens(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_response_tokens_token_index ON chat_response_tokens(conversation_id, token_index);
CREATE INDEX IF NOT EXISTS idx_chat_responses_conversation_id ON chat_responses(conversation_id);

-- Enable Row Level Security
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_response_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view own conversations" 
  ON chat_conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
  ON chat_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON chat_conversations FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for chat_response_tokens
CREATE POLICY "Users can view own response tokens" 
  ON chat_response_tokens FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert response tokens" 
  ON chat_response_tokens FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for chat_responses
CREATE POLICY "Users can view own responses" 
  ON chat_responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert responses" 
  ON chat_responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can update responses" 
  ON chat_responses FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at 
  BEFORE UPDATE ON chat_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_responses_updated_at 
  BEFORE UPDATE ON chat_responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
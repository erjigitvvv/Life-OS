-- Migration: 0008_ai_memory.sql
-- Description: AI memory storage, pgvector for semantic search, AI runs tracking
-- Created: 2026-10-22

-- ============================================
-- PGVECTOR EXTENSION (for semantic search)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- AI RUNS (Track every AI call)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL
    CHECK (agent_type IN (
      'capture', 'planner', 'finance', 'reviewer', 'coach',
      'study_coach', 'obsidian', 'other'
    )),
  model TEXT DEFAULT 'claude-3-5-sonnet-20240620',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC(10, 4) DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'error', 'timeout')),
  prompt TEXT,
  response TEXT,
  error_message TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AI MEMORY (Semantic search / Vector embeddings)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- OpenAI/Anthropic embedding dimension
  source TEXT NOT NULL
    CHECK (source IN ('capture', 'chat', 'habit_log', 'task', 'flashcard', 'other')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
-- Vector index for semantic similarity search
CREATE INDEX IF NOT EXISTS ai_memory_embedding_idx
  ON ai_memory USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- B-tree indexes for performance
CREATE INDEX IF NOT EXISTS ai_runs_user_id ON ai_runs(user_id);
CREATE INDEX IF NOT EXISTS ai_runs_agent_type ON ai_runs(agent_type);
CREATE INDEX IF NOT EXISTS ai_runs_created_at ON ai_runs(created_at);
CREATE INDEX IF NOT EXISTS ai_memory_user_id ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS ai_memory_source ON ai_memory(source);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own ai_runs" ON ai_runs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own ai_memory" ON ai_memory FOR ALL USING (auth.uid() = user_id);
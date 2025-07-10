-- Strategy Creator Sessions table
-- Stores the state of in-progress strategy creation sessions
CREATE TABLE IF NOT EXISTS strategy_creator_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  
  -- Session state
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  
  -- Context selections
  selected_blueprint_cards UUID[] DEFAULT '{}',
  selected_intelligence_cards UUID[] DEFAULT '{}',
  
  -- Generated content
  context_summary TEXT,
  target_blueprint_id TEXT,
  generation_options JSONB DEFAULT '{"count": 3, "style": "comprehensive"}',
  generated_cards JSONB[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Strategy Creator History table
-- Tracks all actions and generations for analytics and debugging
CREATE TABLE IF NOT EXISTS strategy_creator_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES strategy_creator_sessions(id) ON DELETE SET NULL,
  
  -- Action details
  action_type TEXT NOT NULL, -- 'session_start', 'context_generated', 'cards_generated', 'cards_committed'
  action_data JSONB DEFAULT '{}',
  
  -- Results
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_strategy_creator_sessions_user_id ON strategy_creator_sessions(user_id);
CREATE INDEX idx_strategy_creator_sessions_strategy_id ON strategy_creator_sessions(strategy_id);
CREATE INDEX idx_strategy_creator_sessions_expires_at ON strategy_creator_sessions(expires_at);
CREATE INDEX idx_strategy_creator_history_user_id ON strategy_creator_history(user_id);
CREATE INDEX idx_strategy_creator_history_session_id ON strategy_creator_history(session_id);
CREATE INDEX idx_strategy_creator_history_created_at ON strategy_creator_history(created_at);

-- Enable RLS
ALTER TABLE strategy_creator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_creator_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategy_creator_sessions
CREATE POLICY "Users can view their own sessions"
  ON strategy_creator_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON strategy_creator_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON strategy_creator_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON strategy_creator_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for strategy_creator_history
CREATE POLICY "Users can view their own history"
  ON strategy_creator_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history"
  ON strategy_creator_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_strategy_creator_sessions_updated_at
  BEFORE UPDATE ON strategy_creator_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Clean up expired sessions periodically
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM strategy_creator_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run cleanup daily
-- This would need pg_cron extension enabled
-- SELECT cron.schedule('cleanup-strategy-creator-sessions', '0 0 * * *', 'SELECT cleanup_expired_sessions();');
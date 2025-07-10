-- Migration: Create Intelligence Cards System
-- Description: Creates the intelligence_cards table for storing intelligence across all categories
-- Author: Claude Code
-- Date: 2025-01-08

-- Create the intelligence_cards table
CREATE TABLE IF NOT EXISTS intelligence_cards (
  -- Core identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL CHECK (category IN (
    'market', 
    'competitor', 
    'trends', 
    'technology', 
    'stakeholder', 
    'consumer', 
    'risk', 
    'opportunities'
  )),
  
  -- Template fields (required)
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  intelligence_content TEXT NOT NULL,
  
  -- Template fields (optional)
  key_findings TEXT[] DEFAULT '{}',
  source_reference VARCHAR(500),
  date_accessed TIMESTAMPTZ,
  credibility_score INTEGER CHECK (credibility_score IS NULL OR (credibility_score >= 1 AND credibility_score <= 10)),
  relevance_score INTEGER CHECK (relevance_score IS NULL OR (relevance_score >= 1 AND relevance_score <= 10)),
  relevant_blueprint_pages VARCHAR[] DEFAULT '{}',
  strategic_implications TEXT,
  recommended_actions TEXT,
  tags VARCHAR[] DEFAULT '{}',
  
  -- Status management
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'saved', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_intelligence_cards_user_id ON intelligence_cards(user_id);
CREATE INDEX idx_intelligence_cards_category ON intelligence_cards(category);
CREATE INDEX idx_intelligence_cards_status ON intelligence_cards(status);
CREATE INDEX idx_intelligence_cards_created_at ON intelligence_cards(created_at DESC);
CREATE INDEX idx_intelligence_cards_user_category ON intelligence_cards(user_id, category);
CREATE INDEX idx_intelligence_cards_user_status ON intelligence_cards(user_id, status);

-- Create GIN indexes for array fields
CREATE INDEX idx_intelligence_cards_tags ON intelligence_cards USING GIN(tags);
CREATE INDEX idx_intelligence_cards_key_findings ON intelligence_cards USING GIN(key_findings);
CREATE INDEX idx_intelligence_cards_blueprint_pages ON intelligence_cards USING GIN(relevant_blueprint_pages);

-- Enable Row Level Security
ALTER TABLE intelligence_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own intelligence cards
CREATE POLICY "Users can view their own intelligence cards"
  ON intelligence_cards
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Users can create intelligence cards
CREATE POLICY "Users can create intelligence cards"
  ON intelligence_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own intelligence cards
CREATE POLICY "Users can update their own intelligence cards"
  ON intelligence_cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own intelligence cards
CREATE POLICY "Users can delete their own intelligence cards"
  ON intelligence_cards
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_intelligence_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_intelligence_cards_updated_at_trigger
  BEFORE UPDATE ON intelligence_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_intelligence_cards_updated_at();

-- Add helpful comments
COMMENT ON TABLE intelligence_cards IS 'Stores intelligence cards across all categories for the Intelligence Bank';
COMMENT ON COLUMN intelligence_cards.user_id IS 'References the user who owns this intelligence card';
COMMENT ON COLUMN intelligence_cards.category IS 'Category of intelligence: market, competitor, trends, technology, stakeholder, consumer, risk, opportunities';
COMMENT ON COLUMN intelligence_cards.title IS 'Brief, descriptive title of the intelligence';
COMMENT ON COLUMN intelligence_cards.summary IS 'Executive summary of the key intelligence';
COMMENT ON COLUMN intelligence_cards.intelligence_content IS 'Full intelligence content and analysis';
COMMENT ON COLUMN intelligence_cards.key_findings IS 'Array of key findings or insights';
COMMENT ON COLUMN intelligence_cards.source_reference IS 'Reference to the source of this intelligence';
COMMENT ON COLUMN intelligence_cards.date_accessed IS 'When the source was accessed or intelligence was gathered';
COMMENT ON COLUMN intelligence_cards.credibility_score IS 'Score from 1-10 indicating source credibility';
COMMENT ON COLUMN intelligence_cards.relevance_score IS 'Score from 1-10 indicating relevance to business';
COMMENT ON COLUMN intelligence_cards.relevant_blueprint_pages IS 'Array of blueprint page IDs this intelligence relates to';
COMMENT ON COLUMN intelligence_cards.strategic_implications IS 'Analysis of strategic implications';
COMMENT ON COLUMN intelligence_cards.recommended_actions IS 'Recommended actions based on this intelligence';
COMMENT ON COLUMN intelligence_cards.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN intelligence_cards.status IS 'Status: active (default), saved, or archived';
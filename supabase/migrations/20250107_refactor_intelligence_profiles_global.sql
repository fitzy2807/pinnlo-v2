-- Migration: Refactor Intelligence Profiles to be Global (Strategy-Independent)
-- Description: Removes strategy dependency and makes profiles user-global
-- Author: AI Assistant
-- Date: 2025-01-07

-- Drop the existing table to start fresh with correct schema
DROP TABLE IF EXISTS intelligence_profiles CASCADE;

-- Create the new global intelligence_profiles table
CREATE TABLE IF NOT EXISTS intelligence_profiles (
  -- Primary identification
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Note: No strategyId - profiles are now global per user
  
  -- Business Context Section
  businessModel TEXT[] DEFAULT '{}',
  industrySector TEXT[] DEFAULT '{}',
  stageOfGrowth TEXT,
  strategicHorizon TEXT,
  primaryStrategicGoals TEXT[] DEFAULT '{}',
  
  -- Market Focus Section
  targetGeographies TEXT[] DEFAULT '{}',
  marketType TEXT,
  marketInsightsPriority TEXT[] DEFAULT '{}',
  preferredSources TEXT[] DEFAULT '{}',
  
  -- Competitor Focus Section
  directCompetitors TEXT[] DEFAULT '{}',
  watchCategories TEXT[] DEFAULT '{}',
  businessModelMatch TEXT,
  competitiveIntensity TEXT,
  
  -- Trends Section
  designTrends TEXT[] DEFAULT '{}',
  behaviouralTrends TEXT[] DEFAULT '{}',
  contentMediaTrends TEXT[] DEFAULT '{}',
  relevantTimeframe TEXT,
  
  -- Technology Signals Section
  techCategories TEXT[] DEFAULT '{}',
  specificTechnologies TEXT[] DEFAULT '{}',
  adoptionStrategy TEXT,
  techStackBias TEXT[] DEFAULT '{}',
  
  -- Stakeholder Alignment Section
  internalStakeholders TEXT[] DEFAULT '{}',
  strategicThemes TEXT[] DEFAULT '{}',
  governancePriority TEXT,
  
  -- Consumer Insights Section
  feedbackChannels TEXT[] DEFAULT '{}',
  topUserFrictions TEXT[] DEFAULT '{}',
  personasOfInterest TEXT[] DEFAULT '{}', -- Reserved for future use
  behaviourTriggers TEXT[] DEFAULT '{}',
  
  -- Risk Section
  riskTypes TEXT[] DEFAULT '{}',
  complianceFrameworks TEXT[] DEFAULT '{}',
  jurisdictionalFocus TEXT[] DEFAULT '{}',
  riskAppetite TEXT,
  
  -- Opportunities Section
  opportunityCategories TEXT[] DEFAULT '{}',
  innovationAppetite TEXT,
  linkedProblems TEXT[] DEFAULT '{}', -- Reserved for future use
  
  -- Timestamps
  createdAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  -- Ensure one profile per user (global profile)
  CONSTRAINT unique_user_profile UNIQUE (userId)
);

-- Create indexes for performance
CREATE INDEX idx_intelligence_profiles_userId ON intelligence_profiles(userId);

-- Add GIN indexes for array fields to improve query performance
CREATE INDEX idx_intelligence_profiles_businessModel ON intelligence_profiles USING GIN(businessModel);
CREATE INDEX idx_intelligence_profiles_industrySector ON intelligence_profiles USING GIN(industrySector);
CREATE INDEX idx_intelligence_profiles_primaryStrategicGoals ON intelligence_profiles USING GIN(primaryStrategicGoals);
CREATE INDEX idx_intelligence_profiles_targetGeographies ON intelligence_profiles USING GIN(targetGeographies);
CREATE INDEX idx_intelligence_profiles_marketInsightsPriority ON intelligence_profiles USING GIN(marketInsightsPriority);
CREATE INDEX idx_intelligence_profiles_preferredSources ON intelligence_profiles USING GIN(preferredSources);
CREATE INDEX idx_intelligence_profiles_directCompetitors ON intelligence_profiles USING GIN(directCompetitors);
CREATE INDEX idx_intelligence_profiles_watchCategories ON intelligence_profiles USING GIN(watchCategories);
CREATE INDEX idx_intelligence_profiles_techCategories ON intelligence_profiles USING GIN(techCategories);
CREATE INDEX idx_intelligence_profiles_specificTechnologies ON intelligence_profiles USING GIN(specificTechnologies);

-- Enable Row Level Security
ALTER TABLE intelligence_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified for user-only access)
-- Users can view their own intelligence profile
CREATE POLICY "Users can view their own intelligence profile"
  ON intelligence_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = userId);

-- Users can create their own intelligence profile
CREATE POLICY "Users can create their own intelligence profile"
  ON intelligence_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = userId);

-- Users can update their own intelligence profile
CREATE POLICY "Users can update their own intelligence profile"
  ON intelligence_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = userId)
  WITH CHECK (auth.uid()::text = userId);

-- Users can delete their own intelligence profile
CREATE POLICY "Users can delete their own intelligence profile"
  ON intelligence_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = userId);

-- Create function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_intelligence_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updatedAt
CREATE TRIGGER update_intelligence_profiles_updated_at_trigger
  BEFORE UPDATE ON intelligence_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_intelligence_profiles_updated_at();

-- Add comments for documentation
COMMENT ON TABLE intelligence_profiles IS 'Stores global Intelligence Bank configuration profiles for each user';
COMMENT ON COLUMN intelligence_profiles.userId IS 'References the user who owns this global profile';
COMMENT ON COLUMN intelligence_profiles.businessModel IS 'Selected business model types (B2B, B2C, SaaS, etc.)';
COMMENT ON COLUMN intelligence_profiles.industrySector IS 'Selected industry sectors';
COMMENT ON COLUMN intelligence_profiles.stageOfGrowth IS 'Company growth stage';
COMMENT ON COLUMN intelligence_profiles.strategicHorizon IS 'Planning timeframe';
COMMENT ON COLUMN intelligence_profiles.primaryStrategicGoals IS 'Main strategic objectives';
COMMENT ON COLUMN intelligence_profiles.targetGeographies IS 'Geographic markets of focus';
COMMENT ON COLUMN intelligence_profiles.marketType IS 'Market maturity type';
COMMENT ON COLUMN intelligence_profiles.marketInsightsPriority IS 'Priority areas for market intelligence';
COMMENT ON COLUMN intelligence_profiles.preferredSources IS 'Preferred intelligence sources';
COMMENT ON COLUMN intelligence_profiles.directCompetitors IS 'List of direct competitor names';
COMMENT ON COLUMN intelligence_profiles.watchCategories IS 'Competitor monitoring categories';
COMMENT ON COLUMN intelligence_profiles.businessModelMatch IS 'Competitor business model type';
COMMENT ON COLUMN intelligence_profiles.competitiveIntensity IS 'Level of competitive pressure';
COMMENT ON COLUMN intelligence_profiles.designTrends IS 'Design trends to monitor';
COMMENT ON COLUMN intelligence_profiles.behaviouralTrends IS 'User behavior trends to track';
COMMENT ON COLUMN intelligence_profiles.contentMediaTrends IS 'Content and media trends';
COMMENT ON COLUMN intelligence_profiles.relevantTimeframe IS 'Trend monitoring timeframe';
COMMENT ON COLUMN intelligence_profiles.techCategories IS 'Technology categories of interest';
COMMENT ON COLUMN intelligence_profiles.specificTechnologies IS 'Specific technologies to track';
COMMENT ON COLUMN intelligence_profiles.adoptionStrategy IS 'Technology adoption approach';
COMMENT ON COLUMN intelligence_profiles.techStackBias IS 'Technology stack preferences';
COMMENT ON COLUMN intelligence_profiles.internalStakeholders IS 'Key internal stakeholder groups';
COMMENT ON COLUMN intelligence_profiles.strategicThemes IS 'Strategic focus themes';
COMMENT ON COLUMN intelligence_profiles.governancePriority IS 'Governance and compliance priority level';
COMMENT ON COLUMN intelligence_profiles.feedbackChannels IS 'Customer feedback sources';
COMMENT ON COLUMN intelligence_profiles.topUserFrictions IS 'Main user pain points';
COMMENT ON COLUMN intelligence_profiles.personasOfInterest IS 'Target user personas (future feature)';
COMMENT ON COLUMN intelligence_profiles.behaviourTriggers IS 'Key user behavior triggers';
COMMENT ON COLUMN intelligence_profiles.riskTypes IS 'Types of risks to monitor';
COMMENT ON COLUMN intelligence_profiles.complianceFrameworks IS 'Relevant compliance frameworks';
COMMENT ON COLUMN intelligence_profiles.jurisdictionalFocus IS 'Geographic compliance focus areas';
COMMENT ON COLUMN intelligence_profiles.riskAppetite IS 'Organization risk tolerance level';
COMMENT ON COLUMN intelligence_profiles.opportunityCategories IS 'Types of opportunities to track';
COMMENT ON COLUMN intelligence_profiles.innovationAppetite IS 'Innovation approach preference';
COMMENT ON COLUMN intelligence_profiles.linkedProblems IS 'Problems linked to opportunities (future feature)';

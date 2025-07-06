-- Core Tables Migration: users, strategies, strategySummaries
-- This migration creates the core tables for the PINNLO application with exact schema structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "profileImageUrl" VARCHAR,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategies table with exact 24 JSONB fields
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    "userId" VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    client TEXT,
    description TEXT,
    status TEXT DEFAULT 'draft',
    progress INTEGER DEFAULT 0,
    "lastModified" TEXT,
    
    -- Exact 24 JSONB fields from Drizzle schema
    vision JSONB DEFAULT '{}',
    okrs JSONB DEFAULT '{}',
    problems JSONB DEFAULT '{}',
    initiatives JSONB DEFAULT '{}',
    personas JSONB DEFAULT '{}',
    epics JSONB DEFAULT '{}',
    "customerExperience" JSONB DEFAULT '{}',
    "experienceSections" JSONB DEFAULT '{}',
    "userJourneys" JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    roadmap JSONB DEFAULT '{}',
    "techRequirements" JSONB DEFAULT '{}',
    "techStack" JSONB DEFAULT '{}',
    team JSONB DEFAULT '{}',
    cost JSONB DEFAULT '{}',
    "deliveryPlan" JSONB DEFAULT '{}',
    "strategicContext" JSONB DEFAULT '{}',
    "valuePropositions" JSONB DEFAULT '{}',
    workstreams JSONB DEFAULT '{}',
    "technicalStacks" JSONB DEFAULT '{}',
    "organisationalCapabilities" JSONB DEFAULT '{}',
    "gtmPlays" JSONB DEFAULT '{}',
    "serviceBlueprints" JSONB DEFAULT '{}',
    "ideasBank" JSONB DEFAULT '{}',
    "blueprintConfiguration" JSONB DEFAULT '{}',
    
    -- Metadata
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategySummaries table with exact schema
CREATE TABLE IF NOT EXISTS "strategySummaries" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "strategyId" INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    section TEXT,
    summary TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies("userId");
CREATE INDEX IF NOT EXISTS idx_strategies_status ON strategies(status);
CREATE INDEX IF NOT EXISTS idx_strategies_created_at ON strategies("createdAt");
CREATE INDEX IF NOT EXISTS idx_strategy_summaries_strategy_id ON "strategySummaries"("strategyId");
CREATE INDEX IF NOT EXISTS idx_strategy_summaries_section ON "strategySummaries"(section);

-- Create GIN indexes for JSONB fields that will be queried frequently
CREATE INDEX IF NOT EXISTS idx_strategies_vision ON strategies USING GIN(vision);
CREATE INDEX IF NOT EXISTS idx_strategies_okrs ON strategies USING GIN(okrs);
CREATE INDEX IF NOT EXISTS idx_strategies_problems ON strategies USING GIN(problems);
CREATE INDEX IF NOT EXISTS idx_strategies_initiatives ON strategies USING GIN(initiatives);
CREATE INDEX IF NOT EXISTS idx_strategies_personas ON strategies USING GIN(personas);
CREATE INDEX IF NOT EXISTS idx_strategies_features ON strategies USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_strategies_roadmap ON strategies USING GIN(roadmap);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updatedAt columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_summaries_updated_at BEFORE UPDATE ON "strategySummaries"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE "strategySummaries" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- RLS Policies for strategies table
CREATE POLICY "Users can view their own strategies" ON strategies
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own strategies" ON strategies
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own strategies" ON strategies
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete their own strategies" ON strategies
    FOR DELETE USING (auth.uid()::text = "userId");

-- RLS Policies for strategySummaries table
CREATE POLICY "Users can view strategy summaries for their strategies" ON "strategySummaries"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM strategies 
            WHERE strategies.id = "strategySummaries"."strategyId" 
            AND strategies."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert strategy summaries for their strategies" ON "strategySummaries"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM strategies 
            WHERE strategies.id = "strategySummaries"."strategyId" 
            AND strategies."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can update strategy summaries for their strategies" ON "strategySummaries"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM strategies 
            WHERE strategies.id = "strategySummaries"."strategyId" 
            AND strategies."userId" = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete strategy summaries for their strategies" ON "strategySummaries"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM strategies 
            WHERE strategies.id = "strategySummaries"."strategyId" 
            AND strategies."userId" = auth.uid()::text
        )
    );
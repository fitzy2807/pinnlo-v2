-- =============================================
-- AI Edit Mode Generator System - Complete Setup
-- =============================================
-- Copy and paste this entire file into Supabase SQL Editor

-- Drop existing tables if you need to start fresh (uncomment if needed)
-- DROP TABLE IF EXISTS ai_generation_history CASCADE;
-- DROP TABLE IF EXISTS ai_context_strategies CASCADE;
-- DROP TABLE IF EXISTS ai_context_mappings CASCADE;
-- DROP TABLE IF EXISTS ai_system_prompts CASCADE;

-- 1. System Prompts Table
CREATE TABLE IF NOT EXISTS ai_system_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_type VARCHAR(100) UNIQUE NOT NULL,
    prompt_name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    prompt_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 4000,
    model_preference VARCHAR(50) DEFAULT 'gpt-4o-mini',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    times_used INTEGER DEFAULT 0,
    avg_user_rating DECIMAL(3,2),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- 2. Context Mappings Table
CREATE TABLE IF NOT EXISTS ai_context_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_blueprint VARCHAR(100) NOT NULL,
    context_blueprint VARCHAR(100) NOT NULL,
    priority INTEGER DEFAULT 1,
    max_cards INTEGER DEFAULT 5,
    inclusion_strategy VARCHAR(50) DEFAULT 'always',
    summarization_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_blueprint, context_blueprint)
);

-- 3. Context Summarization Strategies
CREATE TABLE IF NOT EXISTS ai_context_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_type VARCHAR(100) UNIQUE NOT NULL,
    strategy_type VARCHAR(50) DEFAULT 'summarize_all',
    summarization_prompt TEXT,
    max_tokens_for_summary INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Generation History
CREATE TABLE IF NOT EXISTS ai_generation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    card_id UUID NOT NULL,
    blueprint_type VARCHAR(100) NOT NULL,
    context_used JSONB,
    prompt_used TEXT,
    fields_generated JSONB,
    total_tokens_used INTEGER,
    generation_time_ms INTEGER,
    model_used VARCHAR(50),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    fields_accepted JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_system_prompts_blueprint ON ai_system_prompts(blueprint_type);
CREATE INDEX IF NOT EXISTS idx_ai_system_prompts_active ON ai_system_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_context_mappings_source ON ai_context_mappings(source_blueprint);
CREATE INDEX IF NOT EXISTS idx_ai_context_strategies_blueprint ON ai_context_strategies(blueprint_type);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_user ON ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_created ON ai_generation_history(created_at DESC);

-- Enable RLS
ALTER TABLE ai_system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public read for system tables)
CREATE POLICY "Public read prompts" ON ai_system_prompts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read mappings" ON ai_context_mappings
    FOR SELECT USING (true);

CREATE POLICY "Public read strategies" ON ai_context_strategies
    FOR SELECT USING (true);

-- Users can only access their own history
CREATE POLICY "Users view own history" ON ai_generation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create history" ON ai_generation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Insert Initial Data - Core Prompts
-- =============================================

INSERT INTO ai_system_prompts (blueprint_type, prompt_name, system_prompt) VALUES
-- Core Strategy
('strategicContext', 'Strategic Context Expert', 
'You are a strategic planning expert with deep understanding of market dynamics and organizational strategy. Create comprehensive strategic context that considers market environment, competitive landscape, and stakeholder needs. Be specific, data-driven where possible, and forward-looking.'),

('vision', 'Strategic Visioning Expert', 
'You are a strategic visioning expert. Create inspiring, future-focused vision statements that motivate teams and provide clear direction. Balance aspiration with achievability. Use clear, memorable language that resonates with all stakeholders.'),

('valuePropositions', 'Value Proposition Designer', 
'You are a value proposition expert. Create clear, compelling value propositions that resonate with target customers. Focus on specific problems solved, unique benefits delivered, and clear differentiation from alternatives.'),

('strategic-bet', 'Strategic Betting Expert',
'You are a strategic decision expert specializing in strategic bets. Clearly articulate what we are betting on, why it matters, and what evidence supports this bet. Be specific about risks, required investments, and expected returns.'),

-- Planning & Execution
('okrs', 'OKR Expert', 
'You are an OKR (Objectives and Key Results) expert. Create ambitious yet achievable objectives with measurable, time-bound key results. Ensure objectives inspire action and key results are specific, measurable, and directly indicate success.'),

('epics', 'Agile Product Expert', 
'You are an agile product expert. Create comprehensive epics that bridge strategy and execution. Include clear scope, user value, acceptance criteria, and success metrics. Consider technical feasibility and business impact.'),

('features', 'Feature Design Expert', 
'You are a product feature expert. Create detailed feature specifications that solve real user problems. Include user stories, acceptance criteria, and clear success metrics. Balance user needs with technical feasibility.'),

('problem-statement', 'Problem Analysis Expert',
'You are a problem analysis expert. Clearly articulate who is affected, what the core problem is, why it matters, and what evidence supports this. Be specific about impact and root causes.'),

('workstreams', 'Workstream Planning Expert',
'You are a program management expert. Create clear workstream definitions with objectives, success criteria, dependencies, and team structures. Focus on coordination and delivery.'),

-- Analysis
('swot-analysis', 'Strategic Analyst', 
'You are a strategic analyst specializing in SWOT analysis. Create balanced, insightful SWOT analyses with equal depth in all quadrants. Provide specific, actionable insights rather than generic observations.'),

('competitive-analysis', 'Competitive Intelligence Expert', 
'You are a competitive intelligence expert. Create thorough competitive analyses that identify strengths, weaknesses, and strategic implications. Focus on actionable insights and strategic responses.'),

('market-insight', 'Market Intelligence Expert',
'You are a market intelligence expert. Extract and synthesize key market insights, trends, and implications. Focus on actionable intelligence that informs strategic decisions.'),

-- Technical
('techRequirements', 'Senior Technical Architect', 
'You are a senior technical architect with 15+ years of experience. Create comprehensive technical requirements that address scalability, security, performance, and maintainability. Be specific and implementation-ready.'),

('techStack', 'Technology Strategy Expert', 
'You are a technology strategy expert. Make informed technology choices based on requirements, team capabilities, and long-term maintainability. Justify each technology decision with clear pros/cons.'),

-- User Experience
('userJourneys', 'User Experience Expert',
'You are a user experience expert. Map comprehensive user journeys that identify all touchpoints, emotions, pain points, and opportunities. Focus on actionable insights for improving the experience.'),

('personas', 'User Research Expert',
'You are a user research expert. Create detailed, realistic personas based on user research and data. Include demographics, goals, pain points, and behavioral patterns that guide product decisions.'),

-- Business
('business-model', 'Business Model Expert',
'You are a business model strategist. Create comprehensive business models that clearly articulate how value is created, delivered, and captured. Consider all key components and their interactions.'),

('go-to-market', 'GTM Strategy Expert',
'You are a go-to-market strategy expert. Create comprehensive GTM strategies that define target market, positioning, channels, and success metrics. Be specific and actionable.'),

-- Measurement
('kpis', 'Performance Measurement Expert',
'You are a performance measurement expert. Define clear, measurable KPIs that align with strategic objectives. Include calculation methods, targets, and data sources.'),

('financial-projections', 'Financial Planning Expert',
'You are a financial planning expert. Create realistic financial projections based on clear assumptions. Include revenue, costs, and key financial metrics with scenario planning.')

ON CONFLICT (blueprint_type) DO UPDATE SET
    system_prompt = EXCLUDED.system_prompt,
    updated_at = NOW();

-- =============================================
-- Insert Context Mappings
-- =============================================

INSERT INTO ai_context_mappings (source_blueprint, context_blueprint, priority, max_cards, inclusion_strategy) VALUES
-- Vision needs context
('vision', 'strategicContext', 1, NULL, 'always'),
('vision', 'business-model', 2, 2, 'if_exists'),
('vision', 'competitive-analysis', 3, 3, 'if_exists'),

-- Epics need comprehensive context
('epics', 'vision', 1, 1, 'always'),
('epics', 'problem-statement', 2, NULL, 'always'),
('epics', 'userJourneys', 3, 5, 'if_exists'),
('epics', 'personas', 4, 3, 'if_exists'),

-- OKRs need strategic alignment
('okrs', 'vision', 1, 1, 'always'),
('okrs', 'strategicContext', 2, 1, 'always'),
('okrs', 'strategic-bet', 3, 3, 'if_exists'),

-- Features need product context
('features', 'epics', 1, 3, 'always'),
('features', 'personas', 2, 3, 'if_exists'),
('features', 'userJourneys', 3, 3, 'if_exists'),

-- Technical requirements need architectural context
('techRequirements', 'epics', 1, NULL, 'always'),
('techRequirements', 'techStack', 2, NULL, 'always'),
('techRequirements', 'features', 3, 5, 'if_exists'),

-- SWOT needs broad context
('swot-analysis', 'strategicContext', 1, 1, 'always'),
('swot-analysis', 'competitive-analysis', 2, NULL, 'if_exists'),
('swot-analysis', 'market-insight', 3, 5, 'if_exists'),

-- Problem statements need user context
('problem-statement', 'personas', 1, NULL, 'if_exists'),
('problem-statement', 'userJourneys', 2, NULL, 'if_exists'),

-- Business model needs strategic context
('business-model', 'vision', 1, 1, 'always'),
('business-model', 'valuePropositions', 2, NULL, 'always'),
('business-model', 'strategic-bet', 3, 3, 'if_exists')

ON CONFLICT (source_blueprint, context_blueprint) DO UPDATE SET
    priority = EXCLUDED.priority,
    max_cards = EXCLUDED.max_cards;

-- =============================================
-- Insert Summarization Strategies
-- =============================================

INSERT INTO ai_context_strategies (blueprint_type, strategy_type, summarization_prompt) VALUES
('problem-statement', 'summarize_all', 
'Summarize all problem statements into key themes. Group by: 1) User impact severity, 2) Business impact, 3) Problem category. Preserve specific details that would affect solution design.'),

('competitive-analysis', 'summarize_all',
'Summarize competitive landscape into: 1) Key competitive threats, 2) Market opportunities, 3) Our competitive advantages, 4) Strategic responses needed.'),

('userJourneys', 'summarize_all',
'Extract all unique user workflows, pain points, and opportunities. Group by: 1) User type, 2) Journey stage, 3) Severity of friction. Preserve specific issues that need addressing.'),

('personas', 'summarize_all',
'Summarize all personas into key user segments. Include: 1) Primary goals, 2) Major pain points, 3) Key behaviors, 4) Decision criteria.'),

('epics', 'summarize_all',
'Summarize all epics into major initiatives. Group by: 1) Strategic objective, 2) User impact, 3) Dependencies. Highlight sequencing considerations.')

ON CONFLICT (blueprint_type) DO UPDATE SET
    summarization_prompt = EXCLUDED.summarization_prompt;

-- =============================================
-- Create Helper Function
-- =============================================

CREATE OR REPLACE FUNCTION get_ai_context_config(p_blueprint_type VARCHAR)
RETURNS TABLE (
    context_blueprint VARCHAR,
    priority INTEGER,
    max_cards INTEGER,
    inclusion_strategy VARCHAR,
    summarization_required BOOLEAN,
    summarization_prompt TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.context_blueprint,
        cm.priority,
        cm.max_cards,
        cm.inclusion_strategy,
        CASE WHEN cs.strategy_type IS NOT NULL THEN true ELSE false END,
        cs.summarization_prompt
    FROM ai_context_mappings cm
    LEFT JOIN ai_context_strategies cs ON cm.context_blueprint = cs.blueprint_type
    WHERE cm.source_blueprint = p_blueprint_type
    ORDER BY cm.priority;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Verify Installation
-- =============================================

-- Check that tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('ai_system_prompts', 'ai_context_mappings', 'ai_context_strategies', 'ai_generation_history')
ORDER BY table_name;

-- Check prompt count
SELECT COUNT(*) as prompt_count FROM ai_system_prompts;

-- Check mapping count  
SELECT COUNT(*) as mapping_count FROM ai_context_mappings;

-- View a sample configuration
SELECT * FROM get_ai_context_config('epics');
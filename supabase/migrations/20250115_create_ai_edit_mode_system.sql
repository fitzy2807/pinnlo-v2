-- =============================================
-- AI Edit Mode Generator System Tables
-- =============================================
-- This creates a database-driven system for managing AI prompts and context mappings
-- for the edit mode generator feature.

-- 1. System Prompts Table
-- Stores the expert prompts for each blueprint type
CREATE TABLE IF NOT EXISTS ai_system_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_type VARCHAR(100) UNIQUE NOT NULL, -- matches registry IDs exactly
    prompt_name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    prompt_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    -- Optional fields for enhancement
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 4000,
    model_preference VARCHAR(50) DEFAULT 'gpt-4o-mini',
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Performance metrics (updated by system)
    times_used INTEGER DEFAULT 0,
    avg_user_rating DECIMAL(3,2),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- 2. Context Mappings Table
-- Defines which blueprints provide context for each blueprint type
CREATE TABLE IF NOT EXISTS ai_context_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_blueprint VARCHAR(100) NOT NULL, -- The blueprint being generated
    context_blueprint VARCHAR(100) NOT NULL, -- Blueprint to read for context
    priority INTEGER DEFAULT 1, -- 1 = highest priority
    max_cards INTEGER DEFAULT 5, -- How many cards to fetch (NULL = all)
    
    -- Context strategy
    inclusion_strategy VARCHAR(50) DEFAULT 'always', -- always, if_exists, if_token_budget_allows
    summarization_required BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique mappings
    UNIQUE(source_blueprint, context_blueprint)
);

-- 3. Context Summarization Strategies
-- How to summarize when there are too many cards
CREATE TABLE IF NOT EXISTS ai_context_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blueprint_type VARCHAR(100) UNIQUE NOT NULL,
    strategy_type VARCHAR(50) DEFAULT 'summarize_all', -- summarize_all, take_recent, take_relevant
    summarization_prompt TEXT,
    max_tokens_for_summary INTEGER DEFAULT 500,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Generation History (for tracking and improvement)
CREATE TABLE IF NOT EXISTS ai_generation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    card_id UUID NOT NULL,
    blueprint_type VARCHAR(100) NOT NULL,
    
    -- Generation details
    context_used JSONB, -- Which cards were used for context
    prompt_used TEXT, -- The actual prompt sent to AI
    fields_generated JSONB, -- The generated content
    
    -- Performance metrics
    total_tokens_used INTEGER,
    generation_time_ms INTEGER,
    model_used VARCHAR(50),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    fields_accepted JSONB, -- Which fields the user kept
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_system_prompts_blueprint ON ai_system_prompts(blueprint_type);
CREATE INDEX idx_ai_system_prompts_active ON ai_system_prompts(is_active);
CREATE INDEX idx_ai_context_mappings_source ON ai_context_mappings(source_blueprint);
CREATE INDEX idx_ai_context_strategies_blueprint ON ai_context_strategies(blueprint_type);
CREATE INDEX idx_ai_generation_history_user ON ai_generation_history(user_id);
CREATE INDEX idx_ai_generation_history_created ON ai_generation_history(created_at DESC);

-- Enable RLS
ALTER TABLE ai_system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_context_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- System prompts and mappings are public read (all users can use them)
CREATE POLICY "Public read access to prompts" ON ai_system_prompts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to mappings" ON ai_context_mappings
    FOR SELECT USING (true);

CREATE POLICY "Public read access to strategies" ON ai_context_strategies
    FOR SELECT USING (true);

-- Only admins can modify system configuration
CREATE POLICY "Admin manage prompts" ON ai_system_prompts
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

CREATE POLICY "Admin manage mappings" ON ai_context_mappings
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

CREATE POLICY "Admin manage strategies" ON ai_context_strategies
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

-- Users can only see their own generation history
CREATE POLICY "Users view own history" ON ai_generation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own history" ON ai_generation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own history" ON ai_generation_history
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Initial Data Population
-- =============================================

-- Insert core system prompts for the most common blueprint types
INSERT INTO ai_system_prompts (blueprint_type, prompt_name, system_prompt) VALUES
-- Core Strategy
('strategicContext', 'Strategic Context Expert', 
'You are a strategic planning expert with deep understanding of market dynamics and organizational strategy. Create comprehensive strategic context that considers market environment, competitive landscape, and stakeholder needs. Be specific, data-driven where possible, and forward-looking.'),

('vision', 'Strategic Visioning Expert', 
'You are a strategic visioning expert. Create inspiring, future-focused vision statements that motivate teams and provide clear direction. Balance aspiration with achievability. Use clear, memorable language that resonates with all stakeholders.'),

('valuePropositions', 'Value Proposition Designer', 
'You are a value proposition expert. Create clear, compelling value propositions that resonate with target customers. Focus on specific problems solved, unique benefits delivered, and clear differentiation from alternatives.'),

-- Planning & Execution
('okrs', 'OKR Expert', 
'You are an OKR (Objectives and Key Results) expert. Create ambitious yet achievable objectives with measurable, time-bound key results. Ensure objectives inspire action and key results are specific, measurable, and directly indicate success. Follow OKR best practices.'),

('epics', 'Agile Product Expert', 
'You are an agile product expert with extensive experience in epic creation. Create comprehensive epics that bridge strategy and execution. Include clear scope, user value, acceptance criteria, and success metrics. Consider technical feasibility and business impact.'),

('features', 'Feature Design Expert', 
'You are a product feature expert. Create detailed feature specifications that solve real user problems. Include user stories, acceptance criteria, and clear success metrics. Balance user needs with technical feasibility and business value.'),

-- Analysis
('swot-analysis', 'Strategic Analyst', 
'You are a strategic analyst specializing in SWOT analysis. Create balanced, insightful SWOT analyses with equal depth in all quadrants. Provide specific, actionable insights rather than generic observations. Consider internal and external factors comprehensively.'),

('competitive-analysis', 'Competitive Intelligence Expert', 
'You are a competitive intelligence expert. Create thorough competitive analyses that identify strengths, weaknesses, and strategic implications. Focus on actionable insights and strategic responses. Be objective and data-driven.'),

-- Technical
('techRequirements', 'Senior Technical Architect', 
'You are a senior technical architect with 15+ years of experience. Create comprehensive technical requirements that address scalability, security, performance, and maintainability. Consider system architecture, integration points, and technical constraints. Be specific and implementation-ready.'),

('techStack', 'Technology Strategy Expert', 
'You are a technology strategy expert. Make informed technology choices based on requirements, team capabilities, and long-term maintainability. Justify each technology decision with clear pros/cons. Consider ecosystem, community support, and total cost of ownership.');

-- Insert context mappings for key blueprint types
INSERT INTO ai_context_mappings (source_blueprint, context_blueprint, priority, max_cards, inclusion_strategy) VALUES
-- Vision needs strategic context
('vision', 'strategicContext', 1, NULL, 'always'),
('vision', 'business-model', 2, 2, 'if_exists'),
('vision', 'competitive-analysis', 3, 3, 'if_exists'),

-- Epics need vision and problems
('epics', 'vision', 1, 1, 'always'),
('epics', 'problem-statement', 2, NULL, 'always'), -- Get all problems, will summarize
('epics', 'userJourneys', 3, 5, 'if_exists'),
('epics', 'personas', 4, 3, 'if_exists'),

-- OKRs need vision and strategy
('okrs', 'vision', 1, 1, 'always'),
('okrs', 'strategicContext', 2, 1, 'always'),
('okrs', 'strategic-bet', 3, 3, 'if_exists'),
('okrs', 'roadmap', 4, 1, 'if_exists'),

-- Technical requirements need epics and architecture
('techRequirements', 'epics', 1, NULL, 'always'), -- Parent epic(s)
('techRequirements', 'techStack', 2, NULL, 'always'),
('techRequirements', 'features', 3, 5, 'if_exists'),

-- SWOT needs broad context
('swot-analysis', 'strategicContext', 1, 1, 'always'),
('swot-analysis', 'competitive-analysis', 2, NULL, 'if_exists'),
('swot-analysis', 'market-insight', 3, 5, 'if_exists');

-- Insert summarization strategies for types that might have many cards
INSERT INTO ai_context_strategies (blueprint_type, strategy_type, summarization_prompt, max_tokens_for_summary) VALUES
('problem-statement', 'summarize_all', 
'Summarize all problem statements into key themes and critical issues. Group by severity, user impact, and business impact. Preserve specific details that would affect solution design. Include problem IDs for traceability.', 500),

('epics', 'summarize_all', 
'Summarize all epics into major initiative themes. Group by strategic objective and user impact. Highlight dependencies and sequencing considerations.', 500),

('userJourneys', 'summarize_all', 
'Extract all unique user workflows, pain points, and opportunities. Group by user type and journey stage. Preserve specific friction points that need addressing.', 500),

('competitive-analysis', 'take_recent', 
'Include the 5 most recent competitive analyses. Summarize key competitive threats, opportunities, and strategic responses needed.', 400),

('market-insight', 'take_relevant', 
'Select insights most relevant to the current context. Summarize market trends, opportunities, and threats. Focus on actionable intelligence.', 400);

-- Create a view for easy prompt management
CREATE OR REPLACE VIEW ai_prompt_performance AS
SELECT 
    sp.blueprint_type,
    sp.prompt_name,
    sp.times_used,
    sp.avg_user_rating,
    sp.last_used_at,
    COUNT(gh.id) as total_generations,
    AVG(gh.generation_time_ms) as avg_generation_time_ms,
    SUM(CASE WHEN gh.success THEN 1 ELSE 0 END)::FLOAT / NULLIF(COUNT(gh.id), 0) * 100 as success_rate
FROM ai_system_prompts sp
LEFT JOIN ai_generation_history gh ON sp.blueprint_type = gh.blueprint_type
WHERE sp.is_active = true
GROUP BY sp.blueprint_type, sp.prompt_name, sp.times_used, sp.avg_user_rating, sp.last_used_at;

-- Create helper function to get all context for a blueprint
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
        cm.summarization_required,
        cs.summarization_prompt
    FROM ai_context_mappings cm
    LEFT JOIN ai_context_strategies cs ON cm.context_blueprint = cs.blueprint_type
    WHERE cm.source_blueprint = p_blueprint_type
    ORDER BY cm.priority;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE ai_system_prompts IS 'Stores AI system prompts for each blueprint type';
COMMENT ON TABLE ai_context_mappings IS 'Defines which blueprints provide context for generation';
COMMENT ON TABLE ai_context_strategies IS 'Strategies for summarizing large context sets';
COMMENT ON TABLE ai_generation_history IS 'Tracks all AI generations for analysis and improvement';

COMMENT ON COLUMN ai_system_prompts.blueprint_type IS 'Must match blueprint IDs from registry exactly (e.g., strategicContext, epics)';
COMMENT ON COLUMN ai_context_mappings.inclusion_strategy IS 'always = always include, if_exists = only if cards exist, if_token_budget_allows = include if under token limit';
COMMENT ON COLUMN ai_context_strategies.strategy_type IS 'summarize_all = AI summarizes all cards, take_recent = take N most recent, take_relevant = AI selects most relevant';
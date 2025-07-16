-- PRD Multi-Item Structure Migration
-- Creates tables for structured PRD fields that need multi-item support
-- Created: 2025-01-17

-- Create prd_user_stories table
CREATE TABLE IF NOT EXISTS prd_user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    acceptance_criteria TEXT[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'in_progress', 'completed')),
    story_points INTEGER,
    linked_features TEXT[],
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_functional_requirements table
CREATE TABLE IF NOT EXISTS prd_functional_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    requirement_id TEXT NOT NULL, -- e.g., "REQ-001"
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'implemented')),
    complexity TEXT DEFAULT 'medium' CHECK (complexity IN ('low', 'medium', 'high')),
    dependencies TEXT[],
    linked_user_stories UUID[],
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_acceptance_criteria table
CREATE TABLE IF NOT EXISTS prd_acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    parent_type TEXT NOT NULL CHECK (parent_type IN ('user_story', 'functional_requirement', 'feature')),
    parent_id UUID, -- Can reference user story or requirement
    criteria_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
    test_method TEXT, -- e.g., "manual", "automated", "unit_test"
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_risks table
CREATE TABLE IF NOT EXISTS prd_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    risk_title TEXT NOT NULL,
    risk_description TEXT NOT NULL,
    impact_level TEXT DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
    probability TEXT DEFAULT 'medium' CHECK (probability IN ('low', 'medium', 'high')),
    mitigation_strategy TEXT NOT NULL,
    mitigation_status TEXT DEFAULT 'planned' CHECK (mitigation_status IN ('planned', 'in_progress', 'completed')),
    owner TEXT,
    due_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_milestones table
CREATE TABLE IF NOT EXISTS prd_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    milestone_title TEXT NOT NULL,
    milestone_description TEXT,
    target_date DATE NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    dependencies TEXT[],
    deliverables TEXT[],
    owner TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_dependencies table
CREATE TABLE IF NOT EXISTS prd_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    dependency_title TEXT NOT NULL,
    dependency_description TEXT NOT NULL,
    dependency_type TEXT DEFAULT 'technical' CHECK (dependency_type IN ('technical', 'business', 'external', 'resource')),
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'in_progress', 'resolved', 'blocked')),
    blocking_impact TEXT, -- What this dependency blocks
    owner TEXT,
    target_resolution_date DATE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prd_linked_items table for relationships
CREATE TABLE IF NOT EXISTS prd_linked_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('trd', 'task', 'feature')),
    item_id TEXT NOT NULL, -- External ID reference
    item_title TEXT,
    relationship_type TEXT DEFAULT 'related' CHECK (relationship_type IN ('related', 'depends_on', 'blocks', 'implements')),
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prd_user_stories_card_id ON prd_user_stories(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_user_stories_order ON prd_user_stories(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prd_functional_requirements_card_id ON prd_functional_requirements(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_functional_requirements_order ON prd_functional_requirements(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prd_acceptance_criteria_card_id ON prd_acceptance_criteria(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_acceptance_criteria_parent ON prd_acceptance_criteria(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_prd_risks_card_id ON prd_risks(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_risks_order ON prd_risks(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prd_milestones_card_id ON prd_milestones(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_milestones_order ON prd_milestones(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prd_dependencies_card_id ON prd_dependencies(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_dependencies_order ON prd_dependencies(card_id, order_index);
CREATE INDEX IF NOT EXISTS idx_prd_linked_items_card_id ON prd_linked_items(card_id);
CREATE INDEX IF NOT EXISTS idx_prd_linked_items_type ON prd_linked_items(item_type, item_id);

-- Create update triggers for all tables
CREATE TRIGGER update_prd_user_stories_updated_at 
    BEFORE UPDATE ON prd_user_stories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_functional_requirements_updated_at 
    BEFORE UPDATE ON prd_functional_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_acceptance_criteria_updated_at 
    BEFORE UPDATE ON prd_acceptance_criteria 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_risks_updated_at 
    BEFORE UPDATE ON prd_risks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_milestones_updated_at 
    BEFORE UPDATE ON prd_milestones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_dependencies_updated_at 
    BEFORE UPDATE ON prd_dependencies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prd_linked_items_updated_at 
    BEFORE UPDATE ON prd_linked_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for all tables
ALTER TABLE prd_user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_functional_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE prd_linked_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can access items for cards they own
CREATE POLICY "Users can access user stories for their cards" ON prd_user_stories
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access functional requirements for their cards" ON prd_functional_requirements
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access acceptance criteria for their cards" ON prd_acceptance_criteria
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access risks for their cards" ON prd_risks
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access milestones for their cards" ON prd_milestones
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access dependencies for their cards" ON prd_dependencies
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access linked items for their cards" ON prd_linked_items
    FOR ALL USING (
        card_id IN (
            SELECT c.id FROM cards c
            JOIN strategies s ON c.strategy_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

-- Create a view for easy PRD data retrieval with all related items
CREATE OR REPLACE VIEW prd_card_complete AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.card_data,
    c.created_at,
    c.updated_at,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', us.id,
                'title', us.title,
                'description', us.description,
                'acceptance_criteria', us.acceptance_criteria,
                'priority', us.priority,
                'status', us.status,
                'story_points', us.story_points,
                'linked_features', us.linked_features,
                'order_index', us.order_index
            )
        ) FILTER (WHERE us.id IS NOT NULL),
        '[]'::json
    ) AS user_stories,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', fr.id,
                'requirement_id', fr.requirement_id,
                'title', fr.title,
                'description', fr.description,
                'priority', fr.priority,
                'status', fr.status,
                'complexity', fr.complexity,
                'dependencies', fr.dependencies,
                'linked_user_stories', fr.linked_user_stories,
                'order_index', fr.order_index
            )
        ) FILTER (WHERE fr.id IS NOT NULL),
        '[]'::json
    ) AS functional_requirements,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', r.id,
                'risk_title', r.risk_title,
                'risk_description', r.risk_description,
                'impact_level', r.impact_level,
                'probability', r.probability,
                'mitigation_strategy', r.mitigation_strategy,
                'mitigation_status', r.mitigation_status,
                'owner', r.owner,
                'due_date', r.due_date,
                'order_index', r.order_index
            )
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
    ) AS risks,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', m.id,
                'milestone_title', m.milestone_title,
                'milestone_description', m.milestone_description,
                'target_date', m.target_date,
                'status', m.status,
                'dependencies', m.dependencies,
                'deliverables', m.deliverables,
                'owner', m.owner,
                'order_index', m.order_index
            )
        ) FILTER (WHERE m.id IS NOT NULL),
        '[]'::json
    ) AS milestones,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', d.id,
                'dependency_title', d.dependency_title,
                'dependency_description', d.dependency_description,
                'dependency_type', d.dependency_type,
                'status', d.status,
                'blocking_impact', d.blocking_impact,
                'owner', d.owner,
                'target_resolution_date', d.target_resolution_date,
                'order_index', d.order_index
            )
        ) FILTER (WHERE d.id IS NOT NULL),
        '[]'::json
    ) AS dependencies,
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'id', li.id,
                'item_type', li.item_type,
                'item_id', li.item_id,
                'item_title', li.item_title,
                'relationship_type', li.relationship_type,
                'order_index', li.order_index
            )
        ) FILTER (WHERE li.id IS NOT NULL),
        '[]'::json
    ) AS linked_items
FROM cards c
LEFT JOIN prd_user_stories us ON c.id = us.card_id
LEFT JOIN prd_functional_requirements fr ON c.id = fr.card_id
LEFT JOIN prd_risks r ON c.id = r.card_id
LEFT JOIN prd_milestones m ON c.id = m.card_id
LEFT JOIN prd_dependencies d ON c.id = d.card_id
LEFT JOIN prd_linked_items li ON c.id = li.card_id
WHERE c.card_type = 'prd'
GROUP BY c.id, c.title, c.description, c.card_data, c.created_at, c.updated_at;

-- Grant permissions on the view
GRANT SELECT ON prd_card_complete TO authenticated;
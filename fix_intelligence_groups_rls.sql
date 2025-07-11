-- Fix Row Level Security policies for intelligence_groups table
-- Date: July 11, 2025
-- Purpose: Allow users to manage their own intelligence groups

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own intelligence groups" ON intelligence_groups;
DROP POLICY IF EXISTS "Users can create their own intelligence groups" ON intelligence_groups;
DROP POLICY IF EXISTS "Users can update their own intelligence groups" ON intelligence_groups;
DROP POLICY IF EXISTS "Users can delete their own intelligence groups" ON intelligence_groups;

-- Enable RLS on intelligence_groups table
ALTER TABLE intelligence_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own intelligence groups
CREATE POLICY "Users can view their own intelligence groups" ON intelligence_groups
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own intelligence groups
CREATE POLICY "Users can create their own intelligence groups" ON intelligence_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own intelligence groups
CREATE POLICY "Users can update their own intelligence groups" ON intelligence_groups
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own intelligence groups
CREATE POLICY "Users can delete their own intelligence groups" ON intelligence_groups
    FOR DELETE USING (auth.uid() = user_id);

-- Also fix intelligence_group_cards table RLS policies
DROP POLICY IF EXISTS "Users can view their own group cards" ON intelligence_group_cards;
DROP POLICY IF EXISTS "Users can manage their own group cards" ON intelligence_group_cards;

-- Enable RLS on intelligence_group_cards table
ALTER TABLE intelligence_group_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view group cards for their groups
CREATE POLICY "Users can view their own group cards" ON intelligence_group_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM intelligence_groups 
            WHERE intelligence_groups.id = intelligence_group_cards.group_id 
            AND intelligence_groups.user_id = auth.uid()
        )
    );

-- Policy: Users can manage group cards for their groups
CREATE POLICY "Users can manage their own group cards" ON intelligence_group_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM intelligence_groups 
            WHERE intelligence_groups.id = intelligence_group_cards.group_id 
            AND intelligence_groups.user_id = auth.uid()
        )
    );

-- Verify the user_id column type matches auth.uid() return type
-- The user_id should be UUID, not VARCHAR
-- If it's VARCHAR, we need to fix that

-- Check current column type
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'intelligence_groups' 
AND column_name = 'user_id';

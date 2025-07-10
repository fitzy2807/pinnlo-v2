-- Create executive_summaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.executive_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id INTEGER NOT NULL,
    blueprint_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    cards_count INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one summary per strategy/blueprint/user combination
    CONSTRAINT unique_strategy_blueprint_user UNIQUE (strategy_id, blueprint_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_executive_summaries_strategy_id ON public.executive_summaries(strategy_id);
CREATE INDEX IF NOT EXISTS idx_executive_summaries_blueprint_id ON public.executive_summaries(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_executive_summaries_user_id ON public.executive_summaries(user_id);

-- Enable RLS
ALTER TABLE public.executive_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own summaries" ON public.executive_summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries" ON public.executive_summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" ON public.executive_summaries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" ON public.executive_summaries
    FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_executive_summaries_updated_at BEFORE UPDATE
    ON public.executive_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
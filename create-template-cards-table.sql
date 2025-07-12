-- Create template_cards table for the Template Bank demo
CREATE TABLE IF NOT EXISTS template_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    card_type VARCHAR(50) NOT NULL DEFAULT 'template',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    card_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_template_cards_user_id ON template_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_template_cards_created_at ON template_cards(created_at DESC);

-- Enable RLS
ALTER TABLE template_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own template cards"
    ON template_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own template cards"
    ON template_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own template cards"
    ON template_cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own template cards"
    ON template_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_template_cards_updated_at 
    BEFORE UPDATE ON template_cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some demo cards for testing
INSERT INTO template_cards (user_id, title, description, card_type, priority, card_data)
SELECT 
    auth.uid(),
    'Demo Template Card ' || generate_series,
    'This is a demonstration card for the Template Bank section',
    'template',
    CASE 
        WHEN generate_series % 3 = 0 THEN 'high'
        WHEN generate_series % 3 = 1 THEN 'medium'
        ELSE 'low'
    END,
    jsonb_build_object(
        'example_field', 'Example value ' || generate_series,
        'tags', ARRAY['demo', 'template'],
        'custom_data', jsonb_build_object(
            'field1', 'value1',
            'field2', generate_series * 10
        )
    )
FROM generate_series(1, 5)
WHERE auth.uid() IS NOT NULL;

-- Check and apply Strategy Creator migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategy_creator_sessions') THEN
        RAISE NOTICE 'Creating Strategy Creator tables...';
        
        -- Strategy Creator Sessions table
        CREATE TABLE strategy_creator_sessions (
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
        CREATE TABLE strategy_creator_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
          session_id UUID REFERENCES strategy_creator_sessions(id) ON DELETE SET NULL,
          
          -- Action details
          action_type TEXT NOT NULL,
          action_data JSONB DEFAULT '{}',
          
          -- Results
          success BOOLEAN DEFAULT true,
          error_message TEXT,
          
          -- Metadata
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add indexes
        CREATE INDEX idx_strategy_creator_sessions_user_id ON strategy_creator_sessions(user_id);
        CREATE INDEX idx_strategy_creator_sessions_strategy_id ON strategy_creator_sessions(strategy_id);
        CREATE INDEX idx_strategy_creator_sessions_expires_at ON strategy_creator_sessions(expires_at);
        CREATE INDEX idx_strategy_creator_history_user_id ON strategy_creator_history(user_id);
        CREATE INDEX idx_strategy_creator_history_session_id ON strategy_creator_history(session_id);
        CREATE INDEX idx_strategy_creator_history_created_at ON strategy_creator_history(created_at);
        
        -- Enable RLS
        ALTER TABLE strategy_creator_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE strategy_creator_history ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policies
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
        
        CREATE POLICY "Users can view their own history"
          ON strategy_creator_history FOR SELECT
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create their own history"
          ON strategy_creator_history FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        
        -- Create update trigger
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
        
        RAISE NOTICE 'Strategy Creator tables created successfully!';
    ELSE
        RAISE NOTICE 'Strategy Creator tables already exist.';
    END IF;
END $$;

-- Check and apply Intelligence Groups migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intelligence_groups') THEN
        RAISE NOTICE 'Creating Intelligence Groups tables...';
        
        -- Intelligence Groups table
        CREATE TABLE intelligence_groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          color VARCHAR(7) DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          card_count INTEGER DEFAULT 0,
          last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Intelligence Group Cards junction table
        CREATE TABLE intelligence_group_cards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID REFERENCES intelligence_groups(id) ON DELETE CASCADE NOT NULL,
          card_id UUID REFERENCES intelligence_cards(id) ON DELETE CASCADE NOT NULL,
          added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          UNIQUE(group_id, card_id)
        );
        
        -- Add indexes
        CREATE INDEX idx_intelligence_groups_user_id ON intelligence_groups(user_id);
        CREATE INDEX idx_intelligence_groups_last_used ON intelligence_groups(last_used_at DESC);
        CREATE INDEX idx_intelligence_group_cards_group_id ON intelligence_group_cards(group_id);
        CREATE INDEX idx_intelligence_group_cards_card_id ON intelligence_group_cards(card_id);
        
        -- Enable RLS
        ALTER TABLE intelligence_groups ENABLE ROW LEVEL SECURITY;
        ALTER TABLE intelligence_group_cards ENABLE ROW LEVEL SECURITY;
        
        -- RLS Policies for intelligence_groups
        CREATE POLICY "Users can view their own groups"
          ON intelligence_groups FOR SELECT
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create their own groups"
          ON intelligence_groups FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own groups"
          ON intelligence_groups FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own groups"
          ON intelligence_groups FOR DELETE
          USING (auth.uid() = user_id);
        
        -- RLS Policies for intelligence_group_cards
        CREATE POLICY "Users can view cards in their groups"
          ON intelligence_group_cards FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM intelligence_groups
              WHERE intelligence_groups.id = intelligence_group_cards.group_id
              AND intelligence_groups.user_id = auth.uid()
            )
          );
        
        CREATE POLICY "Users can add cards to their groups"
          ON intelligence_group_cards FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM intelligence_groups
              WHERE intelligence_groups.id = group_id
              AND intelligence_groups.user_id = auth.uid()
            )
          );
        
        CREATE POLICY "Users can remove cards from their groups"
          ON intelligence_group_cards FOR DELETE
          USING (
            EXISTS (
              SELECT 1 FROM intelligence_groups
              WHERE intelligence_groups.id = intelligence_group_cards.group_id
              AND intelligence_groups.user_id = auth.uid()
            )
          );
        
        -- Create trigger to update card_count
        CREATE OR REPLACE FUNCTION update_group_card_count()
        RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            UPDATE intelligence_groups 
            SET card_count = card_count + 1,
                last_used_at = NOW()
            WHERE id = NEW.group_id;
          ELSIF TG_OP = 'DELETE' THEN
            UPDATE intelligence_groups 
            SET card_count = GREATEST(0, card_count - 1),
                last_used_at = NOW()
            WHERE id = OLD.group_id;
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_group_card_count_trigger
          AFTER INSERT OR DELETE ON intelligence_group_cards
          FOR EACH ROW
          EXECUTE FUNCTION update_group_card_count();
        
        -- Create trigger for updated_at
        CREATE TRIGGER update_intelligence_groups_updated_at
          BEFORE UPDATE ON intelligence_groups
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'Intelligence Groups tables created successfully!';
    ELSE
        RAISE NOTICE 'Intelligence Groups tables already exist.';
    END IF;
END $$;
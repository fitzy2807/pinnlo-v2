# Intelligence Card Template System - Implementation Plan

## 🎯 Project Overview
**Objective**: Create the foundational Intelligence Card template system for the Intelligence Bank, enabling storage and management of intelligence across 5 different input sources.

**Scope**: Database schema, React components, TypeScript interfaces, and CRUD operations for Intelligence Cards - NO changes to existing Strategy Cards, Blueprint system, or workspace functionality.

**Key Context**: Intelligence Bank is now global (not tied to specific strategies), simplifying our card management system.

## 📋 Phase 1: Database Schema & Types
**Duration**: 1-2 hours  
**Risk Level**: LOW (New table creation only)

### Success Criteria
- [ ] Intelligence Cards table created with all template fields
- [ ] RLS policies implemented for security
- [ ] TypeScript interfaces defined
- [ ] Database indexes optimized for performance

### Task 1.1: Create Intelligence Cards Database Table
**File**: `/supabase/migrations/20250108_intelligence_cards_system.sql`

```sql
-- Intelligence Cards table structure
CREATE TABLE intelligence_cards (
  -- Core fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL CHECK (category IN ('market', 'competitor', 'trends', 'technology', 'stakeholder', 'consumer', 'risk', 'opportunities')),
  
  -- Template fields
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  intelligence_content TEXT NOT NULL,
  key_findings TEXT[] DEFAULT '{}',
  source_reference VARCHAR(500),
  date_accessed TIMESTAMPTZ,
  credibility_score INTEGER CHECK (credibility_score >= 1 AND credibility_score <= 10),
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
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

-- Indexes for performance
CREATE INDEX idx_intelligence_cards_user_id ON intelligence_cards(user_id);
CREATE INDEX idx_intelligence_cards_category ON intelligence_cards(category);
CREATE INDEX idx_intelligence_cards_status ON intelligence_cards(status);
CREATE INDEX idx_intelligence_cards_created_at ON intelligence_cards(created_at DESC);
CREATE INDEX idx_intelligence_cards_tags ON intelligence_cards USING GIN(tags);

-- RLS Policies
ALTER TABLE intelligence_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intelligence cards"
  ON intelligence_cards FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create intelligence cards"
  ON intelligence_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own intelligence cards"
  ON intelligence_cards FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own intelligence cards"
  ON intelligence_cards FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Update trigger
CREATE TRIGGER update_intelligence_cards_updated_at
  BEFORE UPDATE ON intelligence_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Task 1.2: Create TypeScript Interfaces
**File**: `/src/types/intelligence-cards.ts`

```typescript
/**
 * Intelligence Card category types
 */
export enum IntelligenceCardCategory {
  MARKET = 'market',
  COMPETITOR = 'competitor',
  TRENDS = 'trends',
  TECHNOLOGY = 'technology',
  STAKEHOLDER = 'stakeholder',
  CONSUMER = 'consumer',
  RISK = 'risk',
  OPPORTUNITIES = 'opportunities'
}

/**
 * Intelligence Card status types
 */
export enum IntelligenceCardStatus {
  ACTIVE = 'active',
  SAVED = 'saved',
  ARCHIVED = 'archived'
}

/**
 * Complete Intelligence Card interface matching database schema
 */
export interface IntelligenceCard {
  id: string
  user_id: string
  category: IntelligenceCardCategory
  title: string
  summary: string
  intelligence_content: string
  key_findings: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number
  relevance_score?: number
  relevant_blueprint_pages: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags: string[]
  status: IntelligenceCardStatus
  created_at: string
  updated_at: string
}

/**
 * Data required to create a new Intelligence Card
 */
export interface CreateIntelligenceCardData {
  category: IntelligenceCardCategory
  title: string
  summary: string
  intelligence_content: string
  key_findings?: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number
  relevance_score?: number
  relevant_blueprint_pages?: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags?: string[]
  status?: IntelligenceCardStatus
}

/**
 * Data for updating an existing Intelligence Card
 */
export interface UpdateIntelligenceCardData {
  title?: string
  summary?: string
  intelligence_content?: string
  key_findings?: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number
  relevance_score?: number
  relevant_blueprint_pages?: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags?: string[]
  status?: IntelligenceCardStatus
}

/**
 * Filters for loading Intelligence Cards
 */
export interface IntelligenceCardFilters {
  category?: IntelligenceCardCategory
  status?: IntelligenceCardStatus
  tags?: string[]
  limit?: number
  offset?: number
  searchQuery?: string
}
```

## 📋 Phase 2: CRUD API Functions
**Duration**: 2-3 hours  
**Risk Level**: LOW (New API files only)

### Task 2.1: Create Intelligence Card CRUD API
**File**: `/src/lib/intelligence-cards-api.ts`

Key functions to implement:
- `createIntelligenceCard(cardData: CreateIntelligenceCardData)`
- `loadIntelligenceCards(filters?: IntelligenceCardFilters)`
- `loadIntelligenceCard(id: string)`
- `updateIntelligenceCard(id: string, updates: UpdateIntelligenceCardData)`
- `deleteIntelligenceCard(id: string)`
- `archiveIntelligenceCard(id: string)`
- `saveIntelligenceCard(id: string)`

### Task 2.2: Add Intelligence Card Hooks
**File**: `/src/hooks/useIntelligenceCards.ts`

React hooks following existing patterns:
- `useIntelligenceCards(filters?)` - Load and manage cards list
- `useIntelligenceCard(id)` - Load single card
- `useCreateIntelligenceCard()` - Create new card
- `useUpdateIntelligenceCard()` - Update existing card

## 📋 Phase 3: Intelligence Card Components
**Duration**: 3-4 hours  
**Risk Level**: MEDIUM (New React components)

### Task 3.1: Create Intelligence Card Component
**File**: `/src/components/intelligence-cards/IntelligenceCard.tsx`

Features:
- Collapsed view showing title, summary, category badge
- Expanded view with all template fields
- Action buttons (Save, Archive, Delete, Edit)
- Similar design to MasterCard but optimized for intelligence

### Task 3.2: Create Intelligence Card Editor
**File**: `/src/components/intelligence-cards/IntelligenceCardEditor.tsx`

Form fields:
- Category selection (dropdown)
- Title (text input)
- Summary (textarea)
- Intelligence content (rich textarea)
- Key findings (tag input)
- Source reference (text input)
- Date accessed (date picker)
- Credibility score (1-10 slider)
- Relevance score (1-10 slider)
- Blueprint pages (multi-select)
- Strategic implications (textarea)
- Recommended actions (textarea)
- Tags (tag input)

### Task 3.3: Create Intelligence Card List
**File**: `/src/components/intelligence-cards/IntelligenceCardList.tsx`

Features:
- Grid/list view toggle
- Filtering by category, status, tags
- Sorting options
- Search functionality
- Empty states
- Loading states

## 📋 Phase 4: Intelligence Bank Integration
**Duration**: 2-3 hours  
**Risk Level**: MEDIUM (Modifying existing component)

### Task 4.1: Update Intelligence Bank Categories
**File**: `/src/components/intelligence-bank/IntelligenceBank.tsx`

Modifications:
- Update `IntelligenceCardsContent` to load actual cards
- Add "Create New Card" button
- Update card counts in sidebar
- Handle empty states

### Task 4.2: Add Manual Card Creation Flow
Add modal/drawer for creating new intelligence cards:
- Opens IntelligenceCardEditor
- Pre-selects current category
- Handles save/cancel
- Updates card list after creation

## 📋 Phase 5: Testing & Validation
**Duration**: 1-2 hours  
**Risk Level**: LOW (Testing only)

### Test Scenarios
1. Complete card lifecycle (create → view → edit → save/archive → delete)
2. All template fields persist correctly
3. Category filtering and organization
4. No regressions in Intelligence Bank

### Test Data
**File**: `/tests/intelligence-cards-test-data.json`

Sample cards for each category with realistic data.

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Intelligence   │────▶│   Card CRUD      │────▶│    Supabase     │
│  Bank UI        │     │   API Layer      │     │   Database      │
│                 │◀────│                  │◀────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                  │
        └────────── React Hooks & State ──────────────────┘
```

## 🔒 Security Considerations
- RLS policies ensure users only see their own cards
- Input validation on both client and server
- Sanitization of HTML content if rich text is used
- Rate limiting for card creation

## 📈 Performance Optimizations
- Pagination for large card sets
- Debounced search
- Optimistic updates for better UX
- Indexed database queries
- Lazy loading of expanded card content

## 🎯 Success Metrics
- All CRUD operations functional
- < 200ms response time for card operations
- Seamless integration with Intelligence Bank
- No impact on existing functionality
- Intuitive user experience

## 🚀 Future Enhancements (Post-MVP)
1. Bulk operations (select multiple cards)
2. Card templates for common patterns
3. Export functionality (PDF, CSV)
4. Card sharing between team members
5. Version history for cards
6. AI-powered card generation from URLs/documents
7. Card relationships and linking
8. Advanced search with filters

## 📝 Implementation Notes
- Follow existing PINNLO design patterns
- Use existing color scheme and component styles
- Maintain TypeScript strict mode compliance
- Include proper error boundaries
- Add loading and error states throughout
- Ensure mobile responsiveness

This plan provides a clear roadmap for implementing the Intelligence Card Template System while maintaining strict boundaries around existing functionality.
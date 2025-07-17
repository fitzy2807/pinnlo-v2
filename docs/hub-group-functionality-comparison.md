# Hub Group Functionality Comparison

## Overview

This document provides a comprehensive comparison of how group functionality works across the three main hubs in PINNLO V2: Intelligence Hub, Strategy Hub, Development Hub, and Organisation Hub. Each hub implements grouping differently based on their specific use cases and data models.

## Summary Table

| Feature | Intelligence Hub | Strategy Hub | Development Hub | Organisation Hub |
|---------|------------------|--------------|-----------------|------------------|
| **Data Model** | Junction table | Array-based | No groups | Junction table |
| **Database Tables** | `intelligence_groups` + `intelligence_group_cards` | `strategy_groups` + `cards.group_ids` | N/A | `organisation_groups` + `organisation_group_cards` |
| **Scope** | User-specific | Strategy-specific | N/A | User-specific |
| **Card Relationship** | Many-to-many | Many-to-many | N/A | Many-to-many |
| **UI Integration** | Full CRUD interface | Full CRUD interface | N/A | Full CRUD interface |
| **State Management** | `useIntelligenceGroups` hook | `useStrategyGroups` hook | N/A | `useOrganisationGroups` hook |

## 1. Intelligence Hub Groups

### Architecture
- **Database Schema**: Junction table pattern
  - `intelligence_groups`: Group metadata (id, user_id, name, description, color)
  - `intelligence_group_cards`: Many-to-many relationships (group_id, card_id)
- **Scope**: User-specific (groups belong to individual users)
- **Hook**: `useIntelligenceGroups` (`/src/hooks/useIntelligenceGroups.ts`)

### Data Model
```typescript
interface IntelligenceGroup {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  card_count?: number
}

interface IntelligenceGroupCard {
  id: string
  group_id: string
  card_id: string
  created_at: string
}
```

### Key Features
- **CRUD Operations**: Full create, read, update, delete for groups
- **Bulk Actions**: Add multiple cards to groups simultaneously
- **Card Management**: Add/remove individual cards from groups
- **Color Coding**: Visual group identification with color system
- **Search & Filter**: Group-based card filtering and search
- **Real-time Updates**: Optimistic UI updates with server sync

### Implementation Details
- **Component**: `/src/components/intelligence-bank/IntelligenceBank.tsx`
- **Groups Interface**: `/src/components/intelligence-groups/IntelligenceGroups.tsx`
- **Card Operations**: Uses junction table for many-to-many relationships
- **Authentication**: Row Level Security (RLS) policies filter by user_id
- **UI Pattern**: Sidebar navigation with expandable group views

### Database Queries
```sql
-- Load user groups with card counts
SELECT * FROM intelligence_groups_with_counts 
WHERE user_id = ? 
ORDER BY created_at DESC

-- Get cards in a group
SELECT ic.*, igc.id as group_card_id 
FROM intelligence_group_cards igc
JOIN intelligence_cards ic ON igc.card_id = ic.id
WHERE igc.group_id = ?
```

## 2. Strategy Hub Groups

### Architecture
- **Database Schema**: Array-based pattern
  - `strategy_groups`: Group metadata (id, strategy_id, name, color)
  - `cards.group_ids`: JSONB array field containing group IDs
- **Scope**: Strategy-specific (groups belong to individual strategies)
- **Hook**: `useStrategyGroups` (`/src/hooks/useStrategyGroups.ts`)

### Data Model
```typescript
interface StrategyGroup {
  id: string
  strategy_id: number
  name: string
  color: string
  created_at: string
  updated_at: string
  card_count?: number
}

// Cards have group_ids as JSONB array
interface Card {
  id: string
  strategy_id: number
  group_ids: string[] // Array of group IDs
  // ... other fields
}
```

### Key Features
- **Strategy-Scoped**: Groups are tied to specific strategies
- **Array-Based Storage**: Cards store group membership as array field
- **Blueprint Integration**: Works with blueprint-based card organization
- **Drag & Drop**: Support for blueprint reordering
- **Color System**: Visual group identification
- **RPC Functions**: Uses stored procedures for complex operations

### Implementation Details
- **Component**: `/src/components/strategy-bank/StrategyBank.tsx`
- **Card Operations**: Modifies `group_ids` array on cards table
- **Blueprint System**: Integrates with strategy blueprint configuration
- **UI Pattern**: Sidebar with blueprints and groups sections

### Database Queries
```sql
-- Load strategy groups with counts
SELECT * FROM strategy_groups_with_counts 
WHERE strategy_id = ? 
ORDER BY created_at ASC

-- Add card to group (update array)
UPDATE cards 
SET group_ids = group_ids || ?::text 
WHERE id = ? AND NOT (group_ids @> ?::text[])

-- Remove group from all cards (RPC function)
CALL remove_group_from_all_cards(group_id_param)
```

### Unique Features
- **RPC Integration**: Uses `remove_group_from_all_cards` stored procedure
- **Blueprint Manager**: Integrated blueprint configuration tool
- **Agent Tools**: AI-powered card generation with group targeting

## 3. Development Hub

### Architecture
- **No Group System**: Development Hub does not implement card grouping
- **Focus**: Technical specifications and tech stack management
- **Organization**: Tab-based (Tech Stack, Specifications, Assets)

### Key Features
- **Tech Stack Management**: Technology selection and configuration
- **Specification Generation**: Technical documentation creation
- **Asset Management**: (Coming soon)
- **No Card Groups**: Uses different organizational paradigm

### Implementation Details
- **Component**: `/src/components/development-bank/DevelopmentBank.tsx`
- **Service**: `DevelopmentBankService` for tech stack operations
- **Data Types**: `TechStackSelection`, `DevBankAsset`
- **UI Pattern**: Tab-based interface with sidebar lists

### Why No Groups?
Development Hub focuses on technical architecture rather than card organization:
- Tech stacks are inherently hierarchical (layers)
- Specifications are version-controlled documents
- Different mental model from card-based organization

## 4. Organisation Hub Groups

### Architecture
- **Database Schema**: Junction table pattern (identical to Intelligence Hub)
  - `organisation_groups`: Group metadata
  - `organisation_group_cards`: Many-to-many relationships
- **Scope**: User-specific (groups belong to individual users)
- **Hook**: `useOrganisationGroups` (`/src/hooks/organisation/useOrganisationGroups.ts`)

### Data Model
```typescript
interface OrganisationGroup {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  card_count?: number
}

interface OrganisationGroupCard {
  id: string
  group_id: string
  card_id: string
  created_at: string
}
```

### Key Features
- **Identical to Intelligence Hub**: Same CRUD operations and UI patterns
- **Organisation Cards**: Works with organisation-specific card types
- **User-Scoped**: Groups are user-specific, not organisation-specific
- **Full Feature Parity**: Same functionality as Intelligence Hub groups

### Implementation Details
- **Component**: Organisation Hub equivalent (not examined in detail)
- **Hook**: `/src/hooks/organisation/useOrganisationGroups.ts`
- **Database**: Uses `organisation_groups_with_counts` view
- **Card Types**: Works with `organisation_cards` table

## Architecture Patterns Comparison

### 1. Junction Table Pattern (Intelligence & Organisation Hubs)

**Advantages:**
- Clean separation of concerns
- Flexible many-to-many relationships
- Easy to query and maintain
- Supports complex relationships
- Better data integrity

**Disadvantages:**
- More complex queries
- Additional table management
- Slightly more database overhead

**Use Case:** When cards can belong to multiple groups and groups can contain multiple cards with flexible relationships.

### 2. Array-Based Pattern (Strategy Hub)

**Advantages:**
- Simpler data model
- Fewer joins required
- JSONB array operations in PostgreSQL
- Direct card-group relationship

**Disadvantages:**
- Less flexible querying
- Harder to maintain referential integrity
- JSONB operations can be complex
- Potential for orphaned references

**Use Case:** When group membership is simpler and tightly coupled to the primary entity (strategy).

### 3. No Groups Pattern (Development Hub)

**Advantages:**
- Simpler implementation
- Focus on core functionality
- Different organizational paradigm

**Disadvantages:**
- Less organizational flexibility
- No card grouping capabilities

**Use Case:** When the domain doesn't benefit from ad-hoc grouping (technical specifications are naturally hierarchical).

## UI/UX Patterns

### Sidebar Navigation
All hubs with groups use consistent sidebar patterns:
- **Intelligence Hub**: Categories → Agents → Groups
- **Strategy Hub**: Tools → Blueprints → Groups  
- **Organisation Hub**: Similar to Intelligence Hub
- **Development Hub**: Tabs → Lists (no groups)

### Color Systems
Groups across hubs use consistent color palettes:
- Blue, Green, Purple, Red, Yellow, Gray
- Visual indicators in sidebar and card displays
- Color picker interfaces for group creation

### Card Operations
- **Bulk Actions**: Multi-select and group assignment
- **Drag & Drop**: (Strategy Hub has blueprint reordering)
- **Context Menus**: Right-click operations for group management
- **Modal Interfaces**: Group creation and editing forms

## Database Schema Differences

### Intelligence Hub Schema
```sql
CREATE TABLE intelligence_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE intelligence_group_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES intelligence_groups(id) ON DELETE CASCADE,
  card_id UUID REFERENCES intelligence_cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, card_id)
);
```

### Strategy Hub Schema
```sql
CREATE TABLE strategy_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id INTEGER REFERENCES strategies(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table has group_ids JSONB array field
ALTER TABLE cards ADD COLUMN group_ids JSONB DEFAULT '[]';
```

### Organisation Hub Schema
```sql
-- Identical to Intelligence Hub but with organisation_ prefix
CREATE TABLE organisation_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organisation_group_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES organisation_groups(id) ON DELETE CASCADE,
  card_id UUID REFERENCES organisation_cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, card_id)
);
```

## Performance Considerations

### Junction Table Pattern
- **Pros**: Efficient joins, good indexing support
- **Cons**: Additional table overhead
- **Optimization**: Composite indexes on (group_id, card_id)

### Array Pattern
- **Pros**: Single table queries, JSONB indexing
- **Cons**: Complex array operations, potential for large arrays
- **Optimization**: GIN indexes on group_ids JSONB field

## Security & Permissions

### Row Level Security (RLS)
All group systems implement RLS policies:

```sql
-- Intelligence & Organisation Hubs
CREATE POLICY "Users can only see their own groups" 
ON intelligence_groups FOR ALL USING (auth.uid() = user_id);

-- Strategy Hub
CREATE POLICY "Users can access strategy groups" 
ON strategy_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM strategies 
    WHERE id = strategy_id 
    AND user_id = auth.uid()
  )
);
```

## Migration Considerations

### From Array to Junction Table
If migrating Strategy Hub to junction table pattern:

```sql
-- Create junction table
CREATE TABLE strategy_group_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES strategy_groups(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data
INSERT INTO strategy_group_cards (group_id, card_id)
SELECT unnest(group_ids::text[])::uuid, id
FROM cards 
WHERE group_ids IS NOT NULL AND group_ids != '[]';

-- Remove old column
ALTER TABLE cards DROP COLUMN group_ids;
```

### From Junction Table to Array
If migrating Intelligence Hub to array pattern:

```sql
-- Add array column
ALTER TABLE intelligence_cards ADD COLUMN group_ids JSONB DEFAULT '[]';

-- Migrate data
UPDATE intelligence_cards 
SET group_ids = (
  SELECT COALESCE(json_agg(group_id), '[]'::json)
  FROM intelligence_group_cards 
  WHERE card_id = intelligence_cards.id
);

-- Drop junction table
DROP TABLE intelligence_group_cards;
```

## Best Practices

### When to Use Each Pattern

**Junction Table Pattern:**
- Complex many-to-many relationships
- Need for referential integrity
- Metadata on relationships
- Frequent group membership queries
- User-scoped grouping

**Array Pattern:**
- Simpler relationships
- Primary entity ownership (strategy-scoped)
- Fewer group operations
- Performance-critical scenarios
- JSONB query capabilities

**No Groups:**
- Domain doesn't benefit from grouping
- Alternative organizational paradigms
- Focus on core functionality

### Development Guidelines

1. **Consistency**: Use similar patterns within the same domain
2. **Performance**: Consider query patterns and indexing
3. **Scalability**: Plan for growth in group and card counts
4. **Security**: Implement proper RLS policies
5. **UI/UX**: Maintain consistent interaction patterns
6. **Testing**: Comprehensive testing of group operations

## Future Considerations

### Potential Unification
Consider standardizing on junction table pattern across all hubs:
- **Pros**: Consistent data model, easier maintenance, better flexibility
- **Cons**: Migration effort, potential performance impact

### Enhanced Features
- **Nested Groups**: Hierarchical group structures
- **Group Permissions**: Shared groups with access controls
- **Group Templates**: Predefined group structures
- **Group Analytics**: Usage metrics and insights
- **Cross-Hub Groups**: Groups that span multiple hubs

## Conclusion

Each hub implements groups differently based on their specific requirements:

- **Intelligence Hub**: Full-featured junction table pattern for flexible user-specific grouping
- **Strategy Hub**: Array-based pattern for strategy-scoped group management with blueprint integration
- **Development Hub**: No groups, focusing on technical architecture organization
- **Organisation Hub**: Junction table pattern identical to Intelligence Hub for organisation-specific cards

The choice of pattern depends on the specific use case, scalability requirements, and domain model. Junction table patterns offer more flexibility and better data integrity, while array patterns provide simpler queries for basic use cases. The Development Hub's approach shows that groups aren't always necessary when the domain has alternative organizational paradigms.
# Intelligence Groups System Documentation

## Overview

The Intelligence Groups System is a comprehensive feature within the PINNLO V2 Intelligence Hub that allows users to organize intelligence cards into logical groups for better analysis and strategic planning. This system provides full CRUD (Create, Read, Update, Delete) operations for groups and enables users to manage card memberships within those groups.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Frontend Components](#frontend-components)
4. [Hooks and State Management](#hooks-and-state-management)
5. [User Interface Flow](#user-interface-flow)
6. [Security and Authentication](#security-and-authentication)
7. [API Integration](#api-integration)
8. [Testing and Debugging](#testing-and-debugging)
9. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
10. [Development Guidelines](#development-guidelines)

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Intelligence Hub                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Intelligence    │  │ Intelligence    │                  │
│  │ Cards           │  │ Groups          │                  │
│  │                 │  │                 │                  │
│  │ - Market        │  │ - Group CRUD    │                  │
│  │ - Competitor    │  │ - Card Mgmt     │                  │
│  │ - Technology    │  │ - Permissions   │                  │
│  │ - etc.          │  │ - Navigation    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Database                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ intelligence_    │  │ intelligence_    │                │
│  │ groups           │  │ group_cards      │                │
│  │                  │  │ (Junction)       │                │
│  │ - id             │  │ - group_id       │                │
│  │ - user_id        │  │ - card_id        │                │
│  │ - name           │  │ - position       │                │
│  │ - description    │  │ - added_at       │                │
│  │ - color          │  │ - added_by       │                │
│  │ - card_count     │  └──────────────────┘                │
│  │ - created_at     │                                       │
│  │ - updated_at     │                                       │
│  │ - last_used_at   │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **State Management**: React Hooks with local component state
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Database Schema

### Tables Structure

#### `intelligence_groups` Table

```sql
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
```

#### `intelligence_group_cards` Table (Junction Table)

```sql
CREATE TABLE intelligence_group_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES intelligence_groups(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES intelligence_cards(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  position INTEGER DEFAULT 0,
  UNIQUE(group_id, card_id)
);
```

### Database Indexes

```sql
-- Intelligence Groups indexes
CREATE INDEX idx_intelligence_groups_user_id ON intelligence_groups(user_id);
CREATE INDEX idx_intelligence_groups_last_used ON intelligence_groups(last_used_at DESC);

-- Intelligence Group Cards indexes
CREATE INDEX idx_intelligence_group_cards_group_id ON intelligence_group_cards(group_id);
CREATE INDEX idx_intelligence_group_cards_card_id ON intelligence_group_cards(card_id);
```

### Row Level Security (RLS) Policies

#### intelligence_groups policies:
- Users can only view, create, update, and delete their own groups
- All operations filtered by `user_id = auth.uid()`

#### intelligence_group_cards policies:
- Users can only manage cards in groups they own
- Junction table access controlled via group ownership

### Database Triggers

#### Auto-update card_count:
```sql
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
```

## Frontend Components

### Component Hierarchy

```
IntelligenceBank.tsx
├── IntelligenceGroups.tsx (Main groups interface)
│   ├── GroupCard.tsx (Individual group display)
│   │   └── GroupCardItem.tsx (Cards within groups)
│   ├── GroupCreator.tsx (Create new group modal)
│   └── GroupEditor.tsx (Edit existing group modal)
└── CardGroupSelector.tsx (Bulk add cards to groups)
```

### Key Components

#### 1. IntelligenceBank.tsx
- **Location**: `src/components/intelligence-bank/IntelligenceBank.tsx`
- **Purpose**: Main container for the Intelligence Hub
- **Key Features**:
  - Navigation between categories and groups
  - State management for current view type (category vs group)
  - Integration point for all intelligence functionality

#### 2. IntelligenceGroups.tsx
- **Location**: `src/components/intelligence-groups/IntelligenceGroups.tsx`
- **Purpose**: Main interface for viewing and managing groups
- **Key Features**:
  - Search functionality
  - View mode toggle (grid/list)
  - Group creation trigger
  - Bulk card selection

#### 3. GroupCard.tsx
- **Location**: `src/components/intelligence-groups/GroupCard.tsx`
- **Purpose**: Display individual groups with expandable card view
- **Key Features**:
  - Expandable/collapsible card list
  - Individual card management (remove from group)
  - Bulk card selection within group
  - Edit/delete group actions

#### 4. GroupCreator.tsx
- **Location**: `src/components/intelligence-groups/GroupCreator.tsx`
- **Purpose**: Modal for creating new groups
- **Key Features**:
  - Form validation
  - Color picker
  - Error handling

#### 5. GroupEditor.tsx
- **Location**: `src/components/intelligence-groups/GroupEditor.tsx`
- **Purpose**: Modal for editing existing groups
- **Key Features**:
  - Pre-populated form data
  - Change detection
  - Metadata display

#### 6. CardGroupSelector.tsx
- **Location**: `src/components/intelligence-groups/CardGroupSelector.tsx`
- **Purpose**: Bulk action modal for adding cards to groups
- **Key Features**:
  - Multiple group selection
  - Batch operations
  - Progress feedback

## Hooks and State Management

### useIntelligenceGroups Hook

**Location**: `src/hooks/useIntelligenceGroups.ts`

**Purpose**: Central state management for all group operations

**Key Functions**:

```typescript
interface useIntelligenceGroups {
  // State
  groups: IntelligenceGroup[]
  isLoading: boolean
  error: string | null
  
  // CRUD Operations
  loadGroups: () => Promise<void>
  createGroup: (data: CreateGroupData) => Promise<IntelligenceGroup | null>
  updateGroup: (id: string, data: UpdateGroupData) => Promise<boolean>
  deleteGroup: (id: string) => Promise<boolean>
  
  // Card Management
  getGroupCards: (groupId: string) => Promise<GroupCard[]>
  addCardsToGroup: (groupId: string, cardIds: string[]) => Promise<boolean>
  removeCardFromGroup: (groupId: string, cardId: string) => Promise<boolean>
}
```

**Key Implementation Details**:

1. **User Authentication**: Always checks for authenticated user before operations
2. **RLS Compliance**: Filters all queries by user_id
3. **Error Handling**: Comprehensive error catching and user feedback
4. **Real-time Updates**: Local state updates for immediate UI feedback

### State Flow

```
User Action → Hook Function → Supabase Query → Local State Update → UI Re-render
     ↓              ↓              ↓              ↓              ↓
  Click Edit → updateGroup() → UPDATE query → setGroups() → Modal closes
```

## User Interface Flow

### Navigation Flow

1. **Access Groups**: User clicks "Groups" in Intelligence Hub sidebar
2. **View Selection**: Choose between grid or list view
3. **Group Operations**:
   - **Create**: Click "New Group" → Fill form → Save
   - **View**: Click group to expand and see cards
   - **Edit**: Click edit icon → Modify in modal → Save
   - **Delete**: Click delete icon → Confirm → Remove

### Card Management Flow

1. **Add Cards to Group**:
   - Select cards using checkboxes
   - Click group action button
   - Choose target groups
   - Confirm bulk action

2. **Remove Cards from Group**:
   - Expand group view
   - Click "LogOut" icon on specific card
   - Card removed from group (but preserved in system)

### Visual States

- **Loading States**: Spinners during data fetching
- **Empty States**: Helpful messages when no groups exist
- **Error States**: User-friendly error messages
- **Success Feedback**: Toast notifications for completed actions

## Security and Authentication

### Authentication Requirements

- Users must be authenticated to access any group functionality
- All group operations require valid user session
- Unauthenticated users see empty states

### Row Level Security (RLS)

```sql
-- Example RLS policy
CREATE POLICY "Users can view their own groups"
  ON intelligence_groups FOR SELECT
  USING (auth.uid() = user_id);
```

### Data Access Patterns

1. **Groups**: Users can only access their own groups
2. **Cards in Groups**: Users can only manage cards in groups they own
3. **Junction Records**: Controlled via group ownership

### Security Best Practices

- Never trust client-side data
- Always validate user ownership server-side
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing system details

## API Integration

### Supabase Client Usage

```typescript
// Example group creation
const { data, error } = await supabase
  .from('intelligence_groups')
  .insert({
    user_id: user.id,
    name: groupData.name,
    description: groupData.description,
    color: groupData.color,
    card_count: 0,
    last_used_at: new Date().toISOString()
  })
  .select()
  .single()
```

### Error Handling Patterns

```typescript
try {
  const result = await supabaseOperation()
  // Handle success
  setGroups(result.data)
  toast.success('Operation completed')
} catch (err: any) {
  console.error('Operation failed:', err)
  setError(err.message)
  toast.error('Operation failed')
}
```

## Testing and Debugging

### Debug Mode

The system includes comprehensive console logging for debugging:

```typescript
console.log('🔍 Loading intelligence groups...')
console.log('🔍 Auth user:', user?.id || 'No user')
console.log('🔍 Groups query result:', { data, error })
console.log('🔍 Setting groups:', groups.length, 'groups found')
```

### Test User Creation

For testing purposes, you can create test users and groups:

```javascript
// Test credentials
Email: test@example.com
Password: testpassword123
```

### Common Debug Scenarios

1. **Groups not loading**: Check authentication and console for user ID
2. **Groups not showing**: Verify component rendering and state updates
3. **Operations failing**: Check RLS policies and user permissions
4. **UI not updating**: Verify local state management and re-renders

## Common Issues and Troubleshooting

### Issue: Groups not visible in UI

**Symptoms**: Groups section appears empty despite data in database
**Causes**: 
- User not authenticated
- RLS policies blocking access
- Component not rendering

**Solutions**:
1. Check browser console for debug messages
2. Verify user authentication status
3. Confirm RLS policies are correctly configured
4. Test with known test user credentials

### Issue: Group operations failing

**Symptoms**: Create/update/delete operations don't work
**Causes**:
- Missing user_id in requests
- RLS policy violations
- Network connectivity issues

**Solutions**:
1. Add user authentication checks
2. Verify database policies
3. Check error messages in console

### Issue: Card counts not updating

**Symptoms**: Group shows wrong card count
**Causes**:
- Database trigger not firing
- Race conditions in updates
- Stale local state

**Solutions**:
1. Check database trigger implementation
2. Add manual count recalculation
3. Force state refresh after operations

## Development Guidelines

### Code Standards

1. **TypeScript**: All components and hooks must be fully typed
2. **Error Handling**: Comprehensive try-catch blocks required
3. **User Feedback**: Toast notifications for all user actions
4. **Loading States**: Show loading indicators for async operations
5. **Accessibility**: Proper ARIA labels and keyboard navigation

### File Organization

```
src/
├── components/intelligence-groups/
│   ├── IntelligenceGroups.tsx
│   ├── GroupCard.tsx
│   ├── GroupCreator.tsx
│   ├── GroupEditor.tsx
│   └── CardGroupSelector.tsx
├── hooks/
│   └── useIntelligenceGroups.ts
├── types/
│   └── intelligence-groups.ts
└── components/intelligence-bank/
    └── IntelligenceBank.tsx
```

### Naming Conventions

- **Components**: PascalCase (e.g., `GroupCard`)
- **Hooks**: camelCase with "use" prefix (e.g., `useIntelligenceGroups`)
- **Database tables**: snake_case (e.g., `intelligence_groups`)
- **Props interfaces**: PascalCase with "Props" suffix (e.g., `GroupCardProps`)

### Performance Considerations

1. **Lazy Loading**: Load group cards only when expanded
2. **Debounced Search**: Prevent excessive API calls during search
3. **Optimistic Updates**: Update UI immediately, sync to server
4. **Memoization**: Use React.memo for expensive components

### Future Enhancements

1. **Drag & Drop**: Reorder cards within groups
2. **Group Templates**: Pre-defined group structures
3. **Sharing**: Share groups between users
4. **Analytics**: Track group usage and effectiveness
5. **Export**: Export group data in various formats
6. **Advanced Filtering**: Filter cards within groups
7. **Group Hierarchies**: Nested group structures

### Maintenance Notes

- **Database Migrations**: All schema changes must include proper migrations
- **RLS Updates**: Test all policy changes thoroughly
- **Component Updates**: Maintain backward compatibility
- **Hook Changes**: Update all consuming components
- **Type Updates**: Keep TypeScript definitions current

---

## Quick Reference

### Essential Files to Know
- `/src/hooks/useIntelligenceGroups.ts` - Core logic
- `/src/components/intelligence-groups/IntelligenceGroups.tsx` - Main UI
- `/src/components/intelligence-bank/IntelligenceBank.tsx` - Integration point
- `/docs/intelligence-groups-system.md` - This documentation

### Key Database Tables
- `intelligence_groups` - Group metadata
- `intelligence_group_cards` - Card-group relationships
- `intelligence_cards` - Individual cards

### Important Concepts
- **RLS (Row Level Security)**: Users only see their own data
- **Junction Table**: Many-to-many relationship between groups and cards
- **Optimistic Updates**: UI updates immediately, syncs to server
- **User Authentication**: Required for all operations

### Testing Credentials
- Email: `test@example.com`
- Password: `testpassword123`

---

This documentation should be updated whenever significant changes are made to the Intelligence Groups system. For questions or clarifications, refer to the codebase or reach out to the development team.
# Intelligence Bank Controller Enhancement - Design Document

## Current Header Implementation Analysis

### Location
- File: `/src/components/intelligence-bank/IntelligenceBank.tsx`
- Lines: 238-289 (Main header section)
- Container: `<div className="p-4 border-b border-gray-200">`

### Current Components
1. **Top Row** (lines 239-262):
   - Left: Category icon, name, and description
   - Right: Test MCP System button + card count

2. **Bottom Row** (lines 265-288):
   - Left: Search input (full width flex)
   - Right: Filter toggle button

### Current State Management
- `searchQuery`: string - Search input value
- `showFilters`: boolean - Filter panel visibility
- `selectedCategory`: string - Current category
- `totalCards`: number - Total card count

## Enhanced Controller Design

### New Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Row 1: Category Info & Primary Actions                              │
├─────────────────────────────────────────────────────────────────────┤
│ [Icon] Category Name    [+ Add Card] [Test MCP] [Bulk] [123 cards] │
│        Description                                                   │
├─────────────────────────────────────────────────────────────────────┤
│ Row 2: Search, Sort & View Controls                                 │
├─────────────────────────────────────────────────────────────────────┤
│ [Search........................] [Sort ▼] [≡][⊞] [Filter (3)]      │
├─────────────────────────────────────────────────────────────────────┤
│ Row 3: Advanced Filters Panel (Expandable)                          │
├─────────────────────────────────────────────────────────────────────┤
│ Date Range: [From] [To]  Credibility: [1----10]  Status: □ □ □     │
│ Relevance: [1----10]     Source: □ URL □ Doc □ Manual              │
│ Tags: [tag1] [tag2] [+ Add]     [Clear All] [Apply Filters]        │
├─────────────────────────────────────────────────────────────────────┤
│ Row 4: Bulk Actions Bar (Conditional - when cards selected)         │
├─────────────────────────────────────────────────────────────────────┤
│ 5 cards selected    [Archive] [Save] [Delete] [Export] [Cancel]    │
└─────────────────────────────────────────────────────────────────────┘
```

### New Components to Add

#### 1. Add Intelligence Card Button
- Position: Top row, center-right
- Style: Primary blue button with "+" icon
- Function: Opens IntelligenceCardEditor modal
- Pre-selects current category

#### 2. Sort Dropdown
- Position: Row 2, after search
- Options: Date (newest/oldest), Relevance, Credibility, Title (A-Z/Z-A)
- Default: Date (newest first)
- State: `sortBy` + `sortOrder`

#### 3. View Toggle
- Position: Row 2, after sort
- Icons: List (≡) and Grid (⊞)
- State: `viewMode` ('list' | 'grid')
- Visual feedback for active view

#### 4. Enhanced Filter Button
- Shows active filter count
- Toggles advanced filter panel
- Changes appearance when filters active

#### 5. Advanced Filter Panel
- Slides down with smooth animation
- Date range pickers
- Score sliders (1-10 range)
- Checkbox groups for source/status
- Tag input with suggestions
- Apply/Clear buttons

#### 6. Bulk Actions System
- Checkbox on each card (on hover)
- Select all checkbox in header
- Bulk actions bar slides up from bottom
- Progress indicators for operations

### State Management Requirements

```typescript
// New state variables needed
const [showCreateCard, setShowCreateCard] = useState(false)
const [sortBy, setSortBy] = useState<'date' | 'relevance' | 'credibility' | 'title'>('date')
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set())
const [showBulkActions, setShowBulkActions] = useState(false)

// Advanced filter state
const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({})
const [credibilityRange, setCredibilityRange] = useState<[number, number]>([1, 10])
const [relevanceRange, setRelevanceRange] = useState<[number, number]>([1, 10])
const [sourceTypes, setSourceTypes] = useState<string[]>([])
const [statusFilters, setStatusFilters] = useState<string[]>([])
const [tagFilters, setTagFilters] = useState<string[]>([])
```

### Integration Points

1. **IntelligenceCardEditor**
   - Import and use existing component
   - Pass category prop for pre-selection
   - Handle onSave to refresh card list

2. **IntelligenceCardList**
   - Pass sortBy, sortOrder, viewMode props
   - Receive selectedCardIds from selection system
   - Handle bulk selection callbacks

3. **useIntelligenceCards Hook**
   - Build comprehensive filter object
   - Include all advanced filter criteria
   - Handle sorting at API level if possible

### Responsive Behavior

- **Mobile (< 640px)**
  - Stack controls vertically
  - Collapse button text to icons
  - Full-width modals
  - Simplified bulk actions

- **Tablet (640px - 1024px)**
  - Two-column control layout
  - Condensed spacing
  - Floating action buttons

- **Desktop (> 1024px)**
  - Full horizontal layout
  - All labels visible
  - Spacious controls

### Visual Design Principles

1. **Compact but Clear**
   - Use PINNLO's compact design system
   - Small text (text-xs) but readable
   - Tight spacing without cramping

2. **Progressive Disclosure**
   - Basic controls always visible
   - Advanced features behind toggles
   - Contextual actions (bulk ops)

3. **Visual Feedback**
   - Active states for all controls
   - Loading states during operations
   - Success/error messages
   - Filter count badges

### Performance Considerations

1. **Debounced Search**
   - 300ms delay on search input
   - Cancel previous requests

2. **Optimistic Updates**
   - Update UI before API confirms
   - Rollback on error

3. **Lazy Loading**
   - Load filter suggestions on demand
   - Paginate large result sets

4. **Memoization**
   - Memoize filtered/sorted results
   - Prevent unnecessary re-renders

## Implementation Order

1. **Phase 2**: Core controller functions
   - Add Card button
   - Sort dropdown
   - View toggle

2. **Phase 3**: Advanced filtering
   - Filter panel UI
   - Filter integration

3. **Phase 4**: Bulk operations
   - Selection system
   - Bulk actions bar

4. **Phase 5**: Polish
   - Animations
   - Responsive design
   - Error handling

This design maintains the existing Intelligence Bank structure while significantly enhancing its capabilities as a comprehensive intelligence management controller.
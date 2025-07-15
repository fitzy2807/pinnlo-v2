# Development Bank V2 Preview Card Migration - Actual Implementation Plan

## Current State Analysis (Based on Screenshots)

### What's Actually Implemented
- ✅ **Modal Overlay**: Development Bank IS using a modal overlay pattern
- ❌ **Preview Cards**: Development Bank is NOT using preview cards - still showing full expanded cards
- ⚠️ **Partial Migration**: The migration is only 50% complete

### Visual Comparison
- **Strategy Hub**: Shows compact preview cards (3-4 per row) → Click opens modal
- **Development Bank**: Shows full expanded cards (1 per row) → Click opens modal

## Implementation Plan to Complete Migration

---

## Step 1: Verify Current File Structure

### Instructions:
First, let's understand what components actually exist.

```bash
# Check what files exist in development components
ls -la src/components/development-bank-v2/
ls -la src/components/development-cards/

# Check if DevelopmentCardGrid is actually being used
grep -r "DevelopmentCardGrid" src/
```

**✅ CHECKPOINT**: Document which files exist and where DevelopmentCardGrid is imported

---

## Step 2: Create or Update Preview Card Component

### Instructions:
Based on what we find, either create a new preview card or verify the existing one matches our needs.

### Option A: If DevelopmentCardPreview exists but isn't used
```typescript
// Verify it has the right structure for preview display
// Should be ~160px tall, not full height
// Should show only title, snippet, and metadata
```

### Option B: If no preview component exists
```typescript
// Create: src/components/development-bank-v2/DevelopmentCardPreview.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, ListTodo, Calendar, User } from 'lucide-react';

interface DevelopmentCardPreviewProps {
  card: any;
  onClick: () => void;
}

const cardTypeConfig = {
  prd: { icon: FileText, label: 'PRD', color: 'blue' },
  trd: { icon: Code, label: 'TRD', color: 'green' },
  'task-list': { icon: ListTodo, label: 'Tasks', color: 'purple' }
};

export function DevelopmentCardPreview({ card, onClick }: DevelopmentCardPreviewProps) {
  const config = cardTypeConfig[card.card_type] || cardTypeConfig.trd;
  const Icon = config.icon;

  // Extract preview content based on card type
  const getPreviewContent = () => {
    const data = card.card_data || {};
    
    switch (card.card_type) {
      case 'prd':
        return {
          subtitle: data.problem_statement?.substring(0, 100) + '...' || 'No problem statement',
          status: data.status || 'draft',
          version: data.version || '1.0.0'
        };
      case 'trd':
        // For TRD, use the description since that's what's shown in screenshot
        return {
          subtitle: card.description?.substring(0, 100) + '...' || 'No description',
          status: data.status || 'draft',
          version: data.version || '1.0.0'
        };
      case 'task-list':
        const tasks = data.tasks || [];
        const completed = tasks.filter(t => t.status === 'completed').length;
        return {
          subtitle: `${completed} of ${tasks.length} tasks completed`,
          status: `${Math.round((completed / tasks.length) * 100) || 0}% complete`,
          version: null
        };
      default:
        return {
          subtitle: card.description?.substring(0, 100) + '...' || '',
          status: 'draft',
          version: '1.0.0'
        };
    }
  };

  const preview = getPreviewContent();

  return (
    <Card 
      className="p-4 h-[180px] cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col"
      onClick={onClick}
    >
      {/* Header with card type and priority */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium">
            {config.label}
          </Badge>
        </div>
        {card.priority && (
          <Badge 
            variant={card.priority === 'high' ? 'destructive' : 'default'}
            className="text-xs"
          >
            {card.priority.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm mb-2 line-clamp-2">
        {card.title}
      </h3>

      {/* Preview Content */}
      <p className="text-xs text-gray-600 line-clamp-3 flex-1">
        {preview.subtitle}
      </p>

      {/* Status and Version */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <span>Status: <strong>{preview.status}</strong></span>
        {preview.version && <span>Version: <strong>{preview.version}</strong></span>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span>{card.card_data?.owner || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{new Date(card.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}
```

**✅ CHECKPOINT**: Preview card component exists and is properly styled

---

## Step 3: Update Main Development Bank Component

### Instructions:
Find where cards are currently rendered and add preview mode.

### Look for the card rendering section and update:

```typescript
// In DevelopmentBankV2.tsx or similar

// Add state for view mode
const [viewMode, setViewMode] = useState<'expanded' | 'preview'>('preview');
const [selectedCard, setSelectedCard] = useState<any>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// Add handler for card clicks
const handleCardClick = (card: any) => {
  setSelectedCard(card);
  setIsModalOpen(true);
};

// Replace current card rendering with conditional rendering
{viewMode === 'expanded' ? (
  // Current expanded card view (keep existing code)
  <div className="space-y-4">
    {cards.map(card => (
      // Existing full card component
    ))}
  </div>
) : (
  // New preview card grid
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {cards.map(card => (
      <DevelopmentCardPreview
        key={card.id}
        card={card}
        onClick={() => handleCardClick(card)}
      />
    ))}
  </div>
)}

// Add view toggle button near search/filter
<Button
  variant="outline"
  size="sm"
  onClick={() => setViewMode(viewMode === 'expanded' ? 'preview' : 'expanded')}
>
  {viewMode === 'expanded' ? 'Preview View' : 'Expanded View'}
</Button>
```

**✅ CHECKPOINT**: 
- View toggle button appears
- Clicking switches between views
- Preview cards display in grid
- Clicking preview card opens modal

---

## Step 4: Ensure Modal Integration Works

### Instructions:
Verify the modal properly displays Development Bank specific fields.

### Check that modal handles:
1. **TRD fields**: Technical requirements, constraints, assumptions
2. **PRD fields**: Problem statement, user stories, acceptance criteria  
3. **Task List fields**: Tasks grouped by status with progress

**✅ CHECKPOINT**: Modal displays all card type fields correctly

---

## Step 5: Test All Card Types

### Testing Checklist:

1. **Technical Requirements (TRD)**:
   - [ ] Preview shows description snippet
   - [ ] Preview shows status and version
   - [ ] Modal displays all TRD-specific fields
   - [ ] Can edit and save in modal

2. **Product Requirements (PRD)**:
   - [ ] Preview shows problem statement snippet
   - [ ] Preview shows correct metadata
   - [ ] Modal displays all PRD sections
   - [ ] Edit functionality works

3. **Task Lists**:
   - [ ] Preview shows task completion progress
   - [ ] Preview shows percentage complete
   - [ ] Modal shows tasks grouped by status
   - [ ] Can edit tasks in modal

**✅ CHECKPOINT**: All three card types work in preview and modal

---

## Step 6: Remove or Hide Legacy View (Optional)

### Instructions:
Once preview mode is working well, consider making it the default.

```typescript
// Option 1: Make preview the default
const [viewMode, setViewMode] = useState<'expanded' | 'preview'>('preview');

// Option 2: Remove expanded view entirely (after testing)
// Remove the toggle and only render preview cards
```

**✅ CHECKPOINT**: Preview mode is the primary/only view

---

## Step 7: Update Documentation

### Update Card_Migration.md:
```markdown
### 4. Development Hub ✅ (Fully Migrated)
- **Status**: Successfully migrated to preview cards and modal overlay
- **Components**: Uses DevelopmentCardPreview and modal overlay
- **User Experience**: Consistent with other hubs - preview cards in grid with modal for details
- **Special Features**: 
  - Task progress bars in preview
  - Status/Version display for TRDs
  - Card type badges (PRD/TRD/Tasks)
```

**✅ FINAL CHECKPOINT**: 
- Development Bank looks and feels like Strategy Hub
- All functionality preserved
- Performance improved
- Documentation updated

---

## Common Issues & Solutions

### Issue: Cards not displaying data correctly
**Solution**: Check card_data structure - Development Bank may store data differently:
```typescript
// TRD data might be in:
card.card_data  // or
card.trd_data   // or
card.description // (as seen in screenshot)
```

### Issue: Modal not opening
**Solution**: Ensure modal state and handler are properly connected:
```typescript
// Modal should already exist based on screenshot
// Just need to connect it to preview card clicks
```

### Issue: Styling inconsistencies
**Solution**: Use the same height (160-180px) and padding as Strategy Hub preview cards

---

## Time Estimate

- Create/update preview component: 30 minutes
- Update main component with grid view: 30 minutes
- Test all card types: 30 minutes
- Fix any issues: 30 minutes
- **Total: ~2 hours**

This is the actual work needed to complete the Development Bank migration to match Strategy Hub's preview card pattern.

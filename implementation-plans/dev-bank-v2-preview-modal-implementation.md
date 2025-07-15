# Step-by-Step Implementation Plan for Development Bank V2 Preview/Modal System

## Pre-Implementation Setup

### Step 0: Verify Current State
```bash
# Check that Development Bank V2 is working
# Navigate to a development blueprint and confirm cards are displaying
# Make note of any console errors before starting
```

**✅ CHECKPOINT**: Development Bank V2 loads without errors

---

## Step 1: Create Data Adapter Utility

### Instructions:
Create a new file for data transformation utilities.

```bash
# Create the utility file
touch src/components/development-bank-v2/utils/cardAdapter.ts
```

### Code to implement:
```typescript
// src/components/development-bank-v2/utils/cardAdapter.ts
import type { DevelopmentCard } from '@/types/development';

export interface StandardCardPreview {
  id: string;
  title: string;
  type: 'prd' | 'trd' | 'taskList';
  priority: string;
  created_at: string;
  updated_at: string;
  previewData: {
    subtitle: string;
    stats: string;
    progress?: number;
  };
}

export function getCardPreviewData(card: DevelopmentCard): StandardCardPreview {
  let previewData = {
    subtitle: '',
    stats: '',
    progress: undefined as number | undefined
  };

  switch (card.type) {
    case 'prd':
      previewData.subtitle = card.prd_data?.problem?.substring(0, 100) + '...' || 'No problem statement';
      previewData.stats = `${card.prd_data?.features?.length || 0} features`;
      break;
      
    case 'trd':
      previewData.subtitle = card.trd_data?.targetAudience?.substring(0, 100) + '...' || 'No target audience';
      previewData.stats = card.trd_data?.constraints ? 'Has constraints' : 'No constraints';
      break;
      
    case 'taskList':
      const tasks = card.task_list_data?.tasks || [];
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      previewData.subtitle = `${completed} of ${total} tasks completed`;
      previewData.stats = total > 0 ? `${Math.round((completed / total) * 100)}% complete` : '0% complete';
      previewData.progress = total > 0 ? (completed / total) * 100 : 0;
      break;
  }

  return {
    id: card.id,
    title: card.title,
    type: card.type,
    priority: card.priority || 'medium',
    created_at: card.created_at,
    updated_at: card.updated_at,
    previewData
  };
}
```

**✅ CHECKPOINT**: 
1. File exists at `src/components/development-bank-v2/utils/cardAdapter.ts`
2. No TypeScript errors in the file
3. All three card types are handled in the switch statement

---

## Step 2: Create Preview Card Component

### Instructions:
Create the preview card component that will display in grid view.

```bash
# Create the preview component file
touch src/components/development-bank-v2/DevelopmentCardPreview.tsx
```

### Code to implement:
```typescript
// src/components/development-bank-v2/DevelopmentCardPreview.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Code, ListTodo } from 'lucide-react';
import type { DevelopmentCard } from '@/types/development';
import { getCardPreviewData } from './utils/cardAdapter';

interface DevelopmentCardPreviewProps {
  card: DevelopmentCard;
  onClick: () => void;
}

const cardTypeConfig = {
  prd: {
    icon: FileText,
    label: 'PRD',
    color: 'blue'
  },
  trd: {
    icon: Code,
    label: 'Technical',
    color: 'green'
  },
  taskList: {
    icon: ListTodo,
    label: 'Tasks',
    color: 'purple'
  }
};

export function DevelopmentCardPreview({ card, onClick }: DevelopmentCardPreviewProps) {
  const preview = getCardPreviewData(card);
  const config = cardTypeConfig[card.type];
  const Icon = config.icon;

  return (
    <Card 
      className="p-4 h-[160px] cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-${config.color}-500`} />
          <span className="text-xs text-gray-500 font-medium">{config.label}</span>
        </div>
        {card.priority && (
          <Badge 
            variant={
              card.priority === 'high' ? 'destructive' : 
              card.priority === 'medium' ? 'default' : 
              'secondary'
            }
            className="text-xs"
          >
            {card.priority}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm mb-2 line-clamp-2 flex-shrink-0">
        {card.title}
      </h3>

      {/* Preview Content */}
      <p className="text-xs text-gray-600 line-clamp-2 flex-1 mb-3">
        {preview.previewData.subtitle}
      </p>

      {/* Progress Bar for Tasks */}
      {card.type === 'taskList' && preview.previewData.progress !== undefined && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${preview.previewData.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Icon className="w-3 h-3" />
          <span>{preview.previewData.stats}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{new Date(card.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}
```

**✅ CHECKPOINT**: 
1. File exists at `src/components/development-bank-v2/DevelopmentCardPreview.tsx`
2. Imports are resolving correctly (no red underlines)
3. Component exports `DevelopmentCardPreview`
4. No TypeScript errors

---

## Step 3: Create Read-Only Modal Component

### Instructions:
Create a simple read-only modal first (no edit functionality yet).

```bash
# Create the modal component file
touch src/components/development-bank-v2/DevelopmentCardModal.tsx
```

### Code to implement:
```typescript
// src/components/development-bank-v2/DevelopmentCardModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { DevelopmentCard } from '@/types/development';

interface DevelopmentCardModalProps {
  card: DevelopmentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DataRowProps {
  label: string;
  value?: string | string[];
  type?: 'text' | 'list';
}

function DataRow({ label, value, type = 'text' }: DataRowProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      {type === 'list' && Array.isArray(value) ? (
        <ul className="text-sm space-y-1">
          {value.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-900 whitespace-pre-wrap">{value}</div>
      )}
    </div>
  );
}

export function DevelopmentCardModal({ card, isOpen, onClose }: DevelopmentCardModalProps) {
  if (!card) return null;

  const renderPRDContent = () => {
    const data = card.prd_data || {};
    return (
      <>
        <DataRow label="Problem Statement" value={data.problem} />
        <DataRow label="Solution" value={data.solution} />
        {data.features && data.features.length > 0 && (
          <DataRow 
            label="Features" 
            value={data.features.map((f: any) => f.title || f)}
            type="list"
          />
        )}
        {data.acceptance_criteria && data.acceptance_criteria.length > 0 && (
          <DataRow 
            label="Acceptance Criteria" 
            value={data.acceptance_criteria}
            type="list"
          />
        )}
      </>
    );
  };

  const renderTRDContent = () => {
    const data = card.trd_data || {};
    return (
      <>
        <DataRow label="Target Audience" value={data.targetAudience} />
        <DataRow label="Success Metrics" value={data.successMetrics} />
        <DataRow label="Constraints" value={data.constraints} />
        <DataRow label="Assumptions" value={data.assumptions} />
      </>
    );
  };

  const renderTaskListContent = () => {
    const tasks = card.task_list_data?.tasks || [];
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'todo'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      completed: tasks.filter(t => t.status === 'completed')
    };

    return (
      <>
        {tasksByStatus.todo.length > 0 && (
          <DataRow 
            label="To Do" 
            value={tasksByStatus.todo.map(t => t.title)}
            type="list"
          />
        )}
        {tasksByStatus['in-progress'].length > 0 && (
          <DataRow 
            label="In Progress" 
            value={tasksByStatus['in-progress'].map(t => t.title)}
            type="list"
          />
        )}
        {tasksByStatus.completed.length > 0 && (
          <DataRow 
            label="Completed" 
            value={tasksByStatus.completed.map(t => t.title)}
            type="list"
          />
        )}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{card.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {card.type.toUpperCase()}
                </Badge>
                {card.priority && (
                  <Badge 
                    variant={
                      card.priority === 'high' ? 'destructive' : 
                      card.priority === 'medium' ? 'default' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {card.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-1">
          {card.description && (
            <DataRow label="Description" value={card.description} />
          )}
          
          {card.type === 'prd' && renderPRDContent()}
          {card.type === 'trd' && renderTRDContent()}
          {card.type === 'taskList' && renderTaskListContent()}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2">{new Date(card.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <span className="ml-2">{new Date(card.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**✅ CHECKPOINT**: 
1. File exists at `src/components/development-bank-v2/DevelopmentCardModal.tsx`
2. All imports resolve correctly
3. Component handles all three card types (prd, trd, taskList)
4. DataRow component is defined within the file

---

## Step 4: Add State Management to Main Component

### Instructions:
Update the main DevelopmentBankV2 component to add preview/modal state WITHOUT removing existing functionality.

### Code to add to `src/components/development-bank-v2/DevelopmentBankV2.tsx`:

```typescript
// Add these imports at the top of the file
import { DevelopmentCardPreview } from './DevelopmentCardPreview';
import { DevelopmentCardModal } from './DevelopmentCardModal';
import { LayoutGrid, LayoutList } from 'lucide-react';

// Add these state variables inside the DevelopmentBankV2 component function
// (after existing state declarations)
const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards'); // Default to existing view
const [selectedCard, setSelectedCard] = useState<DevelopmentCard | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// Add these handler functions (after existing handlers)
const handleCardClick = (card: DevelopmentCard) => {
  setSelectedCard(card);
  setIsModalOpen(true);
};

const handleModalClose = () => {
  setIsModalOpen(false);
  // Don't clear selectedCard immediately for smooth animation
  setTimeout(() => setSelectedCard(null), 200);
};
```

**✅ CHECKPOINT**: 
1. New imports added without errors
2. State variables added
3. Handler functions added
4. No TypeScript errors
5. Existing functionality still works

---

## Step 5: Add View Toggle Button

### Instructions:
Add a toggle button to switch between card view and grid view.

### Find the section with search/filter controls and add:

```typescript
// Add this after the search input and filter buttons
<Button
  variant="outline"
  size="sm"
  onClick={() => setViewMode(viewMode === 'cards' ? 'grid' : 'cards')}
  className="flex items-center gap-2"
>
  {viewMode === 'cards' ? (
    <>
      <LayoutGrid className="w-4 h-4" />
      Grid View
    </>
  ) : (
    <>
      <LayoutList className="w-4 h-4" />
      Card View
    </>
  )}
</Button>
```

**✅ CHECKPOINT**: 
1. Toggle button appears in the UI
2. Clicking changes the button text/icon
3. No console errors

---

## Step 6: Add Conditional Rendering for Views

### Instructions:
Replace the card rendering section to support both views.

### Find the section that renders cards and replace with:

```typescript
{/* Conditional rendering based on view mode */}
{viewMode === 'cards' ? (
  // Existing card view - keep exactly as is
  <div className="grid grid-cols-1 gap-4">
    {filteredAndSortedCards.map((card) => (
      <MasterCard
        key={card.id}
        cardData={{
          id: card.id,
          title: card.title,
          description: card.description,
          cardType: card.type,
          priority: card.priority || 'medium',
          blueprintId: blueprintId,
          createdAt: card.created_at,
          updatedAt: card.updated_at,
          ...formatCardData(card)
        }}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        isPreviewMode={false}
      />
    ))}
  </div>
) : (
  // New grid view
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {filteredAndSortedCards.map((card) => (
      <DevelopmentCardPreview
        key={card.id}
        card={card}
        onClick={() => handleCardClick(card)}
      />
    ))}
  </div>
)}

{/* Add modal at the end of the component, before the closing div */}
<DevelopmentCardModal
  card={selectedCard}
  isOpen={isModalOpen}
  onClose={handleModalClose}
/>
```

**✅ CHECKPOINT**: 
1. Toggle button switches between views
2. Card view (original) still works exactly as before
3. Grid view shows preview cards
4. Clicking a preview card opens the modal
5. Modal displays card information correctly
6. Modal closes when clicking outside or X button

---

## Step 7: Test All Card Types

### Instructions:
Test each card type thoroughly.

### Testing checklist:
1. **PRD Cards**:
   - [ ] Preview shows problem statement snippet
   - [ ] Preview shows feature count
   - [ ] Modal displays all PRD fields
   - [ ] Features show as bullet list

2. **TRD Cards**:
   - [ ] Preview shows target audience snippet
   - [ ] Preview shows constraints indicator
   - [ ] Modal displays all TRD fields

3. **Task List Cards**:
   - [ ] Preview shows task completion count
   - [ ] Preview shows progress bar
   - [ ] Modal groups tasks by status
   - [ ] Completed percentage is correct

**✅ CHECKPOINT**: All card types display correctly in both preview and modal

---

## Step 8: Add Edit Functionality (Optional)

### Instructions:
Only proceed if read-only version is working perfectly.

### Add to DevelopmentCardModal.tsx:

```typescript
// Add these props to the interface
interface DevelopmentCardModalProps {
  card: DevelopmentCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (cardId: string, updates: any) => Promise<void>; // Add this
  onDelete?: (cardId: string) => Promise<void>; // Add this
}

// Add state for edit mode
const [isEditing, setIsEditing] = useState(false);

// Add edit button in the header
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setIsEditing(!isEditing)}
  >
    {isEditing ? 'Cancel' : 'Edit'}
  </Button>
</div>

// In the main component, pass the handlers
<DevelopmentCardModal
  card={selectedCard}
  isOpen={isModalOpen}
  onClose={handleModalClose}
  onUpdate={handleUpdateCard}  // Your existing function
  onDelete={handleDeleteCard}  // Your existing function
/>
```

**✅ FINAL CHECKPOINT**: 
1. All existing functionality preserved
2. Can toggle between card and grid view
3. Preview cards display correctly
4. Modal shows full card details
5. No console errors
6. No TypeScript errors
7. Performance is good (no lag when switching views)

---

## Rollback Plan

If anything breaks at any point:

1. **Immediate rollback**: Set default view to 'cards'
   ```typescript
   const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
   ```

2. **Remove the toggle button** - Users won't know the feature exists

3. **Git reset if needed**:
   ```bash
   git reset --hard HEAD
   ```

This plan ensures you can test at each step and catch issues early. The key is maintaining the existing functionality while adding the new view as an optional enhancement.

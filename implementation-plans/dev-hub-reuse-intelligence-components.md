# Development Hub Migration - Reusing Intelligence Hub Components

## Smart Approach: Reuse Existing Components ♻️

Since Strategy Hub successfully uses `IntelligenceCardGrid` with `IntelligenceCardPreview`, we should do the same for Development Hub instead of creating new components.

---

## Step 1: Understand How Strategy Hub Does It

### Strategy Hub Implementation:
```typescript
// From StrategyBankContent.tsx
import IntelligenceCardGrid from '@/components/intelligence-cards/IntelligenceCardGrid'

// Transforms strategy cards to match intelligence card format
<IntelligenceCardGrid
  cards={filteredCards.map(card => ({
    ...card,
    // Map fields to match IntelligenceCard interface
    cardType: card.card_type,
    createdDate: card.created_at,
    lastModified: card.updated_at,
    intelligence_content: card.description || '',
    key_findings: [],
    relevance_score: 50,
    credibility_score: 50,
    // ... other required fields
  }))}
  onCreateCard={handleCreateCard}
  onUpdateCard={handleUpdateCard}
  onDeleteCard={handleDeleteCard}
  searchQuery={searchQuery}
  viewMode={viewMode}
/>
```

---

## Step 2: Find Current Development Hub Implementation

### Instructions:
First, locate how Development Hub currently renders cards.

```bash
# Find the main component
grep -r "Technical Requirements" src/components/development-bank*
grep -r "card_type.*trd" src/components/development-bank*
```

**✅ CHECKPOINT**: Found the file that renders the expanded development cards

---

## Step 3: Import Intelligence Components

### Instructions:
Add imports to the Development Hub main component.

```typescript
// At the top of DevelopmentBankV2.tsx (or equivalent)
import IntelligenceCardGrid from '@/components/intelligence-cards/IntelligenceCardGrid'
import type { CardData } from '@/types/intelligence'
```

**✅ CHECKPOINT**: Imports added without errors

---

## Step 4: Create Data Transformation Function

### Instructions:
Create a function to transform Development cards to Intelligence card format.

```typescript
// Add this function in Development Hub component
const transformDevCardToIntelligence = (devCard: any): CardData => {
  // Extract preview content based on card type
  let content = devCard.description || '';
  let keyFindings: string[] = [];
  
  if (devCard.card_type === 'prd' && devCard.card_data) {
    content = devCard.card_data.problem_statement || devCard.card_data.problem || content;
    keyFindings = [
      `${devCard.card_data.features?.length || 0} features defined`,
      `Status: ${devCard.card_data.status || 'Draft'}`
    ];
  } else if (devCard.card_type === 'task-list' && devCard.card_data?.tasks) {
    const completed = devCard.card_data.tasks.filter(t => t.status === 'completed').length;
    const total = devCard.card_data.tasks.length;
    content = `Task list with ${total} tasks`;
    keyFindings = [
      `${completed} of ${total} tasks completed`,
      `${Math.round((completed / total) * 100)}% complete`
    ];
  } else if (devCard.card_type === 'trd') {
    keyFindings = [
      `Version: ${devCard.card_data?.version || '1.0.0'}`,
      `Status: ${devCard.card_data?.status || 'Draft'}`
    ];
  }

  return {
    id: devCard.id,
    title: devCard.title,
    description: devCard.description || '',
    cardType: devCard.card_type,
    priority: devCard.priority || 'medium',
    confidenceLevel: 'medium',
    created_at: devCard.created_at,
    updated_at: devCard.updated_at,
    
    // Intelligence-specific fields (required by the component)
    intelligence_content: content,
    key_findings: keyFindings,
    relevance_score: devCard.card_type === 'task-list' ? 
      (devCard.card_data?.tasks?.filter(t => t.status === 'completed').length / devCard.card_data?.tasks?.length) * 100 : 
      75,
    credibility_score: 80,
    
    // Map owner/creator
    owner: devCard.card_data?.assigned_to || devCard.card_data?.owner || 'Unassigned',
    creator: devCard.created_by || 'System',
    
    // Other required fields
    tags: devCard.card_data?.tags || [],
    relationships: [],
    strategicAlignment: '',
    confidenceRationale: '',
    priorityRationale: '',
    
    // Keep original data for modal
    card_data: devCard.card_data || {}
  };
};
```

**✅ CHECKPOINT**: Transformation function handles all card types

---

## Step 5: Replace Card Rendering

### Instructions:
Find where cards are currently rendered and replace with IntelligenceCardGrid.

```typescript
// Find and replace the current card rendering
// FROM something like:
<div className="space-y-4">
  {filteredCards.map(card => (
    <ExpandedDevCard key={card.id} card={card} />
  ))}
</div>

// TO:
<IntelligenceCardGrid
  cards={filteredCards.map(transformDevCardToIntelligence)}
  onCreateCard={handleCreateCard}
  onUpdateCard={async (id, updates) => {
    // Transform updates back to dev card format
    const devUpdates = {
      title: updates.title,
      description: updates.description,
      priority: updates.priority,
      card_data: {
        ...updates.card_data,
        // Preserve dev-specific fields
      }
    };
    await handleUpdateCard(id, devUpdates);
  }}
  onDeleteCard={handleDeleteCard}
  searchQuery={searchQuery}
  selectedCardIds={selectedCards}
  onSelectCard={handleSelectCard}
  viewMode="grid" // Force grid view
  loading={loading}
/>
```

**✅ CHECKPOINT**: 
- Grid renders with preview cards
- Cards show appropriate content
- Modal opens on click

---

## Step 6: Handle Development-Specific Features

### Instructions:
Ensure special features like task progress work.

The IntelligenceCardPreview already shows progress bars for relevance/credibility scores. We can use these for task completion:

```typescript
// In transformation function for task-list cards:
relevance_score: calculateTaskProgress(), // This will show as a progress bar
credibility_score: 0, // Hide second bar

// Or modify the key_findings to show progress
key_findings: [
  `Progress: ${completed}/${total} tasks`,
  `━${'━'.repeat(Math.floor(progress/10))}${'─'.repeat(10-Math.floor(progress/10))} ${progress}%`
]
```

**✅ CHECKPOINT**: Task lists show progress appropriately

---

## Step 7: Test All Card Types

### Testing Checklist:
1. **TRD Cards**:
   - [ ] Shows "TRD" badge/indicator
   - [ ] Displays description preview
   - [ ] Shows version and status in key findings

2. **PRD Cards**:
   - [ ] Shows "PRD" badge/indicator  
   - [ ] Displays problem statement preview
   - [ ] Shows feature count

3. **Task Lists**:
   - [ ] Shows "Tasks" badge/indicator
   - [ ] Displays completion progress
   - [ ] Progress bar or percentage visible

4. **All Cards**:
   - [ ] Clicking opens modal with full details
   - [ ] Edit functionality works in modal
   - [ ] Grid layout with 3-4 cards per row

**✅ FINAL CHECKPOINT**: Development Hub looks identical to Strategy Hub

---

## Benefits of This Approach

1. **No new components needed** - Reuse existing, tested code
2. **Consistent UI** - Exact same component = exact same look
3. **Less maintenance** - One component to update for all hubs
4. **Proven to work** - Strategy Hub already uses this successfully
5. **Faster implementation** - Just transform data and render

## Summary

Instead of creating new preview components, we:
1. Import `IntelligenceCardGrid` (already used by Strategy Hub)
2. Transform Development cards to match Intelligence card interface
3. Pass transformed data to the grid
4. Let the existing components handle everything

Total implementation time: **~30 minutes** (mostly data transformation logic)

# Card Creator Simplified Flow Test

## Expected Flow (3 steps total):

### Step 1: Source Selection
- Select one or more source sections (Development, Blueprint, Intelligence)
- Click "Next" to proceed

### Step 2: Output Configuration  
- Select target section for new cards
- Click "Generate Preview" to see AI analysis

### Preview State (part of Step 2):
- AI shows preview with:
  - Determined number of cards to create (e.g., "I will create **four** value proposition cards")
  - Brief description of each planned card
  - Rationale for the quantity
- Click "Approve & Generate X Cards" to auto-create all cards

## What was removed:
- Card selection step (all cards from selected sections are used automatically)
- Quantity selector (AI determines optimal count)
- Card selection after generation (all cards auto-added)

## Test the flow:
1. Open Card Creator
2. Select source sections → Next
3. Select target section → Generate Preview
4. Review preview → Approve & Generate
5. Cards should be auto-added to blueprint
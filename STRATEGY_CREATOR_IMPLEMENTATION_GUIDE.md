# Strategy Creator - Implementation Prompts for Claude Code

## Step 1: Database Schema Setup

**Prompt:**
```
Please create the database schema for the Strategy Creator feature. 

1. Go to the Supabase dashboard SQL editor
2. Create two new tables: strategy_creator_sessions and strategy_creator_history
3. Set up RLS policies for user data isolation
4. Add necessary indexes for performance
5. Create an update trigger for the updated_at column

Here's the SQL schema to implement: [paste Step 1 SQL code]

Confirm when the tables are created successfully and RLS is enabled.
```

---

## Step 2: MCP Tools for Strategy Creator

**Prompt:**
```
Please implement the MCP tools for the Strategy Creator feature.

1. Create a new file at /supabase-mcp/src/tools/strategy-creator-tools.ts
2. Import the necessary dependencies including OpenAI and the blueprint registry
3. Define two new MCP tools: generate_context_summary and generate_strategy_cards
4. Implement the handler functions for each tool
5. Update /supabase-mcp/src/index.ts to include these new tools in the exports and switch statement

Here's the code for the MCP tools: [paste Step 2 code]

Make sure to test that the MCP server still starts correctly after adding these tools.
```

---

## Step 3: API Routes for Strategy Creator

**Prompt:**
```
Please create the API routes for the Strategy Creator feature.

Create the following four API route files:
1. /src/app/api/strategy-creator/session/route.ts - For session management (GET/PUT)
2. /src/app/api/strategy-creator/context/route.ts - For generating context summaries (POST)
3. /src/app/api/strategy-creator/generate/route.ts - For generating cards (POST)
4. /src/app/api/strategy-creator/commit/route.ts - For saving selected cards (POST)

Each route should:
- Use the same authentication pattern as existing PINNLO APIs (createClient from supabase-server)
- Handle errors gracefully with appropriate status codes
- Log actions to the strategy_creator_history table

Here's the code for all four API routes: [paste Step 3 code]

Ensure all routes follow the established PINNLO patterns for consistency.
```

---

## Step 4: Strategy Creator Modal Component

**Prompt:**
```
Please create the main Strategy Creator modal component.

1. Create /src/components/strategy-creator/StrategyCreator.tsx
2. This is the main modal component that follows the Intelligence Bank pattern
3. It should manage the 6-step wizard flow and session state
4. Include loading states and error handling
5. Implement the step navigation logic with validation

The component should:
- Use fixed positioning with backdrop (like Intelligence Bank)
- Include a sidebar for step navigation
- Manage session state and API calls
- Handle step transitions with validation
- Reset state properly on close

Here's the code for the main modal component: [paste Step 4 code]
```

---

## Step 5: Creator Sidebar Component

**Prompt:**
```
Please create the Creator Sidebar component for step navigation.

1. Create /src/components/strategy-creator/CreatorSidebar.tsx
2. This component shows the 6 steps in the creation process
3. It should indicate current step, completed steps, and clickable steps
4. Follow the same sidebar pattern as Intelligence Bank

The sidebar should:
- Show step icons and labels
- Highlight the current step
- Show checkmarks for completed steps
- Disable future steps until current step is valid
- Match PINNLO's compact design system

Here's the code for CreatorSidebar: [paste CreatorSidebar code from original implementation]
```

---

## Step 6: Strategy Selector Component

**Prompt:**
```
Please create the Strategy Selector component (Step 1 of the wizard).

1. Create /src/components/strategy-creator/steps/StrategySelector.tsx
2. This component allows users to select which strategy to enhance with AI cards
3. Display strategies in a grid with search functionality
4. Show strategy completion percentage and last modified date
5. Highlight the selected strategy

The component should:
- Use the useStrategies hook to load user's strategies
- Show loading and error states
- Calculate and display completion percentages
- Format dates in a user-friendly way
- Handle strategy selection and pass to parent

Here's the code for StrategySelector: [paste StrategySelector code]
```

---

## Step 7: Blueprint Context Selector Component

**Prompt:**
```
Please create the Blueprint Context Selector component (Step 2 of the wizard).

1. Create /src/components/strategy-creator/steps/BlueprintContextSelector.tsx
2. This component allows selecting existing blueprint cards as context
3. Use a two-panel layout: blueprint list on left, selected cards summary on right
4. Support multi-select with checkboxes
5. Include search and expand/collapse for blueprints

Features to implement:
- Load all blueprint cards for the selected strategy
- Group cards by blueprint type with expand/collapse
- Show selection checkboxes with "select all" per blueprint
- Display selected cards summary in right panel
- Persist selections when navigating between steps

Here's the code for BlueprintContextSelector: [paste BlueprintContextSelector code]
```

---

## Step 8: Intelligence Context Selector Component

**Prompt:**
```
Please create the Intelligence Context Selector component (Step 3 of the wizard).

1. Create /src/components/strategy-creator/steps/IntelligenceContextSelector.tsx
2. This component selects intelligence cards based on blueprint context
3. Show suggested categories based on selected blueprint cards
4. Include filtering by relevance score
5. Support multi-select with visual feedback

The component should:
- Load intelligence cards using useIntelligenceCards hook
- Show categories in left sidebar with suggested badges
- Filter cards by relevance (default to high relevance only)
- Display cards in a grid with selection checkboxes
- Show intelligence card details (category, relevance score, key findings)

Here's the code for IntelligenceContextSelector: [paste IntelligenceContextSelector code]
```

---

## Step 9: Context Summary Review Component

**Prompt:**
```
Please create the Context Summary Review component (Step 4 of the wizard).

1. Create /src/components/strategy-creator/steps/ContextSummaryReview.tsx
2. This component generates and displays an AI context summary
3. Call the /api/strategy-creator/context endpoint on mount
4. Allow editing the generated summary
5. Include copy and regenerate functionality

Features to implement:
- Show loading animation during generation
- Format the summary with proper sections and styling
- Enable edit mode with a textarea
- Add copy to clipboard functionality
- Display metadata (word count, cards used)
- Save summary to session when proceeding

Here's the code for ContextSummaryReview: [paste ContextSummaryReview code]
```

---

## Step 10: Target Blueprint Selector Component

**Prompt:**
```
Please create the Target Blueprint Selector component (Step 5 of the wizard).

1. Create /src/components/strategy-creator/steps/TargetBlueprintSelector.tsx
2. This component selects which blueprint type to generate cards for
3. Show AI recommendations based on context summary
4. Include generation options (card count, style)
5. Use a main panel + options sidebar layout

The component should:
- Analyze context summary for blueprint recommendations
- Group blueprints by category
- Highlight recommended blueprints
- Show generation options in right sidebar when blueprint selected
- Support selecting number of cards (1-5) and generation style

Here's the code for TargetBlueprintSelector: [paste TargetBlueprintSelector code]
```

---

## Step 11: Generated Cards Review Component

**Prompt:**
```
Please create the Generated Cards Review component (Step 6 of the wizard).

1. Create /src/components/strategy-creator/steps/GeneratedCardsReview.tsx
2. This component generates AI cards and allows review before committing
3. Call /api/strategy-creator/generate on mount
4. Support editing generated cards inline
5. Allow selecting which cards to save

Key features:
- Show loading state during card generation
- Display generated cards with all blueprint fields
- Enable inline editing with save/cancel
- Multi-select cards to commit
- Call /api/strategy-creator/commit to save selected cards
- Show AI metadata badge on each card

Here's the final step component code: [paste GeneratedCardsReview code]
```

---

## Step 12: Navigation Integration and Supporting Files

**Prompt:**
```
Please complete the Strategy Creator integration:

1. Update /src/components/Header.tsx to add the Strategy Creator button
   - Import StrategyCreator component and Sparkles icon
   - Add state for showStrategyCreator
   - Add button in navigation after AI Settings
   - Render StrategyCreator modal at the end

2. Create /src/hooks/useStrategies.ts for loading user strategies
   - Load strategies with card counts
   - Handle authentication
   - Return loading and error states

3. Create /src/hooks/useBlueprintCards.ts for loading blueprint cards
   - Accept strategyId and blueprintId parameters
   - Fetch cards from API
   - Handle loading and error states

4. Add environment variables to .env.local:
   - MCP_SERVER_URL=http://localhost:3001
   - MCP_SERVER_TOKEN=pinnlo-dev-token-2025

Here's the code for navigation integration and hooks: [paste Step 11-12 code]

After this step, the Strategy Creator should be fully integrated and accessible from the main navigation.
```

---

## Testing Prompt

**Prompt:**
```
Please test the Strategy Creator implementation:

1. Start the MCP server: cd supabase-mcp && npm run dev
2. Start the main app: npm run dev
3. Click "Strategy Creator" in the navigation
4. Test the complete flow:
   - Select a strategy
   - Choose blueprint cards as context
   - Select relevant intelligence cards
   - Review the generated context summary
   - Select a target blueprint
   - Review and edit generated cards
   - Commit selected cards

Please verify:
- All API endpoints return proper responses
- MCP tools execute successfully
- UI components render correctly
- State persists between steps
- Cards are saved to the database on commit

Report any errors or issues found during testing.
```
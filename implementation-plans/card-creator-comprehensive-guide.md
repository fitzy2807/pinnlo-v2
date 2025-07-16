# Card Creator: Comprehensive Technical Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technical Stack](#technical-stack)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [MCP Integration](#mcp-integration)
7. [Database Schema](#database-schema)
8. [AI System](#ai-system)
9. [Recent Enhancements](#recent-enhancements)
10. [Testing & Debugging](#testing--debugging)
11. [Future Improvements](#future-improvements)

## Overview

The Card Creator is a sophisticated AI-powered tool that enables users to generate strategic cards based on existing context. It uses a multi-step wizard interface, integrates with the Model Context Protocol (MCP) server, and leverages OpenAI for intelligent card generation.

### Key Features
- **Context-Aware Generation**: Analyzes existing cards to generate relevant new cards
- **Multi-Step Wizard**: Guides users through card selection, preview, and generation
- **AI-Powered Preview**: Shows impact analysis before generation
- **Dynamic Field Parsing**: Automatically determines required fields for each card type
- **Single Card Generation**: Generates cards one at a time for better reliability
- **Auto-Navigation**: Takes users to the generated cards after creation

## Architecture

### High-Level Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  MCP Server  │────▶│   OpenAI    │
│  (Card Creator) │     │ (HTTP/3001)  │     │    API      │
└────────┬────────┘     └──────┬───────┘     └─────────────┘
         │                     │
         ▼                     ▼
┌─────────────────┐     ┌──────────────┐
│    Supabase     │     │  TypeScript  │
│   (Database)    │     │Config Files  │
└─────────────────┘     └──────────────┘
```

### Component Structure
```
src/components/shared/card-creator/
├── CardCreator.tsx          # Main component & orchestration
├── sections/
│   ├── SourceSelection.tsx  # Step 1: Select source sections (with filtering)
│   ├── CardDisplay.tsx      # Step 2: Preview selected cards
│   └── ContextPreview.tsx   # Step 3: AI impact analysis
├── services/
│   └── aiService.ts         # AI service integration
├── utils/
│   └── contextBuilder.ts    # Context formatting utilities
└── types.ts                 # TypeScript definitions
```

## Technical Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** App Router
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hot Toast** for notifications

### Backend
- **MCP Server** (Model Context Protocol)
  - Node.js with TypeScript
  - HTTP server on port 3001
  - Tools for strategy card generation
- **Supabase**
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions

### AI Integration
- **OpenAI GPT-4** (gpt-4o-mini model)
- **Dynamic Prompt Engineering**
- **Context-aware generation**

## Core Components

### 1. CardCreator.tsx
The main orchestrator component that manages the wizard flow.

```typescript
// Key state management
const [currentStep, setCurrentStep] = useState(1)
const [selectedSections, setSelectedSections] = useState<string[]>([])
const [selectedCards, setSelectedCards] = useState<string[]>([])
const [contextPreview, setContextPreview] = useState<string | null>(null)
const [plannedQuantity, setPlannedQuantity] = useState<number>(0)
const [isGenerating, setIsGenerating] = useState(false)

// Step flow
// 1. Source Selection → 2. Card Selection → 3. AI Analysis → 4. Generation
```

### 2. SourceSelection.tsx
Handles Step 1 - selecting source sections for context cards.

```typescript
// Key filtering logic
const strategySections = config.sections
  .filter(s => s.category === 'strategy')
  .filter(section => {
    const count = getSectionCardCount(
      section.id,
      section.category,
      section.cardTypes,
      strategy,
      getSectionCounts,
      blueprintCards || [],
      intelligenceCards || []
    )
    return count > 0 // Only show sections with cards
  })
```

### 3. MCP Integration
The MCP server provides tools for card generation:

```typescript
// strategy-creator-tools.ts
export async function handleGenerateStrategyCards(args: any) {
  const { 
    contextSummary,      // Summary of selected cards
    targetBlueprint,     // Type of card to generate
    existingCards,       // Already existing cards
    preview_only,        // Preview vs generation mode
    cardIndex           // For single card generation
  } = args;
  
  // Dynamic field parsing
  const fieldDefinitions = await getBlueprintFields(targetBlueprint);
  
  // Database prompt retrieval
  const dbPrompt = await getSystemPrompt('blueprint', targetBlueprint);
  
  // Return prompts for AI generation
  return { system: systemPrompt, user: userPrompt };
}
```

### 4. AI Service Layer
Handles communication between frontend and AI:

```typescript
// aiService.ts
export class AIService {
  async generateFromMCPPrompts(mcpResult: any): Promise<any[]> {
    const { system, user } = mcpResult.prompts;
    
    // Call API endpoint
    const response = await fetch('/api/card-creator/generate', {
      method: 'POST',
      body: JSON.stringify({ systemPrompt: system, userPrompt: user })
    });
    
    return result.cards;
  }
}
```

## Data Flow

### Generation Flow
1. **User selects source sections** → SourceSelection component (only shows sections with cards)
2. **User selects specific cards** → CardDisplay shows available cards from selected sections
3. **Generate AI preview** → MCP analyzes context and provides impact analysis
4. **User approves** → Triggers generation loop
5. **For each card**:
   - MCP generates prompts with field definitions
   - AI service calls OpenAI
   - Response parsed and validated
   - Card added to database
6. **Navigation** → User redirected to new cards

### Context Building
```typescript
// contextBuilder.ts
export function buildStructuredContext(selectedCards: Card[], targetSection: string) {
  return {
    summary: buildContextSummary(selectedCards),
    cardCount: selectedCards.length,
    cardTypes: Object.keys(cardsByType),
    targetSection,
    detailsByType: // Grouped card information
  };
}
```

## MCP Integration

### MCP Server Setup
```javascript
// server-simple.js
const PORT = 3001;

app.post('/mcp/invoke', async (req, res) => {
  const { tool, arguments: args } = req.body;
  
  switch (tool) {
    case 'generate_strategy_cards':
      const result = await handleGenerateStrategyCards(args);
      res.json({ success: true, content: [{ type: 'text', text: JSON.stringify(result) }] });
      break;
  }
});
```

### Dynamic Field Parsing
The system dynamically reads TypeScript config files to determine card fields:

```typescript
async function getBlueprintFields(blueprintType: string): Promise<string> {
  // Read TypeScript config file
  const configPath = `../src/components/blueprints/configs/${blueprintType}Config.ts`;
  const configContent = await fs.readFile(configPath, 'utf-8');
  
  // Parse field definitions using regex
  // Extract: field name, type, required status, description
  return parsedFields;
}
```

## Database Schema

### System Prompts Table
```sql
CREATE TABLE ai_system_prompts (
    id UUID PRIMARY KEY,
    blueprint_type VARCHAR(100) UNIQUE NOT NULL,
    prompt_name VARCHAR(255) NOT NULL,
    system_prompt TEXT NOT NULL,
    card_creator_preview_prompt TEXT,     -- Preview analysis prompt
    card_creator_generation_prompt TEXT,  -- Generation prompt
    card_creator_config JSONB,           -- Config like chunk_size
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 4000,
    is_active BOOLEAN DEFAULT true
);
```

### Context Mappings
```sql
CREATE TABLE ai_context_mappings (
    source_blueprint VARCHAR(100),
    context_blueprint VARCHAR(100),
    priority INTEGER,
    max_cards INTEGER,
    inclusion_strategy VARCHAR(50)
);
```

## AI System

### Preview Prompts
Preview prompts analyze strategic impact without suggesting card counts:

```text
You are a Customer Journey Manager analyzing strategic initiatives...

Response Structure:
- Key Strategic Themes
- Customer Journey Impact Analysis
- Journey Stages Impact
- Touchpoints Changes
- Pain Points Analysis
- Opportunities
- Quick Recommendations
```

### Generation Prompts
Generation prompts create specific cards with all required fields:

```text
Generate a JSON response with these EXACT fields:
{
  "title": "Clear, specific title",
  "description": "Comprehensive description",
  "journeyType": "Current State",
  "stages": ["Stage 1", "Stage 2"],
  "touchpoints": ["Touchpoint 1"],
  // ... all blueprint-specific fields
}
```

## Recent Enhancements

### 1. Simplified 3-Step Flow
- Removed card quantity selection
- AI determines optimal card count
- Auto-adds all generated cards

### 2. Single Card Generation
- Generates one card at a time
- Better error handling
- Progress tracking for each card

### 3. Dynamic Field Parsing
- Reads blueprint configs at runtime
- Ensures all fields are populated
- Adapts to blueprint changes

### 4. Context-Aware Preview
- Custom preview prompts per blueprint
- Impact analysis instead of card planning
- Stored in database for customization

### 5. Auto-Navigation
- Navigates to created cards after generation
- Uses blueprint registry for section lookup
- Handles both blueprint and section navigation

### 6. Source Filtering Enhancement
- Only shows blueprint sections with at least 1 card
- Filters empty sections from source selection
- Real-time updates as cards are added/removed
- Improves UX by showing only meaningful context sources

## Testing & Debugging

### Common Issues

1. **Generic Card Titles**
   - Check if AI response includes title field
   - Verify prompt includes context usage
   - Check array vs object response handling

2. **Missing Context**
   - Verify contextSummary is passed to MCP
   - Check if preview prompt emphasizes context
   - Ensure selected cards are formatted correctly

3. **Navigation Errors**
   - Ensure BLUEPRINT_REGISTRY is imported
   - Check targetSection matches blueprint IDs
   - Verify metadata is passed correctly

4. **Empty Source Sections**
   - Source sections with 0 cards are automatically filtered out
   - If no sections appear, check card counts in database
   - Verify blueprint card types match section cardTypes array

5. **Source Selection Issues**
   - Check if getSectionCardCount logic matches actual card filtering
   - Verify strategy ID is passed correctly to hooks
   - Monitor console logs for card counting debug info

### Debug Points
```typescript
// Key console.log locations
console.log('MCP Response:', result);
console.log('AI generated card:', aiResponse);
console.log('Processing card:', rawCard);
console.log('Planned quantity:', quantity);

// Source selection debugging
console.log(`🔢 Counting cards for ${sectionId} (${category}):`, cardTypes);
console.log(`🔵 Strategy count for ${sectionId}:`, count, 'matching cards:', cards.map(c => c.card_type));
```

### MCP Server Logs
Monitor MCP server output for:
- System prompt retrieval
- Field definitions parsing
- Context processing
- Error messages

## Future Improvements

### Planned Enhancements
1. **Batch Generation Optimization**
   - Generate multiple cards in single AI call
   - Reduce API costs and latency

2. **Context Intelligence**
   - Smart context selection
   - Relevance scoring
   - Auto-suggest related cards

3. **Template System**
   - Save successful generation patterns
   - Quick-start templates
   - Industry-specific templates

4. **Advanced Preview**
   - Visual journey mapping
   - Impact visualization
   - Confidence scoring

5. **Collaborative Features**
   - Team review workflow
   - Comment on generated cards
   - Version control for prompts

### Technical Debt
- Consolidate error handling
- Improve TypeScript types
- Add comprehensive tests
- Performance optimization for large contexts

## Getting Started

### For New Developers

1. **Understand the Flow**
   - Start with CardCreator.tsx
   - Follow the step progression: Source Selection → Card Selection → AI Analysis → Generation
   - Trace data through MCP to AI

2. **Key Files to Review**
   ```
   - src/components/shared/card-creator/CardCreator.tsx
   - src/components/shared/card-creator/sections/SourceSelection.tsx
   - supabase-mcp/src/tools/strategy-creator-tools.ts
   - src/app/api/card-creator/generate/route.ts
   - src/components/blueprints/registry.ts
   ```

3. **Testing Locally**
   ```bash
   # Start MCP server
   cd supabase-mcp && npm run start:http
   
   # Run Next.js app
   npm run dev
   
   # Monitor logs in both terminals
   ```

4. **Database Setup**
   - Run migration: `20250115_create_ai_edit_mode_system.sql`
   - Add system prompts for each blueprint type
   - Configure context mappings as needed

### Best Practices
- Always handle AI response variations
- Provide clear error messages
- Log key decision points
- Test with different card types
- Monitor token usage

## Conclusion

The Card Creator is a sophisticated system that combines modern web technologies, AI capabilities, and thoughtful UX design. Its modular architecture allows for easy extension while maintaining reliability. The recent enhancements have focused on simplification and reliability, making it more robust for production use.

For questions or improvements, consider:
- The balance between AI autonomy and user control
- Performance implications of single vs batch generation
- Customization needs for different organizations
- Integration with other strategic planning tools
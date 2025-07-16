# PINNLO V2 - New Engineer Onboarding Guide

Welcome to the Pinnlo V2 team! This comprehensive guide will help you understand the platform, its architecture, and how to contribute effectively.

## Table of Contents
1. [What is Pinnlo?](#what-is-pinnlo)
2. [Technical Architecture](#technical-architecture)
3. [Getting Started](#getting-started)
4. [Key Concepts](#key-concepts)
5. [Code Organization](#code-organization)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [FAQ](#faq)

---

## What is Pinnlo?

### Vision
Pinnlo V2 is an **AI-powered strategic planning platform** designed to help organizations create, manage, and execute comprehensive business strategies through intelligent card-based interfaces.

### Target Users
- **Strategy Teams**: Creating and managing organizational strategies
- **Product Managers**: Developing product roadmaps and requirements
- **Business Analysts**: Gathering and analyzing market intelligence
- **Leadership Teams**: Making data-driven strategic decisions

### Core Value Proposition
- **AI-Enhanced Planning**: Leverage AI to generate strategic insights and recommendations
- **Unified Workspace**: Single platform for intelligence, strategy, development, and organizational planning
- **Visual Strategy Management**: Card-based interface for easy strategy visualization and management
- **Collaborative Platform**: Real-time collaboration features for distributed teams

### Key Features
1. **Intelligence Bank**: Collect, analyze, and manage business intelligence
2. **Strategy Bank**: Create and execute strategic plans with AI assistance
3. **Development Bank**: Manage technical requirements and development workflows
4. **Organisation Bank**: Map organizational structures and capabilities
5. **Agent Hub**: Marketplace for AI agents that enhance productivity
6. **Template Bank**: Reusable templates for common strategic artifacts

---

## Technical Architecture

### Tech Stack Overview
```
Frontend:    Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:     Supabase (PostgreSQL + Auth + Real-time)
AI:          OpenAI GPT-4 + MCP Server architecture
Deployment:  Vercel (Frontend) + Supabase (Backend)
```

### Architecture Principles
1. **Universal Card System**: Single component handles all content types
2. **Blueprint-Driven**: Dynamic field configuration through blueprints
3. **Agent-Based AI**: Modular AI tools through MCP server
4. **Progressive Disclosure**: Preview cards → detailed modals
5. **Real-time Collaboration**: Live updates and synchronization

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  MCP Server     │    │   Supabase      │
│   (Frontend)    │◄──►│  (AI Tools)     │    │   (Database)    │
│                 │    │                 │    │                 │
│ • Components    │    │ • OpenAI API    │    │ • PostgreSQL    │
│ • Hooks         │    │ • AI Tools      │    │ • Auth          │
│ • Pages         │    │ • Strategy Gen  │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Interaction** → Component → Hook → Supabase
2. **AI Generation** → Component → MCP Server → OpenAI → Database
3. **Real-time Updates** → Supabase → Hook → Component → UI

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Code editor (VS Code recommended)

### 1. Clone and Setup
```bash
git clone https://github.com/your-org/pinnlo-v2.git
cd pinnlo-v2
npm install
```

### 2. Environment Variables
Create `.env.local` file:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MCP Server
MCP_SERVER_URL=http://localhost:3001
MCP_SERVER_TOKEN=your-mcp-token

# AI APIs
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Feature Flags
AI_CARD_GENERATION_ENABLED=true
AI_SUGGESTIONS_ENABLED=false
```

### 3. Database Setup
```bash
# Apply migrations
npx supabase db push

# Verify setup
npm run test:db
```

### 4. Start Development Servers
```bash
# Terminal 1: Start MCP Server
cd supabase-mcp && npm run dev

# Terminal 2: Start Next.js
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **MCP Server**: http://localhost:3001
- **Supabase Dashboard**: Your Supabase project URL

---

## Key Concepts

### 1. Cards and Blueprints
**Cards** are the fundamental unit of content in Pinnlo. Each card has:
- **Blueprint**: Defines structure and fields
- **Data**: Actual content stored in database
- **Type**: Determines behavior and validation

**Blueprints** define card structure:
```typescript
interface BlueprintConfig {
  id: string;           // Unique identifier
  name: string;         // Display name
  fields: BlueprintField[];  // Field definitions
  category: string;     // Grouping category
}
```

### 2. Banks (Core Features)
**Banks** are feature modules that manage specific types of content:
- **Intelligence Bank**: Market research, competitor analysis
- **Strategy Bank**: Strategic plans, objectives, KPIs
- **Development Bank**: Technical requirements, task lists
- **Organisation Bank**: Company structure, team mapping

### 3. Agents
**Agents** are AI-powered tools that enhance productivity:
- **Card Creator**: Generate cards from prompts
- **URL Analyzer**: Extract insights from web pages
- **Text Processor**: Analyze and structure text content

### 4. MCP Server
**Model Context Protocol Server** handles AI operations:
- Centralizes AI tool management
- Provides consistent AI patterns
- Enables tool reuse across features

### 5. Component Architecture
```
IntelligenceCardGrid (Container)
├── IntelligenceCardPreview (Preview)
└── IntelligenceCardModal (Detail View)
```

---

## Code Organization

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── strategies/        # Strategy workspace
│   └── globals.css        # Global styles
├── components/
│   ├── intelligence-bank/ # Intelligence features
│   ├── strategy-bank/     # Strategy features
│   ├── development-bank/  # Development features
│   ├── organisation-bank/ # Organisation features
│   ├── agent-hub/         # Agent marketplace
│   ├── shared/           # Reusable components
│   └── blueprints/       # Blueprint configurations
├── hooks/                 # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

### Key Files to Understand
1. **`/src/components/intelligence-cards/IntelligenceCardGrid.tsx`**
   - Universal grid component used by all banks
   - Handles card display, selection, and modal management

2. **`/src/components/blueprints/registry.ts`**
   - Central registry for all blueprint configurations
   - Maps card types to their field definitions

3. **`/src/hooks/useIntelligenceBankCards.ts`**
   - Example of data management hook pattern
   - Handles CRUD operations for intelligence cards

4. **`/src/lib/agentRegistry.ts`**
   - Agent management system
   - Dynamic agent loading and assignment

5. **`/src/components/shared/card-creator/CardCreator.tsx`**
   - AI-powered card generation component
   - Reused across all banks

### Component Patterns

#### 1. Universal Card Component
```typescript
// Single component handles all card types
<IntelligenceCardGrid 
  cards={transformedCards}
  onCreateCard={handleCreate}
  onUpdateCard={handleUpdate}
  onDeleteCard={handleDelete}
/>
```

#### 2. Data Transformation Layer
```typescript
// Each bank transforms data to common format
const transformedCards = cards.map(card => ({
  ...card,
  cardType: card.card_type,
  priority: card.priority || 'Medium',
  created_at: card.created_at || card.createdDate
}))
```

#### 3. Hook Pattern
```typescript
// Custom hooks for data management
const {
  cards,
  loading,
  error,
  createCard,
  updateCard,
  deleteCard
} = useIntelligenceBankCards()
```

---

## Development Workflow

### 1. Feature Development Process
1. **Plan**: Review requirements and design
2. **Blueprint**: Create/update blueprint configuration if needed
3. **Component**: Build UI components following patterns
4. **Hook**: Create data management hook
5. **Integration**: Connect to existing systems
6. **Test**: Manual testing with real data
7. **Review**: Code review and feedback
8. **Deploy**: Merge and deploy

### 2. Code Standards
- **TypeScript**: Strict mode enabled, full type coverage
- **Components**: PascalCase naming, default exports
- **Hooks**: camelCase naming, use- prefix
- **Imports**: Named imports for utilities, default for components
- **Styling**: Tailwind CSS with consistent patterns

### 3. Commit Convention
```bash
feat: add new blueprint configuration
fix: resolve card save issue
docs: update onboarding guide
refactor: extract common agent logic
test: add validation tests
```

### 4. Branch Strategy
- `main`: Production-ready code
- `development`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Emergency fixes

---

## Testing

### Manual Testing Approach
Pinnlo uses **manual testing with real data** as the primary testing strategy:

1. **Feature Testing**: Test each feature with realistic data
2. **Integration Testing**: Verify features work together
3. **Performance Testing**: Monitor load times and responsiveness
4. **User Flow Testing**: Complete user scenarios

### Automated Testing
Limited automated tests for:
- **Performance**: Load testing for critical paths
- **Memory**: Memory leak detection
- **Validation**: Edge case validation logic

### Test Data
- **Development**: Use test strategies and mock data
- **Staging**: Real-world data for comprehensive testing
- **Production**: Live data with feature flags

---

## Deployment

### Architecture
```
GitHub → Vercel (Frontend) → Supabase (Backend)
         ↓
    MCP Server (AI Tools)
```

### Deployment Process
1. **Development**: Feature branches deployed to preview URLs
2. **Staging**: `development` branch auto-deployed
3. **Production**: `main` branch deployment

### URLs
- **Production**: `https://pinnlo-v2-pinnlo.vercel.app/`
- **Development**: `https://pinnlo-v2-git-development-pinnlo.vercel.app/`
- **Preview**: Unique URLs for each PR

### Environment Configuration
- **Development**: Full debugging, relaxed validation
- **Staging**: Production-like, with test data
- **Production**: Optimized, strict validation

---

## FAQ

### General Questions

**Q: What makes Pinnlo different from other strategy tools?**
A: Pinnlo combines AI-powered generation with visual card-based interfaces, allowing for dynamic strategy creation and management. The universal card system enables flexible content types while maintaining consistency.

**Q: How does the AI integration work?**
A: AI features are provided through the MCP (Model Context Protocol) server, which centralizes AI operations and provides consistent patterns across all features. AI can generate cards, analyze content, and provide suggestions.

**Q: What is the card-based approach?**
A: Everything in Pinnlo is represented as cards - strategies, requirements, intelligence, etc. Cards provide a consistent interface while blueprints define their structure and behavior.

### Technical Questions

**Q: Why use a universal card component instead of specific components?**
A: The universal card approach eliminates code duplication and ensures UI consistency. Through blueprints, one component can handle any card type while maintaining type safety.

**Q: How does the blueprint system work?**
A: Blueprints define the structure and fields for different card types. They're configured in `/src/components/blueprints/configs/` and registered in the central registry. This allows for dynamic form generation and validation.

**Q: What is the MCP server and why is it separate?**
A: The MCP (Model Context Protocol) server handles AI operations in a separate process. This provides better performance, easier scaling, and separation of concerns between UI and AI logic.

**Q: How do I add a new card type?**
A: 1) Create a blueprint configuration, 2) Register it in the blueprint registry, 3) Add database schema if needed, 4) Test with existing components.

**Q: Why are there so many similar components across banks?**
A: This is technical debt. Originally each bank had custom components, but we've migrated to shared components. Some duplication remains and should be consolidated.

### Development Questions

**Q: How do I debug a card that's not saving?**
A: Check the browser network tab for API errors, verify the blueprint configuration matches database schema, and ensure all required fields are present.

**Q: What's the difference between Intelligence, Strategy, Development, and Organisation banks?**
A: They're different feature modules that handle different types of content, but they all use the same underlying card system and components.

**Q: How do I add a new AI agent?**
A: 1) Create the agent component in `/src/components/shared/agents/`, 2) Register it in the agent registry, 3) Implement the agent logic, 4) Add to desired banks.

**Q: Why is auto-save so complex?**
A: The auto-save system handles race conditions, offline scenarios, conflict resolution, and provides a smooth user experience. It's one of the most sophisticated parts of the system.

**Q: How do I handle new field types?**
A: Add the field type to the blueprint system, update the dynamic field renderer, and ensure proper validation and storage.

### Performance Questions

**Q: Why did we move away from the original card system?**
A: The original system had 12-28 second render times due to complex nested components. The new preview card system provides instant loading with progressive disclosure.

**Q: How does the preview card system work?**
A: Users see lightweight preview cards that show key information. Clicking opens a modal with full details. This reduces initial load time while maintaining full functionality.

**Q: What performance considerations should I keep in mind?**
A: Use React.memo for expensive components, implement proper cleanup in useEffect, debounce user input, and avoid unnecessary re-renders.

### Database Questions

**Q: Why mix camelCase and snake_case in the database?**
A: This is legacy from different development phases. We're standardizing on camelCase for new features and will migrate existing tables over time.

**Q: How does Row Level Security (RLS) work?**
A: RLS policies ensure users can only access their own data. Every table has policies that filter by user_id or related user ownership.

**Q: What's the card_data column for?**
A: The card_data column stores dynamic blueprint data as JSON. It allows for flexible field storage without database schema changes.

### Troubleshooting

**Q: The MCP server isn't starting**
A: Check that port 3001 is available, verify OpenAI API key is set, and ensure all dependencies are installed in the supabase-mcp directory.

**Q: Cards are not displaying correctly**
A: Verify the blueprint configuration exists and is properly registered. Check that the card type matches the blueprint ID.

**Q: Getting authentication errors**
A: Ensure Supabase environment variables are set correctly and RLS policies are properly configured for the current user.

**Q: AI features are not working**
A: Check that the MCP server is running, OpenAI API key is valid, and the AI_CARD_GENERATION_ENABLED flag is set to true.

---

## Next Steps

After completing this onboarding:

1. **Explore the codebase**: Start with the key files listed above
2. **Run the application**: Follow the getting started guide
3. **Make a small change**: Try adding a field to an existing blueprint
4. **Ask questions**: Don't hesitate to ask the team for clarification
5. **Review recent PRs**: See how others are implementing features

Welcome to the team! 🚀

---

## Additional Resources

- **Project Context**: `/project_context_package.md`
- **Implementation Plans**: `/implementation-plans/`
- **Migration Guides**: `/Card_Migration.md`
- **Component Documentation**: `/src/components/intelligence-cards/README.md`
- **API Documentation**: Supabase dashboard → API docs
- **Design System**: `/pinnlo-design-system.md`

## Contact

For questions or support:
- **Technical Issues**: Create GitHub issue
- **Architecture Questions**: Ask senior engineers
- **Design Questions**: Consult design system documentation
- **Database Issues**: Check Supabase logs and documentation
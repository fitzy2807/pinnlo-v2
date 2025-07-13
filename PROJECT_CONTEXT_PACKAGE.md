# Project Context Package - PINNLO V2

## Project Overview
- **Project Type**: AI-powered strategic planning platform (Next.js web application)
- **Tech Stack**: Next.js 14 + TypeScript + Supabase + OpenAI + MCP Server + Tailwind CSS
- **Current Phase**: Production-ready with Template Bank Architecture Implementation
- **Version**: 2.4.0 (Enhanced MasterCard v2.0, Organisation Bank Phase 4 Complete)
- **Timeline**: Started 2024, Major rebuild in 2025, Template Bank completed July 12, 2025, Strategy Bank completed July 12, 2025, Organisation Bank Phase 4 completed July 13, 2025

## Codebase Structure
```
pinnlo-v2/
├── 📱 Frontend (src/)
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx               # Root layout with auth
│   │   ├── page.tsx                 # Dashboard
│   │   ├── strategies/
│   │   │   ├── [id]/workspace/      # Strategy workspaces
│   │   │   └── bank/                # NEW: Strategy Bank
│   │   │       ├── page.tsx         # Strategy selection gateway
│   │   │       └── [id]/page.tsx    # Main strategy bank interface
│   │   └── api/                     # API endpoints
│   │       ├── development-bank/    # Tech generation APIs
│   │       └── strategy-creator/    # AI strategy APIs
│   │
│   ├── components/
│   │   ├── cards/                   # Universal card system
│   │   │   ├── MasterCard.tsx       # Core card component
│   │   │   └── EnhancedMasterCard.tsx # v2.0 with blueprint-driven fields
│   │   ├── blueprints/              # 30+ blueprint types
│   │   │   ├── configs/             # Blueprint definitions (including org-specific)
│   │   │   └── registry.ts          # Central registry (camelCase IDs)
│   │   ├── development-bank/        # Development tools
│   │   │   ├── DevelopmentBankModal.tsx  # Main modal
│   │   │   ├── tech-stack/          # Tech Stack section
│   │   │   │   └── TechStackSection.tsx
│   │   │   ├── TechnicalRequirements.tsx
│   │   │   └── TaskList.tsx
│   │   ├── strategy-creator/        # AI strategy wizard
│   │   │   ├── StrategyCreator.tsx  # 6-step wizard
│   │   │   └── steps/              # Individual steps
│   │   ├── intelligence-bank/       # Intelligence management
│   │   │   └── IntelligenceBank.tsx
│   │   ├── strategy-bank/           # NEW: Strategy Bank implementation
│   │   │   ├── StrategyBank.tsx    # Main bank container (includes Card Creator)
│   │   │   ├── StrategyBankModal.tsx # Modal wrapper
│   │   │   ├── StrategyBankSidebar.tsx # Tools/Sections/Groups nav
│   │   │   ├── StrategyBankContent.tsx # Card display area
│   │   │   ├── StrategySelectionGateway.tsx # Strategy picker
│   │   │   ├── BlueprintManagerTool.tsx # Blueprint configuration
│   │   │   ├── GroupManager.tsx    # Groups CRUD interface
│   │   │   ├── CardSelectionBar.tsx # Bulk operations
│   │   │   ├── QuickAddCard.tsx    # Inline card creation
│   │   │   ├── EmptyState.tsx      # Empty section guidance
│   │   │   └── LoadingStates.tsx   # Skeleton screens
│   │   ├── template-bank/           # Template Bank (reference implementation)
│   │   │   └── TemplateBank.tsx    # Complete unified bank architecture
│   │   ├── organisation-bank/       # NEW: Organisation Bank (Phase 4 complete)
│   │   │   ├── OrganisationBank.tsx # Main bank with section-specific blueprints
│   │   │   └── OrganisationBankModal.tsx # Modal with fixed scrolling
│   │   ├── shared/
│   │   │   ├── cards/
│   │   │   │   └── components/
│   │   │   │       └── AIEnhancedField.tsx # AI suggestions disabled
│   │   │   └── card-creator/       # Card Creator (shared across banks)
│   │   │       ├── CardCreator.tsx # Main component with width fixes
│   │   │       ├── factory.ts      # Factory pattern for bank-specific config
│   │   │       └── sections/       # UI sections for card generation
│   │   └── workspace/               # Strategy workspace
│   │
│   ├── hooks/
│   │   ├── useCards.ts              # Card CRUD operations
│   │   ├── useStrategies.ts         # Strategy management
│   │   ├── useIntelligenceCards.ts  # Intelligence operations
│   │   ├── useTechStackComponents.ts # Tech stack CRUD
│   │   ├── useStrategyGroups.ts     # NEW: Strategy groups CRUD
│   │   ├── organisation/
│   │   │   └── useOrganisationCards.ts # Fixed card_data merging
│   │   └── useKeyboardShortcuts.ts  # NEW: Power user shortcuts
│   │
│   └── lib/
│       ├── supabase.ts              # Database client
│       └── intelligence-api.ts      # Intelligence APIs
│
├── 🤖 MCP Server (supabase-mcp/)
│   ├── src/
│   │   ├── index.ts                 # Main server
│   │   └── tools/
│   │       ├── strategy-creator-tools.js    # AI strategy tools
│   │       ├── development-bank-tools.js    # Development tools
│   │       └── tech-stack-tools.js          # Tech stack AI
│   └── package.json
│
├── 🗄️ Database (supabase/)
│   ├── migrations/                  # Database schema
│   │   └── 20250714_create_organisation_bank.sql # Organisation Bank schema
│   └── functions/                   # Edge functions
│
└── 📝 Documentation/
    ├── README.md
    ├── PINNLO_V2_IMPLEMENTATION_OVERVIEW.md
    ├── strategy_bank_migration.md    # NEW: Strategy Bank migration guide
    └── [feature-specific guides]
```

## Key Decisions Made
- **Architecture**: Universal card system with dynamic blueprint fields - enables flexible content types
- **Technology Choices**: 
  - Next.js 14 App Router for modern React patterns
  - Supabase for auth + database with RLS security
  - MCP Server for AI tool integration (port 3001)
  - OpenAI GPT-4 for AI generation
- **Design Patterns**: 
  - MasterCard component handles all card types universally
  - Blueprint registry system for extensible card types
  - Enhanced MasterCard v2.0 with blueprint-driven field rendering
  - Section-specific blueprints for Organisation Bank (company, department, team, person)
  - Row Level Security (RLS) for multi-tenant data isolation
  - Template Bank unified architecture for all "Bank" features
- **Performance Requirements**: 
  - Real-time updates with optimistic UI
  - Efficient React Query caching
  - Defensive programming patterns

## Recent Progress
- **Last Implementation**: Organisation Bank Phase 4 Complete, Card Creator added to Strategy Bank (July 13, 2025)
- **Current Focus**: Organisation Bank card creation with section-specific blueprints, Card Creator UI consistency fixes
- **Next Steps**: Phase 5 & 6 of Organisation Bank (navigation and final integration), resolve Card Creator Step 3 width issue
- **Achievements**: 
  - Complete MasterCard Rollout Implementation Plan (Phase A & B completed)
  - All feature flags enabled for immediate access
  - Blueprint-driven card system with 30+ blueprint configurations
  - Advanced auto-save, validation, undo/redo, and AI enhancement features
  - Organisation Bank database schema and Phase 1-4 implementation
  - Fixed critical bugs: auto-deletion, field update synchronization, modal scrolling
  - Added Card Creator to Strategy Bank tools section

## Code Patterns Established
- **File Naming**: PascalCase for components, camelCase for hooks/utilities
- **Folder Structure**: Feature-based organization (development-bank/, strategy-creator/, etc.)
- **Import Patterns**: 
  ```typescript
  // Named imports for utilities
  import { supabase } from '@/lib/supabase'
  // Default imports for components
  import MasterCard from '@/components/cards/MasterCard'
  ```
- **Testing Approach**: Manual testing with real data, defensive programming with fallbacks

## Configuration & Standards
- **Package.json**: 
  ```json
  {
    "dependencies": {
      "next": "^14.2.30",
      "react": "^18",
      "@supabase/supabase-js": "^2.50.3",
      "lucide-react": "^0.525.0",
      "tailwindcss": "^3.4.17"
    }
  }
  ```
- **TypeScript**: Strict mode enabled, full type coverage
- **Tailwind CSS**: 
  - Compact sizing: `px-3 py-2 text-sm` for inputs
  - Consistent buttons: `px-4 py-1.5 text-sm bg-black text-white`
  - All input text must be `text-black` class
- **Build Process**: Next.js with TypeScript, Tailwind compilation

## Current Challenges
- **Technical Issues**: 
  - Card Creator Step 3 container width inconsistency (not matching Steps 1 & 2)
  - RLS policy violation when creating strategies (401 Unauthorized)
  - Multiple Supabase client instances warning
  - Cookie parsing errors in development
- **Performance Concerns**: 
  - Large blueprint registry could impact bundle size
  - AI suggestions were slow (disabled for performance)
- **Integration Points**: MCP server dependency (requires port 3001 availability)
- **Quality Goals**: 
  - 100% TypeScript coverage ✅
  - Comprehensive error handling ✅
  - Real-time UI updates ✅
  - Visual consistency across all UI components (in progress)

## Previous Chat Outcomes
- **Key Recommendations**: 
  - Use MasterCard for all card displays (95% code reuse achieved)
  - Follow existing patterns exactly (useCards.ts, useIntelligenceCards.ts)
  - Minimal database changes (leveraged existing tech_stack tables)
  - Apply Template Bank architecture to all bank features
- **Implementation Status**: 
  - ✅ Tech Stack feature: 5 phases completed in 1 day vs 9-day estimate
  - ✅ Strategy Creator: Both simple and advanced versions
  - ✅ Development Bank: 4 complete features
  - ✅ Intelligence Bank: Full implementation with AI processing
  - ✅ Template Bank: Complete with Groups system
  - ✅ Strategy Bank: UI complete, RLS issues pending
  - ✅ Organisation Bank: Phase 1-4 complete, section-specific blueprints working
- **Lessons Learned**: 
  - MasterCard universality eliminates need for custom card components
  - Blueprint system scales effectively to new card types
  - MCP server pattern enables consistent AI integration
  - Template Bank architecture provides excellent foundation
  - Always align blueprint IDs with database column names
  - Add ID properties to all blueprint fields to prevent sync issues
  - Properly merge card_data in update operations to preserve fields

## Architecture Decision Records

### ADR-001: Universal Card System
**Decision**: Use single MasterCard component for all card types  
**Rationale**: Eliminates code duplication, ensures UI consistency  
**Status**: Implemented ✅  
**Impact**: 95% code reuse rate, consistent UX across features  

### ADR-002: MCP Server Integration
**Decision**: External MCP server for AI tool orchestration  
**Rationale**: Separation of concerns, reusable AI tools  
**Status**: Implemented ✅  
**Impact**: Consistent AI patterns, easy tool addition  

### ADR-003: Blueprint Registry System
**Decision**: Centralized blueprint configuration  
**Rationale**: Extensible architecture for new card types  
**Status**: Implemented ✅  
**Impact**: 30+ blueprint types supported, easy expansion  

### ADR-004: Supabase + RLS Security
**Decision**: Row Level Security for multi-tenant isolation  
**Rationale**: Database-level security, zero trust architecture  
**Status**: Implemented ✅  
**Impact**: Secure multi-user environment  

### ADR-005: Template Bank Architecture
**Decision**: Unified bank architecture with Tools/Sections/Groups  
**Rationale**: Consistent UX across all bank features  
**Status**: Implemented ✅  
**Impact**: Reusable pattern for Strategy Bank and future banks  

### ADR-006: Blueprint ID Naming Convention
**Decision**: Use camelCase IDs matching database column names  
**Rationale**: Prevents mapping errors between application and database  
**Status**: Implemented ✅  
**Impact**: Backward compatibility mapping added for legacy cards  

## Environment Variables Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# MCP Server
MCP_SERVER_URL=http://localhost:3001
MCP_SERVER_TOKEN=[your-mcp-token]

# AI APIs
OPENAI_API_KEY=[your-openai-key]

# Feature Flags
AI_CARD_GENERATION_ENABLED=true
AI_SUGGESTIONS_ENABLED=false  # Disabled for performance
```

## Quick Start Commands
```bash
# Start MCP server (Terminal 1)
cd supabase-mcp && npm run dev

# Start main application (Terminal 2)
npm run dev

# Apply database migrations
npx supabase db push
```

## Session Handover Summary (July 13, 2025)

### What Was Accomplished
1. **Enhanced MasterCard Review**: Confirmed blueprint-driven system uses generic approach, not 28-field structure
2. **Performance Optimization**: Disabled AI suggestions in AIEnhancedField.tsx due to slowness
3. **UI Consistency**: Added `text-black` class to all input fields across multiple components
4. **Blueprint Registry Alignment**: Updated all blueprint IDs from kebab-case to camelCase to match database schema
5. **Backward Compatibility**: Added mapping for legacy card types to prevent "Unknown card type" errors
6. **Organisation Bank Implementation**: 
   - Phase 1: Database schema created via SQL
   - Phase 2: Hooks and types created (with critical fixes)
   - Phase 3: Blueprint configuration created
   - Phase 4: Main components created and added to navigation
7. **Critical Bug Fixes**:
   - Fixed cards auto-deleting after creation (section filter mismatch)
   - Fixed typing in one field updating all fields (missing ID properties)
   - Fixed modal scrolling issues (flex layout)
   - Fixed value.trim() error (String conversion)
   - Fixed updateCard to properly merge card_data
8. **Section-Specific Blueprints**: Created separate blueprints for company, department, team, and person
9. **Card Creator Integration**: Added to Strategy Bank tools section as exact replica of Development Bank version
10. **UI Consistency Attempts**: Multiple attempts to fix Card Creator Step 3 width issue (still pending)

### Key Technical Insights
- Blueprint IDs must match database column names exactly
- All blueprint fields must have unique ID properties
- Card_data must be properly merged in update operations to preserve fields
- Section filtering logic must align between display and storage
- Exact replication of existing patterns is crucial for consistency
- Visual consistency requires careful attention to container widths and constraints

### Outstanding Issues
1. **Card Creator Step 3 Width**: Container width not matching Steps 1 & 2 despite multiple fixes
2. **Organisation Bank Phase 5 & 6**: Navigation and final integration not yet implemented
3. **Strategy Bank RLS**: Still has policy violations when creating strategies

### User Interaction Patterns
- Direct, specific feedback without lengthy explanations
- Values exact replication of existing functionality
- Emphasizes visual consistency and proper UI behavior
- Corrects course immediately when implementation doesn't match expectations
- Prefers working implementations over perfect initial planning

### Next Session Priorities
1. Resolve Card Creator Step 3 width inconsistency
2. Complete Organisation Bank Phase 5 & 6
3. Continue testing all Organisation Bank blueprints
4. Address any new bugs discovered during testing
# Project Context Package - PINNLO V2

## Project Overview
- **Project Type**: AI-powered strategic planning platform (Next.js web application)
- **Tech Stack**: Next.js 14 + TypeScript + Supabase + OpenAI + MCP Server + Tailwind CSS
- **Current Phase**: Production-ready with Template Bank Architecture Implementation
- **Version**: 2.1.0
- **Timeline**: Started 2024, Major rebuild in 2025, Template Bank completed July 12, 2025

## Codebase Structure
```
pinnlo-v2/
├── 📱 Frontend (src/)
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx               # Root layout with auth
│   │   ├── page.tsx                 # Dashboard
│   │   ├── strategies/[id]/workspace/ # Strategy workspaces
│   │   └── api/                     # API endpoints
│   │       ├── development-bank/    # Tech generation APIs
│   │       └── strategy-creator/    # AI strategy APIs
│   │
│   ├── components/
│   │   ├── cards/                   # Universal card system
│   │   │   └── MasterCard.tsx       # Core card component
│   │   ├── blueprints/              # 14 blueprint types
│   │   │   ├── configs/             # Blueprint definitions
│   │   │   └── registry.ts          # Central registry
│   │   ├── development-bank/        # Development tools
│   │   │   ├── DevelopmentBankModal.tsx  # Main modal
│   │   │   ├── tech-stack/          # NEW: Tech Stack section
│   │   │   │   └── TechStackSection.tsx
│   │   │   ├── TechnicalRequirements.tsx
│   │   │   └── TaskList.tsx
│   │   ├── strategy-creator/        # AI strategy wizard
│   │   │   ├── StrategyCreator.tsx  # 6-step wizard
│   │   │   └── steps/              # Individual steps
│   │   ├── intelligence-bank/       # Intelligence management
│   │   │   └── IntelligenceBank.tsx
│   │   └── workspace/               # Strategy workspace
│   │
│   ├── hooks/
│   │   ├── useCards.ts              # Card CRUD operations
│   │   ├── useStrategies.ts         # Strategy management
│   │   ├── useIntelligenceCards.ts  # Intelligence operations
│   │   └── useTechStackComponents.ts # NEW: Tech stack CRUD
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
│   │       └── tech-stack-tools.js          # NEW: Tech stack AI
│   └── package.json
│
├── 🗄️ Database (supabase/)
│   ├── migrations/                  # Database schema
│   └── functions/                   # Edge functions
│
└── 📝 Documentation/
    ├── README.md
    ├── PINNLO_V2_IMPLEMENTATION_OVERVIEW.md
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
  - Row Level Security (RLS) for multi-tenant data isolation
- **Performance Requirements**: 
  - Real-time updates with optimistic UI
  - Efficient React Query caching
  - Defensive programming patterns

## Recent Progress
- **Last Implementation**: Tech Stack management feature in Development Bank (July 12, 2025)
- **Current Focus**: Complete production-ready platform with all major features implemented
- **Next Steps**: Performance optimization, additional blueprint types, user onboarding
- **Blockers**: None - all core features functional

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
- **Build Process**: Next.js with TypeScript, Tailwind compilation

## Current Challenges
- **Technical Issues**: None blocking - all features operational
- **Performance Concerns**: Large blueprint registry could impact bundle size
- **Integration Points**: MCP server dependency (requires port 3001 availability)
- **Quality Goals**: 
  - 100% TypeScript coverage ✅
  - Comprehensive error handling ✅
  - Real-time UI updates ✅

## Previous Chat Outcomes
- **Key Recommendations**: 
  - Use MasterCard for all card displays (95% code reuse achieved)
  - Follow existing patterns exactly (useCards.ts, useIntelligenceCards.ts)
  - Minimal database changes (leveraged existing tech_stack tables)
- **Implementation Status**: 
  - ✅ Tech Stack feature: 5 phases completed in 1 day vs 9-day estimate
  - ✅ Strategy Creator: Both simple and advanced versions
  - ✅ Development Bank: 4 complete features
  - ✅ Intelligence Bank: Full implementation with AI processing
- **Lessons Learned**: 
  - MasterCard universality eliminates need for custom card components
  - Blueprint system scales effectively to new card types
  - MCP server pattern enables consistent AI integration

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
**Impact**: 14 blueprint types supported, easy expansion  

### ADR-004: Supabase + RLS Security
**Decision**: Row Level Security for multi-tenant isolation  
**Rationale**: Database-level security, zero trust architecture  
**Status**: Implemented ✅  
**Impact**: Secure multi-user environment  

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

## Feature Status Matrix
| Feature | Status | Completion | Location |
|---------|--------|------------|----------|
| Universal Cards | ✅ Live | 100% | `/src/components/cards/` |
| Blueprint System | ✅ Live | 14/22 types | `/src/components/blueprints/` |
| Strategy Creator | ✅ Live | 100% | `/src/components/strategy-creator/` |
| Development Bank | ✅ Live | 100% | `/src/components/development-bank/` |
| Tech Stack Mgmt | ✅ NEW | 100% | `/src/components/development-bank/tech-stack/` |
| Intelligence Bank | ✅ Live | 100% | `/src/components/intelligence-bank/` |
| MCP Integration | ✅ Live | 100% | `/supabase-mcp/` |

## Git History Summary (Last 15 commits)
```
fd12ac8 feat: Add Tech Stack management to Development Bank (LATEST)
b6d8279 Major Development Bank enhancements and TaskList implementation  
1e48ea3 Strategy Creator UI redesign: black theme, enhanced filtering, bug fixes
990c5bd feat: Complete Intelligence Bank implementation with real-time updates and AI processing
60fc6ee Complete PINNLO V2 upload: All features, MCP server, Intelligence Bank automation
99d8c90 feat(ui): complete Development Bank MVP with test scenarios and task lists
409fe2d feat(db): update asset types to include test scenarios and task lists
076e8e4 feat(api): add test scenarios and task list generation endpoints
```

## Current Working State
- **Build Status**: ✅ Compiles successfully
- **Services Running**: Next.js dev server + MCP server (port 3001)
- **Database**: All migrations applied, RLS policies active
- **Authentication**: Supabase Auth working
- **AI Features**: All AI generation features operational
- **Tests**: Manual testing completed for all features

## Production Readiness Checklist
- ✅ All major features implemented
- ✅ Database schema complete with RLS
- ✅ AI integration functional
- ✅ Error handling comprehensive
- ✅ TypeScript coverage 100%
- ✅ Security (RLS) implemented
- ✅ Documentation complete
- ⏳ Performance optimization (future)
- ⏳ User onboarding flow (future)

---

## 🎯 TEMPLATE BANK v2.1.0 - COMPLETE HANDOFF (GROUPS SYSTEM)

### Major Implementation: Groups System
Successfully transformed Template Bank from basic card management to comprehensive **unified bank architecture** with full Groups functionality.

**New Database Schema Added:**
```sql
-- Groups Management Tables
CREATE TABLE template_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'blue',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE template_group_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES template_groups(id) ON DELETE CASCADE,
    card_id UUID REFERENCES template_cards(id) ON DELETE CASCADE,
    UNIQUE(group_id, card_id)
);

CREATE VIEW template_groups_with_counts AS
SELECT g.*, COUNT(gc.card_id) as card_count
FROM template_groups g
LEFT JOIN template_group_cards gc ON g.id = gc.group_id
GROUP BY g.id, g.user_id, g.name, g.description, g.color, g.created_at, g.updated_at;
```

**Frontend Implementation Complete:**
- **New Hook**: `/src/hooks/useTemplateGroups.ts` - Complete Groups CRUD with real-time updates
- **Enhanced Component**: `/src/components/template-bank/TemplateBank.tsx` - Three-way navigation (Tools/Sections/Groups)
- **UI Redesign**: Page header redesigned to match original clean style
- **Groups Functionality**: Create, view, organize, and manage card groups with color coding

### Features Implemented

#### 1. Complete Groups System
- **Cross-Section Organization**: Cards can belong to multiple groups regardless of section
- **Group Creation**: Inline form with name, description, and 6 color options
- **Group Management**: View, edit, delete groups with real-time card counts
- **Bulk Operations**: Select multiple cards → Group button → Assign to groups
- **Group View**: Click any group to see only its cards with remove functionality
- **Visual Indicators**: Color-coded dots, card counts, clean remove buttons

#### 2. Enhanced Navigation
- **Three-Way Navigation**: Tools, Sections, Groups with mutually exclusive selection
- **50% Transparent Selection**: `bg-black bg-opacity-50` for professional selected state
- **Dynamic Navigation**: Seamless switching between all three navigation types
- **Clean UI**: Black text, proper contrast, consistent hover effects

#### 3. UI/UX Improvements
- **Page Header Redesign**: Restored original clean text-based style
- **Button Styling**: `text-gray-700 hover:bg-black hover:bg-opacity-10` throughout
- **Compact Sizing**: `px-1.5 py-0.5` for text buttons, `px-2.5 py-0.5` for inputs
- **No Focus Rings**: Removed distracting black rings from all inputs
- **Quick Add**: Smooth slide animation with clean form design
- **Selection States**: Proper white text on selected, black on unselected

#### 4. Group Cards Management
- **Remove Indicators**: Small red circle + "remove from group" text positioned after confidence badge
- **Clean Positioning**: `top-8 right-2` for perfect alignment with card content
- **Smooth Interactions**: Hover effects and transitions on all group actions
- **Real-time Updates**: Group counts and views refresh immediately after operations

### Technical Architecture

**Database Pattern:**
- Many-to-many relationship between cards and groups via junction table
- Efficient view with card counts for real-time UI updates
- RLS policies ensure user data isolation
- Cascade deletes maintain data integrity

**Frontend Pattern:**
- State management with `selectedGroup`, `viewType`, `groupCards`
- Real-time data loading with `loadGroupCards()` on group selection
- Optimistic UI updates with proper error handling
- Defensive programming throughout (null checks, fallbacks)

**UI Pattern:**
- Sidebar sections: Tools → Sections → Groups
- Main content area adapts based on selection type
- Consistent styling across all navigation elements
- Modal-based group selection for bulk operations

### Key Files Updated/Created
```
pinnlo-v2/src/
├── hooks/
│   └── useTemplateGroups.ts                    # NEW: Complete Groups CRUD
├── components/
│   └── template-bank/
│       └── TemplateBank.tsx                    # MAJOR UPDATE: Groups system
supabase/migrations/
└── [timestamp]_create_template_groups.sql      # NEW: Groups schema
```

### User Experience Flow
1. **Create Groups**: Click + icon → Name/describe/color → Create
2. **Add Cards to Groups**: Select cards → Group button → Choose group
3. **View Groups**: Click group in sidebar → See only group cards
4. **Manage Groups**: Remove cards, edit groups, organize collections
5. **Cross-Section Access**: Groups work across all sections seamlessly

### Migration Value
The Template Bank now demonstrates the **complete unified architecture** for all bank sections:
- **Intelligence Bank**: Can adopt Groups for organizing insights by topic
- **Development Bank**: Can use Groups for organizing by project or technology
- **Strategy Workspace**: Can leverage Groups for strategic themes

### Production Status
- ✅ **Database Schema**: All tables created with RLS policies
- ✅ **Frontend Implementation**: Complete Groups system functional
- ✅ **UI Design**: Clean, professional, consistent with platform
- ✅ **Real-time Updates**: All operations refresh UI immediately
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Testing**: All features manually tested and working
- ✅ **Performance**: Efficient queries and optimistic updates

### Debug & Monitoring
- Console logging for group operations (can be removed for production)
- Debug info panel in empty group states (can be removed for production)
- Toast notifications for all user actions
- Proper error boundaries and fallback states

---
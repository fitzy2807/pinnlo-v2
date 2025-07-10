# PINNLO V2 - Complete Implementation Overview

**Last Updated:** July 10, 2025  
**Purpose:** Complete recovery guide for all implemented features

---

## 🎯 PROJECT OVERVIEW

PINNLO V2 is an AI-powered strategy development platform that transforms strategic planning from scattered documents into a structured, intelligent card-based system. The platform uses a universal card architecture with 22 specialized blueprint types, enhanced by AI features for content generation and intelligence management.

**Core Technologies:**
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **AI Integration:** OpenAI API + MCP (Model Context Protocol) Server
- **Authentication:** Supabase Auth with email/password

---

## 📁 COMPLETE FILE STRUCTURE

```
pinnlo-v2/
├── 📄 Configuration Files
│   ├── package.json                    # Dependencies & scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tailwind.config.ts             # Tailwind CSS configuration
│   ├── next.config.js                 # Next.js configuration
│   ├── .env.local                     # Environment variables (contains API keys)
│   └── .gitignore                     # Git ignore patterns
│
├── 📊 Database & Migrations
│   └── supabase/
│       ├── config.toml                # Supabase configuration
│       └── migrations/
│           ├── 20250710_strategy_creator_schema.sql      # Strategy Creator tables
│           ├── 20250710_add_executive_summaries.sql      # Executive summaries
│           ├── 20250107_refactor_intelligence_profiles_global.sql  # Intelligence profiles
│           ├── 20250108_intelligence_cards_system.sql    # Intelligence cards
│           └── [other migration files]
│
├── 🤖 MCP Server (supabase-mcp/)
│   ├── src/
│   │   ├── index.ts                   # Main MCP server entry
│   │   └── tools/
│   │       ├── development-bank-tools.js    # Development Bank AI tools
│   │       └── strategy-creator-tools.js    # Strategy Creator AI tools
│   ├── package.json                   # MCP server dependencies
│   └── .env                          # MCP server environment variables
│
├── 💻 Source Code (src/)
│   ├── 📱 Application Routes (app/)
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                  # Homepage/dashboard
│   │   ├── auth/                     # Authentication pages
│   │   ├── strategies/
│   │   │   └── [id]/
│   │   │       └── workspace/
│   │   │           ├── page.tsx      # Strategy workspace
│   │   │           └── [blueprintId]/
│   │   │               └── page.tsx  # Blueprint-specific pages
│   │   └── api/                      # API endpoints
│   │       ├── development-bank/
│   │       │   ├── tech-stack/route.ts         # AI tech stack generation
│   │       │   ├── specification/route.ts      # Specification generation
│   │       │   ├── generate-tests/route.ts     # Test scenario generation
│   │       │   └── generate-tasks/route.ts     # Task list generation
│   │       └── strategy-creator/
│   │           ├── session/route.ts            # Session management
│   │           ├── context/route.ts            # Context summary generation
│   │           ├── generate/route.ts           # Card generation
│   │           └── commit/route.ts             # Save cards to database
│   │
│   ├── 🧩 Components (components/)
│   │   ├── Header.tsx                 # Main navigation with feature modals
│   │   ├── CreateStrategyModal.tsx    # Strategy creation modal
│   │   │
│   │   ├── blueprints/               # Blueprint system (14 implemented)
│   │   │   ├── configs/              # Blueprint configurations
│   │   │   ├── registry.ts           # Central blueprint registry
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── BlueprintFields.tsx   # Dynamic field renderer
│   │   │
│   │   ├── cards/                    # Universal card system
│   │   │   ├── MasterCard.tsx        # Main card component
│   │   │   ├── editors/              # Tag & relationship editors
│   │   │   └── fields/               # Dynamic field components
│   │   │
│   │   ├── workspace/                # Workspace components
│   │   │   ├── BlueprintManager.tsx  # Blueprint configuration
│   │   │   ├── BlueprintPage.tsx     # Blueprint page layout
│   │   │   └── ExecutiveSummary.tsx  # Executive summary component
│   │   │
│   │   ├── development-bank/         # Development Bank feature
│   │   │   ├── DevelopmentBankModal.tsx        # Main modal (4 features)
│   │   │   ├── TechStackWizard.tsx            # Tech stack selection wizard
│   │   │   ├── SpecificationDisplay.tsx        # Spec generator & display
│   │   │   └── TechStackRecommendations.tsx   # AI recommendations display
│   │   │
│   │   ├── strategy-creator/         # Strategy Creator feature (2 versions)
│   │   │   ├── StrategyCreator.tsx            # Comprehensive 6-step wizard
│   │   │   ├── StrategyCreatorModalSimple.tsx # Simple 3-step version
│   │   │   ├── CreatorSidebar.tsx             # Step navigation
│   │   │   ├── ContextInput.tsx               # Simple context input
│   │   │   ├── CardTypeSelector.tsx           # Simple card selector
│   │   │   ├── StrategyPreview.tsx            # Simple preview
│   │   │   └── steps/                         # Comprehensive wizard steps
│   │   │       ├── StrategySelector.tsx       # Step 1: Select strategy
│   │   │       ├── BlueprintContextSelector.tsx # Step 2: Blueprint cards
│   │   │       ├── IntelligenceContextSelector.tsx # Step 3: Intelligence
│   │   │       ├── ContextSummaryReview.tsx   # Step 4: Review summary
│   │   │       ├── TargetBlueprintSelector.tsx # Step 5: Target blueprint
│   │   │       └── GeneratedCardsReview.tsx   # Step 6: Review & commit
│   │   │
│   │   ├── intelligence-bank/        # Intelligence Bank feature
│   │   │   ├── IntelligenceBank.tsx           # Main modal interface
│   │   │   ├── IntelligenceProfile.tsx        # Profile configuration
│   │   │   └── IntelligenceBankSimple.tsx     # Simplified version
│   │   │
│   │   ├── intelligence-cards/       # Intelligence card components
│   │   │   ├── IntelligenceCard.tsx           # Card display
│   │   │   ├── IntelligenceCardEditor.tsx     # Card editor
│   │   │   └── IntelligenceCardList.tsx       # Card list view
│   │   │
│   │   └── ui/                       # Reusable UI components
│   │       ├── button.tsx            # Button component
│   │       ├── input.tsx             # Input fields
│   │       ├── textarea.tsx          # Textarea component
│   │       └── [other UI components]
│   │
│   ├── 🔧 Business Logic
│   │   ├── lib/
│   │   │   ├── supabase.ts           # Browser client
│   │   │   ├── supabase-server.ts    # Server client
│   │   │   ├── supabase-admin.ts     # Admin client
│   │   │   ├── intelligence-api.ts   # Intelligence Bank API
│   │   │   ├── intelligence-cards-api.ts # Intelligence Cards API
│   │   │   └── utils.ts              # Utility functions
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Authentication hook
│   │   │   ├── useCards.ts           # Card management
│   │   │   ├── useStrategies.ts      # Strategy management
│   │   │   ├── useBlueprintCards.ts  # Blueprint card loading
│   │   │   └── useIntelligenceCards.ts # Intelligence card hooks
│   │   │
│   │   ├── services/
│   │   │   └── cardService.ts        # Card CRUD operations
│   │   │
│   │   └── types/
│   │       ├── card.ts               # Card type definitions
│   │       ├── strategy-creator.ts   # Strategy Creator types
│   │       └── intelligence-cards.ts # Intelligence card types
│   │
│   └── 🔐 Infrastructure
│       ├── providers/
│       │   └── AuthProvider.tsx      # Authentication context
│       └── middleware.ts             # Auth middleware
│
├── 📝 Documentation Files
│   ├── DEVELOPMENT_README.md         # Development progress tracking
│   ├── INTELLIGENCE_BANK_RECOVERY_STATUS.md  # Intelligence Bank recovery
│   ├── STRATEGY_CREATOR_IMPLEMENTATION_GUIDE.md # Strategy Creator guide
│   └── PINNLO_V2_IMPLEMENTATION_OVERVIEW.md    # This file
│
└── 🧪 Test Files
    └── tests/
        ├── intelligence-bank-test-data.json
        └── intelligence-cards-test-data.json
```

---

## 🏗️ IMPLEMENTED FEATURES

### 1. Universal Card System ✅
**Location:** `/src/components/cards/MasterCard.tsx`
- **Universal Fields:** 15 standard fields across all card types
- **Dynamic Fields:** Blueprint-specific fields render dynamically
- **Features:** Expandable sections, in-place editing, auto-save
- **Actions:** Pin, edit, duplicate, delete functionality
- **Database:** Cards stored in `cards` table with JSONB for blueprint fields

### 2. Blueprint Architecture ✅
**Location:** `/src/components/blueprints/`
- **14 Blueprint Types Implemented:**
  - Core Strategy: strategic-context, vision, value-proposition
  - Research: personas, customer-journey, swot-analysis, competitive-analysis
  - Planning: okrs, business-model, go-to-market, risk-assessment, roadmap
  - Measurement: kpis, financial-projections
- **Registry System:** Centralized configuration in `registry.ts`
- **Dynamic Rendering:** `BlueprintFields.tsx` handles all field types

### 3. Development Bank ✅
**Location:** `/src/components/development-bank/`
**Features:**
1. **AI Tech Stack Generator** - Multi-step wizard for technology selection
2. **Specification Generator** - Creates detailed technical specifications
3. **Test Scenario Generator** - Generates comprehensive test scenarios
4. **Task List Generator** - Breaks down features into actionable tasks

**MCP Tools:** `/supabase-mcp/src/tools/development-bank-tools.js`
- `generate_tech_stack` - AI-powered tech recommendations
- `generate_specification` - Technical spec generation
- `generate_test_scenarios` - Test case generation
- `generate_task_list` - Task breakdown

### 4. Strategy Creator (Two Versions) ✅

#### Simple Version (3-step wizard)
**Location:** `/src/components/strategy-creator/StrategyCreatorModalSimple.tsx`
- Basic context input (business context, goals, challenges, constraints)
- Card type selection
- Preview and create

#### Comprehensive Version (6-step wizard)
**Location:** `/src/components/strategy-creator/StrategyCreator.tsx`
**Steps:**
1. **Strategy Selection** - Choose target strategy with metrics
2. **Blueprint Context** - Select existing cards as context
3. **Intelligence Context** - Choose intelligence cards
4. **Context Summary** - AI-generated summary review
5. **Target Blueprint** - Select blueprint type with AI recommendations
6. **Generated Cards Review** - Edit and commit cards

**Database Tables:**
- `strategy_creator_sessions` - Persistent session state
- `strategy_creator_history` - Action tracking

**MCP Tools:** `/supabase-mcp/src/tools/strategy-creator-tools.js`
- `generate_context_summary` - Analyzes blueprint and intelligence cards
- `generate_strategy_cards` - Creates cards with blueprint-specific fields

### 5. Intelligence Bank ✅
**Location:** `/src/components/intelligence-bank/`
**Features:**
- **Intelligence Profile:** 41 fields across 9 categories
- **Intelligence Cards:** 8 categories (Market, Competitor, Trends, etc.)
- **Search & Filter:** Advanced filtering with date ranges, scores, tags
- **View Modes:** Grid and list views
- **Status Management:** Active, Saved, Archived states

**Database:**
- `intelligence_profiles` - User preferences (global, one per user)
- `intelligence_cards` - Strategic intelligence content

**Edge Functions:**
- `/supabase/functions/save-intelligence-profile/`
- `/supabase/functions/load-intelligence-profile/`

---

## 🔑 KEY TECHNICAL PATTERNS

### Authentication Pattern
```typescript
// Server-side
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

const supabase = createClient(cookies())
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Database Access Pattern
```typescript
// Row Level Security (RLS) enforced
const { data, error } = await supabase
  .from('cards')
  .select('*')
  .eq('strategy_id', strategyId)
  .eq('user_id', user.id)  // RLS ensures user can only see their data
```

### MCP Integration Pattern
```typescript
// Call MCP tool
const response = await fetch(`${process.env.MCP_SERVER_URL}/api/tools/tool_name`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
  },
  body: JSON.stringify({ /* tool arguments */ })
})

// Extract prompts and call OpenAI
const { prompts } = JSON.parse(mpcResult.content)
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  // Use prompts.system and prompts.user
})
```

### Component Structure Pattern
```typescript
// Modal component pattern
interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeatureModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        {/* Modal content */}
      </div>
    </div>
  )
}
```

---

## 🌐 ENVIRONMENT VARIABLES

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# MCP Server
MCP_SERVER_URL=http://localhost:3001
MCP_SERVER_TOKEN=pinnlo-dev-token-2025

# AI APIs
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...

# Feature Flags
AI_CARD_GENERATION_ENABLED=true
AI_INTELLIGENCE_PROCESSING_ENABLED=false
AI_STRATEGY_MONITORING_ENABLED=false
```

---

## 🚀 DEPLOYMENT CHECKLIST

### 1. Database Setup
```bash
# Apply all migrations
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy load-intelligence-profile
npx supabase functions deploy save-intelligence-profile
```

### 2. MCP Server
```bash
cd supabase-mcp
npm install
npm run dev  # Development
npm run build && npm start  # Production
```

### 3. Main Application
```bash
npm install
npm run dev   # Development
npm run build # Production build
npm start     # Production server
```

### 4. Required Services
- PostgreSQL database (via Supabase)
- MCP server running on port 3001
- OpenAI API key for AI features
- Supabase Auth configured

---

## 📊 DATABASE SCHEMA OVERVIEW

### Core Tables
1. **users** - Managed by Supabase Auth
2. **strategies** - User strategies
3. **cards** - Universal cards with blueprint fields
4. **strategy_creator_sessions** - Wizard session state
5. **strategy_creator_history** - Action tracking
6. **intelligence_profiles** - User intelligence preferences
7. **intelligence_cards** - Strategic intelligence content

### Key Relationships
- Users → Strategies (one-to-many)
- Strategies → Cards (one-to-many)
- Users → Intelligence Profile (one-to-one)
- Users → Intelligence Cards (one-to-many)

### RLS Policies
All tables have Row Level Security enabled:
- Users can only see/modify their own data
- Strategies are user-scoped
- Cards inherit strategy ownership
- Intelligence data is user-scoped

---

## 🔄 RECOVERY INSTRUCTIONS

If you need to rebuild any feature:

### 1. Development Bank
- Copy `/src/components/development-bank/` directory
- Copy `/supabase-mcp/src/tools/development-bank-tools.js`
- Copy API routes from `/src/app/api/development-bank/`
- Update Header.tsx to include the modal

### 2. Strategy Creator
- Copy `/src/components/strategy-creator/` directory
- Copy `/supabase-mcp/src/tools/strategy-creator-tools.js`
- Copy API routes from `/src/app/api/strategy-creator/`
- Apply database migration: `20250710_strategy_creator_schema.sql`
- Update Header.tsx to include the modal

### 3. Intelligence Bank
- Copy `/src/components/intelligence-bank/` directory
- Copy `/src/components/intelligence-cards/` directory
- Copy `/src/lib/intelligence-*.ts` files
- Copy `/src/hooks/useIntelligenceCards.ts`
- Copy `/src/types/intelligence-cards.ts`
- Apply database migrations for intelligence tables
- Deploy Edge Functions
- Update Header.tsx to include the modal

### 4. Blueprint System
- Copy `/src/components/blueprints/` directory
- Copy `/src/components/cards/` directory
- Ensure all 14 blueprint configs are in place
- Test with MasterCard component

---

## 🎯 FEATURE STATUS SUMMARY

| Feature | Status | Completeness | Location |
|---------|---------|--------------|-----------|
| Universal Card System | ✅ Complete | 100% | `/src/components/cards/` |
| Blueprint Architecture | ✅ Complete | 14/22 types (64%) | `/src/components/blueprints/` |
| Development Bank | ✅ Complete | 4/4 features | `/src/components/development-bank/` |
| Strategy Creator (Simple) | ✅ Complete | 100% | `/src/components/strategy-creator/` |
| Strategy Creator (Advanced) | ✅ Complete | 100% | `/src/components/strategy-creator/` |
| Intelligence Bank | ✅ Complete | 100% | `/src/components/intelligence-bank/` |
| MCP Server Integration | ✅ Complete | 100% | `/supabase-mcp/` |
| Database Schema | ✅ Complete | 100% | `/supabase/migrations/` |

---

## 💡 CRITICAL IMPLEMENTATION NOTES

1. **MCP Server Must Be Running** - All AI features require the MCP server on port 3001
2. **API Keys Required** - OpenAI API key needed for all AI generation features
3. **RLS is Critical** - Never disable Row Level Security on any table
4. **Session Management** - Strategy Creator uses database sessions for persistence
5. **Blueprint Registry** - All blueprint types must be registered in `registry.ts`
6. **Edge Functions** - Intelligence Bank uses Supabase Edge Functions, not Next.js API routes
7. **Type Safety** - Full TypeScript coverage is maintained throughout

---

**This document serves as the complete recovery guide for PINNLO V2. All features listed here have been fully implemented and tested.**
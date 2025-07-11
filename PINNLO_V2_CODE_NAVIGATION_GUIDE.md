# Pinnlo V2 Code Navigation Guide

This guide provides a comprehensive overview of the Pinnlo V2 codebase to help AI engineers quickly locate what they need.

## Table of Contents
1. [Application Overview](#application-overview)
2. [Page Routes & Components](#page-routes--components)
3. [API Endpoints](#api-endpoints)
4. [Core Components](#core-components)
5. [Feature Components](#feature-components)
6. [Hooks & State Management](#hooks--state-management)
7. [Blueprint System](#blueprint-system)
8. [Component Relationships](#component-relationships)
9. [Quick Reference](#quick-reference)

## Application Overview

Pinnlo V2 is a strategic planning platform built with:
- **Frontend**: Next.js 13+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Next.js API routes
- **AI Integration**: OpenAI GPT-4, Custom MCP server
- **Architecture**: Component-based with custom hooks for state management

## Page Routes & Components

### Main Pages

#### 1. **Home Page** (`/`)
- **File**: `src/app/page.tsx`
- **Purpose**: Main dashboard showing user strategies
- **Key Components**:
  - `Header`: Global navigation
  - `WelcomeContainer`: User greeting and quick actions
  - `MainContentContainer`: Strategy list display
  - `SidebarContainer`: Additional information panel
- **Dependencies**:
  - `useStrategies()` hook: Manages strategy CRUD operations
  - Supabase authentication

#### 2. **Login Page** (`/auth/login`)
- **File**: `src/app/auth/login/page.tsx`
- **Purpose**: Authentication gateway
- **Key Components**:
  - `AuthForm`: Supabase Auth UI component
  - Marketing content (features, testimonials)
- **Dependencies**:
  - Supabase Auth
  - Redirects to `/auth/callback` on success

#### 3. **Workspace Page** (`/strategies/[id]/workspace`)
- **File**: `src/app/strategies/[id]/workspace/page.tsx`
- **Purpose**: Main strategy workspace with blueprint-based organization
- **Key Components**:
  - `BlueprintManager`: Blueprint configuration (src/components/workspace/BlueprintManager.tsx:47)
  - `BlueprintNavigation`: Blueprint selector sidebar (src/components/workspace/BlueprintNavigation.tsx:30)
  - `PageController`: Blueprint-specific controls (src/components/workspace/PageController.tsx:52)
  - `ContentArea`: Card display and management (src/components/workspace/ContentArea.tsx:52)
  - `ExecutiveSummary`: AI-generated summaries (src/components/workspace/ExecutiveSummary.tsx:24)
  - `StrategyTools`: Right sidebar tools (src/components/workspace/StrategyTools.tsx:13)
- **Key Functions**:
  - `handleBlueprintsChange`: Updates enabled blueprints (src/app/strategies/[id]/workspace/page.tsx:34)
  - `handleAddCard`: Triggers card creation (src/app/strategies/[id]/workspace/page.tsx:51)
  - `handleQuickAddSubmit`: Quick card creation (src/app/strategies/[id]/workspace/page.tsx:56)

## API Endpoints

### Strategy Creator APIs

#### 1. **Generate Strategy** (`POST /api/strategy-creator/generate`)
- **File**: `src/app/api/strategy-creator/generate/route.ts`
- **Purpose**: Generates strategy cards using AI
- **Functions**:
  - Validates session ownership
  - Invokes MCP server for prompt generation
  - Calls OpenAI GPT-4 Turbo
  - Deduplicates against existing cards
  - Updates session with generated cards
- **Related**: `strategy_creator_sessions`, `strategy_creator_history` tables

#### 2. **Generate Cards** (`POST /api/strategy-creator/generate-cards`)
- **File**: `src/app/api/strategy-creator/generate-cards/route.ts`
- **Purpose**: Simplified card generation (no session required)
- **Functions**:
  - Direct MCP/OpenAI integration
  - Uses GPT-4o-mini for faster generation
  - No database persistence
- **Related**: Used by StrategyCreator component

#### 3. **Session Management** (`GET/POST/PUT /api/strategy-creator/session`)
- **File**: `src/app/api/strategy-creator/session/route.ts`
- **Purpose**: Manages strategy creation sessions
- **Functions**:
  - GET: Retrieves or creates session
  - POST: Creates new session
  - PUT: Updates existing session
- **Related**: `strategy_creator_sessions` table

### Executive Summary APIs

#### 1. **Generate Summary** (`POST /api/executive-summary`)
- **File**: `src/app/api/executive-summary/route.ts`
- **Purpose**: Creates AI summaries of strategy cards
- **Functions**:
  - MCP tool for prompt generation
  - OpenAI GPT-4o-mini processing
  - Structured output (themes, implications, next steps)
- **Related**: `executive_summaries` table

#### 2. **Load Summary** (`GET /api/executive-summary-load`)
- **File**: `src/app/api/executive-summary-load/route.ts`
- **Purpose**: Retrieves existing summaries
- **Related**: ExecutiveSummary component

### Development Bank APIs

#### 1. **Generate Recommendations** (`POST /api/development-bank/generate-recommendations`)
- **File**: `src/app/api/development-bank/generate-recommendations/route.ts`
- **Purpose**: Creates tech stack recommendations
- **Functions**:
  - Fetches strategy context
  - MCP server integration
  - Saves as tech stack assets
- **Related**: DevelopmentBankModal component

#### 2. **Generate Tests** (`POST /api/development-bank/generate-tests`)
- **File**: `src/app/api/development-bank/generate-tests/route.ts`
- **Purpose**: Creates test scenarios for features
- **Related**: `development_assets` table (type: 'test-scenario')

#### 3. **Generate Tasks** (`POST /api/development-bank/generate-tasks`)
- **File**: `src/app/api/development-bank/generate-tasks/route.ts`
- **Purpose**: Creates task lists for features
- **Related**: `development_assets` table (type: 'task-list')

### Intelligence Groups APIs

#### 1. **Groups CRUD** (`GET/POST /api/intelligence-groups`)
- **File**: `src/app/api/intelligence-groups/route.ts`
- **Purpose**: Manages intelligence groups
- **Related**: IntelligenceGroups component

#### 2. **Group Operations** (`GET/PATCH/DELETE /api/intelligence-groups/[id]`)
- **File**: `src/app/api/intelligence-groups/[id]/route.ts`
- **Purpose**: Individual group management
- **Related**: `intelligence_groups` table

## Core Components

### 1. **MasterCard** 
- **File**: `src/components/cards/MasterCard.tsx:71`
- **Purpose**: Universal card component supporting all blueprint types
- **Key Features**:
  - Dynamic field rendering based on blueprint
  - Inline editing with auto-save
  - Relationship management
  - Tag system
  - AI enhancement capabilities
- **Dependencies**:
  - Blueprint registry for field definitions
  - Field editor components
  - Supabase for persistence

### 2. **ContentArea**
- **File**: `src/components/workspace/ContentArea.tsx:52`
- **Purpose**: Main card display and management area
- **Key Functions**:
  - `createCard`: Imperative card creation (src/components/workspace/ContentArea.tsx:131)
  - `handleCardChange`: Card update handler (src/components/workspace/ContentArea.tsx:171)
  - `handleDeleteCard`: Card deletion (src/components/workspace/ContentArea.tsx:191)
- **Dependencies**:
  - `useCards()` hook for data management
  - MasterCard for rendering

### 3. **BlueprintNavigation**
- **File**: `src/components/workspace/BlueprintNavigation.tsx:30`
- **Purpose**: Blueprint selector sidebar
- **Key Features**:
  - Visual blueprint grid
  - Active blueprint highlighting
  - Badge showing card counts
- **Related Components**:
  - BlueprintManager (configuration)
  - ContentArea (displays cards for selected blueprint)

## Feature Components

### 1. **StrategyCreator**
- **File**: `src/components/strategy-creator/StrategyCreator.tsx:44`
- **Purpose**: 4-step AI-powered strategy generation wizard
- **Steps**:
  1. Context input (textarea)
  2. Blueprint card selection
  3. Intelligence integration
  4. AI generation with preview
- **Key Functions**:
  - `handleGenerateCards`: AI card generation (src/components/strategy-creator/StrategyCreator.tsx:226)
  - `handleCommit`: Save cards to strategy (src/components/strategy-creator/StrategyCreator.tsx:341)
- **API Calls**:
  - `/api/strategy-creator/session`
  - `/api/strategy-creator/generate-summary`
  - `/api/strategy-creator/generate-cards`

### 2. **IntelligenceBank**
- **File**: `src/components/intelligence-bank/IntelligenceBank.tsx:48`
- **Purpose**: Comprehensive intelligence card management
- **Features**:
  - Card creation and organization
  - Group management
  - AI processing (summarization, extraction)
  - Bulk operations
- **Sub-components**:
  - IntelligenceGroups (src/components/intelligence-groups/IntelligenceGroups.tsx:41)
  - GroupCard (src/components/intelligence-groups/GroupCard.tsx:14)
- **Dependencies**:
  - `useIntelligenceCards()` hook
  - Multiple API endpoints for AI processing

### 3. **DevelopmentBankModal**
- **File**: `src/components/development-bank/DevelopmentBankModal.tsx:68`
- **Purpose**: Technical development planning
- **Features**:
  - Tech stack recommendations
  - Test scenario generation
  - Task list creation
- **API Integration**:
  - `/api/development-bank/generate-recommendations`
  - `/api/development-bank/generate-tests`
  - `/api/development-bank/generate-tasks`

## Hooks & State Management

### 1. **useStrategies**
- **File**: `src/hooks/useStrategies.ts:21`
- **Purpose**: Strategy CRUD operations
- **Features**:
  - Circuit breaker pattern
  - Optimistic updates
  - Error handling
- **Functions**:
  - `createStrategy`: Create new strategy
  - `deleteStrategy`: Delete strategy
  - `refreshStrategies`: Reload data

### 2. **useCards**
- **File**: `src/hooks/useCards.ts`
- **Purpose**: Card management within a strategy
- **Features**:
  - Real-time updates
  - Batch operations
  - Filter by blueprint

### 3. **useIntelligenceCards**
- **File**: `src/hooks/useIntelligenceCards.ts`
- **Purpose**: Intelligence-specific card operations
- **Features**:
  - Group associations
  - Bulk updates

### 4. **useAuth**
- **File**: `src/hooks/useAuth.tsx`
- **Purpose**: Authentication state management
- **Features**:
  - Supabase integration
  - Session management

## Blueprint System

### Registry
- **File**: `src/components/blueprints/registry.ts:305`
- **Purpose**: Central configuration for all card types
- **Structure**:
  ```typescript
  {
    id: string,
    name: string,
    icon: LucideIcon,
    color: string,
    category: BlueprintCategory,
    fields: BlueprintField[],
    description: string
  }
  ```

### Available Blueprints (30+ types)
Categories:
- **Strategy**: Vision, Mission, Goals, Initiatives
- **Analysis**: Market Analysis, Competitive Analysis, Risk Assessment
- **Innovation**: Feature, Epic, User Story, Experiment
- **Operations**: Process, Workflow, Policy, Metric
- **Technology**: Technical Spec, Architecture Decision
- **People**: Stakeholder, Team, Role
- **Customer**: User Persona, Customer Journey
- **Finance**: Budget, Revenue Stream

## Component Relationships

### Data Flow
```
HomePage
  └── useStrategies() → MainContentContainer → StrategyCard

WorkspacePage
  ├── BlueprintNavigation ←→ ContentArea
  │                              └── useCards() → MasterCard
  ├── StrategyTools → Modal Components
  │   ├── StrategyCreator
  │   ├── IntelligenceBank
  │   └── DevelopmentBankModal
  └── ExecutiveSummary
```

### Communication Patterns
1. **Props/Callbacks**: Parent-child communication
2. **Refs**: Imperative operations (ContentArea.createCard)
3. **Custom Hooks**: Shared state management
4. **API Layer**: Server state synchronization

## Quick Reference

### Finding What You Need

**To work with strategies:**
- List/Create/Delete: `src/hooks/useStrategies.ts`
- Strategy page: `src/app/page.tsx`

**To work with cards:**
- Display/Edit: `src/components/cards/MasterCard.tsx`
- Management: `src/components/workspace/ContentArea.tsx`
- CRUD operations: `src/hooks/useCards.ts`

**To work with AI features:**
- Strategy generation: `src/components/strategy-creator/StrategyCreator.tsx`
- Executive summaries: `src/components/workspace/ExecutiveSummary.tsx`
- Intelligence processing: `src/components/intelligence-bank/IntelligenceBank.tsx`

**To add new blueprint types:**
- Registry: `src/components/blueprints/registry.ts`
- Field types: `src/components/blueprints/types.ts`

**To modify API endpoints:**
- Strategy Creator: `src/app/api/strategy-creator/*`
- Development Bank: `src/app/api/development-bank/*`
- Intelligence: `src/app/api/intelligence-groups/*`

**To work with authentication:**
- Hook: `src/hooks/useAuth.tsx`
- Login page: `src/app/auth/login/page.tsx`
- Callback: `src/app/auth/callback/route.ts`

**To debug:**
- Test pages: `src/app/test/*`
- Debug endpoint: `src/app/api/debug/route.ts`

### Key Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role for server operations
- `OPENAI_API_KEY`: OpenAI API access
- `MCP_SERVER_URL`: MCP server endpoint
- `MCP_SERVER_TOKEN`: MCP authentication

### Database Tables
- `strategies`: Main strategy records
- `cards`: Strategy cards (blueprint-based)
- `intelligence_cards`: Intelligence bank cards
- `intelligence_groups`: Card groupings
- `executive_summaries`: AI-generated summaries
- `development_assets`: Tech recommendations, tests, tasks
- `strategy_creator_sessions`: Wizard state
- `strategy_creator_history`: Audit trail

This guide should help you quickly navigate the Pinnlo V2 codebase and understand component relationships. Each file path includes line numbers where applicable for precise navigation.
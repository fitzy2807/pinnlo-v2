# Agent Hub Implementation Plan

## Overview
The Agent Hub will be a central repository for all AI agents in PINNLO V2. Users can browse agents, configure them, and assign them to different hubs (Intelligence, Strategy, Development, Organisation). This replaces the current hardcoded tools approach with a dynamic, configurable system.

## Phase 1: Create Agent Hub as Exact Replica of Template Bank (No DB)

### Step 1.1: Create Directory Structure ✅
- [x] Create `/src/components/agent-hub/` directory
- [x] Create `AgentHub.tsx` (main component)
- [x] Create `AgentHubModal.tsx` (modal wrapper)

**Completion Summary:** Created the agent-hub directory and both component files. AgentHubModal is a simple wrapper that displays AgentHub in a fullscreen modal, matching the pattern from Template Bank.

### Step 1.2: Copy and Adapt Template Bank UI ✅
- [x] Copy TemplateBank.tsx structure to AgentHub.tsx
- [x] Replace all "template" references with "agent"
- [x] Replace "Template Bank" with "Agent Hub" in UI text
- [x] Keep the same layout:
  - Left sidebar with Tools, Sections, Groups
  - Main content area with header, controls, and card grid
  - Same styling and interactions

**Completion Summary:** Successfully adapted the Template Bank UI to create Agent Hub. Key changes include:
- Renamed sections to agent categories (Content Creation, Data Analysis, Research & Discovery, etc.)
- Updated tools section to "Agent Management" with relevant tools
- Changed all UI text from "template" to "agent" terminology
- Added agent-specific icons for categories
- Maintained the exact same layout and interaction patterns

### Step 1.3: Create Mock Data Hooks ✅
- [x] Create `/src/hooks/useAgentCards.ts` (returns mock data)
- [x] Create `/src/hooks/useAgentGroups.ts` (returns mock data)
- [x] Mock functions: createCard, updateCard, deleteCard, etc.
- [x] Use useState to simulate CRUD operations locally

**Completion Summary:** Created both mock data hooks with full CRUD functionality:
- `useAgentCards`: Manages agent cards with initial data for Card Creator, URL Analyzer, and Text & Paste Processor
- `useAgentGroups`: Manages agent groups with color coding and card associations
- Both hooks simulate API delays and maintain state locally
- Added special functions like `updateAgentHubAssignment` and `getAgentsForHub` for Phase 4 functionality

### Step 1.4: Update Global Navigation ✅
- [x] Enable the Agent Hub button in Header.tsx
- [x] Connect it to open AgentHubModal

**Completion Summary:** Successfully integrated Agent Hub into the global navigation:
- Imported AgentHubModal component
- Added agentHubOpen state variable
- Changed the Agent Hub button from disabled to functional
- Added AgentHubModal to the modals section
- Agent Hub is now accessible from the main navigation bar

## Phase 2: Create Agent Card Structure

### Step 2.1: Define Agent Card Type
```typescript
interface AgentCard {
  id: string
  name: string
  description: string
  type: 'analyzer' | 'creator' | 'processor' | 'automation'
  capabilities: string[]
  availableInHubs: string[] // ['intelligence', 'strategy', 'development', 'organisation']
  configuration: {
    requiresApiKey?: boolean
    customSettings?: Record<string, any>
  }
  icon: string // Lucide icon name
  component: string // Component name to render
  status: 'active' | 'beta' | 'deprecated'
  version: string
  author: string
  lastUpdated: string
}
```

### Step 2.2: Update Agent Hub Sections
Replace generic "Section 1-8" with agent categories:
- [ ] Content Creation
- [ ] Data Analysis
- [ ] Research & Discovery
- [ ] Automation
- [ ] Integration
- [ ] Utilities
- [ ] Custom Agents
- [ ] Archived

## Phase 3: Create Agent Components

### Step 3.1: Create Shared Agent Components Directory ✅
- [x] Create `/src/components/shared/agents/` directory

**Completion Summary:** Created the shared agents directory structure.

### Step 3.2: Extract Existing Tools as Agent Components ✅
- [x] Move Card Creator to `/src/components/shared/agents/CardCreatorAgent.tsx`
- [x] Create `/src/components/shared/agents/UrlAnalyzerAgent.tsx`
- [x] Create `/src/components/shared/agents/TextPasteAgent.tsx`

**Completion Summary:** Successfully extracted all three existing tools as reusable agent components:
- **CardCreatorAgent**: Wraps the existing Card Creator with agent-specific props and configuration
- **UrlAnalyzerAgent**: Full implementation of URL analysis functionality with category selection and group assignment
- **TextPasteAgent**: Complete text processing interface with interview detection and multi-card generation support

### Step 3.3: Create Agent Interface ✅
```typescript
interface AgentComponent {
  onClose: () => void
  configuration?: Record<string, any>
  hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
}
```

**Completion Summary:** Created comprehensive agent type definitions in `/src/components/shared/agents/types.ts`:
- Defined `AgentComponentProps` interface for all agent components
- Created `AgentMetadata` interface for agent registration
- Added type definitions for agent components and registry entries

### Step 3.4: Standardize Agent Components ✅
- [x] Each agent component should accept standard props
- [x] Include header with title, description, and close button
- [x] Maintain consistent styling with PINNLO design system

**Completion Summary:** All three agent components now follow the standard:
- Each accepts `AgentComponentProps` with onClose and optional configuration
- All have consistent headers with title, description, and close button
- All maintain PINNLO design system styling (white backgrounds, gray borders, consistent spacing)

### Step 3.5: Create Agent Loader Component ✅
- [x] Create `/src/components/shared/agents/AgentLoader.tsx`
- [x] Implement dynamic component loading with React.lazy
- [x] Add error boundary for graceful error handling
- [x] Include loading states and agent not found handling

**Completion Summary:** Created a robust agent loader that:
- Dynamically imports agent components based on agentId
- Provides loading state with spinner
- Handles errors with error boundary
- Shows helpful message when agent not found
- Supports all standard agent props

### Step 3.6: Create Agent Registry System ✅
- [x] Create `/src/lib/agentRegistry.ts`
- [x] Implement localStorage persistence
- [x] Add functions for hub assignment and agent management
- [x] Initialize with default agents

**Completion Summary:** Created comprehensive agent registry with:
- Singleton pattern for global access
- LocalStorage persistence
- Full CRUD operations for agents
- Hub assignment management
- Default agents initialization
- Reset functionality

## Phase 4: Dynamic Hub Assignment Functionality

### Step 4.1: Create Agent Configuration UI
In Agent Hub, when clicking an agent card:
- [ ] Show configuration panel
- [ ] Add checkboxes for hub availability:
  - [ ] Intelligence Hub
  - [ ] Strategy Hub
  - [ ] Development Hub
  - [ ] Organisation Hub
- [ ] Add "Save Configuration" button
- [ ] Show current assignment status

### Step 4.2: Create Agent Registry System ✅
- [x] Create `/src/lib/agentRegistry.ts`
- [x] Store agent-to-hub mappings (initially in localStorage)
- [x] Implement functions:
  ```typescript
  getAgentsForHub(hubId: string): AgentCard[]
  updateAgentHubAssignment(agentId: string, hubIds: string[])
  getAgentById(agentId: string): AgentCard | null
  getAllAgents(): AgentCard[]
  ```

**Completion Summary:** Agent registry system created in Phase 3.6 with all required functionality.

### Step 4.3: Update Hub Components to Use Agent Registry ✅
Modify Intelligence Hub's Tools section:
- [x] Import agentRegistry
- [x] Dynamically load agents assigned to 'intelligence'
- [x] Render agent buttons dynamically
- [x] Handle agent selection and render appropriate component

**Completion Summary:** Intelligence Hub updated to use dynamic agents:
- Replaced hardcoded Tools dropdown with Agents button
- Created AgentsSection component to display available agents
- Removed old UploadDataContent, UploadLinkContent, and TextPasteContent components
- Updated dashboard Quick Actions to show Agents button
- Agents are now dynamically loaded from the agent registry

### Step 4.4: Create Agent Loader Component ✅
```typescript
// /src/components/shared/AgentLoader.tsx
interface AgentLoaderProps {
  agentId: string
  onClose: () => void
  hubContext: string
}
```
- [x] Dynamically import and render agent components
- [x] Handle loading states
- [x] Handle errors gracefully

**Completion Summary:** Agent loader created in Phase 3.5.

### Step 4.5: Update All Hubs to Use Dynamic Agents ✅
- [x] Update Intelligence Hub to use agent registry
- [x] Update Strategy Hub to use agent registry
- [x] Update Development Hub to use agent registry
- [x] Update Organisation Hub to use agent registry

**Completion Summary:** All four hubs now use the dynamic agent system:
- Each hub has an "Agents" button that opens the AgentsSection
- Agents are loaded dynamically from the registry based on hub assignments
- Removed all hardcoded tool implementations
- Card Creator and other agents work seamlessly across hubs

## Phase 5: Integration and Polish

### Step 5.1: Update All Hubs
- [ ] Update Strategy Hub to use agent registry
- [ ] Update Development Hub to use agent registry
- [ ] Update Organisation Hub to use agent registry
- [ ] Remove hardcoded tool implementations
- [ ] Rename "Tools" sections to "Agents" in all hubs

### Step 5.2: Add Agent Management Features
- [ ] Enable/disable agents globally
- [ ] Agent usage analytics (mock)
- [ ] Agent version management (mock)
- [ ] Agent permissions/access control (mock)
- [ ] Favorite agents functionality

### Step 5.3: Final Testing
- [ ] Test agent assignment/unassignment
- [ ] Test agents appear in correct hubs
- [ ] Test agent functionality in different hub contexts
- [ ] Ensure no broken imports or references
- [ ] Test responsive behavior
- [ ] Test keyboard navigation

## Initial Agent Catalog

### 1. Card Creator Agent
- **Type**: Creator
- **Description**: Create and edit cards with AI assistance
- **Available in**: All hubs
- **Current locations**: Development Hub, Strategy Hub

### 2. URL Analyzer Agent
- **Type**: Analyzer
- **Description**: Analyze web pages and extract intelligence
- **Available in**: Intelligence Hub
- **Current location**: Intelligence Hub (as upload-link)

### 3. Text & Paste Agent
- **Type**: Processor
- **Description**: Process pasted text to extract insights
- **Available in**: Intelligence Hub
- **Current location**: Intelligence Hub (as text-paste)

### 4. Future Agents (Placeholders)
- **Strategy Analyzer**: Analyze existing strategies for improvements
- **Code Generator**: Generate code snippets and boilerplate
- **Report Builder**: Create reports from data
- **Workflow Automator**: Create automated workflows
- **Data Connector**: Connect to external data sources

## Implementation Timeline

### Day 1: Phase 1 - Create Agent Hub Replica
- Morning: Set up directory structure and basic components
- Afternoon: Complete UI replication and mock hooks
- End of day: Agent Hub accessible from navigation

### Day 2: Phase 2 & 3 - Card Structure and Agent Components
- Morning: Define agent card structure and update sections
- Afternoon: Extract existing tools as agent components
- End of day: Three working agent components

### Day 3: Phase 4 - Dynamic Assignment System
- Morning: Create agent configuration UI
- Afternoon: Implement agent registry system
- End of day: Agents can be assigned to hubs dynamically

### Day 4: Phase 5 - Integration and Testing
- Morning: Update all hubs to use agent registry
- Afternoon: Add management features and polish
- End of day: Complete system ready for use

## Success Criteria
1. Agent Hub looks and feels like Template Bank
2. Existing tools work as agents without loss of functionality
3. Agents can be dynamically assigned to any hub
4. No hardcoded tools remain in hub components
5. System is extensible for future agents

## Future Enhancements (Post-MVP)
1. Database persistence for agent configurations
2. Agent marketplace/sharing functionality
3. Custom agent builder interface
4. Agent chaining/workflow capabilities
5. Performance metrics and usage analytics
6. Version control and rollback capabilities
7. Team/organization level agent management
# Comprehensive Analysis: AI Functions in Pinnlo V2 Codebase

## Executive Summary

The Pinnlo V2 codebase contains a sophisticated AI-powered system with multiple integrated AI functions spanning intelligence processing, strategy creation, development automation, and executive summary generation. The system primarily uses OpenAI's GPT models (gpt-4o, gpt-4o-mini, gpt-3.5-turbo) with a Model Context Protocol (MCP) server architecture for prompt generation and management.

## 1. API Routes with AI Integration

### 1.1 Intelligence Processing Routes

**`/api/intelligence-processing/text/route.ts`**
- **Purpose**: Process raw text content (including interview transcripts) into structured intelligence cards
- **AI Model**: OpenAI GPT-4o-mini
- **System Prompt**: Dynamic based on content type (enhanced prompts for interviews)
- **Key Features**:
  - Interview detection (extracts 10+ insights for comprehensive analysis)
  - Fallback processing when MCP server fails
  - Category-based intelligence extraction
  - Token usage tracking and cost calculation
- **Input**: Text content, context, type, target category, target groups
- **Output**: Array of intelligence cards with structured data
- **Button Integration**: Text & Paste Agent in Intelligence Bank
- **Hub Application**: Intelligence Bank
- **Status**: Active

**`/api/intelligence-processing/url/route.ts`**
- **Purpose**: Analyze web pages and extract strategic intelligence
- **AI Model**: OpenAI GPT-4o
- **System Prompt**: Strategic analyst focused on web content analysis
- **Key Features**:
  - Web scraping with content extraction
  - Strategic intelligence categorization
  - Credibility scoring based on source
- **Input**: URL, context, target category, target groups
- **Output**: Intelligence cards with web-specific metadata
- **Button Integration**: URL Analyzer Agent
- **Hub Application**: Intelligence Bank
- **Status**: Active

### 1.2 Strategy Creation Routes

**`/api/strategy-creator/generate/route.ts`**
- **Purpose**: Generate strategy cards based on comprehensive context
- **AI Model**: OpenAI GPT-4-turbo-preview
- **System Prompt**: Strategic planning expert via MCP
- **Key Features**:
  - Blueprint-specific card generation
  - Context-aware generation from existing cards
  - JSON-formatted output with structured fields
- **Input**: Session ID, context summary, target blueprint, generation options
- **Output**: Array of strategy cards with blueprint-specific fields
- **Button Integration**: Strategy Creator modal
- **Hub Application**: Strategy Bank
- **Status**: Active

**`/api/strategy-creator/context/route.ts`**
- **Purpose**: Generate context summaries from blueprint and intelligence cards
- **AI Model**: Via MCP server
- **Integration**: Uses MCP strategy-creator-tools
- **Hub Application**: Strategy Bank
- **Status**: Active

### 1.3 Development Bank Routes

**`/api/development-bank/generate-technical-requirement/route.ts`**
- **Purpose**: Generate comprehensive technical requirements documents
- **AI Model**: OpenAI GPT-4o (with explicit Claude 4 preference via MCP)
- **System Prompt**: Senior technical architect with 15+ years experience
- **Key Features**:
  - Comprehensive technical specifications
  - Architecture, API, security, and performance requirements
  - Strategy context integration
- **Input**: Strategy context, features, options
- **Output**: Detailed technical requirements document
- **Button Integration**: Development Bank TRD generation
- **Hub Application**: Development Bank
- **Status**: Active

**`/api/development-bank/commit-trd-to-task-list/route.ts`**
- **Purpose**: Convert TRD into structured task lists
- **AI Model**: Claude 4 via MCP
- **System Prompt**: Senior technical project manager
- **Key Features**:
  - 9-category task breakdown
  - Effort estimation (story points)
  - Dependency mapping
- **Hub Application**: Development Bank
- **Status**: Active

### 1.4 Executive Summary Routes

**`/api/executive-summary/route.ts`**
- **Purpose**: Generate executive summaries for strategy blueprints
- **AI Model**: OpenAI GPT-3.5-turbo
- **System Prompt**: Auto-detecting blueprint type with focused analysis
- **Key Features**:
  - Blueprint type detection
  - 3-5 bullet point summaries
  - Structured JSON output with themes, implications, next steps
- **Input**: Strategy ID, blueprint type, cards array
- **Output**: Executive summary with detected blueprint and strategic insights
- **Button Integration**: Workspace page summaries
- **Hub Application**: Strategy workspace
- **Status**: Active

### 1.5 Card Creator Routes

**`/api/card-creator/generate/route.ts`**
- **Purpose**: Generic card generation endpoint
- **AI Model**: OpenAI GPT-4o-mini
- **System Prompt**: Custom system prompts via input
- **Key Features**:
  - JSON-formatted output
  - Flexible prompt system
  - Token usage tracking
- **Input**: System prompt, user prompt
- **Output**: Generated cards array
- **Button Integration**: Card Creator system
- **Hub Application**: All banks (Strategy, Development, Organisation, Intelligence)
- **Status**: Active

### 1.6 Automation Routes

**`/api/automation/rules/route.ts`**
- **Purpose**: Manage AI generation automation rules
- **Features**: CRUD operations for automation rules
- **Integration**: Used by daily intelligence cron job
- **Hub Application**: Intelligence Bank (automation)
- **Status**: Active

**`/api/cron/daily-intelligence/route.ts`**
- **Purpose**: Scheduled automation execution
- **AI Integration**: Calls MCP automation tools
- **Key Features**:
  - Rule-based execution
  - Token and cost tracking
  - Execution logging
- **Hub Application**: Intelligence Bank (automation)
- **Status**: Active

## 2. MCP Server AI Tools

### 2.1 Intelligence Tools (`supabase-mcp/src/tools/ai-generation.ts`)

**`analyze_url`**
- **Purpose**: Generate URL analysis prompts
- **Integration**: Used by intelligence-processing/url endpoint
- **Hub Application**: Intelligence Bank
- **Status**: Active - Returns prompts for AI execution

**`process_intelligence_text`**
- **Purpose**: Process text into intelligence cards
- **AI Model**: OpenAI GPT-4o-mini (direct execution)
- **System Prompt**: Dynamic based on content type
- **Key Features**:
  - Interview detection and specialized processing
  - Category-based intelligence extraction
  - Retry logic for interviews
  - Database storage integration
- **Hub Application**: Intelligence Bank
- **Status**: Active - Direct AI execution

**`generate_automation_intelligence`**
- **Purpose**: Generate intelligence cards via automation rules
- **AI Model**: OpenAI GPT-4o-mini
- **System Prompt**: From automation rules configuration
- **Key Features**:
  - System prompt from automation rules
  - Category-based generation
  - Optimization level handling
- **Hub Application**: Intelligence Bank (automation)
- **Status**: Active - Direct AI execution

### 2.2 Strategy Creator Tools (`supabase-mcp/src/tools/strategy-creator-tools.ts`)

**`generate_universal_executive_summary`**
- **Purpose**: Generate executive summaries with blueprint detection
- **System Prompt**: Expert strategic analyst with blueprint type detection
- **Key Features**:
  - Auto-detection of blueprint types
  - Framework-based analysis by blueprint category
  - 3-5 bullet point summaries
- **Hub Application**: Strategy workspace
- **Status**: Active - Returns prompts

**`generate_context_summary`**
- **Purpose**: Create comprehensive context summaries
- **System Prompt**: Strategic planning expert
- **Key Features**:
  - Blueprint and intelligence card synthesis
  - Strategic pattern identification
  - Constraint and opportunity highlighting
- **Hub Application**: Strategy Bank
- **Status**: Active - Returns prompts

**`generate_strategy_cards`**
- **Purpose**: Generate strategy cards based on context
- **System Prompt**: Blueprint-specific strategic planning expert
- **Key Features**:
  - Blueprint-specific field generation
  - Style-based generation (comprehensive, focused, innovative)
  - Existing card duplication avoidance
- **Hub Application**: Strategy Bank
- **Status**: Active - Returns prompts

### 2.3 Development Bank Tools (`supabase-mcp/src/tools/development-bank-tools.ts`)

**`generate_technical_requirement`**
- **Purpose**: Generate comprehensive technical requirements
- **System Prompt**: Senior technical architect
- **Key Features**:
  - 10-section technical requirements
  - Architecture, security, performance specifications
  - Implementation guidelines
- **Hub Application**: Development Bank
- **Status**: Active - Returns prompts

**`commit_trd_to_task_list`**
- **Purpose**: Convert TRD to structured task lists
- **System Prompt**: Senior technical project manager
- **Key Features**:
  - 9-category task breakdown
  - Effort estimation and dependency mapping
  - Acceptance criteria definition
- **Hub Application**: Development Bank
- **Status**: Active - Returns prompts

## 3. Agent System

### 3.1 URL Analyzer Agent (`src/components/shared/agents/UrlAnalyzerAgent.tsx`)
- **Purpose**: UI for URL analysis and intelligence extraction
- **AI Integration**: Calls `/api/intelligence-processing/url`
- **Features**:
  - URL validation
  - Category selection
  - Group assignment
  - Real-time feedback
- **Button Integration**: "URL Analyzer" button in Agents section
- **Hub Assignment**: Intelligence Bank
- **Status**: Active

### 3.2 Text Paste Agent (`src/components/shared/agents/TextPasteAgent.tsx`)
- **Purpose**: UI for text processing and intelligence extraction
- **AI Integration**: Calls `/api/intelligence-processing/text`
- **Features**:
  - Content type detection (interview, meeting, research)
  - Word count and estimation
  - Category selection
  - Interview-specific processing
- **Button Integration**: "Text & Paste Processor" button in Agents section
- **Hub Assignment**: Intelligence Bank
- **Status**: Active

### 3.3 Card Creator Agent (`src/components/shared/agents/CardCreatorAgent.tsx`)
- **Purpose**: UI wrapper for card generation workflow
- **AI Integration**: Uses Card Creator system
- **Features**:
  - Multi-step generation process
  - Context building
  - Blueprint-specific generation
- **Button Integration**: "Card Creator" button in Agents section
- **Hub Assignment**: All banks (Intelligence, Strategy, Development, Organisation)
- **Status**: Active

## 4. Card Creator System

### 4.1 Main Card Creator (`src/components/shared/card-creator/CardCreator.tsx`)
- **Purpose**: Multi-step card generation workflow
- **AI Integration**: Uses MCP strategy tools and AI service
- **System Prompts**: Generated via MCP based on target blueprint
- **Features**:
  - 4-step generation process
  - Context building from existing cards
  - Blueprint-specific field mapping
  - Fallback mock generation
- **Button Integration**: "Card Creator" in Agents section across all banks
- **Hub Application**: All banks (Intelligence, Strategy, Development, Organisation)
- **Status**: Active

### 4.2 AI Service (`src/components/shared/card-creator/services/aiService.ts`)
- **Purpose**: AI generation service for card creator
- **AI Integration**: Calls `/api/card-creator/generate`
- **Features**:
  - MCP prompt execution
  - Error handling
  - Response parsing
- **Status**: Active

## 5. Intelligence Processing Workflows

### 5.1 Text Processing Hook (`src/hooks/useTextProcessing.ts`)
- **Purpose**: React hook for text processing
- **AI Integration**: Calls `/api/intelligence-processing/text`
- **Features**:
  - Loading states
  - Error handling
  - Result tracking
- **Status**: Active

### 5.2 URL Analysis Hook (`src/hooks/useUrlAnalysis.ts`)
- **Purpose**: React hook for URL analysis
- **AI Integration**: Calls `/api/intelligence-processing/url`
- **Features**:
  - URL validation
  - Analysis tracking
  - Result management
- **Status**: Active

## 6. System Prompts and AI Models

### 6.1 Intelligence Processing Prompts

**Text Processing (Interview Detection)**
```
You are an expert analyst specialized in extracting business intelligence from various text sources. Since this appears to be an interview transcript, please extract comprehensive insights that would be valuable for strategic planning.

Focus on extracting 10+ detailed insights that cover:
- Strategic insights and implications
- Market opportunities and threats
- Competitive intelligence
- Customer insights and pain points
- Operational insights
- Technology insights
- Financial insights
- Risk factors
- Innovation opportunities
- Future trends and predictions
```

**URL Analysis**
```
You are a strategic analyst. Extract key intelligence from this web content and categorize it appropriately. Focus on insights that would be valuable for strategic planning.
```

### 6.2 Strategy Creation Prompts

**Executive Summary Generation**
```
You are an expert strategic analyst. Analyze the provided strategy cards and generate a comprehensive executive summary. First, automatically detect the blueprint type from the cards provided, then provide analysis appropriate to that blueprint category.
```

**Context Summary Generation**
```
You are an expert strategic planning consultant. Analyze the provided blueprint cards and intelligence cards to create a comprehensive context summary that will be used for generating additional strategic content.
```

### 6.3 Development Bank Prompts

**Technical Requirements Generation**
```
You are a senior technical architect with 15+ years of experience in software development and system design. Generate comprehensive technical requirements based on the provided strategy context and features.
```

**Task List Generation**
```
You are a senior technical project manager with expertise in breaking down complex technical requirements into actionable tasks. Convert the provided Technical Requirements Document (TRD) into a comprehensive task list.
```

## 7. Button Integration Map

### 7.1 Intelligence Bank
- **"Agents" Button** → Opens AgentsSection with dynamic agent buttons
- **"URL Analyzer" Button** → Opens UrlAnalyzerAgent component
- **"Text & Paste Processor" Button** → Opens TextPasteAgent component
- **"Card Creator" Button** → Opens CardCreatorAgent component

### 7.2 Strategy Bank
- **"Agents" Button** → Opens AgentsSection with assigned agents
- **"Card Creator" Button** → Opens CardCreatorAgent component
- **"Create Strategy" Button** → Opens StrategyCreator modal with AI generation
- **Executive Summary** → Auto-generates via `/api/executive-summary`

### 7.3 Development Bank
- **"Agents" Button** → Opens AgentsSection with assigned agents
- **"Card Creator" Button** → Opens CardCreatorAgent component
- **"Generate TRD" Button** → Calls `/api/development-bank/generate-technical-requirement`
- **"Convert to Tasks" Button** → Calls `/api/development-bank/commit-trd-to-task-list`

### 7.4 Organisation Bank
- **"Agents" Button** → Opens AgentsSection with assigned agents
- **"Card Creator" Button** → Opens CardCreatorAgent component

## 8. AI Models and Costs

### 8.1 Model Usage Summary
- **OpenAI GPT-4o**: URL analysis, development bank TRD generation
- **OpenAI GPT-4o-mini**: Text processing, intelligence automation, card generation
- **OpenAI GPT-3.5-turbo**: Executive summaries
- **Claude 4**: Preferred for development bank tools (via MCP)

### 8.2 Cost Tracking
- All AI functions include token usage tracking
- Cost calculation based on model pricing
- Usage logged in `ai_usage` database table
- Real-time cost feedback in UI components

## 9. Feature Flags and Configuration

### 9.1 Environment Variables
```bash
AI_CARD_GENERATION_ENABLED=true
AI_INTELLIGENCE_PROCESSING_ENABLED=false
AI_STRATEGY_MONITORING_ENABLED=false
AI_SUGGESTIONS_ENABLED=false  # Disabled for performance
```

### 9.2 Feature Status
- **Card Generation**: ✅ Active across all banks
- **Intelligence Processing**: ✅ Active for text and URL analysis
- **Strategy Creation**: ✅ Active with full workflow
- **Development Bank AI**: ✅ Active for TRD and task generation
- **Executive Summaries**: ✅ Active in strategy workspace
- **AI Suggestions**: ❌ Disabled for performance reasons
- **Automation**: ✅ Active with scheduled execution

## 10. Current Status Summary

### 10.1 Active AI Functions
1. **Intelligence Processing**: Text and URL analysis ✅
2. **Strategy Creation**: Card generation and context summaries ✅
3. **Development Bank**: TRD generation and task list creation ✅
4. **Executive Summaries**: Blueprint-based summary generation ✅
5. **Automation**: Scheduled intelligence generation ✅
6. **Card Creator**: Multi-step card generation workflow ✅

### 10.2 System Architecture
- **MCP Server**: Central prompt management and some direct AI execution
- **API Routes**: Authentication, request handling, AI service calls
- **React Hooks**: State management for AI operations
- **Agent System**: UI components for AI interactions
- **Database Integration**: Result storage and usage tracking

### 10.3 Integration Points
- **Intelligence Bank**: Text & URL processing agents, automation
- **Strategy Bank**: Card creator, executive summaries, strategy generation
- **Development Bank**: TRD and task list generation, card creator
- **Organisation Bank**: Card creator (framework present)
- **Automation System**: Scheduled AI generation with rule management

## 11. Recommendations

### 11.1 Performance Optimization
- Monitor token usage and costs across all AI functions
- Implement caching for frequently requested AI operations
- Consider model optimization for high-volume operations

### 11.2 Feature Enhancement
- Enable AI suggestions with performance optimizations
- Expand automation capabilities to other banks
- Implement AI-powered search and filtering

### 11.3 Monitoring and Analytics
- Add comprehensive AI usage analytics
- Implement performance monitoring for AI operations
- Track user satisfaction with AI-generated content

The system represents a comprehensive AI-powered business planning platform with sophisticated prompt engineering, multiple AI model integration, and extensive automation capabilities across all major functional areas.
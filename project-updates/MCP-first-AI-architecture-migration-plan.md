# MCP-First AI Architecture Migration Plan

## Executive Summary

This plan outlines the migration from direct OpenAI API calls to a centralized MCP (Model Context Protocol) server architecture. This will enable complex AI sequencing, multi-step workflows, and sophisticated AI orchestration while eliminating code duplication and improving maintainability.

## Current State Analysis

### Direct OpenAI Calls (To Be Migrated)
1. **`/api/intelligence-processing/text/route.ts`** - Direct GPT-4o-mini calls
2. **`/api/intelligence-processing/url/route.ts`** - Direct GPT-4o calls  
3. **`/api/executive-summary/route.ts`** - Direct GPT-3.5-turbo calls
4. **`/api/card-creator/generate/route.ts`** - Direct GPT-4o-mini calls
5. **`/api/strategy-creator/generate/route.ts`** - Direct GPT-4-turbo calls

### MCP Tools (Already Implemented)
1. **`process_intelligence_text`** - Direct execution in MCP
2. **`generate_automation_intelligence`** - Direct execution in MCP
3. **`generate_strategy_cards`** - Prompt generation only
4. **`generate_context_summary`** - Prompt generation only
5. **`generate_technical_requirement`** - Prompt generation only

## Migration Strategy

### Phase 1: Centralize All AI Calls in MCP (Immediate)
**Goal**: Move all direct OpenAI calls to MCP server
**Benefits**: Single point of AI execution, consistent error handling, token tracking

#### 1.1 Migrate Intelligence Processing
```typescript
// NEW MCP Tool: supabase-mcp/src/tools/ai-generation.ts
async function process_intelligence_url(args) {
  // Move URL processing logic from API route to MCP
  const { url, context, category, groups } = args;
  
  // Complex sequencing example:
  // 1. Fetch and clean URL content
  // 2. Generate initial analysis
  // 3. Enhance with context-specific insights
  // 4. Validate and score credibility
  // 5. Format for database storage
  
  return await executeAISequence([
    { step: 'extract_content', url },
    { step: 'analyze_content', context, category },
    { step: 'enhance_insights', existing_cards: groups },
    { step: 'score_credibility', source: url },
    { step: 'format_output', category, groups }
  ]);
}
```

#### 1.2 Migrate Card Generation
```typescript
// NEW MCP Tool: Enhanced card generation with sequencing
async function generate_cards_with_sequence(args) {
  const { blueprint, context, style, existing_cards } = args;
  
  // Multi-step AI generation:
  // 1. Analyze existing cards to avoid duplication
  // 2. Generate initial cards
  // 3. Cross-reference with blueprint requirements
  // 4. Enhance with context-specific details
  // 5. Validate and refine output
  
  return await executeAISequence([
    { step: 'analyze_existing', cards: existing_cards },
    { step: 'generate_initial', blueprint, context, style },
    { step: 'cross_reference', blueprint_requirements: blueprint.fields },
    { step: 'enhance_context', context, existing_insights: context.intelligence },
    { step: 'validate_output', blueprint, expected_count: 3 }
  ]);
}
```

#### 1.3 Migrate Executive Summaries
```typescript
// NEW MCP Tool: Multi-step executive summary generation
async function generate_executive_summary_sequence(args) {
  const { strategy_id, cards, blueprint_type } = args;
  
  // Sequential AI processing:
  // 1. Detect blueprint type if not provided
  // 2. Analyze cards by category
  // 3. Identify strategic themes
  // 4. Generate implications
  // 5. Recommend next steps
  
  return await executeAISequence([
    { step: 'detect_blueprint', cards, blueprint_type },
    { step: 'analyze_by_category', cards },
    { step: 'identify_themes', analyzed_cards: '$previous' },
    { step: 'generate_implications', themes: '$previous' },
    { step: 'recommend_actions', themes: '$previous', implications: '$previous' }
  ]);
}
```

### Phase 2: Implement AI Sequencing Framework (1-2 weeks)
**Goal**: Create sophisticated AI workflow orchestration
**Benefits**: Complex multi-step AI operations, conditional logic, retry mechanisms

#### 2.1 AI Sequence Executor
```typescript
// NEW: supabase-mcp/src/lib/ai-sequencer.ts
export class AISequencer {
  async executeSequence(steps: AISequenceStep[]): Promise<any> {
    const results = {};
    
    for (const step of steps) {
      try {
        // Replace variable references with previous results
        const processedStep = this.resolveVariables(step, results);
        
        // Execute AI step with retry logic
        const result = await this.executeAIStep(processedStep);
        results[step.id] = result;
        
        // Check conditions for next step
        if (step.condition && !this.evaluateCondition(step.condition, results)) {
          break;
        }
      } catch (error) {
        // Handle retry logic, fallbacks, error recovery
        results[step.id] = await this.handleStepError(step, error, results);
      }
    }
    
    return results;
  }
  
  private async executeAIStep(step: ProcessedAIStep): Promise<any> {
    // Route to appropriate AI model based on step type
    switch (step.type) {
      case 'analyze': return await this.analyzeWithGPT4o(step);
      case 'generate': return await this.generateWithGPT4oMini(step);
      case 'summarize': return await this.summarizeWithGPT35(step);
      case 'validate': return await this.validateWithClaude(step);
      default: throw new Error(`Unknown step type: ${step.type}`);
    }
  }
}
```

#### 2.2 Sequence Definitions
```typescript
// NEW: supabase-mcp/src/sequences/intelligence-sequences.ts
export const INTELLIGENCE_TEXT_SEQUENCE = [
  {
    id: 'detect_content_type',
    type: 'analyze',
    model: 'gpt-4o-mini',
    prompt: 'Analyze this text and determine if it\'s an interview, meeting, research, or other type',
    input: '${text}',
    condition: 'success'
  },
  {
    id: 'extract_insights',
    type: 'generate',
    model: 'gpt-4o-mini',
    prompt: 'Extract ${insight_count} insights based on content type ${detect_content_type.type}',
    input: '${text}',
    variables: {
      insight_count: 'IF(${detect_content_type.type} == "interview", 10, 5)'
    }
  },
  {
    id: 'enhance_with_context',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Enhance insights with strategic context',
    input: '${extract_insights.insights}',
    context: '${strategy_context}',
    condition: '${strategy_context} != null'
  },
  {
    id: 'validate_categories',
    type: 'validate',
    model: 'claude-4',
    prompt: 'Validate insights match target category',
    input: '${extract_insights.insights}',
    target_category: '${category}'
  }
];
```

#### 2.3 Complex Sequencing Examples
```typescript
// Strategy Generation with Intelligence Integration
export const STRATEGY_GENERATION_SEQUENCE = [
  {
    id: 'analyze_intelligence',
    type: 'analyze',
    prompt: 'Analyze intelligence cards for strategic patterns',
    input: '${intelligence_cards}'
  },
  {
    id: 'identify_gaps',
    type: 'analyze',
    prompt: 'Identify gaps in current strategy based on intelligence',
    input: '${existing_strategy_cards}',
    context: '${analyze_intelligence.patterns}'
  },
  {
    id: 'generate_strategy',
    type: 'generate',
    prompt: 'Generate strategy cards addressing identified gaps',
    input: '${identify_gaps.gaps}',
    blueprint: '${target_blueprint}',
    style: '${generation_style}'
  },
  {
    id: 'cross_validate',
    type: 'validate',
    prompt: 'Validate strategy alignment with intelligence insights',
    input: '${generate_strategy.cards}',
    intelligence: '${analyze_intelligence.patterns}'
  },
  {
    id: 'refine_output',
    type: 'generate',
    prompt: 'Refine strategy cards based on validation feedback',
    input: '${generate_strategy.cards}',
    feedback: '${cross_validate.feedback}',
    condition: '${cross_validate.issues_found} == true'
  }
];
```

### Phase 3: Advanced AI Orchestration (2-3 weeks)
**Goal**: Implement sophisticated AI workflows with conditional logic
**Benefits**: Adaptive AI behavior, quality assurance, multi-model orchestration

#### 3.1 Conditional Logic and Branching
```typescript
// Conditional AI sequences based on results
export const ADAPTIVE_INTELLIGENCE_SEQUENCE = [
  {
    id: 'initial_analysis',
    type: 'analyze',
    prompt: 'Analyze content quality and type'
  },
  {
    id: 'high_quality_processing',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Process high-quality content with advanced analysis',
    condition: '${initial_analysis.quality_score} > 0.8'
  },
  {
    id: 'standard_processing',
    type: 'generate',
    model: 'gpt-4o-mini',
    prompt: 'Process standard content with basic analysis',
    condition: '${initial_analysis.quality_score} <= 0.8'
  },
  {
    id: 'quality_enhancement',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Enhance low-quality output',
    condition: '${standard_processing.quality_score} < 0.6'
  }
];
```

#### 3.2 Multi-Model Orchestration
```typescript
// Different models for different aspects
export const MULTI_MODEL_STRATEGY_SEQUENCE = [
  {
    id: 'creative_generation',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Generate creative strategic options'
  },
  {
    id: 'technical_validation',
    type: 'validate',
    model: 'claude-4',
    prompt: 'Validate technical feasibility'
  },
  {
    id: 'business_analysis',
    type: 'analyze',
    model: 'gpt-4o-mini',
    prompt: 'Analyze business impact and ROI'
  },
  {
    id: 'risk_assessment',
    type: 'analyze',
    model: 'gpt-4o',
    prompt: 'Assess risks and mitigation strategies'
  },
  {
    id: 'final_synthesis',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Synthesize all analyses into final strategy',
    input: {
      creative: '${creative_generation.options}',
      technical: '${technical_validation.feedback}',
      business: '${business_analysis.impact}',
      risks: '${risk_assessment.risks}'
    }
  }
];
```

#### 3.3 Quality Assurance and Retry Logic
```typescript
// AI quality assurance with retry mechanisms
export const QA_ENHANCED_SEQUENCE = [
  {
    id: 'initial_generation',
    type: 'generate',
    prompt: 'Generate initial content',
    max_retries: 3
  },
  {
    id: 'quality_check',
    type: 'validate',
    prompt: 'Validate output quality and completeness',
    input: '${initial_generation.output}'
  },
  {
    id: 'improve_quality',
    type: 'generate',
    prompt: 'Improve quality based on validation feedback',
    input: '${initial_generation.output}',
    feedback: '${quality_check.feedback}',
    condition: '${quality_check.quality_score} < 0.8',
    max_retries: 2
  },
  {
    id: 'fallback_generation',
    type: 'generate',
    model: 'gpt-4o',
    prompt: 'Generate with premium model as fallback',
    condition: '${improve_quality.quality_score} < 0.7'
  }
];
```

### Phase 4: API Route Refactoring (1 week)
**Goal**: Convert API routes to thin MCP wrappers
**Benefits**: Consistent error handling, centralized monitoring, easier maintenance

#### 4.1 New API Route Pattern
```typescript
// /api/intelligence-processing/text/route.ts (REFACTORED)
export async function POST(request: Request) {
  try {
    const { text, context, category, groups } = await request.json();
    
    // Thin wrapper - all logic in MCP
    const result = await mcp.invoke('process_intelligence_text_sequence', {
      text,
      context,
      category,
      groups,
      user_id: await getUserId(request)
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return handleAPIError(error);
  }
}
```

#### 4.2 Centralized Error Handling
```typescript
// NEW: src/lib/ai-api-wrapper.ts
export class AIAPIWrapper {
  static async invoke(tool: string, args: any): Promise<any> {
    try {
      const result = await mcp.invoke(tool, args);
      
      // Centralized monitoring
      await this.logUsage(tool, args, result);
      
      return result;
    } catch (error) {
      // Centralized error handling
      const handledError = await this.handleError(error, tool, args);
      throw handledError;
    }
  }
  
  private static async logUsage(tool: string, args: any, result: any) {
    // Token tracking, performance monitoring, usage analytics
  }
  
  private static async handleError(error: any, tool: string, args: any) {
    // Error classification, retry logic, fallbacks
  }
}
```

## Implementation Timeline

### Week 1-2: Core MCP Migration
- [ ] Migrate intelligence processing to MCP
- [ ] Migrate card generation to MCP
- [ ] Migrate executive summaries to MCP
- [ ] Implement basic AI sequencing framework

### Week 3-4: Advanced Sequencing
- [ ] Implement conditional logic and branching
- [ ] Add multi-model orchestration
- [ ] Implement quality assurance and retry logic
- [ ] Add sequence monitoring and analytics

### Week 5: API Refactoring
- [ ] Convert API routes to MCP wrappers
- [ ] Implement centralized error handling
- [ ] Add comprehensive monitoring
- [ ] Performance optimization

### Week 6: Testing and Optimization
- [ ] Comprehensive testing of sequences
- [ ] Performance optimization
- [ ] Documentation and training
- [ ] Production deployment

## Benefits of MCP-First Architecture

### 1. Complex AI Workflows
- Multi-step AI processing with conditional logic
- Adaptive AI behavior based on content quality
- Cross-model validation and enhancement

### 2. Quality Assurance
- Built-in retry mechanisms
- Quality validation at each step
- Fallback strategies for failed operations

### 3. Maintainability
- Centralized AI logic
- Consistent error handling
- Single point of monitoring

### 4. Scalability
- Easy to add new AI models
- Sequence reusability across features
- Performance monitoring and optimization

### 5. Advanced Features
- AI workflow orchestration
- Multi-model collaboration
- Adaptive prompt engineering

## Success Metrics

### Technical
- [ ] 100% AI calls routed through MCP
- [ ] 40% reduction in duplicated AI code
- [ ] 60% faster AI feature development
- [ ] 50% improvement in AI operation reliability

### Business
- [ ] Enhanced AI quality through multi-step processing
- [ ] Faster time-to-market for AI features
- [ ] Better user experience through quality assurance
- [ ] Reduced operational costs through optimization

## Risk Mitigation

### 1. Gradual Migration
- Migrate one function at a time
- Keep fallback mechanisms during transition
- Comprehensive testing at each step

### 2. Monitoring
- Real-time performance monitoring
- Error tracking and alerting
- Usage analytics and optimization

### 3. Rollback Strategy
- Ability to rollback to direct API calls
- Feature flags for new sequences
- Gradual rollout to users

This MCP-first architecture will transform Pinnlo into a sophisticated AI-powered platform with complex sequencing capabilities, quality assurance, and advanced workflow orchestration.
import { CardCreatorConfig } from './types'

export function createCardCreatorConfig(bankType: CardCreatorConfig['bankType']): CardCreatorConfig {
  // Simplified configuration focusing on working Development Bank first
  const baseConfig: CardCreatorConfig = {
    bankType: bankType,
    sections: [
      // ✅ Development Bank - Known Working Sections
      {
        id: 'prd',
        label: 'Product Requirements (PRD)',
        cardTypes: ['prd', 'product-requirements'],
        description: 'Product requirement documents with business context',
        category: 'development',
        required: false
      },
      {
        id: 'trd',
        label: 'Technical Requirements (TRD)',
        cardTypes: ['trd', 'technical-requirement', 'technical-requirement-structured'],
        description: 'Technical requirement documents with implementation details',
        category: 'development',
        required: false
      },
      {
        id: 'section1',
        label: 'Features', 
        cardTypes: ['feature'],
        description: 'Feature specifications and user stories',
        category: 'development',
        required: true
      },
      {
        id: 'section2',
        label: 'Tech Stack',
        cardTypes: ['tech-stack'],
        description: 'Technology stack and architecture decisions', 
        category: 'development'
      },
      {
        id: 'section4',
        label: 'Task Lists',
        cardTypes: ['task-list'],
        description: 'Development tasks and project management',
        category: 'development'
      },
      
      // 🔵 Strategy Bank - All Blueprint Types (matching exact blueprint IDs)
      {
        id: 'strategic-context',
        label: 'Strategic Context',
        cardTypes: ['strategic-context'],
        description: 'Define the strategic context and foundation for your strategy',
        category: 'strategy',
        required: true
      },
      {
        id: 'vision',
        label: 'Vision Statement',
        cardTypes: ['vision'],
        description: 'Define your long-term vision and aspirational goals',
        category: 'strategy'
      },
      {
        id: 'value-proposition',
        label: 'Value Proposition',
        cardTypes: ['value-proposition'],
        description: 'Define the unique value you provide to customers',
        category: 'strategy'
      },
      {
        id: 'personas',
        label: 'Personas',
        cardTypes: ['personas'],
        description: 'Define detailed user personas and customer segments',
        category: 'strategy',
        suggested: true
      },
      {
        id: 'customer-journey',
        label: 'Customer Journey',
        cardTypes: ['customer-journey'],
        description: 'Map the customer experience from awareness to advocacy',
        category: 'strategy',
        suggested: true
      },
      {
        id: 'swot-analysis',
        label: 'SWOT Analysis',
        cardTypes: ['swot-analysis'],
        description: 'Analyze strengths, weaknesses, opportunities, and threats',
        category: 'strategy'
      },
      {
        id: 'competitive-analysis',
        label: 'Competitive Analysis',
        cardTypes: ['competitive-analysis'],
        description: 'Analyze competitors and competitive landscape',
        category: 'strategy'
      },
      {
        id: 'okrs',
        label: 'OKRs',
        cardTypes: ['okrs'],
        description: 'Define objectives and key results for goal tracking',
        category: 'strategy'
      },
      {
        id: 'business-model',
        label: 'Business Model',
        cardTypes: ['business-model'],
        description: 'Define how your business creates, delivers, and captures value',
        category: 'strategy'
      },
      {
        id: 'go-to-market',
        label: 'Go-to-Market Strategy',
        cardTypes: ['go-to-market'],
        description: 'Plan how to bring your product or service to market',
        category: 'strategy',
        suggested: true
      },
      {
        id: 'risk-assessment',
        label: 'Risk Assessment',
        cardTypes: ['risk-assessment'],
        description: 'Identify and analyze potential risks and mitigation strategies',
        category: 'strategy'
      },
      {
        id: 'roadmap',
        label: 'Roadmap',
        cardTypes: ['roadmap'],
        description: 'Plan timeline and milestones for strategy execution',
        category: 'strategy'
      },
      {
        id: 'kpis',
        label: 'KPIs & Metrics',
        cardTypes: ['kpis'],
        description: 'Define key performance indicators and success metrics',
        category: 'strategy'
      },
      {
        id: 'financial-projections',
        label: 'Financial Projections',
        cardTypes: ['financial-projections'],
        description: 'Create financial forecasts and projections',
        category: 'strategy'
      },
      {
        id: 'workstream',
        label: 'Workstream',
        cardTypes: ['workstream'],
        description: 'Organize work into manageable streams with clear ownership',
        category: 'strategy',
        suggested: true
      },
      
      // 🟢 Intelligence Bank - All Intelligence Categories (matching exact category IDs)
      {
        id: 'market',
        label: 'Market Intelligence',
        cardTypes: ['market'],
        description: 'Growth projections and market insights',
        category: 'intelligence'
      },
      {
        id: 'competitor',
        label: 'Competitor Intelligence',
        cardTypes: ['competitor'],
        description: 'New product launches and competitive analysis',
        category: 'intelligence'
      },
      {
        id: 'trends',
        label: 'Trends',
        cardTypes: ['trends'],
        description: 'UX/UI shifts and industry trends',
        category: 'intelligence'
      },
      {
        id: 'technology',
        label: 'Technology Intelligence',
        cardTypes: ['technology'],
        description: 'Tech stack evolution and technical trends',
        category: 'intelligence'
      },
      {
        id: 'stakeholder',
        label: 'Stakeholder Intelligence',
        cardTypes: ['stakeholder'],
        description: 'Internal goals and stakeholder insights',
        category: 'intelligence'
      },
      {
        id: 'consumer',
        label: 'Consumer Intelligence',
        cardTypes: ['consumer'],
        description: 'Customer feedback and behavior insights',
        category: 'intelligence'
      },
      {
        id: 'risk',
        label: 'Risk Intelligence',
        cardTypes: ['risk'],
        description: 'Legal and risk assessment',
        category: 'intelligence'
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        cardTypes: ['opportunities'],
        description: 'White space and market opportunities',
        category: 'intelligence'
      }
    ],
    generation: {
      endpoint: '/api/mcp/invoke',
      model: 'gpt-4o-mini' as const,
      maxTokens: 4000,
      temperature: 0.7
    },
    costOptimization: {
      enableBatching: true,
      cacheTimeout: 3600000, // 1 hour
      maxConcurrentRequests: 3,
      maxTokensPerRequest: 4000
    }
  }

  // For Card Creator, we want ALL sections available as sources
  // The bankType only determines what can be created as output
  // So we keep all sections but mark which bank we're in
  
  return baseConfig
}

export function createCardCreator(bankType: CardCreatorConfig['bankType']) {
  return createCardCreatorConfig(bankType)
}
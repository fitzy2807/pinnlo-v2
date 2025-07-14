import { BlueprintConfig } from '../types'

export const consumerIntelligenceConfig: BlueprintConfig = {
  id: 'consumer-intelligence',
  name: 'Consumer Intelligence',
  description: 'User research findings, behavior patterns, and customer feedback',
  category: 'Research & Analysis',
  icon: 'UserCheck',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed consumer insights and analysis...',
      description: 'Comprehensive consumer behavior intelligence'
    },
    {
      id: 'consumer_segment',
      name: 'Consumer Segment',
      type: 'text',
      required: false,
      placeholder: 'e.g., Enterprise users, SMB customers, Free tier users',
      description: 'Specific consumer segment analyzed'
    },
    {
      id: 'research_method',
      name: 'Research Method',
      type: 'enum',
      required: false,
      options: ['Survey', 'Interview', 'Focus Group', 'Usability Test', 'Analytics', 'Support Tickets', 'Social Media', 'Reviews'],
      placeholder: 'Select research method',
      description: 'How this intelligence was gathered'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key consumer insights...',
      description: 'Critical consumer behavior discoveries'
    },
    {
      id: 'pain_points',
      name: 'Pain Points',
      type: 'array',
      required: false,
      placeholder: 'Add customer pain point...',
      description: 'Identified customer frustrations and problems'
    },
    {
      id: 'needs_and_wants',
      name: 'Needs & Wants',
      type: 'array',
      required: false,
      placeholder: 'Add customer need or desire...',
      description: 'What customers are asking for'
    },
    {
      id: 'satisfaction_score',
      name: 'Satisfaction Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'Overall customer satisfaction (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Q4 User Survey, Customer Interview Series',
      description: 'Primary source of this intelligence'
    },
    {
      id: 'date_accessed',
      name: 'Date Accessed',
      type: 'date',
      required: false,
      description: 'When this information was obtained'
    },
    {
      id: 'credibility_score',
      name: 'Credibility Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How reliable is this data? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'relevance_score',
      name: 'Relevance Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How relevant to our product strategy? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'behavior_patterns',
      name: 'Behavior Patterns',
      type: 'array',
      required: false,
      placeholder: 'Add observed behavior pattern...',
      description: 'Observed consumer behavior patterns'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this impact our product and CX strategy?',
      description: 'Analysis of consumer intelligence implications'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'How should we respond to these consumer insights?',
      description: 'Actionable product and experience recommendations'
    },
    {
      id: 'relevant_blueprint_pages',
      name: 'Related Blueprints',
      type: 'array',
      required: false,
      placeholder: 'Link to related strategy cards...',
      description: 'Other cards this intelligence relates to'
    }
  ],
  defaultValues: {
    intelligence_content: '',
    key_findings: [],
    pain_points: [],
    needs_and_wants: [],
    credibility_score: 5,
    relevance_score: 5,
    behavior_patterns: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['customerExperience', 'userPersonas', 'product-vision']
  }
}
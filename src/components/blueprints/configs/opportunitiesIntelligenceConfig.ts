import { BlueprintConfig } from '../types'

export const opportunitiesIntelligenceConfig: BlueprintConfig = {
  id: 'opportunities-intelligence',
  name: 'Opportunities Intelligence',
  description: 'Strategic opportunities, market gaps, and growth potential',
  category: 'Research & Analysis',
  icon: 'Lightbulb',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed opportunity analysis...',
      description: 'Comprehensive opportunity intelligence and potential'
    },
    {
      id: 'opportunity_type',
      name: 'Opportunity Type',
      type: 'enum',
      required: false,
      options: ['Market Gap', 'Partnership', 'Acquisition', 'Product Extension', 'Geographic Expansion', 'Technology Advantage', 'Regulatory Change', 'Customer Need'],
      placeholder: 'Select opportunity type',
      description: 'Category of opportunity identified'
    },
    {
      id: 'opportunity_size',
      name: 'Opportunity Size',
      type: 'enum',
      required: false,
      options: ['Transformational', 'Major', 'Significant', 'Moderate', 'Minor'],
      placeholder: 'Select opportunity size',
      description: 'Potential impact of this opportunity'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key opportunity insights...',
      description: 'Critical opportunity discoveries'
    },
    {
      id: 'market_signals',
      name: 'Market Signals',
      type: 'array',
      required: false,
      placeholder: 'Add market signal...',
      description: 'Indicators pointing to this opportunity'
    },
    {
      id: 'potential_value',
      name: 'Potential Value',
      type: 'text',
      required: false,
      placeholder: 'e.g., $10M revenue opportunity, 20% market share gain',
      description: 'Estimated value of the opportunity'
    },
    {
      id: 'feasibility_score',
      name: 'Feasibility Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How achievable is this opportunity? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'strategic_fit_score',
      name: 'Strategic Fit Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How well does this align with our strategy? (1-10)',
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
      placeholder: 'e.g., Market analysis, Customer feedback, Partner discussion',
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
      description: 'How reliable is this source? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'required_capabilities',
      name: 'Required Capabilities',
      type: 'array',
      required: false,
      placeholder: 'Add required capability...',
      description: 'What we need to capture this opportunity'
    },
    {
      id: 'competitive_advantage',
      name: 'Competitive Advantage',
      type: 'textarea',
      required: false,
      placeholder: 'Why are we uniquely positioned for this opportunity?',
      description: 'Our unique advantages for this opportunity'
    },
    {
      id: 'timing_considerations',
      name: 'Timing Considerations',
      type: 'textarea',
      required: false,
      placeholder: 'Window of opportunity, market timing factors...',
      description: 'Critical timing factors for this opportunity'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this opportunity impact our strategy?',
      description: 'Analysis of opportunity implications'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'What steps should we take to capture this opportunity?',
      description: 'Actionable opportunity pursuit recommendations'
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
    market_signals: [],
    feasibility_score: 5,
    strategic_fit_score: 5,
    credibility_score: 5,
    required_capabilities: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['opportunities', 'strategic-context', 'roadmap']
  }
}
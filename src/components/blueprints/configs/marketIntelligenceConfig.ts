import { BlueprintConfig } from '../types'

export const marketIntelligenceConfig: BlueprintConfig = {
  id: 'marketIntelligence',
  name: 'Market Intelligence',
  description: 'Market trends, growth projections, and industry analysis',
  category: 'Research & Analysis',
  icon: 'TrendingUp',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed market intelligence findings...',
      description: 'Comprehensive market analysis and insights'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key market insights...',
      description: 'Bullet points of critical market discoveries'
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Industry Report Q4 2024, Market Research Study',
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
      id: 'relevance_score',
      name: 'Relevance Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How relevant to our strategy? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'relevant_blueprint_pages',
      name: 'Related Blueprints',
      type: 'array',
      required: false,
      placeholder: 'Link to related strategy cards...',
      description: 'Other cards this intelligence relates to'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this impact our strategy?',
      description: 'Analysis of how this affects our strategic direction'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'What actions should we take based on this intelligence?',
      description: 'Actionable recommendations based on findings'
    },
    {
      id: 'market_size',
      name: 'Market Size',
      type: 'text',
      required: false,
      placeholder: 'e.g., $50B TAM, 15% CAGR',
      description: 'Total addressable market and growth rates'
    },
    {
      id: 'market_trends',
      name: 'Market Trends',
      type: 'array',
      required: false,
      placeholder: 'Add market trend...',
      description: 'Key trends shaping the market'
    }
  ],
  defaultValues: {
    intelligence_content: '',
    key_findings: [],
    credibility_score: 5,
    relevance_score: 5,
    relevant_blueprint_pages: [],
    market_trends: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['strategic-context', 'business-model', 'go-to-market']
  }
}
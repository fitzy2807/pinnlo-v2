import { BlueprintConfig } from '../types'

export const trendsIntelligenceConfig: BlueprintConfig = {
  id: 'trendsIntelligence',
  name: 'Trends Intelligence',
  description: 'Industry trends, UX/UI shifts, and emerging patterns',
  category: 'Research & Analysis',
  icon: 'BarChart3',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed trend analysis...',
      description: 'Comprehensive analysis of trends and patterns'
    },
    {
      id: 'trend_category',
      name: 'Trend Category',
      type: 'enum',
      required: false,
      options: ['Technology', 'Design', 'User Behavior', 'Market', 'Regulatory', 'Social', 'Economic'],
      placeholder: 'Select trend category',
      description: 'Type of trend being analyzed'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key trend insights...',
      description: 'Critical trend discoveries and patterns'
    },
    {
      id: 'trend_timeline',
      name: 'Trend Timeline',
      type: 'enum',
      required: false,
      options: ['Emerging', 'Growing', 'Mainstream', 'Declining', 'Disrupting'],
      placeholder: 'Select trend stage',
      description: 'Current stage of the trend lifecycle'
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Industry report, Design publication, User research',
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
      id: 'adoption_indicators',
      name: 'Adoption Indicators',
      type: 'array',
      required: false,
      placeholder: 'Add adoption signal...',
      description: 'Signs of trend adoption in the market'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this trend impact our strategy?',
      description: 'Analysis of trend implications for our business'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'How should we respond to this trend?',
      description: 'Actionable recommendations based on trend analysis'
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
    credibility_score: 5,
    relevance_score: 5,
    adoption_indicators: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['strategic-context', 'roadmap', 'customerExperience']
  }
}
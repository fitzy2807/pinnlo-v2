import { BlueprintConfig } from '../types'

export const competitorIntelligenceConfig: BlueprintConfig = {
  id: 'competitor-intelligence',
  name: 'Competitor Intelligence',
  description: 'Competitive landscape analysis and competitor movements',
  category: 'Research & Analysis',
  icon: 'Eye',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed competitor analysis...',
      description: 'Comprehensive competitor intelligence and analysis'
    },
    {
      id: 'competitor_name',
      name: 'Competitor Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Company X, Product Y',
      description: 'Primary competitor or product being analyzed'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key competitive insights...',
      description: 'Critical discoveries about competitors'
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Competitor website, Industry analysis, Press release',
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
      id: 'competitive_advantages',
      name: 'Their Advantages',
      type: 'array',
      required: false,
      placeholder: 'Add competitive advantage...',
      description: "Competitor's key strengths and advantages"
    },
    {
      id: 'competitive_weaknesses',
      name: 'Their Weaknesses',
      type: 'array',
      required: false,
      placeholder: 'Add weakness or gap...',
      description: "Competitor's vulnerabilities and gaps"
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this impact our competitive position?',
      description: 'Analysis of competitive implications'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'How should we respond to this competitive intelligence?',
      description: 'Actionable competitive responses'
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
    competitive_advantages: [],
    competitive_weaknesses: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['competitive-analysis', 'strategic-context', 'value-propositions']
  }
}
import { BlueprintConfig } from '../types'

export const stakeholderIntelligenceConfig: BlueprintConfig = {
  id: 'stakeholderIntelligence',
  name: 'Stakeholder Intelligence',
  description: 'Investor sentiment, partner feedback, and internal stakeholder insights',
  category: 'Research & Analysis',
  icon: 'Users',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed stakeholder analysis and insights...',
      description: 'Comprehensive stakeholder intelligence'
    },
    {
      id: 'stakeholder_name',
      name: 'Stakeholder Name/Group',
      type: 'text',
      required: false,
      placeholder: 'e.g., Board of Directors, Key Investor, Partner Company',
      description: 'Specific stakeholder or stakeholder group'
    },
    {
      id: 'stakeholder_type',
      name: 'Stakeholder Type',
      type: 'enum',
      required: false,
      options: ['Investor', 'Board', 'Partner', 'Employee', 'Customer', 'Supplier', 'Regulator', 'Community'],
      placeholder: 'Select stakeholder type',
      description: 'Category of stakeholder'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key stakeholder insights...',
      description: 'Critical stakeholder sentiments and feedback'
    },
    {
      id: 'sentiment_analysis',
      name: 'Sentiment Analysis',
      type: 'enum',
      required: false,
      options: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
      placeholder: 'Select overall sentiment',
      description: 'Overall stakeholder sentiment'
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Board meeting, Investor call, Partner feedback session',
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
      id: 'key_concerns',
      name: 'Key Concerns',
      type: 'array',
      required: false,
      placeholder: 'Add stakeholder concern...',
      description: 'Primary concerns raised by stakeholders'
    },
    {
      id: 'expectations',
      name: 'Stakeholder Expectations',
      type: 'array',
      required: false,
      placeholder: 'Add expectation...',
      description: 'What stakeholders expect from us'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this impact our stakeholder management strategy?',
      description: 'Analysis of stakeholder implications'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'How should we engage with these stakeholders?',
      description: 'Actionable stakeholder engagement recommendations'
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
    key_concerns: [],
    expectations: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['strategic-context', 'governance', 'partnerships']
  }
}
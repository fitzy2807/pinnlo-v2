import { BlueprintConfig } from '../types'

export const swotConfig: BlueprintConfig = {
  id: 'swotAnalysis',
  name: 'SWOT Analysis',
  description: 'Analyze strengths, weaknesses, opportunities, and threats',
  category: 'Research & Analysis',
  icon: '⚖️',
  fields: [
    {
      id: 'analysisScope',
      name: 'Analysis Scope',
      type: 'enum',
      required: true,
      options: ['Company', 'Product', 'Market', 'Competition', 'Initiative'],
      description: 'What is the focus of this SWOT analysis?'
    },
    {
      id: 'strengths',
      name: 'Strengths',
      type: 'array',
      required: true,
      description: 'Internal factors that give you an advantage'
    },
    {
      id: 'weaknesses',
      name: 'Weaknesses',
      type: 'array',
      required: true,
      description: 'Internal factors that put you at a disadvantage'
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      type: 'array',
      required: true,
      description: 'External factors that could provide an advantage'
    },
    {
      id: 'threats',
      name: 'Threats',
      type: 'array',
      required: true,
      description: 'External factors that could cause trouble'
    },
    {
      id: 'strategicImplications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'What does this analysis mean for your strategy?',
      description: 'Key insights and strategic conclusions'
    },
    {
      id: 'actionItems',
      name: 'Action Items',
      type: 'array',
      required: false,
      description: 'Specific actions based on this analysis'
    },
    {
      id: 'reviewDate',
      name: 'Next Review Date',
      type: 'date',
      required: false,
      description: 'When should this analysis be updated?'
    }
  ],
  defaultValues: {
    analysisScope: 'Company',
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    strategicImplications: '',
    actionItems: [],
    reviewDate: ''
  },
  validation: {
    required: ['analysisScope', 'strengths', 'weaknesses', 'opportunities', 'threats']
  },
  relationships: {
    linkedBlueprints: ['competitive-analysis', 'strategic-context'],
    requiredBlueprints: ['strategic-context']
  }
}
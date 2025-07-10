import { BlueprintConfig } from '../types'

export const competitiveAnalysisConfig: BlueprintConfig = {
  id: 'competitive-analysis',
  name: 'Competitive Analysis',
  description: 'Analyze competitors and competitive landscape',
  category: 'Research & Analysis',
  icon: '⚔️',
  fields: [
    {
      id: 'analysisType',
      name: 'Analysis Type',
      type: 'enum',
      required: true,
      options: ['Direct Competitors', 'Indirect Competitors', 'Market Leaders', 'Emerging Players'],
      description: 'What type of competitive analysis is this?'
    },
    {
      id: 'competitorName',
      name: 'Competitor Name',
      type: 'text',
      required: true,
      placeholder: 'Company/Product name',
      description: 'Name of the competitor being analyzed'
    },
    {
      id: 'competitorType',
      name: 'Competitor Type',
      type: 'enum',
      required: true,
      options: ['Direct', 'Indirect', 'Substitute', 'Potential'],
      description: 'How do they compete with you?'
    },
    {
      id: 'marketPosition',
      name: 'Market Position',
      type: 'enum',
      required: false,
      options: ['Leader', 'Challenger', 'Follower', 'Niche'],
      description: 'Their position in the market'
    },
    {
      id: 'strengths',
      name: 'Competitor Strengths',
      type: 'array',
      required: true,
      description: 'What are they good at?'
    },
    {
      id: 'weaknesses',
      name: 'Competitor Weaknesses',
      type: 'array',
      required: true,
      description: 'Where do they fall short?'
    },
    {
      id: 'offerings',
      name: 'Products/Services',
      type: 'array',
      required: false,
      description: 'Their main offerings'
    },
    {
      id: 'pricing',
      name: 'Pricing Strategy',
      type: 'text',
      required: false,
      placeholder: 'How do they price?',
      description: 'Their pricing approach and levels'
    },
    {
      id: 'marketShare',
      name: 'Market Share',
      type: 'text',
      required: false,
      placeholder: 'Estimated market share',
      description: 'Their approximate market share'
    },
    {
      id: 'strategicResponse',
      name: 'Our Strategic Response',
      type: 'textarea',
      required: false,
      placeholder: 'How should we respond?',
      description: 'Strategic implications and response plans'
    }
  ],
  defaultValues: {
    analysisType: 'Direct Competitors',
    competitorName: '',
    competitorType: 'Direct',
    marketPosition: 'Follower',
    strengths: [],
    weaknesses: [],
    offerings: [],
    pricing: '',
    marketShare: '',
    strategicResponse: ''
  },
  validation: {
    required: ['analysisType', 'competitorName', 'competitorType', 'strengths', 'weaknesses']
  },
  relationships: {
    linkedBlueprints: ['swot-analysis', 'value-proposition'],
    requiredBlueprints: ['strategic-context']
  }
}